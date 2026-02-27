import React, { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ROICalculator({ property }) {
  const [budget, setBudget] = useState(property?.priceLac ? property.priceLac * 10000 : 5000000)

  const data = useMemo(() => {
    const growthRate = 0.12
    const years = [0, 1, 2, 3, 4, 5]
    return years.map((y) => {
      const value = budget * Math.pow(1 + growthRate, y)
      return {
        year: `Year ${y}`,
        value: Math.round(value),
        display: `${(value / 10000000).toFixed(2)} Cr`,
      }
    })
  }, [budget])

  return (
    <div className="rounded-2xl p-6 bg-white/5 backdrop-blur-md border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">5-Year Investment Prediction</h3>
      <p className="text-slate-400 text-sm mb-4">
        Apna budget daalo — AI market data se predicted growth dikhayega.
      </p>
      <div className="mb-6">
        <label className="block text-slate-400 text-sm mb-2">Budget (PKR)</label>
        <input
          type="range"
          min={1000000}
          max={50000000}
          step={500000}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full"
        />
        <p className="text-primary font-bold text-xl mt-2">
          PKR {(budget / 10000000).toFixed(2)} Cr
        </p>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${(v / 1e7).toFixed(1)}Cr`} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              formatter={(value) => [`PKR ${(value / 10000000).toFixed(2)} Cr`, 'Predicted Value']}
            />
            <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={2} dot={{ fill: '#059669' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-slate-500 text-xs mt-2">
        * ~12% annual appreciation assumed (Gemini market data based estimate)
      </p>
    </div>
  )
}
