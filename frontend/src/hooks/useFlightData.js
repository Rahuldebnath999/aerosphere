import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const POLL_INTERVAL = 30_000   // 30 seconds (OpenSky rate limit friendly)
const MAX_FLIGHTS   = 6000     // Cap to avoid Cesium entity overload on free tier

/**
 * useFlightData
 * Polls the AeroSphere backend for live OpenSky flight states.
 * Returns aircraft array, loading state, error, stats, and manual refresh.
 */
export function useFlightData(options = {}) {
  const { bbox = null, autoStart = true } = options

  const [flights,    setFlights]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [stats,      setStats]      = useState({ total: 0, countries: 0 })

  const intervalRef  = useRef(null)
  const isMountedRef = useRef(true)
  const prevFlights  = useRef({})    // icao24 → flight (for delta tracking)

  const fetchFlights = useCallback(async () => {
    try {
      const params = bbox ? { bbox } : {}
      const { data } = await axios.get(`${API_BASE}/api/flights`, { params, timeout: 20_000 })

      if (!isMountedRef.current) return

      const limited = (data.flights || []).slice(0, MAX_FLIGHTS)

      // Track previous positions for smooth interpolation in the globe
      const prevMap = {}
      limited.forEach(f => {
        prevMap[f.icao24] = prevFlights.current[f.icao24] || null
      })
      prevFlights.current = limited.reduce((acc, f) => {
        acc[f.icao24] = f; return acc
      }, {})

      const countries = new Set(limited.map(f => f.originCountry)).size

      setFlights(limited)
      setStats({ total: data.count, countries, lastUpdated: data.time })
      setLastUpdate(new Date())
      setError(null)
      setLoading(false)

    } catch (err) {
      if (!isMountedRef.current) return

      const message = err.response?.status === 429
        ? 'Rate limited by OpenSky — retrying soon…'
        : err.message || 'Failed to fetch flight data'

      setError(message)
      setLoading(false)

      // Keep stale data on error rather than clearing it
    }
  }, [bbox])

  // Start polling
  const startPolling = useCallback(() => {
    fetchFlights()
    intervalRef.current = setInterval(fetchFlights, POLL_INTERVAL)
  }, [fetchFlights])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true

    if (autoStart) startPolling()

    return () => {
      isMountedRef.current = false
      stopPolling()
    }
  }, [autoStart, startPolling, stopPolling])

  // Manual refresh
  const refresh = useCallback(() => {
    setLoading(true)
    fetchFlights()
  }, [fetchFlights])

  return {
    flights,
    loading,
    error,
    lastUpdate,
    stats,
    refresh,
    startPolling,
    stopPolling,
  }
}
