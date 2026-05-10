/**
 * flightUtils.js
 * Utility functions for the AeroSphere flight tracking system
 */

/**
 * Create a canvas-drawn aircraft icon as a data URL.
 * The aircraft shape is a triangle rotated to the given heading.
 * @param {number} heading - Aircraft heading in degrees (0=North)
 * @param {string} color   - Fill color (CSS color string)
 * @param {number} size    - Canvas size in px (default 32)
 */
export function createAircraftIcon(heading = 0, color = '#00D4FF', size = 32) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')
  const cx = size / 2
  const cy = size / 2
  const r  = size * 0.42   // radius for body
  const rad = (heading - 90) * (Math.PI / 180) // offset so 0° points up

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rad)

  // Outer glow
  ctx.shadowColor = color
  ctx.shadowBlur  = 8

  // Aircraft body (stylized arrowhead)
  ctx.beginPath()
  ctx.moveTo(0, -r)                    // nose
  ctx.lineTo(r * 0.45, r * 0.55)      // right wing tip
  ctx.lineTo(0, r * 0.25)             // tail notch
  ctx.lineTo(-r * 0.45, r * 0.55)     // left wing tip
  ctx.closePath()

  ctx.fillStyle = color
  ctx.globalAlpha = 0.92
  ctx.fill()

  // Bright center dot
  ctx.shadowBlur = 4
  ctx.beginPath()
  ctx.arc(0, 0, 2, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.globalAlpha = 0.8
  ctx.fill()

  ctx.restore()

  return canvas.toDataURL('image/png')
}

/**
 * Format altitude from metres to a readable string with units
 */
export function formatAltitude(metres) {
  if (metres == null) return '—'
  const feet = metres * 3.28084
  return `${Math.round(feet).toLocaleString()} ft`
}

/**
 * Format speed from m/s to knots and km/h
 */
export function formatSpeed(mps) {
  if (mps == null) return '—'
  const knots = mps * 1.94384
  const kmh   = mps * 3.6
  return `${Math.round(knots)} kts  (${Math.round(kmh)} km/h)`
}

/**
 * Format vertical rate (m/s) to a human-readable climb/descent indicator
 */
export function formatVerticalRate(mps) {
  if (mps == null || Math.abs(mps) < 0.1) return '→ Level'
  const fpm = mps * 196.85
  const dir = mps > 0 ? '↑ Climbing' : '↓ Descending'
  return `${dir}  ${Math.abs(Math.round(fpm)).toLocaleString()} fpm`
}

/**
 * Format coordinates to DMS notation
 */
export function formatCoordinate(deg, type) {
  if (deg == null) return '—'
  const abs = Math.abs(deg)
  const d = Math.floor(abs)
  const mTotal = (abs - d) * 60
  const m = Math.floor(mTotal)
  const s = ((mTotal - m) * 60).toFixed(1)

  const dir = type === 'lat'
    ? (deg >= 0 ? 'N' : 'S')
    : (deg >= 0 ? 'E' : 'W')

  return `${d}° ${m}' ${s}" ${dir}`
}

/**
 * Convert degrees to a compass bearing label
 */
export function degreesToCompass(deg) {
  if (deg == null) return '—'
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW']
  const idx = Math.round(((deg % 360) + 360) / 22.5) % 16
  return `${dirs[idx]}  ${Math.round(deg)}°`
}

/**
 * Get a Cesium Color from flight altitude (lower = cyan, higher = white/blue)
 */
export function getAltitudeColor(altitude) {
  if (!altitude || altitude < 1000)  return '#00FFD1'  // plasma (low)
  if (altitude < 5000)               return '#00D4FF'  // ion (medium-low)
  if (altitude < 10000)              return '#4DB8FF'  // mid blue
  return '#FFFFFF'                                      // white (high)
}

/**
 * Lerp between two values for smooth animation
 */
export function lerp(a, b, t) {
  return a + (b - a) * t
}

/**
 * Interpolate aircraft positions for smooth movement
 */
export function interpolatePosition(prev, next, t) {
  return {
    latitude:  lerp(prev.latitude,  next.latitude,  t),
    longitude: lerp(prev.longitude, next.longitude, t),
    altitude:  lerp(prev.baroAltitude || 0, next.baroAltitude || 0, t),
  }
}

/**
 * Filter flights by search query (callsign or country)
 */
export function filterFlights(flights, query) {
  if (!query.trim()) return flights
  const q = query.toLowerCase()
  return flights.filter(f =>
    f.callsign.toLowerCase().includes(q) ||
    f.originCountry.toLowerCase().includes(q) ||
    f.icao24.toLowerCase().includes(q)
  )
}

/**
 * Country flag emoji from country name (simplified lookup)
 */
export function getCountryEmoji(country) {
  const map = {
    'United States': '🇺🇸', 'Germany': '🇩🇪', 'France': '🇫🇷',
    'United Kingdom': '🇬🇧', 'China': '🇨🇳', 'Japan': '🇯🇵',
    'Australia': '🇦🇺', 'Canada': '🇨🇦', 'Netherlands': '🇳🇱',
    'Spain': '🇪🇸', 'Italy': '🇮🇹', 'Russia': '🇷🇺',
    'Brazil': '🇧🇷', 'India': '🇮🇳', 'South Korea': '🇰🇷',
    'Turkey': '🇹🇷', 'Mexico': '🇲🇽', 'Switzerland': '🇨🇭',
    'Sweden': '🇸🇪', 'Norway': '🇳🇴', 'Denmark': '🇩🇰',
    'Austria': '🇦🇹', 'Belgium': '🇧🇪', 'Finland': '🇫🇮',
    'Portugal': '🇵🇹', 'Poland': '🇵🇱', 'Greece': '🇬🇷',
    'Czech Republic': '🇨🇿', 'Ireland': '🇮🇪', 'Singapore': '🇸🇬',
    'UAE': '🇦🇪', 'Qatar': '🇶🇦', 'Thailand': '🇹🇭',
  }
  return map[country] || '✈️'
}
