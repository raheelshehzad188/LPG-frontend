import React from 'react'
import { DollarSign, BarChart3, TrendingUp, Image } from 'lucide-react'

const MOCK_REVENUE = { subscription: 125000, commissionPipeline: 450000 }
const MOCK_AI_STATS = { totalLeads: 342, conversionRate: 12.5, topPerformingArea: 'DHA Phase 9' }

export default function AdminOverview() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <p className="text-slate-400 text-sm mb-1">Total Leads</p>
          <p className="text-2xl font-bold text-primary">{MOCK_AI_STATS.totalLeads}</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <p className="text-slate-400 text-sm mb-1">Conversion Rate</p>
          <p className="text-2xl font-bold text-primary">{MOCK_AI_STATS.conversionRate}%</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <p className="text-slate-400 text-sm mb-1">Subscription Income</p>
          <p className="text-2xl font-bold text-primary">PKR {(MOCK_REVENUE.subscription / 1000).toFixed(0)}K</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <p className="text-slate-400 text-sm mb-1">Commission Pipeline</p>
          <p className="text-2xl font-bold text-primary">PKR {(MOCK_REVENUE.commissionPipeline / 100000).toFixed(1)} Lac</p>
        </div>
      </div>

      <div className="rounded-xl bg-white/5 border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Top Performing Area
        </h2>
        <p className="text-xl font-bold text-primary">{MOCK_AI_STATS.topPerformingArea}</p>
      </div>
    </div>
  )
}
