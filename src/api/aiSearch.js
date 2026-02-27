import { getOrCreateThreadId } from '../utils/threadId'
import { API_BASE_URL, API_ENDPOINTS } from '../config'

/**
 * Backend data ko frontend layout ke mutabiq set karta hai
 */
function normalizeListings(data) {
  if (!data) return []
  // Python backend se ab 'listings' ki key aayegi
  const raw = data.listings || []
  
  return raw.map((item, index) => {
    // Price formatting logic
    let priceDisplay = item.price || '—';
    if (item.price && !isNaN(item.price)) {
        const p = parseFloat(item.price);
        priceDisplay = p >= 10000000 
            ? `${(p / 10000000).toFixed(2)} Cr` 
            : `${(p / 100000).toFixed(0)} Lac`;
    }

    return {
      id: item.id || index + 1,
      title: item.title || 'Property',
      location: item.location || item.location_name || '',
      price: priceDisplay,
      image: item.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=260&fit=crop',
      size: item.area || item.area_size || '',
      ...item,
    }
  })
}

/**
 * AI Search API Call
 */
export async function aiSearch(query, options = {}) {
  const q = String(query).trim()
  const threadId = options.threadId ?? getOrCreateThreadId()
  const messages = options.messages ?? [] // Initial search mein messages empty ho sakte hain

  try {
    const base = API_BASE_URL || 'http://127.0.0.1:8000'
    const url = API_ENDPOINTS.aiSearchConversation?.startsWith?.('http')
      ? API_ENDPOINTS.aiSearchConversation
      : `${base}${API_ENDPOINTS.aiConversation}`
    const res = await fetch(url, {
      method: 'POST',
      mode: 'cors', // Direct connection to port 8000
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: q, 
        threadId: threadId, 
        messages: messages 
      }),
    })

    if (!res.ok) {
      throw new Error(`Server Error: ${res.status}`);
    }

    const data = await res.json()
    console.log("📥 Backend Data Received:", data);

    return {
      raw: data,
      listings: normalizeListings(data),
      question: data.question || ''
    }
  } catch (error) {
    console.error("❌ Fetch Error:", error);
    throw error;
  }
}