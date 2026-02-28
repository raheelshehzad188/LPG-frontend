import axios from 'axios'
import { API_BASE_URL, API_ENDPOINTS } from '../config'

const partnerApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

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

partnerApi.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = getErrorMessage(err)
    const e = new Error(msg)
    e.status = err.response?.status
    e.code = err.response?.data?.code
    return Promise.reject(e)
  }
)

// Partner token — login ke baad use hoga
partnerApi.interceptors.request.use((config) => {
  const auth = localStorage.getItem('lpg_partner_auth')
  if (auth) {
    try {
      const parsed = JSON.parse(auth)
      const token = parsed.token ?? parsed.email
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch (_) {}
  }
  return config
})

/** POST /api/auth/partner/login - Agent/Partner Login */
export async function partnerLogin(email, password) {
  const { data } = await partnerApi.post(API_ENDPOINTS.auth.partnerLogin, { email, password })
  return data
}

const DEFAULT_EXPIRE_MINUTES = 5

/** Normalize lead — backend snake_case ya camelCase dono handle */
function normalizeLead(l) {
  if (!l) return null
  let expiresAt = l.expiresAt ?? l.expires_at
  const assignedAt = l.assignedAt ?? l.assigned_at  // API: "2024-02-28T12:05:00+00:00"
  const createdAt = l.createdAt ?? l.created_at
  const status = l.status ?? 'new'

  // Backend assignedAt bhej raha hai — is se expiry nikaalo (assignedAt + 5 min)
  if (!expiresAt && status === 'new' && assignedAt) {
    const baseMs = typeof assignedAt === 'number' ? assignedAt : new Date(assignedAt).getTime()
    expiresAt = isNaN(baseMs) ? Date.now() + DEFAULT_EXPIRE_MINUTES * 60 * 1000 : baseMs + DEFAULT_EXPIRE_MINUTES * 60 * 1000
  }
  // Fallback: createdAt ya abhi ka time
  if (!expiresAt && status === 'new') {
    const base = assignedAt || createdAt || new Date().toISOString()
    const baseMs = typeof base === 'number' ? base : new Date(base).getTime()
    expiresAt = isNaN(baseMs) ? Date.now() + DEFAULT_EXPIRE_MINUTES * 60 * 1000 : baseMs + DEFAULT_EXPIRE_MINUTES * 60 * 1000
  }
  if (typeof expiresAt === 'string') expiresAt = new Date(expiresAt).getTime()
  if (typeof expiresAt !== 'number' || isNaN(expiresAt)) expiresAt = status === 'new' ? Date.now() + DEFAULT_EXPIRE_MINUTES * 60 * 1000 : null

  return {
    ...l,
    id: l.id,
    name: l.name ?? l.userName ?? l.user_name ?? '—',
    userName: l.userName ?? l.user_name ?? l.name ?? '—',
    phone: l.phone ?? '',
    propertyInterest: l.propertyInterest ?? l.property_interest ?? l.interest ?? '—',
    budget: l.budget ?? '',
    leadScore: l.leadScore ?? l.lead_score ?? l.score ?? 0,
    status,
    aiSummary: l.aiSummary ?? l.ai_summary ?? '',
    source: l.source ?? 'AI Search',
    createdAt: createdAt ?? '',
    assignedAt: assignedAt ?? null,
    expiresAt,
  }
}

/** GET /api/partner/leads - Agent apni leads dekhe */
export async function getPartnerLeads(params = {}) {
  const { data } = await partnerApi.get(API_ENDPOINTS.partner.leads, { params })
  const raw = data.leads ?? data.data ?? (Array.isArray(data) ? data : [])
  return { leads: (Array.isArray(raw) ? raw : []).map(normalizeLead).filter(Boolean) }
}

/** POST /api/partner/leads/:id/accept - Accept lead */
export async function acceptLead(leadId) {
  const { data } = await partnerApi.post(API_ENDPOINTS.partner.leadAccept(leadId))
  return data
}

/** POST /api/partner/leads/:id/reject - Reject lead */
export async function rejectLead(leadId) {
  const { data } = await partnerApi.post(API_ENDPOINTS.partner.leadReject(leadId))
  return data
}

/** PATCH /api/partner/leads/:id - Move lead to next stage */
export async function updateLeadStatus(leadId, status) {
  const { data } = await partnerApi.patch(API_ENDPOINTS.partner.leadUpdate(leadId), { status })
  return data
}
