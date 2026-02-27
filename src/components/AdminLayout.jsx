import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const AUTH_KEY = 'lpg_admin_auth'

export default function AdminLayout() {
  const auth = localStorage.getItem(AUTH_KEY)
  if (!auth) return <Navigate to="/admin/login" replace />
  return <Outlet />
}
