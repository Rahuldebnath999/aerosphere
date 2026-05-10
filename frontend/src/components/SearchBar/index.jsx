import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Navigation2, Globe } from 'lucide-react'
import { filterFlights, getCountryEmoji, formatAltitude, degreesToCompass } from '../../utils/flightUtils'

// ─── SEARCH RESULT ITEM ───────────────────────────────────────────────────────

function ResultItem({ flight, onSelect, highlighted }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      onClick={() => onSelect(flight)}
      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 border-b border-horizon/20 last:border-0 group"
      style={{
        background: highlighted ? 'rgba(0,212,255,0.08)' : 'transparent',
      }}
      whileHover={{ background: 'rgba(0,212,255,0.06)' }}
    >
      {/* Aircraft icon */}
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
           style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
        <Navigation2 size={14} className="text-ion" style={{ transform: `rotate(${flight.trueTrack ?? 0}deg)` }} />
      </div>

      {/* Flight info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm text-white font-bold tracking-wider truncate">
            {flight.callsign}
          </span>
          <span className="text-xs">{getCountryEmoji(flight.originCountry)}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-mono text-xs text-text-muted">{flight.icao24}</span>
          <span className="text-horizon">·</span>
          <span className="font-body text-xs text-text-secondary">{formatAltitude(flight.baroAltitude)}</span>
          <span className="text-horizon">·</span>
          <span className="font-body text-xs text-text-muted">{degreesToCompass(flight.trueTrack)}</span>
        </div>
      </div>

      {/* Origin country */}
      <span className="font-heading text-xs text-text-muted shrink-0 hidden sm:block">
        {flight.originCountry}
      </span>
    </motion.button>
  )
}

// ─── MAIN SEARCH COMPONENT ────────────────────────────────────────────────────

export default function SearchBar({ flights, onSelect }) {
  const [query,     setQuery]     = useState('')
  const [focused,   setFocused]   = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef(null)

  const results = useMemo(() => {
    if (!query.trim()) return []
    return filterFlights(flights, query).slice(0, 8)
  }, [query, flights])

  const isOpen = focused && query.length > 0

  const handleSelect = (flight) => {
    onSelect(flight)
    setQuery('')
    setFocused(false)
    inputRef.current?.blur()
  }

  const handleClear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted(h => Math.min(h + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted(h => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[highlighted]) handleSelect(results[highlighted])
    } else if (e.key === 'Escape') {
      setFocused(false)
      setQuery('')
    }
  }

  // Reset highlight when results change
  useEffect(() => setHighlighted(0), [results.length])

  const dropdownVariants = {
    hidden:  { opacity: 0, y: -8, scale: 0.97 },
    visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
    exit:    { opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.15 } },
  }

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4 sm:px-0">
      {/* ── SEARCH INPUT ─────────────────────────────────────────────────── */}
      <motion.div
        animate={{
          boxShadow: focused
            ? '0 0 0 1px rgba(0,212,255,0.5), 0 8px 40px rgba(0,0,0,0.6), 0 0 30px rgba(0,212,255,0.15)'
            : '0 8px 32px rgba(0,0,0,0.5)',
        }}
        className="relative flex items-center rounded-xl overflow-hidden"
        style={{
          background: 'rgba(5, 13, 31, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${focused ? 'rgba(0,212,255,0.4)' : 'rgba(0,212,255,0.15)'}`,
          transition: 'border-color 0.2s ease',
        }}
      >
        <Search size={15} className="absolute left-4 text-text-muted shrink-0" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="Search callsign, airline, or country…"
          className="w-full bg-transparent pl-10 pr-10 py-3.5 font-body text-sm text-text-primary placeholder:text-text-muted outline-none"
          spellCheck={false}
        />

        {/* Clear button */}
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              onClick={handleClear}
              className="absolute right-3 w-6 h-6 rounded-full flex items-center justify-center text-text-muted hover:text-ion hover:bg-ion/10 transition-all"
            >
              <X size={12} />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── RESULTS DROPDOWN ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mt-2 rounded-xl overflow-hidden"
            style={{
              background: 'rgba(5, 13, 31, 0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(0, 212, 255, 0.15)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            }}
          >
            {results.length > 0 ? (
              <>
                {/* Header */}
                <div className="px-4 py-2.5 border-b border-horizon/30 flex items-center justify-between">
                  <span className="font-mono text-xs text-text-muted tracking-widest uppercase">
                    {results.length} aircraft found
                  </span>
                  <span className="font-mono text-xs text-text-muted">
                    ↑↓ to navigate · ↵ to select
                  </span>
                </div>

                {/* Results */}
                <div className="max-h-72 overflow-y-auto">
                  {results.map((flight, i) => (
                    <ResultItem
                      key={flight.icao24}
                      flight={flight}
                      onSelect={handleSelect}
                      highlighted={i === highlighted}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-8 gap-3">
                <Globe size={24} className="text-text-muted opacity-40" />
                <p className="font-body text-sm text-text-muted">No aircraft matching "{query}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
