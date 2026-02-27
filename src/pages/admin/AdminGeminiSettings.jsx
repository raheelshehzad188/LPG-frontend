import React, { useState, useEffect } from 'react'
import { Sparkles, Save, RefreshCw, TestTube, Key, FileText } from 'lucide-react'
import {
  getGeminiSettings,
  saveGeminiSettings,
  testGeminiConnection,
  resetGeminiInstructions,
} from '../../api/adminApi'

const DEMO_KEY = 'lpg_gemini_settings_demo'

const DEFAULT_SYSTEM = `Tu Lahore Property Guide ka AI assistant ho. Tumhare do main kaam hain:

1. PROPERTY REQUIREMENTS: Customer se property details poocho (budget, area, type: plot/house/apartment, marlas)
2. LEAD INFO: Customer se naam, phone, city naturally poocho

Rules: Ek ek question poocho. Roman Urdu aur English dono use karo.`

const DEFAULT_CONVERSATION = `Ek ek question poocho. Property info (budget, area, type) poocho. Jab mauka mile naam/phone poocho.`

export default function AdminGeminiSettings() {
  const [apiKey, setApiKey] = useState('')
  const [apiKeyMasked, setApiKeyMasked] = useState('')
  const [systemInstructions, setSystemInstructions] = useState(DEFAULT_SYSTEM)
  const [conversationInstructions, setConversationInstructions] = useState(DEFAULT_CONVERSATION)
  const [model, setModel] = useState('gemini-1.5-flash')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const fetchSettings = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getGeminiSettings()
      setSystemInstructions(data.systemInstructions || DEFAULT_SYSTEM)
      setConversationInstructions(data.conversationInstructions || DEFAULT_CONVERSATION)
      setModel(data.model || 'gemini-1.5-flash')
      setApiKeyMasked(data.apiKeyMasked || '')
      if (data.apiKey) setApiKey(data.apiKey)
    } catch (err) {
      const demo = localStorage.getItem(DEMO_KEY)
      if (demo) {
        try {
          const parsed = JSON.parse(demo)
          setSystemInstructions(parsed.systemInstructions || DEFAULT_SYSTEM)
          setConversationInstructions(parsed.conversationInstructions || DEFAULT_CONVERSATION)
          setModel(parsed.model || 'gemini-1.5-flash')
          setApiKey(parsed.apiKey || '')
        } catch (_) {}
      }
      setError(err.response?.data?.error || err.message || 'API not ready. Demo mode.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      const payload = {
        systemInstructions,
        conversationInstructions,
        model,
      }
      if (apiKey.trim()) payload.apiKey = apiKey.trim()
      await saveGeminiSettings(payload)
      setMessage('Settings saved successfully.')
      setApiKey('')
      fetchSettings()
    } catch (err) {
      const demo = {
        apiKey: apiKey.trim() || undefined,
        systemInstructions,
        conversationInstructions,
        model,
      }
      localStorage.setItem(DEMO_KEY, JSON.stringify(demo))
      setMessage('Demo: Saved locally (backend API not available).')
      setApiKey('')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    const key = apiKey.trim()
    if (!key) {
      setError('API key enter karein test ke liye.')
      return
    }
    setTesting(true)
    setError(null)
    setMessage(null)
    try {
      await testGeminiConnection(key)
      setMessage('Connection successful!')
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Connection failed.')
    } finally {
      setTesting(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Default instructions restore karein?')) return
    setMessage(null)
    setError(null)
    try {
      const data = await resetGeminiInstructions()
      setSystemInstructions(data.systemInstructions || DEFAULT_SYSTEM)
      setConversationInstructions(data.conversationInstructions || DEFAULT_CONVERSATION)
      setMessage('Reset to default.')
    } catch {
      setSystemInstructions(DEFAULT_SYSTEM)
      setConversationInstructions(DEFAULT_CONVERSATION)
      setMessage('Demo: Reset to default (saved locally).')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <Sparkles className="w-7 h-7 text-primary" />
        Gemini AI Settings
      </h1>
      <p className="text-slate-400 text-sm mb-8">
        API key set karein, instructions edit karein. Backend API ready hone par save/fetch hoga.
      </p>

      {message && (
        <div className="mb-6 p-4 rounded-xl bg-primary/20 border border-primary/40 text-primary text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            API Key
          </h2>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={apiKeyMasked || 'AIzaSy... (Google AI Studio se)'}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
            autoComplete="off"
          />
          {apiKeyMasked && !apiKey && (
            <p className="text-slate-500 text-xs mt-2">Key already saved (masked). Naya key dalne se replace ho jayegi.</p>
          )}
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            System Instructions
          </h2>
          <textarea
            value={systemInstructions}
            onChange={(e) => setSystemInstructions(e.target.value)}
            rows={10}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            placeholder="AI ko kaise behave karna hai..."
          />
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Conversation Instructions</h2>
          <textarea
            value={conversationInstructions}
            onChange={(e) => setConversationInstructions(e.target.value)}
            rows={4}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            placeholder="Conversation flow rules..."
          />
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Model</h2>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="gemini-1.5-flash">gemini-1.5-flash (Fast)</option>
            <option value="gemini-1.5-pro">gemini-1.5-pro (Better quality)</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 disabled:opacity-50 border border-white/10"
          >
            <TestTube className="w-5 h-5" />
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 border border-white/10"
          >
            <RefreshCw className="w-5 h-5" />
            Reset to Default
          </button>
        </div>
      </form>

      <div className="mt-10 p-4 rounded-xl bg-slate-800/50 border border-white/5 text-slate-400 text-sm">
        <p className="font-medium text-white mb-2">API Documentation</p>
        <p>
          <code className="text-primary">docs/GEMINI_SETTINGS_API.md</code> — Fetch, Save, Test, Reset APIs ki detail.
        </p>
      </div>
    </div>
  )
}
