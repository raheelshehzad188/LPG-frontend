import { useState, useCallback, useRef, useEffect } from 'react'
import { API_ENDPOINTS } from '../config'

export interface StreamEvent {
  type: 'chunk' | 'text' | 'delta' | 'done' | string
  content?: string
  text?: string
  question?: string
  message?: string
  properties?: unknown[]
  listings?: unknown[]
  lead_collected?: Record<string, unknown>
  filter_criteria?: Record<string, unknown>
  lead_id?: string | null
  lead_saved?: boolean
  error?: string
}

export interface UseApiNewAiStreamOptions {
  onProperties?: (properties: unknown[]) => void
  onDone?: (data: {
    question: string
    properties: unknown[]
    lead_collected: Record<string, unknown>
    filter_criteria: Record<string, unknown>
    lead_id: string | null
  }) => void
}

export interface UseApiNewAiStreamReturn {
  question: string
  isLoading: boolean
  error: string | null
  sendMessage: (params: {
    query: string
    messages: Array<{ role: string; content: string }>
    threadId?: string | null
    lead_collected?: Record<string, unknown>
    filter_criteria?: Record<string, unknown>
  }) => Promise<void>
  reset: () => void
  properties: unknown[]
  lead_collected: Record<string, unknown>
  filter_criteria: Record<string, unknown>
  lead_id: string | null
}

function normalizeListings(raw: unknown[]): unknown[] {
  return raw.map((value: unknown, index: number) => {
    const item = value as Record<string, unknown>
    const priceNum = typeof item.price === 'number' ? item.price : null
    const priceDisplay =
      priceNum !== null
        ? priceNum >= 10000000
          ? `${(priceNum / 10000000).toFixed(2)} Cr`
          : `${(priceNum / 100000).toFixed(0)} Lac`
        : (item.price_display ?? item.amount ?? '—')
    return {
      id: item.id ?? item.pk ?? index + 1,
      title: item.title ?? item.name ?? item.property_title ?? 'Property',
      location: item.location_name ?? item.location ?? item.area ?? item.city ?? '',
      price: priceDisplay,
      cover_photo: item.cover_photo ?? item.image,
      type: item.type ?? item.property_type ?? '',
      size: item.area_size ?? item.size ?? '',
      ...item,
    }
  })
}

/**
 * Streaming hook for api_new_ai — Option A: React + Vite
 * Uses fetch + ReadableStream to parse NDJSON events.
 * Events: type "chunk"|"text"|"delta" for streaming text, type "done" for final payload.
 */
export function useApiNewAiStream(
  options: UseApiNewAiStreamOptions = {}
): UseApiNewAiStreamReturn {
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [properties, setProperties] = useState([])
  const [lead_collected, setLeadCollected] = useState({})
  const [filter_criteria, setFilterCriteria] = useState({})
  const [lead_id, setLeadId] = useState(null)
  const abortRef = useRef(null)

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const { onProperties, onDone } = options

  const reset = useCallback(() => {
    setQuestion('')
    setError(null)
    setProperties([])
    setLeadCollected({})
    setFilterCriteria({})
    setLeadId(null)
    abortRef.current?.abort()
  }, [])

  const sendMessage = useCallback(
    async (params: {
      query: string
      messages: Array<{ role: string; content: string }>
      threadId?: string | null
      lead_collected?: Record<string, unknown>
      filter_criteria?: Record<string, unknown>
    }) => {
      abortRef.current?.abort()
      abortRef.current = new AbortController()
      const signal = abortRef.current.signal

      setIsLoading(true)
      setError(null)
      setQuestion('')

      const apiMessages = params.messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : m.role,
        content: m.content,
      }))

      const payload: Record<string, unknown> = {
        query: params.query,
        messages: apiMessages,
        lead_collected: params.lead_collected ?? {},
        filter_criteria: params.filter_criteria ?? {},
      }
      if (params.threadId) payload.threadId = params.threadId

      const url = API_ENDPOINTS.aiSearchConversation

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
          signal,
        })

        const contentType = res.headers.get('content-type') ?? ''
        const isStreaming =
          contentType.includes('text/event-stream') ||
          contentType.includes('application/x-ndjson') ||
          contentType.includes('application/stream+json')

        if (!res.ok) {
          const text = await res.text()
          let msg = `Request failed: ${res.status}`
          try {
            const json = JSON.parse(text)
            msg = json.message ?? json.error ?? msg
          } catch {
            if (text) msg = text
          }
          throw new Error(msg)
        }

        if (!isStreaming) {
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          const q = data.question ?? data.message ?? ''
          const props = data.properties ?? data.listings ?? []
          const normalized = normalizeListings(Array.isArray(props) ? props : [])
          setQuestion(q)
          if (normalized.length > 0) {
            setProperties(normalized)
            onProperties?.(normalized)
          }
          setLeadCollected(data.lead_collected ?? {})
          setFilterCriteria(data.filter_criteria ?? {})
          setLeadId(data.lead_id ?? null)
          onDone?.({
            question: q,
            properties: normalized,
            lead_collected: data.lead_collected ?? {},
            filter_criteria: data.filter_criteria ?? {},
            lead_id: data.lead_id ?? null,
          })
          return
        }

        const reader = res.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let buffer = ''
        let accumulatedQuestion = ''

        const handleStreamEvent = (event: StreamEvent) => {
          if (event.type === 'chunk' || event.type === 'text' || event.type === 'delta') {
            const chunk = event.content ?? event.text ?? ''
            if (chunk) {
              accumulatedQuestion += chunk
              setQuestion(accumulatedQuestion)
            }
          } else if (event.type === 'done') {
            const q = event.question ?? event.message ?? accumulatedQuestion
            if (q) setQuestion(q)
            const props = event.properties ?? event.listings ?? []
            const normalized = normalizeListings(Array.isArray(props) ? props : [])
            if (normalized.length > 0) {
              setProperties(normalized)
              onProperties?.(normalized)
            }
            setLeadCollected(event.lead_collected ?? {})
            setFilterCriteria(event.filter_criteria ?? {})
            setLeadId(event.lead_id ?? null)
            onDone?.({
              question: q,
              properties: normalized,
              lead_collected: event.lead_collected ?? {},
              filter_criteria: event.filter_criteria ?? {},
              lead_id: event.lead_id ?? null,
            })
          } else if (event.error) {
            setError(event.error)
          }
        }

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed) continue
            if (trimmed.startsWith('data:')) {
              const jsonStr = trimmed.slice(5).trim()
              if (jsonStr === '[DONE]') continue
              try {
                const event = JSON.parse(jsonStr) as StreamEvent
                handleStreamEvent(event)
              } catch {
                // ignore parse errors
              }
            } else {
              try {
                const event = JSON.parse(trimmed) as StreamEvent
                handleStreamEvent(event)
              } catch {
                // ignore
              }
            }
          }
        }

        if (buffer.trim()) {
          try {
            const event = JSON.parse(buffer.trim()) as StreamEvent
            handleStreamEvent(event)
          } catch {
            // ignore
          }
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setError((err as Error).message ?? 'Request failed')
      } finally {
        setIsLoading(false)
      }
    },
    [onProperties, onDone]
  )

  return {
    question,
    isLoading,
    error,
    sendMessage,
    reset,
    properties,
    lead_collected,
    filter_criteria,
    lead_id,
  }
}
