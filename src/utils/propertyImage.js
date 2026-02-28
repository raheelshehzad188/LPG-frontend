import { PROPERTY_IMAGES_BASE, PROPERTY_IMAGE_PLACEHOLDER } from '../config'

/**
 * Build full property image URL from API path.
 * API returns e.g. "53396901_cover.jpg" → http://localhost:8000/property/53396901_cover.jpg
 * Full URLs passed as-is.
 */
export function getPropertyImageUrl(path) {
  if (!path || typeof path !== 'string') return null
  const trimmed = path.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  const segment = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed
  const base = PROPERTY_IMAGES_BASE ? `${PROPERTY_IMAGES_BASE.replace(/\/+$/, '')}/` : '/'
  return `${base}property/${segment}`
}

/**
 * Get image URL with fallback for listings/cards.
 */
export function getPropertyImageSrc(prop, fallback = PROPERTY_IMAGE_PLACEHOLDER) {
  const path = prop?.cover_photo ?? prop?.image ?? prop?.images?.[0]
  const url = getPropertyImageUrl(path)
  return url || fallback
}

/**
 * Resolve array of image paths to full URLs (for galleries).
 */
export function resolveGalleryUrls(paths) {
  if (!Array.isArray(paths) || paths.length === 0) return []
  return paths.map((p) => getPropertyImageUrl(p) || p).filter(Boolean)
}
