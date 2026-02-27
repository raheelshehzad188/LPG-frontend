import React, { useState, useEffect } from 'react'
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Phone,
  Building2,
  MapPin,
  Mail,
  ToggleLeft,
  X,
} from 'lucide-react'
import { getAgents, createAgent, updateAgent, deleteAgent, toggleAgentRouting } from '../../api/adminApi'

export default function AdminAgents() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(null)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({
    agentName: '',
    agencyName: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    status: 'active',
  })

  const fetchAgents = async () => {
    setLoading(true)
    setApiError(null)
    try {
      const data = await getAgents()
      setAgents(data.agents || [])
    } catch (err) {
      setAgents([])
      setApiError(err.message || 'API failed — backend chal raha hai? GET /api/admin/agents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  const openAddModal = () => {
    setForm({
      agentName: '',
      agencyName: '',
      email: '',
      password: '',
      phone: '',
      specialization: '',
      status: 'active',
    })
    setModal({ mode: 'add' })
  }

  const openEditModal = (agent) => {
    setForm({
      agentName: agent.agentName,
      agencyName: agent.agencyName,
      email: agent.email || '',
      password: '', // Edit mein password blank — change karna ho to naya daalo
      phone: agent.phone,
      specialization: agent.specialization,
      status: agent.status,
    })
    setModal({ mode: 'edit', id: agent.id })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (modal.mode === 'add') {
        const payload = { ...form }
        if (!payload.password) delete payload.password
        await createAgent(payload)
        setAgents((prev) => [...prev, { id: `A${Date.now()}`, ...form, routingEnabled: true }])
      } else {
        const payload = { ...form }
        if (!payload.password) delete payload.password
        await updateAgent(modal.id, payload)
        setAgents((prev) =>
          prev.map((a) => (a.id === modal.id ? { ...a, ...form } : a))
        )
      }
      setModal(null)
    } catch {
      if (modal.mode === 'add') {
        setAgents((prev) => [...prev, { id: `A${Date.now()}`, ...form, routingEnabled: true }])
      } else {
        setAgents((prev) =>
          prev.map((a) => (a.id === modal.id ? { ...a, ...form } : a))
        )
      }
      setModal(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this agent?')) return
    try {
      await deleteAgent(id)
      setAgents((prev) => prev.filter((a) => a.id !== id))
    } catch {
      setAgents((prev) => prev.filter((a) => a.id !== id))
    }
  }

  const handleToggleRouting = async (agent) => {
    const newVal = !agent.routingEnabled
    try {
      await toggleAgentRouting(agent.id, newVal)
      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, routingEnabled: newVal } : a))
      )
    } catch {
      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, routingEnabled: newVal } : a))
      )
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          Partners (Agents)
        </h1>
        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90"
        >
          <Plus className="w-5 h-5" />
          Add Agent
        </button>
      </div>

      <div className="grid gap-4">
        {apiError && (
          <div className="rounded-xl bg-amber-500/20 border border-amber-500/40 p-4 mb-4 text-amber-200 text-sm">
            {apiError}
          </div>
        )}
        {loading ? (
          <div className="rounded-xl bg-white/5 border border-white/10 p-12 text-center text-slate-400">
            Loading...
          </div>
        ) : (
          agents.map((agent) => (
            <div
              key={agent.id}
              className="rounded-xl bg-white/5 border border-white/10 p-6 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{agent.agentName}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      agent.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {agent.agencyName}
                  </span>
                  {agent.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {agent.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {agent.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {agent.specialization}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">Routing</span>
                  <button
                    type="button"
                    onClick={() => handleToggleRouting(agent)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      agent.routingEnabled ? 'bg-primary' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        agent.routingEnabled ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-slate-400">
                    {agent.routingEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => openEditModal(agent)}
                  className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(agent.id)}
                  className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="rounded-xl bg-slate-900 border border-white/10 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white">
                {modal.mode === 'add' ? 'Add Agent' : 'Edit Agent'}
              </h3>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="p-2 rounded-lg hover:bg-white/10 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Agent Name</label>
                <input
                  type="text"
                  value={form.agentName}
                  onChange={(e) => setForm((p) => ({ ...p, agentName: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Agency Name</label>
                <input
                  type="text"
                  value={form.agencyName}
                  onChange={(e) => setForm((p) => ({ ...p, agencyName: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Email (Login)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="agent@agency.com"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  required={modal.mode === 'add'}
                />
                <p className="text-slate-500 text-xs mt-0.5">Partner Panel login ke liye</p>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">
                  Password {modal.mode === 'edit' && '(change karne ke liye naya daalo)'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder={modal.mode === 'edit' ? '••••••••' : 'Min 6 characters'}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  required={modal.mode === 'add'}
                  minLength={modal.mode === 'add' ? 6 : 0}
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Phone (WhatsApp)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+92 300 1234567"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Specialization</label>
                <input
                  type="text"
                  value={form.specialization}
                  onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))}
                  placeholder="e.g. DHA Phase 9, Gulberg"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Account Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="flex-1 py-2 rounded-lg border border-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-primary text-white font-medium"
                >
                  {modal.mode === 'add' ? 'Add' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
