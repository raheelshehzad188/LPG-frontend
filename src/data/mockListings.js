// Mock listings – prompt/filter match by keywords in title, location, tags
export const MOCK_LISTINGS = [
  { id: 1, title: '1 Kanal House', location: 'DHA Phase 5', price: '4.2 Cr', priceLac: 420, type: 'house', size: '1 kanal', aiScore: 95, image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=260&fit=crop' },
  { id: 2, title: '1 Kanal Luxury Villa', location: 'DHA Phase 6', price: '5 Cr', priceLac: 500, type: 'house', size: '1 kanal', aiScore: 92, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=260&fit=crop' },
  { id: 3, title: '2 Kanal House', location: 'DHA Phase 4', price: '8 Cr', priceLac: 800, type: 'house', size: '2 kanal', aiScore: 88, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=260&fit=crop' },
  { id: 4, title: '5 Marla House', location: 'DHA Phase 5', price: '1.2 Cr', priceLac: 120, type: 'house', size: '5 marla', aiScore: 90, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=260&fit=crop' },
  { id: 5, title: '10 Marla Plot', location: 'DHA', price: '85 Lac', priceLac: 85, type: 'plot', size: '10 marla', aiScore: 85, image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=260&fit=crop' },
  { id: 6, title: '3 Bed Apartment', location: 'Gulberg III', price: '1.8 Cr', priceLac: 180, type: 'apartment', size: '3 bed', aiScore: 87, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=260&fit=crop' },
  { id: 7, title: '1 Kanal House', location: 'Gulberg', price: '6 Cr', priceLac: 600, type: 'house', size: '1 kanal', aiScore: 84, image: 'https://images.unsplash.com/photo-1600587544340-873657ef1e64?w=400&h=260&fit=crop' },
  { id: 8, title: '5 Marla Plot', location: 'Bahria Town', price: '55 Lac', priceLac: 55, type: 'plot', size: '5 marla', aiScore: 82, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=260&fit=crop' },
  { id: 9, title: '1 Kanal Plot', location: 'Bahria Town', price: '1.1 Cr', priceLac: 110, type: 'plot', size: '1 kanal', aiScore: 80, image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=260&fit=crop' },
  { id: 10, title: '4 Bed Villa', location: 'DHA Phase 5', price: '3.5 Cr', priceLac: 350, type: 'house', size: '1 kanal', aiScore: 91, image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=260&fit=crop' },
  { id: 11, title: 'Under 2 Crore House', location: 'DHA Phase 8', price: '1.9 Cr', priceLac: 190, type: 'house', size: '10 marla', aiScore: 86, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=260&fit=crop' },
  { id: 12, title: 'Budget 1 Crore', location: 'Bahria', price: '95 Lac', priceLac: 95, type: 'house', size: '5 marla', aiScore: 83, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=260&fit=crop' },
]

function tokenize(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function matchesPrompt(listing, prompt) {
  if (!prompt || !prompt.trim()) return true
  const words = tokenize(prompt)
  const searchable = [
    listing.title,
    listing.location,
    listing.type,
    listing.size,
    listing.price,
  ].join(' ')
  const lower = searchable.toLowerCase()
  return words.some((w) => lower.includes(w))
}

function filterByBudget(listing, prompt) {
  const p = prompt.toLowerCase()
  const lac = listing.priceLac
  // under X crore / under X cr
  const underCr = p.match(/under\s*(\d+)\s*(cr|crore)?/)
  if (underCr) {
    const num = parseInt(underCr[1], 10)
    const maxLac = p.includes('cr') || p.includes('crore') ? num * 100 : num
    return lac <= maxLac
  }
  // X lac / X lac max
  if (/\d+\s*lac/.test(p)) {
    const match = p.match(/(\d+)\s*lac/)
    const max = match ? parseInt(match[1], 10) : 100
    return lac <= max
  }
  // X cr / X crore
  if (/\d+\s*(cr|crore)/.test(p)) {
    const match = p.match(/(\d+)\s*(?:cr|crore)/)
    const maxCr = match ? parseInt(match[1], 10) : 2
    return lac <= maxCr * 100
  }
  return true
}

export function getListingsForPrompt(prompt) {
  if (!prompt || !prompt.trim()) return MOCK_LISTINGS
  const filtered = MOCK_LISTINGS.filter(
    (l) => matchesPrompt(l, prompt) && filterByBudget(l, prompt)
  )
  // APIs nahi lagi – agar kuch match na ho to bhi dummy listings dikhao
  return filtered.length > 0 ? filtered : MOCK_LISTINGS
}

export function filterListings(listings, filterPrompt) {
  if (!filterPrompt || !filterPrompt.trim()) return listings
  const filtered = listings.filter(
    (l) => matchesPrompt(l, filterPrompt) && filterByBudget(l, filterPrompt)
  )
  return filtered.length > 0 ? filtered : listings
}

const DETAIL_DEFAULTS = {
  beds: 4,
  baths: 4,
  marlas: 20,
  facing: 'North',
  gallery: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600587544340-873657ef1e64?w=800&h=600&fit=crop',
  ],
  rentalYield: '6.2%',
  whyThisProperty: [
    'Strong capital appreciation in DHA Phase 5 over last 5 years.',
    'Rental demand high for 1 kanal houses in this block.',
    'LDA-approved; clear title and NOC available.',
  ],
  legalStatus: 'DHA Approved',
}

/** Dummy property for /property/1 when listing not in list (direct URL) */
const DUMMY_PROPERTY = {
  id: 1,
  title: '1 Kanal House',
  location: 'DHA Phase 5',
  price: '4.2 Cr',
  priceLac: 420,
  type: 'house',
  size: '1 kanal',
  aiScore: 95,
  image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
  beds: 4,
  baths: 4,
  marlas: 20,
  facing: 'North',
  gallery: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600587544340-873657ef1e64?w=800&h=600&fit=crop',
  ],
  rentalYield: '6.2%',
  whyThisProperty: [
    'Strong capital appreciation in DHA Phase 5 over last 5 years.',
    'Rental demand high for 1 kanal houses in this block.',
    'LDA-approved; clear title and NOC available.',
  ],
  legalStatus: 'DHA Approved',
}

export function getListingById(id) {
  const idNum = parseInt(id, 10)
  const listing = MOCK_LISTINGS.find((l) => l.id === idNum)
  const base = listing || (idNum === 1 ? DUMMY_PROPERTY : null)
  if (!base) return null
  return {
    ...DETAIL_DEFAULTS,
    ...base,
    gallery: base.gallery || DETAIL_DEFAULTS.gallery.slice(0, 5),
  }
}
