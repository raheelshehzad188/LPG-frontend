import React from 'react'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-deep/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
        <a href="/" className="text-lg font-semibold text-white tracking-tight">
          LahorePropertyGuide<span className="text-primary">.com</span>
        </a>
        <div className="flex items-center gap-4">
          <a href="/" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
            Find Property
          </a>
          <a href="/partner" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
            Partner Panel
          </a>
          <a href="/admin" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
            Admin Panel
          </a>
        </div>
      </div>
    </nav>
  )
}
