import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation, RefreshCw, AlertCircle, ChevronLeft, Wifi, Activity } from 'lucide-react'

// ─── LIVE CLOCK ───────────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="hud-value tabular-nums">
      {time.toUTCString().split(' ')[4]} UTC
    </span>
  )
}

// ─── MINI RADAR ───────────────────────────────────────────────────────────────

function MiniRadar({ active }) {
  return (
    <div className="relative w-10 h-10">
      {/* Radar circles */}
      {[1, 0.66, 0.33].map((scale, i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-full border border-ion/20"
          style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
        />
      ))}

      {/* Cross hairs */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-px bg-ion/20" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-full w-px bg-ion/20" />
      </div>

      {/* Rotating sweep */}
      {active && (
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{ animation: 'radarSweep 3s linear infinite' }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'conic-gradient(from 0deg, rgba(0,212,255,0) 330deg, rgba(0,212,255,0.4) 360deg)',
              borderRadius: '50%',
            }}
          />
        </div>
      )}

      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-ion animate-pulse" />
      </div>
    </div>
  )
}

// ─── HUD PANEL ────────────────────────────────────────────────────────────────

function HudPanel({ children, position = 'top-left', className = '' }) {
  const posMap = {
    'top-left':     'top-4 left-4',
    'top-right':    'top-4 right-4',
    'bottom-left':  'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`absolute z-30 ${posMap[position]} ${className}`}
    >
      <div
        className="rounded-xl p-3"
        style={{
          background: 'rgba(2, 6, 15, 0.8)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 212, 255, 0.12)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        {children}
      </div>
    </motion.div>
  )
}

// ─── STAT CHIP ────────────────────────────────────────────────────────────────

function StatChip({ label, value, color = '#00D4FF' }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="hud-label">{label}</span>
      <span className="hud-value" style={{ color }}>{value ?? '—'}</span>
    </div>
  )
}

// ─── MAIN HUD ─────────────────────────────────────────────────────────────────

export default function HUD({ stats, loading, error, lastUpdate, onBack, onRefresh }) {
  const [showDetails, setShowDetails] = useState(false)

  const formatLastUpdate = (date) => {
    if (!date) return 'Never'
    const secs = Math.round((new Date() - date) / 1000)
    if (secs < 10)  return 'Just now'
    if (secs < 60)  return `${secs}s ago`
    return `${Math.round(secs / 60)}m ago`
  }

  const [updateDisplay, setUpdateDisplay] = useState('—')
  useEffect(() => {
    const tick = () => setUpdateDisplay(formatLastUpdate(lastUpdate))
    tick()
    const id = setInterval(tick, 5000)
    return () => clearInterval(id)
  }, [lastUpdate])

  return (
    <>
      {/* ── TOP-LEFT: Logo + Stats ─────────────────────────────────────── */}
      <HudPanel position="top-left" className="max-w-xs">
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-horizon/30">
          {/* Back button */}
          <button
            onClick={onBack}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-ion hover:bg-ion/10 transition-all"
            title="Back to Landing Page"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <Navigation size={14} className="text-ion" />
            <span className="font-display text-sm font-bold tracking-widest">
              AERO<span className="text-ion">SPHERE</span>
            </span>
          </div>

          {/* Live indicator */}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-plasma animate-pulse" />
            <span className="font-mono text-xs text-plasma">LIVE</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-5">
          <MiniRadar active={!loading && !error} />
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <StatChip label="AIRBORNE" value={stats?.total?.toLocaleString()} />
            <StatChip label="COUNTRIES" value={stats?.countries} color="#00FFD1" />
          </div>
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex items-center gap-2 text-corona"
            >
              <AlertCircle size={11} />
              <span className="font-mono text-xs truncate">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </HudPanel>

      {/* ── TOP-RIGHT: Time + Signal ───────────────────────────────────── */}
      <HudPanel position="top-right">
        <div className="flex flex-col items-end gap-1.5 min-w-[140px]">
          <LiveClock />
          <div className="flex items-center gap-1.5">
            <Wifi size={10} className="text-text-muted" />
            <span className="hud-label">OPENSKY NETWORK</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-ion transition-colors"
              title="Refresh flight data"
            >
              <RefreshCw size={10} className={loading ? 'animate-spin text-ion' : ''} />
            </button>
            <span className="hud-label">UPDATED {updateDisplay.toUpperCase()}</span>
          </div>
        </div>
      </HudPanel>

      {/* ── BOTTOM-LEFT: Activity Bar ──────────────────────────────────── */}
      <HudPanel position="bottom-left">
        <div className="flex items-center gap-3">
          <Activity size={12} className="text-ion" />
          <div className="flex flex-col">
            <span className="hud-label">DATA STREAM</span>
            <div className="flex gap-0.5 mt-1">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 rounded-full bg-ion transition-all duration-300"
                  style={{
                    height: `${Math.random() * 16 + 4}px`,
                    opacity: loading ? 0.3 : 0.6 + Math.random() * 0.4,
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </HudPanel>

      {/* ── BOTTOM-RIGHT: Data source attribution ─────────────────────── */}
      <HudPanel position="bottom-right">
        <div className="text-right space-y-0.5">
          <p className="hud-label">DATA SOURCE</p>
          <p className="font-mono text-xs text-ion">OpenSky Network</p>
          <p className="hud-label mt-1">RENDERING</p>
          <p className="font-mono text-xs" style={{ color: '#7BA7CC' }}>CesiumJS</p>
        </div>
      </HudPanel>

      {/* ── LOADING OVERLAY ───────────────────────────────────────────── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{
              background: 'rgba(2, 6, 15, 0.92)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="text-center">
              {/* Animated logo */}
              <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mb-8"
              >
                <div className="w-20 h-20 rounded-full border-2 border-ion/30 flex items-center justify-center mx-auto relative">
                  <Navigation size={32} className="text-ion" />
                  <div className="absolute inset-0 rounded-full border-t-2 border-ion animate-spin" />
                  <div
                    className="absolute inset-2 rounded-full border-t border-plasma"
                    style={{ animation: 'spin 1.5s linear infinite reverse' }}
                  />
                </div>
              </motion.div>

              <h2 className="font-display text-xl font-bold text-white mb-3 tracking-widest">
                AERO<span className="text-ion">SPHERE</span>
              </h2>
              <p className="font-heading text-sm text-text-secondary mb-8 tracking-widest">
                Initializing Globe & Loading Aircraft
              </p>

              {/* Loading bar */}
              <div className="w-64 h-0.5 bg-horizon/40 rounded-full overflow-hidden mx-auto">
                <div className="h-full loading-bar rounded-full" style={{ width: '70%' }} />
              </div>

              <p className="font-mono text-xs text-text-muted mt-4">
                Connecting to OpenSky Network…
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
