import axios from 'axios'
import { API_BASE_URL, API_ENDPOINTS } from '../config'

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// 500/4xx se actual error message extract karo
function getErrorMessage(err) {
  const status = err.response?.status
  const data = err.response?.data
  if (typeof data === 'object') {
    const msg = data.message ?? data.error ?? data.detail ?? data.msg
    if (msg) return typeof msg === 'string' ? msg : JSON.stringify(msg)
  }
  if (typeof data === 'string' && data.length < 200) return data
  if (status === 500) return 'Server error (500) — backend logs check karo'
  return err.message || `Request failed: ${status || 'unknown'}`
}

// Add auth token from localStorage when available
adminApi.interceptors.request.use((config) => {
  const auth = localStorage.getItem('lpg_admin_auth')
  if (auth) {
    try {
      const parsed = JSON.parse(auth)
      const token = parsed.token ?? parsed.email
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch (_) {}
  }
  return config
})

adminApi.interceptors.response.use(
  (r) => r,
  (err) => Promise.reject(new Error(getErrorMessage(err)))
)

/** GET /api/admin/settings - Lead expiry & other admin settings */
export async function getAdminSettings() {
  const { data } = await adminApi.get(API_ENDPOINTS.admin.settings)
  return data
}

/** PUT /api/admin/settings - Save leadExpireMinutes (1-60) */
export async function saveAdminSettings(payload) {
  const { data } = await adminApi.put(API_ENDPOINTS.admin.settings, payload)
  return data
}

/** POST /api/auth/admin/login - Admin Login */
export async function adminLogin(email, password) {
  const { data } = await adminApi.post(API_ENDPOINTS.auth.adminLogin, { email, password })
  return data
}

/** Normalize lead — backend snake_case ya camelCase dono handle */
function normalizeLead(l) {
  if (!l) return null
  return {
    id: l.id,
    userName: l.userName ?? l.user_name ?? l.name ?? '—',
    name: l.name ?? l.userName ?? l.user_name ?? '—',
    phone: l.phone ?? '',
    propertyInterest: l.propertyInterest ?? l.property_interest ?? l.interest ?? '—',
    propertyId: l.propertyId ?? l.property_id ?? '',
    budget: l.budget ?? '',
    leadScore: l.leadScore ?? l.lead_score ?? l.score ?? 0,
    assignedAgentId: l.assignedAgentId ?? l.assigned_agent_id ?? '',
    assignedAgent: l.assignedAgent ?? l.assigned_agent ?? l.agent_name ?? '—',
    status: l.status ?? 'new',
    aiSummary: l.aiSummary ?? l.ai_summary ?? '',
    createdAt: l.createdAt ?? l.created_at ?? '',
    ...l,
  }
}

/** GET /api/admin/leads - Fetch all leads */
export async function getLeads(params = {}) {
  const { data } = await adminApi.get(API_ENDPOINTS.admin.leads, { params })
  const raw = data.leads ?? data.data ?? (Array.isArray(data) ? data : [])
  return { leads: (Array.isArray(raw) ? raw : []).map(normalizeLead).filter(Boolean) }
}

/** POST /api/admin/leads/:id/reroute - Manual re-route lead to different agent */
export async function rerouteLead(leadId, agentId) {
  const { data } = await adminApi.post(API_ENDPOINTS.admin.leadReroute(leadId), { agentId })
  return data
}

/** GET /api/admin/agents - Fetch all agents/partners */
export async function getAgents() {
  const { data } = await adminApi.get(API_ENDPOINTS.admin.agents)
  return data
}

/** POST /api/admin/agents - Create new agent */
export async function createAgent(payload) {
  const { data } = await adminApi.post(API_ENDPOINTS.admin.agents, payload)
  return data
}

/** PATCH /api/admin/agents/:id - Update agent */
export async function updateAgent(id, payload) {
  const { data } = await adminApi.patch(API_ENDPOINTS.admin.agentById(id), payload)
  return data
}

/** DELETE /api/admin/agents/:id - Delete agent */
export async function deleteAgent(id) {
  const { data } = await adminApi.delete(API_ENDPOINTS.admin.agentById(id))
  return data
}

/** PATCH /api/admin/agents/:id/routing - Toggle lead routing for agent */
export async function toggleAgentRouting(id, active) {
  const { data } = await adminApi.patch(API_ENDPOINTS.admin.agentRouting(id), { active })
  return data
}

/** GET /api/admin/scraping - List scraping sources */
export async function getScrapingSources() {
  const { data } = await adminApi.get(API_ENDPOINTS.admin.scraping)
  return data
}

/** PATCH /api/admin/scraping/:id - Toggle scraping (pause/resume) */
export async function toggleScraping(id, status) {
  const { data } = await adminApi.patch(API_ENDPOINTS.admin.scrapingById(id), { status })
  return data
}

/** GET /api/gemini - Fetch Gemini settings */
export async function getGeminiSettings() {
  const { data } = await adminApi.get(API_ENDPOINTS.admin.geminiSettings)
  return data
}

/** PUT /api/gemini - Save Gemini settings */
export async function saveGeminiSettings(payload) {
  const { data } = await adminApi.put(API_ENDPOINTS.admin.geminiSettings, payload)
  return data
}

/** POST /api/gemini/test - Test Gemini API key */
export async function testGeminiConnection(apiKey) {
  const { data } = await adminApi.post(API_ENDPOINTS.admin.geminiTest, { apiKey })
  return data
}

/** POST /api/gemini/reset - Reset to default instructions */
export async function resetGeminiInstructions() {
  const { data } = await adminApi.post(API_ENDPOINTS.admin.geminiReset)
  return data
}
