import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Building2, Mail, Lock, LogIn } from 'lucide-react'
import { partnerLogin } from '../api/partnerApi'

const AUTH_KEY = 'lpg_partner_auth'

export default function PartnerLogin() {
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
      const res = await partnerLogin(email.trim(), password)
      const token = res.token || email
      localStorage.setItem(AUTH_KEY, JSON.stringify({ token, email, agent: res.agent, loggedAt: Date.now() }))
      navigate('/partner')
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed'
      if (err.code === 'ERR_NETWORK' || err.message?.includes('fetch')) {
        setError('Backend unreachable. Demo mode — proceeding.')
        localStorage.setItem(AUTH_KEY, JSON.stringify({ email, token: email, loggedAt: Date.now() }))
        navigate('/partner')
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
            <Building2 className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-white">Partner Login</h1>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            Agents/Partners — Admin ne jo create kiye, unka login. Apne leads manage karein.
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
                  placeholder="agency@example.com"
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
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-semibold shadow-glow hover:opacity-90 disabled:opacity-50"
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
            Admin ne jo agent create kiya, usi email/password se login karein
          </p>
        </div>
      </div>
    </div>
  )
}
