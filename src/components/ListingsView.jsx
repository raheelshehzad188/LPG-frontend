import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { getPropertyImageSrc } from '../utils/propertyImage'
import AIAssistant from './AIAssistant'

export default function ListingsView({
  initialPrompt,
  listings: displayListings,
  onBack,
  onConversation,
  onListingsUpdate,
}) {
  const listingsRef = useRef(null)

  return (
    <div className="flex min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] relative bg-slate-950 overflow-hidden">
      
      {/* Properties — 60% on desktop */}
      <div className="flex-1 lg:w-[60%] overflow-auto scroll-smooth pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button onClick={onBack} className="text-slate-400 hover:text-white mb-6 text-sm">← New search</button>
          
          <div className="rounded-2xl p-6 bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
            <p className="text-slate-400 text-sm mb-1">Search Results for</p>
            <p className="text-white font-medium text-lg">{initialPrompt}</p>
          </div>

          <h2 ref={listingsRef} className="text-xl font-bold text-white mb-6 scroll-mt-20">
            Matching Properties ({displayListings?.length || 0})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {displayListings && displayListings.map((prop) => (
              <div key={prop.id} className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 p-2 transition-all hover:border-primary/50">
                <img src={getPropertyImageSrc(prop)} alt="" className="w-full h-44 object-cover rounded-xl" />
                <div className="p-3">
                  <p className="text-primary text-sm font-medium flex items-center gap-1 mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {prop.location_name || prop.area || prop.location || '—'}
                  </p>
                  <h4 className="text-white font-bold">{prop.title}</h4>
                  <p className="text-primary font-semibold mt-1">{prop.price}</p>
                  <Link
                    to={`/property/${prop.id}`}
                    state={{ listing: prop }}
                    className="mt-3 block w-full py-2 rounded-xl bg-primary text-white text-center text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {(!displayListings || displayListings.length === 0) && (
            <div className="text-center py-20 text-slate-500 italic">
              AI Assistant is searching...
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant — 40% on desktop, full on mobile */}
      <div className="lg:w-[40%] min-w-0 border-l border-white/10 shadow-2xl flex flex-col h-[calc(100vh-4rem)]">
        <AIAssistant
          initialPrompt={initialPrompt}
          onConversation={onConversation}
          onFilterListings={onListingsUpdate}
        />
      </div>
    </div>
  )
}