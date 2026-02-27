import React, { useState } from 'react'

const LOCATIONS = ['DHA', 'Gulberg', 'Bahria', 'Model Town', 'Johar Town', 'Cantt']
const BUDGET_MIN = 20
const BUDGET_MAX = 500
const BUDGET_STEP = 10

export default function Wizard({ onComplete }) {
  const [step, setStep] = useState(1)
  const [purpose, setPurpose] = useState('')
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState(100)
  const [lead, setLead] = useState({ name: '', whatsapp: '', email: '' })

  const canNext = () => {
    if (step === 1) return !!purpose
    if (step === 2) return !!location
    if (step === 3) return true
    if (step === 4) return lead.name.trim() && lead.whatsapp.trim() && lead.email.trim()
    return false
  }

  const handleNext = () => {
    if (step < 4) setStep((s) => s + 1)
    else onComplete?.({ purpose, location, budget, lead })
  }

  const handleBack = () => setStep((s) => Math.max(1, s - 1))

  return (
    <section id="wizard" className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <div className="rounded-2xl p-6 sm:p-8 bg-white/5 backdrop-blur-md border border-white/10">
        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <span
              key={s}
              className={`h-2 w-8 rounded-full transition-colors ${step >= s ? 'bg-primary' : 'bg-slate-600'}`}
            />
          ))}
        </div>

        {/* Step 1: Buy / Invest / Sell */}
        {step === 1 && (
          <div className="animate-in">
            <h2 className="text-xl font-semibold text-white mb-2">What do you want to do?</h2>
            <p className="text-slate-400 text-sm mb-6">Choose one option to continue.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['Buy', 'Invest', 'Sell'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setPurpose(opt)}
                  className={`rounded-xl p-6 text-left bg-white/5 border backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:shadow-glow ${
                    purpose === opt ? 'border-primary ring-2 ring-primary/50 shadow-glow' : 'border-white/10'
                  }`}
                >
                  <span className="text-primary text-2xl block mb-2">
                    {opt === 'Buy' ? '🏠' : opt === 'Invest' ? '📈' : '📤'}
                  </span>
                  <span className="font-semibold text-white">{opt}</span>
                  <p className="text-slate-400 text-sm mt-1">
                    {opt === 'Buy' && 'Find a home to buy'}
                    {opt === 'Invest' && 'Invest in property'}
                    {opt === 'Sell' && 'Sell your property'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Location grid */}
        {step === 2 && (
          <div className="animate-in">
            <h2 className="text-xl font-semibold text-white mb-2">Preferred location</h2>
            <p className="text-slate-400 text-sm mb-6">Where in Lahore?</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className={`rounded-xl py-4 px-4 text-center font-medium transition-all duration-200 hover:scale-105 hover:shadow-glow ${
                    location === loc ? 'bg-primary text-white shadow-glow' : 'bg-white/5 border border-white/10 text-slate-300'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Budget slider */}
        {step === 3 && (
          <div className="animate-in">
            <h2 className="text-xl font-semibold text-white mb-2">Budget (Lac PKR)</h2>
            <p className="text-slate-400 text-sm mb-6">Slide to set your budget range.</p>
            <div className="px-2">
              <input
                type="range"
                min={BUDGET_MIN}
                max={BUDGET_MAX}
                step={BUDGET_STEP}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer bg-slate-700 accent-primary"
                style={{
                  background: `linear-gradient(to right, #059669 0%, #059669 ${((budget - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100}%, #334155 ${((budget - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100}%, #334155 100%)`,
                }}
              />
              <div className="flex justify-between text-sm text-slate-400 mt-2">
                <span>{BUDGET_MIN} Lac</span>
                <span className="text-primary font-semibold">{budget} Lac</span>
                <span>{BUDGET_MAX} Lac</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Lead form */}
        {step === 4 && (
          <div className="animate-in">
            <h2 className="text-xl font-semibold text-white mb-2">Almost there</h2>
            <p className="text-slate-400 text-sm mb-6">Share your details to get AI recommendations.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  value={lead.name}
                  onChange={(e) => setLead((l) => ({ ...l, name: e.target.value }))}
                  placeholder="Your name"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">WhatsApp number</label>
                <input
                  type="tel"
                  value={lead.whatsapp}
                  onChange={(e) => setLead((l) => ({ ...l, whatsapp: e.target.value }))}
                  placeholder="+92 300 1234567"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={lead.email}
                  onChange={(e) => setLead((l) => ({ ...l, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <button
            type="button"
            onClick={handleBack}
            className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
              step > 1
                ? 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'
                : 'invisible'
            }`}
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!canNext()}
            className="px-6 py-2.5 rounded-xl font-semibold bg-primary text-white shadow-glow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all"
          >
            {step === 4 ? 'Get results' : 'Next'}
          </button>
        </div>
      </div>
    </section>
  )
}
