import React, { useState, useEffect } from 'react'
import { Settings, Save, RefreshCw } from 'lucide-react'
import { getAdminSettings, saveAdminSettings } from '../../api/adminApi'

export default function AdminSettings() {
  const [leadExpireMinutes, setLeadExpireMinutes] = useState(5)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const fetchSettings = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminSettings()
      setLeadExpireMinutes(data.leadExpireMinutes ?? 5)
      setUpdatedAt(data.updatedAt ?? null)
    } catch (err) {
      setError(err.message || 'API not ready.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (leadExpireMinutes < 1 || leadExpireMinutes > 60) {
      setError('Lead expire time must be between 1 and 60 minutes.')
      return
    }
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      const res = await saveAdminSettings({ leadExpireMinutes })
      setMessage('Settings saved successfully.')
      if (res.settings) {
        setLeadExpireMinutes(res.settings.leadExpireMinutes ?? leadExpireMinutes)
        setUpdatedAt(res.settings.updatedAt ?? null)
      }
    } catch (err) {
      setError(err.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-white">System Settings</h1>
          <p className="text-slate-400 text-sm">Lead expiry time aur system-wide options</p>
        </div>
      </div>

      <div className="rounded-xl bg-white/5 border border-white/10 p-6 max-w-xl">
        <h2 className="text-lg font-semibold text-white mb-4">Lead Expire Time</h2>
        <p className="text-slate-400 text-sm mb-4">
          Agar partner X minutes ke andar lead accept nahi karta, lead unlink ho jayegi aur dobara assign ho sakti hai.
        </p>

        {loading ? (
          <div className="py-8 text-slate-400">Loading settings...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Lead Expire Time (minutes)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={leadExpireMinutes}
                onChange={(e) => setLeadExpireMinutes(Number(e.target.value) || 5)}
                className="w-full max-w-[120px] px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <p className="mt-1 text-slate-500 text-xs">Min: 1, Max: 60</p>
            </div>
            {updatedAt && (
              <p className="text-slate-500 text-xs">
                Last updated: {new Date(updatedAt).toLocaleString()}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={fetchSettings}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </form>
        )}

        {message && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
