import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Settings,
  LogOut,
  Shield,
  DollarSign,
  Image,
  BarChart3,
  ToggleLeft,
  Building2,
  TrendingUp,
} from 'lucide-react'

const MOCK_AGENCIES = [
  { id: 'A1', name: 'Elite Properties', leadsActive: true, commissionPaid: true },
  { id: 'A2', name: 'Prime Realty', leadsActive: true, commissionPaid: false },
  { id: 'A3', name: 'DHA Experts', leadsActive: false, commissionPaid: true },
]

const MOCK_REVENUE = {
  subscription: 125000,
  commissionPipeline: 450000,
}

const MOCK_AI_STATS = {
  totalLeads: 342,
  conversionRate: 12.5,
  topPerformingArea: 'DHA Phase 9',
}

const AUTH_KEY = 'lpg_admin_auth'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [agencies, setAgencies] = useState(MOCK_AGENCIES)

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY)
    navigate('/admin/login')
  }
  const [adPlacements, setAdPlacements] = useState([
    { page: 'DHA Phase 9', banner: 'Banner A', active: true },
    { page: 'Bahria Town', banner: 'Banner B', active: true },
    { page: 'Gulberg', banner: 'Banner C', active: false },
  ])

  const toggleAgencyLeads = (id) => {
    setAgencies((prev) =>
      prev.map((a) => (a.id === id ? { ...a, leadsActive: !a.leadsActive } : a))
    )
  }

  return (
    <div className="min-h-screen bg-deep">
      <nav className="sticky top-0 z-50 w-full bg-deep/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-lg font-semibold text-white">
              LahorePropertyGuide<span className="text-primary">.com</span>
            </Link>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-medium">
              Admin Panel
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Master Control Room
        </h1>

        {/* 1. Traffic Routing Override */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Traffic Routing Override
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            Agar kisi Agency ne commission nahi diya, to leads band kar ke doosri agency ko redirect karein.
          </p>
          <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-slate-400 font-medium text-sm">Agency</th>
                  <th className="px-4 py-3 text-slate-400 font-medium text-sm">Commission</th>
                  <th className="px-4 py-3 text-slate-400 font-medium text-sm">Leads</th>
                </tr>
              </thead>
              <tbody>
                {agencies.map((a) => (
                  <tr key={a.id} className="border-b border-white/5">
                    <td className="px-4 py-3 text-white">{a.name}</td>
                    <td className="px-4 py-3">
                      <span className={a.commissionPaid ? 'text-emerald-400' : 'text-red-400'}>
                        {a.commissionPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleAgencyLeads(a.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                          a.leadsActive
                            ? 'bg-primary/20 text-primary'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        <ToggleLeft className="w-4 h-4" />
                        {a.leadsActive ? 'ON' : 'OFF'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Revenue Tracker */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Revenue Tracker
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <p className="text-slate-400 text-sm mb-1">Subscription Income</p>
              <p className="text-2xl font-bold text-primary">
                PKR {(MOCK_REVENUE.subscription / 1000).toFixed(0)}K
              </p>
              <p className="text-slate-500 text-xs mt-1">Small agents monthly</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <p className="text-slate-400 text-sm mb-1">Commission Pipeline</p>
              <p className="text-2xl font-bold text-primary">
                PKR {(MOCK_REVENUE.commissionPipeline / 100000).toFixed(1)} Lac
              </p>
              <p className="text-slate-500 text-xs mt-1">15% deals in process</p>
            </div>
          </div>
        </section>

        {/* 3. Ad Manager */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            Ad Manager
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            Specific pages par kaunsa banner chalna chahiye — yahan se set karein.
          </p>
          <div className="space-y-3">
            {adPlacements.map((ad, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-3"
              >
                <div>
                  <p className="text-white font-medium">{ad.page} page</p>
                  <p className="text-slate-400 text-sm">{ad.banner}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setAdPlacements((prev) =>
                      prev.map((p, j) => (j === i ? { ...p, active: !p.active } : p))
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    ad.active ? 'bg-primary/20 text-primary' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {ad.active ? 'Active' : 'Inactive'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 4. AI Performance Monitor */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            AI Performance Monitor
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            AI kitni leads generate kar raha hai aur unka conversion rate kya hai.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <p className="text-slate-400 text-sm mb-1">Total Leads Generated</p>
              <p className="text-2xl font-bold text-primary">{MOCK_AI_STATS.totalLeads}</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <p className="text-slate-400 text-sm mb-1">Conversion Rate</p>
              <p className="text-2xl font-bold text-primary">{MOCK_AI_STATS.conversionRate}%</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <p className="text-slate-400 text-sm mb-1">Top Performing Area</p>
              <p className="text-xl font-bold text-primary flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {MOCK_AI_STATS.topPerformingArea}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
