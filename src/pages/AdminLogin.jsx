import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Mail, Lock, LogIn } from 'lucide-react'
import { adminLogin } from '../api/adminApi'

const AUTH_KEY = 'lpg_admin_auth'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Email aur password daalein')
      return
    }
    setLoading(true)
    try {
      const res = await adminLogin(email.trim(), password)
      const token = res.token || email
      localStorage.setItem(AUTH_KEY, JSON.stringify({ token, email, loggedAt: Date.now() }))
      navigate('/admin')
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed'
      if (err.code === 'ERR_NETWORK' || err.message?.includes('fetch')) {
        setError('Backend unreachable. Demo mode — proceeding.')
        localStorage.setItem(AUTH_KEY, JSON.stringify({ email, token: email, loggedAt: Date.now() }))
        navigate('/admin')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-deep flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center text-lg font-semibold text-white mb-8">
          LahorePropertyGuide<span className="text-primary">.com</span>
        </Link>
        <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-8">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Admin Login</h1>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            Master Control Room — sirf authorized admins
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Email</label>
              <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3 focus-within:border-primary/50">
                <Mail className="w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lpg.com"
                  className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Password</label>
              <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3 focus-within:border-primary/50">
                <Lock className="w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>
          <p className="text-slate-500 text-xs mt-4 text-center">
            Demo: koi bhi email/password daal kar login ho sakte ho
          </p>
        </div>
      </div>
    </div>
  )
}
