import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import LandingPage from './components/LandingPage'
import TrackerPage from './components/TrackerPage'

const fade = {
  initial: {
    opacity: 0,
  },

  animate: {
    opacity: 1,
    transition: {
      duration: 0.6,
    },
  },

  exit: {
    opacity: 0,
    transition: {
      duration: 0.4,
    },
  },
}

export default function App() {

  const [view, setView] =
    useState('landing')

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {

    const timer =
      setTimeout(() => {

        setLoading(false)

      }, 2500)

    return () =>
      clearTimeout(timer)

  }, [])

  const handleLaunch =
    useCallback(() => {

      setView('tracker')

      window.scrollTo(0, 0)

    }, [])

  const handleBack =
    useCallback(() => {

      setView('landing')

    }, [])

  if (loading) {

    return (

      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: '#000',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          color: '#00ffff',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >

        <div
          style={{
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: 4,
            marginBottom: 20,
          }}
        >
          AEROSPHERE
        </div>

        <div
          style={{
            width: 240,
            height: 3,
            borderRadius: 999,
            background:
              'rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}
        >

          <motion.div
            initial={{
              x: '-100%',
            }}

            animate={{
              x: '100%',
            }}

            transition={{
              repeat: Infinity,
              duration: 1.4,
              ease: 'linear',
            }}

            style={{
              width: '40%',
              height: '100%',
              background: '#00ffff',
            }}
          />

        </div>

        <div
          style={{
            marginTop: 16,
            fontSize: 12,
            opacity: 0.6,
            letterSpacing: 2,
          }}
        >
          INITIALIZING FLIGHT NETWORK
        </div>

      </div>
    )
  }

  return (

    <AnimatePresence mode="wait">

      {view === 'landing'
        ? (

          <motion.div
            key='landing'
            {...fade}
          >

            <LandingPage
              onLaunch={
                handleLaunch
              }
            />

          </motion.div>
        )
        : (

          <motion.div
            key='tracker'
            {...fade}
          >

            <TrackerPage
              onBack={
                handleBack
              }
            />

          </motion.div>
        )}

    </AnimatePresence>
  )
}