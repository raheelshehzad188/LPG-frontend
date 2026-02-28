/** Generate unique thread ID — crypto.randomUUID or fallback */
export function generateThreadId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export const THREAD_STORAGE_KEY = 'lpg_ai_thread_id'
export const CHAT_HISTORY_KEY = 'lpg_ai_chat_history'

/** Get or create persistent thread ID (same chat ke andar use karo) */
export function getOrCreateThreadId() {
  try {
    let id = localStorage.getItem(THREAD_STORAGE_KEY)
    if (!id) {
      id = generateThreadId()
      localStorage.setItem(THREAD_STORAGE_KEY, id)
    }
    return id
  } catch {
    return generateThreadId()
  }
}

/** New chat start — purana thread ID hatao, naya banao. Pehle screen se naya prompt pe call karo. */
export function startNewThread() {
  const id = generateThreadId()
  try {
    localStorage.setItem(THREAD_STORAGE_KEY, id)
  } catch (_) {}
  return id
}

/** Load chat history from localStorage */
export function loadChatHistory() {
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

/** Save chat history to localStorage */
export function saveChatHistory(messages) {
  try {
    if (Array.isArray(messages) && messages.length > 0) {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages))
    }
  } catch {
    // ignore
  }
}

export const LAST_PROPERTIES_KEY = 'lpg_ai_last_properties'

/** Load last properties from localStorage (for session resume) */
export function loadLastProperties() {
  try {
    const raw = localStorage.getItem(LAST_PROPERTIES_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

/** Save last properties to localStorage */
export function saveLastProperties(properties) {
  try {
    if (Array.isArray(properties) && properties.length > 0) {
      localStorage.setItem(LAST_PROPERTIES_KEY, JSON.stringify(properties))
    }
  } catch {
    // ignore
  }
}
