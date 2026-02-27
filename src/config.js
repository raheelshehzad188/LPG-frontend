/**
 * ============================================
 * GLOBAL API CONFIG — Sirf yahan change karo
 * ============================================
 * .env mein VITE_API_BASE_URL set karo, ya yahan default
 */

// Dev: proxy use karega (CORS avoid) — relative URL
// Prod: full backend URL
const defaultUrl = import.meta.env.DEV ? '' : 'http://127.0.0.1:8000'
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? defaultUrl).replace(/\/+$/, '') || ''

// AI chat API (api_new_ai.php) — full URL set karo agar proxy 404 de raha hai
// .env: VITE_AI_API_URL=http://localhost/propert_paython/api_new_ai.php
export const AI_API_FULL_URL = (import.meta.env.VITE_AI_API_URL ?? '').replace(/\/+$/, '') || ''

export const API_ENDPOINTS = {
  aiSearch: '/api/ai-searchOKK',
  aiSearchConversation: AI_API_FULL_URL || '/api_new_ai', // Proxy ya direct URL
  processQuery: '/api/process-query',
  leads: '/api/leads', // Save Lead (AI Chat)
  aiConversation: '/api_new_ai', // AI property search
  admin: {
    leads: '/api/admin/leads',
    leadReroute: (id) => `/api/admin/leads/${id}/reroute`,
    agents: '/api/admin/agents',
    agentById: (id) => `/api/admin/agents/${id}`,
    agentRouting: (id) => `/api/admin/agents/${id}/routing`,
    scraping: '/api/admin/scraping',
    scrapingById: (id) => `/api/admin/scraping/${id}`,
    geminiSettings: '/api/gemini',
    geminiTest: '/api/gemini/test',
    geminiReset: '/api/gemini/reset',
  },
  auth: {
    adminLogin: '/api/auth/admin/login',
    partnerLogin: '/api/auth/partner/login',
  },
  partner: {
    leads: '/api/partner/leads',
    leadAccept: (id) => `/api/partner/leads/${id}/accept`,
    leadReject: (id) => `/api/partner/leads/${id}/reject`,
    leadUpdate: (id) => `/api/partner/leads/${id}`,
  },
}
