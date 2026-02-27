import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, RefreshCw, ArrowRightLeft, ExternalLink, Filter } from 'lucide-react'
import { getLeads, rerouteLead, getAgents } from '../../api/adminApi'

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'site_visit', label: 'Site Visit' },
  { value: 'closed', label: 'Closed' },
]

const STATUS_COLORS = {
  new: 'bg-blue-500/20 text-blue-400',
  contacted: 'bg-amber-500/20 text-amber-400',
  in_progress: 'bg-amber-500/20 text-amber-400',
  site_visit: 'bg-purple-500/20 text-purple-400',
  closed: 'bg-emerald-500/20 text-emerald-400',
}

export default function AdminLeads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(null)
  const [rerouteModal, setRerouteModal] = useState(null)
  const [agents, setAgents] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [agentFilter, setAgentFilter] = useState('')

  const fetchLeads = async () => {
    setLoading(true)
    setApiError(null)
    try {
      const data = await getLeads()
      setLeads(data.leads || [])
    } catch (err) {
      setLeads([])
      setApiError(err.message || 'API failed — GET /api/admin/leads. Backend chal raha hai?')
    } finally {
      setLoading(false)
    }
  }

  const filteredLeads = useMemo(() => {
    let list = leads
    if (statusFilter) list = list.filter((l) => l.status === statusFilter)
    if (agentFilter) list = list.filter((l) => (l.assignedAgentId ?? '') === agentFilter)
    return list
  }, [leads, statusFilter, agentFilter])

  const fetchAgents = async () => {
    try {
      const data = await getAgents()
      const list = (data.agents || []).map((a) => ({
        id: a.id,
        name: a.agentName ?? a.agent_name ?? a.name ?? a.email ?? '—',
      }))
      setAgents(list)
    } catch {
      setAgents([])
    }
  }

  useEffect(() => {
    fetchLeads()
    fetchAgents()
  }, [])


  const handleReroute = async (leadId, newAgentId) => {
    try {
      await rerouteLead(leadId, newAgentId)
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? {
                ...l,
                assignedAgentId: newAgentId,
                assignedAgent: agents.find((a) => a.id === newAgentId)?.name || l.assignedAgent,
              }
            : l
        )
      )
      setRerouteModal(null)
    } catch {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? {
                ...l,
                assignedAgentId: rerouteModal?.newAgentId,
                assignedAgent: agents.find((a) => a.id === rerouteModal?.newAgentId)?.name || l.assignedAgent,
              }
            : l
        )
      )
      setRerouteModal(null)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-primary" />
          Leads — Command Center
        </h1>
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
        <div className="rounded-xl bg-amber-500/20 border border-amber-500/40 p-4 mb-4 text-amber-200 text-sm">
          {apiError}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-5 h-5 text-primary shrink-0" />
          <span className="text-slate-400 text-sm font-medium">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
          >
            <option value="">All Agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          {(statusFilter || agentFilter) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('')
                setAgentFilter('')
              }}
              className="px-4 py-2 rounded-lg border border-white/10 text-slate-300 text-sm hover:bg-white/5"
            >
              Clear
            </button>
          )}
        </div>
        <p className="text-slate-500 text-xs mt-2">
          Showing {filteredLeads.length} of {leads.length} leads
        </p>
      </div>

      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-slate-400 font-medium text-sm">User Name</th>
                <th className="px-4 py-3 text-slate-400 font-medium text-sm">Property Interest</th>
                <th className="px-4 py-3 text-slate-400 font-medium text-sm">Budget</th>
                <th className="px-4 py-3 text-slate-400 font-medium text-sm">Lead Score</th>
                <th className="px-4 py-3 text-slate-400 font-medium text-sm">Assigned Agent</th>
                <th className="px-4 py-3 text-slate-400 font-medium text-sm">Status</th>
                <th className="px-4 py-3 text-slate-400 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <span className="text-white font-medium">{lead.userName}</span>
                    </td>
                    <td className="px-4 py-3">
                      {lead.propertyId ? (
                        <Link
                          to={`/property/${lead.propertyId}`}
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {lead.propertyInterest}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-slate-300">{lead.propertyInterest}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{lead.budget}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-lg bg-primary/20 text-primary text-sm font-medium">
                        {lead.leadScore}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{lead.assignedAgent}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium capitalize ${
                          STATUS_COLORS[lead.status] || 'bg-slate-500/20 text-slate-400'
                        }`}
                      >
                        {lead.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setRerouteModal({ leadId: lead.id, leadName: lead.userName })}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 text-sm font-medium"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                        Re-route
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Re-route Modal */}
      {rerouteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="rounded-xl bg-slate-900 border border-white/10 p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-2">Manual Re-route Lead</h3>
            <p className="text-slate-400 text-sm mb-4">
              Assign this lead to a different agent
            </p>
            <select
              id="reroute-agent"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white mb-4"
              onChange={(e) =>
                setRerouteModal((p) => ({ ...p, newAgentId: e.target.value }))
              }
            >
              <option value="">Select agent</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRerouteModal(null)}
                className="flex-1 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  rerouteModal.newAgentId &&
                  handleReroute(rerouteModal.leadId, rerouteModal.newAgentId)
                }
                disabled={!rerouteModal.newAgentId}
                className="flex-1 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 disabled:opacity-50"
              >
                Re-route
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
