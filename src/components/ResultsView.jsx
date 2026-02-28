import React from 'react'
import { getPropertyImageSrc } from '../utils/propertyImage'

const MOCK_PROPERTIES = [
  {
    id: 1,
    title: 'Luxury 4 Bed Villa',
    location: 'DHA Phase 5',
    price: '4.2 Cr',
    aiScore: 92,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=260&fit=crop',
  },
  {
    id: 2,
    title: 'Modern 3 Bed Apartment',
    location: 'Gulberg III',
    price: '1.8 Cr',
    aiScore: 88,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=260&fit=crop',
  },
  {
    id: 3,
    title: '5 Marla Plot',
    location: 'Bahria Town',
    price: '55 Lac',
    aiScore: 85,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=260&fit=crop',
  },
]

export default function ResultsView({ data }) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        {/* Left: AI Analysis card */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl p-6 bg-white/5 backdrop-blur-md border border-white/10 h-full transition-transform duration-200 hover:scale-[1.02]">
            <h3 className="text-lg font-semibold text-primary mb-4">AI Analysis</h3>
            <div className="text-slate-300 text-sm space-y-3">
              <p>
                <strong className="text-white">Purpose:</strong> {data?.purpose || '—'}
              </p>
              <p>
                <strong className="text-white">Location:</strong> {data?.location || '—'}
              </p>
              <p>
                <strong className="text-white">Budget:</strong> {data?.budget ? `${data.budget} Lac PKR` : '—'}
              </p>
            </div>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed">
              Based on your preferences, we recommend focusing on {data?.location || 'selected areas'} within your budget.
              The listings on the right are ranked by our AI match score. You can expect a follow-up on WhatsApp shortly.
            </p>
          </div>
        </div>

        {/* Right: Property cards grid */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_PROPERTIES.map((prop) => (
            <div
              key={prop.id}
              className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-200 hover:scale-105 hover:shadow-glow"
            >
              <div className="relative h-40 sm:h-44 bg-slate-700">
                <img
                  src={getPropertyImageSrc(prop)}
                  alt={prop.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-primary/90 text-white text-xs font-semibold shadow-glow">
                  AI Score {prop.aiScore}
                </span>
              </div>
              <div className="p-4">
                <p className="text-primary text-xs font-medium">{prop.location}</p>
                <h4 className="font-semibold text-white mt-1">{prop.title}</h4>
                <p className="text-slate-400 text-sm mt-1">PKR {prop.price}</p>
                <button
                  type="button"
                  className="mt-3 w-full py-2 rounded-xl bg-primary text-white font-medium text-sm shadow-glow hover:opacity-90 transition-opacity"
                >
                  View details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
