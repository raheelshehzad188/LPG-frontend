import React, { useState, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ListingsView from './components/ListingsView'
import PropertyDetail from './components/PropertyDetail'
import PartnerDashboard from './pages/PartnerDashboard'
import PartnerLogin from './pages/PartnerLogin'
import AdminShell from './pages/admin/AdminLayout'
import AdminOverview from './pages/admin/AdminOverview'
import AdminLeads from './pages/admin/AdminLeads'
import AdminAgents from './pages/admin/AdminAgents'
import AdminScraping from './pages/admin/AdminScraping'
import AdminSettings from './pages/admin/AdminSettings'
import AdminGeminiSettings from './pages/admin/AdminGeminiSettings'
import AdminLogin from './pages/AdminLogin'
import PartnerLayout from './components/PartnerLayout'
import AdminAuthLayout from './components/AdminLayout'
import { aiSearchConversation } from './api/aiSearchConversation'
import { startNewThread } from './utils/threadId'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [initialPrompt, setInitialPrompt] = useState('')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ✅ New chat = naya thread ID. Same chat mein wahi thread ID pass hota rahega.
  const handleSearch = useCallback((prompt) => {
    startNewThread() // Purana thread hatao, naya banao
    setError(null)
    setInitialPrompt(prompt)
    setListings([])
    setScreen('listings')
  }, [])

  // ✅ AI CONVERSATION: threadId pass hota hai — same chat mein same, naya chat mein naya
  const handleConversation = useCallback(async ({ query, messages, threadId }) => {
    setLoading(true)
    try {
      const res = await aiSearchConversation({
        query,
        messages: messages || [],
        threadId,
      })
      
      if (res.listings) {
        setListings(res.listings)
      }
      
      return res; 
    } catch (err) {
      console.error("Conversation Error:", err)
      setError("Connection failed")
      return { question: "Server error occurred.", listings: [] }
    } finally {
      setLoading(false)
    }
  }, [])

  const handleBack = useCallback(() => {
    setScreen('home')
    setInitialPrompt('')
    setListings([])
    setError(null)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950">
      <Routes>
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/partner/login" element={<PartnerLogin />} />
        <Route path="/partner" element={<PartnerLayout />}>
          <Route index element={<PartnerDashboard />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminAuthLayout />}>
          <Route element={<AdminShell />}>
            <Route index element={<AdminOverview />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="agents" element={<AdminAgents />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="scraping" element={<AdminScraping />} />
            <Route path="gemini" element={<AdminGeminiSettings />} />
          </Route>
        </Route>
        <Route
          path="*"
          element={
            <>
              <Navbar />
              <main>
                {screen === 'home' && (
                  <Hero onSearch={handleSearch} loading={loading} error={error} />
                )}
                {screen === 'listings' && (
                  <ListingsView
                    initialPrompt={initialPrompt}
                    listings={listings}
                    onBack={handleBack}
                    onConversation={handleConversation}
                    onListingsUpdate={setListings}
                    apiError={error}
                  />
                )}
              </main>
            </>
          }
        />
      </Routes>
    </div>
  )
}