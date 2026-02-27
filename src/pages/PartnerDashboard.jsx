import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  LogOut,
  Clock,
  Check,
  X,
  RefreshCw,
  Building2,
  Phone,
  Sparkles,
} from 'lucide-react'
import { KANBAN_COLUMNS } from '../data/mockLeads'
import { getPartnerLeads, acceptLead, rejectLead, updateLeadStatus } from '../api/partnerApi'

function LeadCard({ lead, onAccept, onReject, onMove }) {
  const [timeLeft, setTimeLeft] = useState(null)
  const isNew = lead.status === 'new'

  useEffect(() => {
    if (!isNew || !lead.expiresAt) return
    const tick = () => {
      const left = lead.expiresAt - Date.now()
      if (left <= 0) {
        setTimeLeft('Expired')
        return
      }
      const m = Math.floor(left / 60000)
      const s = Math.floor((left % 60000) / 1000)
      setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isNew, lead.expiresAt])

  const expired = isNew && lead.expiresAt && Date.now() > lead.expiresAt

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4 hover:border-primary/30 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <span className="px-2 py-0.5 rounded-lg bg-primary/20 text-primary text-xs font-semibold">
          Score: {lead.leadScore}
        </span>
        {isNew && (
          <span className="flex items-center gap-1 text-amber-400 text-xs">
            <Clock className="w-3 h-3" />
            {expired ? 'Expired' : timeLeft}
          </span>
        )}
      </div>
      <h4 className="font-semibold text-white">{lead.name}</h4>
      <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
        <Phone className="w-3 h-3" />
        {lead.phone}
      </p>
      <p className="text-primary text-xs mt-2 flex items-center gap-1">
        <Building2 className="w-3 h-3" />
        {lead.propertyInterest}
      </p>
      <div className="mt-3 rounded-lg bg-slate-800/60 p-3 border border-white/5">
        <p className="text-xs text-slate-400 flex items-center gap-1 mb-1">
          <Sparkles className="w-3 h-3" />
          AI Summary
        </p>
        <p className="text-slate-300 text-sm">{lead.aiSummary || '—'}</p>
      </div>
      {isNew && !expired && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onAccept(lead)}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90"
          >
            <Check className="w-4 h-4" />
            Accept
          </button>
          <button
            type="button"
            onClick={() => onReject(lead)}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30"
          >
            <X className="w-4 h-4" />
            Reject
          </button>
        </div>
      )}
      {!isNew && lead.status !== 'closed' && (
        <select
          value={lead.status}
          onChange={(e) => onMove(lead, e.target.value)}
          className="mt-3 w-full py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
        >
          <option value="in_progress">In Progress</option>
          <option value="site_visit">Site Visit</option>
          <option value="closed">Closed</option>
        </select>
      )}
    </div>
  )
}

const AUTH_KEY = 'lpg_partner_auth'

export default function PartnerDashboard() {
  const navigate = useNavigate()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(null)
  const [agentName, setAgentName] = useState('')

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    setApiError(null)
    try {
      const data = await getPartnerLeads()
      setLeads(data.leads || [])
    } catch (err) {
      setLeads([])
      setApiError(err.message || 'API failed — GET /api/partner/leads')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const auth = localStorage.getItem(AUTH_KEY)
    if (auth) {
      try {
        const parsed = JSON.parse(auth)
        setAgentName(parsed.agent?.agentName ?? parsed.agent?.name ?? parsed.email ?? '')
      } catch (_) {}
    }
    fetchLeads()
  }, [fetchLeads])

  const handleAccept = async (lead) => {
    try {
      await acceptLead(lead.id)
      setLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, status: 'in_progress', expiresAt: null } : l))
      )
    } catch (err) {
      setApiError(err.message)
    }
  }

  const handleReject = async (lead) => {
    try {
      await rejectLead(lead.id)
      setLeads((prev) => prev.filter((l) => l.id !== lead.id))
    } catch (err) {
      setApiError(err.message)
    }
  }

  const handleMove = async (lead, newStatus) => {
    try {
      await updateLeadStatus(lead.id, newStatus)
      setLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, status: newStatus } : l))
      )
    } catch (err) {
      setApiError(err.message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY)
    navigate('/partner/login')
  }

  const leadsByStatus = (status) => leads.filter((l) => l.status === status)

  return (
    <div className="min-h-screen bg-deep">
      <nav className="sticky top-0 z-50 w-full bg-deep/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-lg font-semibold text-white">
              LahorePropertyGuide<span className="text-primary">.com</span>
            </Link>
            <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-medium">
              Partner Panel
            </span>
          </div>
          <div className="flex items-center gap-3">
            {agentName && <span className="text-slate-400 text-sm">{agentName}</span>}
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-white">Lead Pipeline</h1>
          </div>
          <button
            type="button"
            onClick={fetchLeads}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {apiError && (
          <div className="rounded-xl bg-amber-500/20 border border-amber-500/40 p-4 mb-6 text-amber-200 text-sm">
            {apiError}
          </div>
        )}

        <p className="text-slate-400 text-sm mb-6">
          New leads ke paas 5 minute hote hain accept karne ke liye. Reject karne par lead agali agency ko transfer ho jayegi.
        </p>

        {loading ? (
          <div className="rounded-xl bg-white/5 border border-white/10 p-12 text-center text-slate-400">
            Loading leads...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
            {KANBAN_COLUMNS.map((col) => (
              <div
                key={col.id}
                className="min-w-[280px] rounded-xl bg-white/5 border border-white/10 p-4"
              >
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      col.color === 'primary'
                        ? 'bg-primary'
                        : col.color === 'amber'
                        ? 'bg-amber-500'
                        : col.color === 'blue'
                        ? 'bg-blue-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  {col.title}
                  <span className="ml-auto text-slate-500 text-sm">
                    {leadsByStatus(col.id).length}
                  </span>
                </h3>
                <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                  {leadsByStatus(col.id).map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      onMove={handleMove}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
