import React, { useState, useEffect } from 'react'
import { Database, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { getScrapingSources, toggleScraping } from '../../api/adminApi'

const MOCK_SCRAPING = [
  { id: 'S1', source: 'DHA Phase 9', status: 'active', lastRun: '2 mins ago', listings: 124 },
  { id: 'S2', source: 'Bahria Town', status: 'active', lastRun: '5 mins ago', listings: 89 },
  { id: 'S3', source: 'Gulberg', status: 'paused', lastRun: '1 hour ago', listings: 56 },
]

function formatLastRun(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  const diff = (Date.now() - d) / 60000
  if (diff < 60) return `${Math.round(diff)} mins ago`
  if (diff < 1440) return `${Math.round(diff / 60)} hours ago`
  return d.toLocaleDateString()
}

export default function AdminScraping() {
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSources = async () => {
    setLoading(true)
    try {
      const data = await getScrapingSources()
      setSources(data.sources || [])
    } catch {
      setSources(MOCK_SCRAPING)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSources()
  }, [])

  const handleToggle = async (id, currentStatus) => {
    const next = currentStatus === 'active' ? 'paused' : 'active'
    try {
      await toggleScraping(id, next)
      setSources((prev) => prev.map((s) => (s.id === id ? { ...s, status: next } : s)))
    } catch {
      setSources((prev) => prev.map((s) => (s.id === id ? { ...s, status: next } : s)))
    }
  }

  const list = sources.length ? sources : MOCK_SCRAPING

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Database className="w-6 h-6 text-primary" />
          Scraping Status
        </h1>
        <button
          type="button"
          onClick={fetchSources}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-slate-400 font-medium text-sm">Source</th>
              <th className="px-4 py-3 text-slate-400 font-medium text-sm">Status</th>
              <th className="px-4 py-3 text-slate-400 font-medium text-sm">Last Run</th>
              <th className="px-4 py-3 text-slate-400 font-medium text-sm">Listings</th>
              <th className="px-4 py-3 text-slate-400 font-medium text-sm">Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row, idx) => (
              <tr key={row.id || row.source || idx} className="border-b border-white/5">
                <td className="px-4 py-3 text-white">{row.source}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                      row.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {row.status === 'active' ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {row.lastRun ? (row.lastRun.includes('ago') ? row.lastRun : formatLastRun(row.lastRun)) : '—'}
                </td>
                <td className="px-4 py-3 text-slate-300">{row.listings ?? '—'}</td>
                <td className="px-4 py-3">
                  {row.id && (
                    <button
                      type="button"
                      onClick={() => handleToggle(row.id, row.status)}
                      className="px-2 py-1 rounded text-xs bg-primary/20 text-primary hover:bg-primary/30"
                    >
                      {row.status === 'active' ? 'Pause' : 'Resume'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
