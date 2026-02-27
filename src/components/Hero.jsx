import React, { useState } from 'react'
import { Search } from 'lucide-react'

export default function Hero({ onSearch, loading, error }) {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = prompt.trim()
    if (trimmed) onSearch?.(trimmed)
  }

  const suggestions = [
    'DHA Phase 9 mein 1 kanal plot',
    '2 crore ke andar house',
    'Bahria Town 5 marla',
    'Investment ke liye best area',
  ]

  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 sm:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-deep via-slate-900/50 to-deep pointer-events-none" />
      <div className="relative z-10 w-full max-w-2xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Where do you want to invest in <span className="text-primary">Lahore</span> today?
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mb-8 max-w-lg mx-auto">
          Roman Urdu ya English mein likho — AI tumhe best properties dikhayega.
        </p>

        <form onSubmit={handleSubmit} className="text-left">
          <div className="rounded-full px-5 py-3 bg-white/5 backdrop-blur-md border border-white/10 shadow-glow-lg transition-shadow focus-within:border-primary/30 focus-within:shadow-glow flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. DHA 9 mein 1 kanal, budget 2 crore"
              className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-base"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || loading}
              className="px-5 py-2 rounded-full font-semibold bg-primary text-white shadow-glow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shrink-0"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Search
                </>
              ) : (
                'Search'
              )}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-400 text-center">{error}</p>}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setPrompt(s)}
                className="px-3 py-1.5 rounded-full text-sm text-slate-400 hover:text-primary hover:bg-white/5 border border-white/5 hover:border-primary/30 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </form>
      </div>
    </section>
  )
}
