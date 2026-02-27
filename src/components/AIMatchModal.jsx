import React from 'react'
import { X } from 'lucide-react'

export default function AIMatchModal({ property, onClose }) {
  if (!property) return null

  const aiExplanation = property.aiExplanation || `Ye ${property.type} aapki investment requirements aur budget par perfect poora utarta hai. ${property.location} mein strong appreciation potential hai aur rental demand bhi achha hai.`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="rounded-2xl p-6 bg-deep border border-white/10 shadow-glow max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <span className="px-3 py-1 rounded-lg bg-primary/20 text-primary font-semibold text-sm">
            {property.aiScore}% Match
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{property.title}</h3>
        <p className="text-primary text-sm mb-4">{property.location} • PKR {property.price}</p>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-slate-300 text-sm leading-relaxed">{aiExplanation}</p>
        </div>
      </div>
    </div>
  )
}
