import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const AUTH_KEY = 'lpg_partner_auth'

export default function PartnerLayout() {
  const auth = localStorage.getItem(AUTH_KEY)
  if (!auth) return <Navigate to="/partner/login" replace />
  return <Outlet />
}
