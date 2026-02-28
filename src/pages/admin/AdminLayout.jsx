import React, { useState } from 'react'
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  LogOut,
  Menu,
  X,
  Database,
  ChevronRight,
  Sparkles,
  Settings,
} from 'lucide-react'

const AUTH_KEY = 'lpg_admin_auth'

const SIDEBAR_ITEMS = [
  { path: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { path: '/admin/leads', icon: UserPlus, label: 'Leads' },
  { path: '/admin/agents', icon: Users, label: 'Agents' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
  { path: '/admin/scraping', icon: Database, label: 'Scraping Status' },
  { path: '/admin/gemini', icon: Sparkles, label: 'Gemini Settings' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY)
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-slate-900/50 border-r border-white/5">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-white/5">
          <Link to="/" className="text-lg font-semibold text-white">
            LPG<span className="text-primary">.com</span>
          </Link>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-medium">
            Admin
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/20 text-primary'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-white/5">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-white/5 transform transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <Link to="/" className="text-lg font-semibold text-white">
            LPG<span className="text-primary">.com</span>
          </Link>
          <button type="button" onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="px-3 py-4 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-4 px-4 py-3 bg-slate-950/80 backdrop-blur-md border-b border-white/5 lg:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-white/5"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <span className="text-slate-500 text-sm">Lahore Property Guide Admin</span>
        </header>
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
