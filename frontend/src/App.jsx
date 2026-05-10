import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import LandingPage from './components/LandingPage'
import TrackerPage from './components/TrackerPage'

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6 } },
  exit:    { opacity: 0, transition: { duration: 0.4 } },
}

export default function App() {
  const [view, setView] = useState('landing')
  const handleLaunch = useCallback(() => { setView('tracker'); window.scrollTo(0, 0) }, [])
  const handleBack   = useCallback(() => setView('landing'), [])

  return (
    <AnimatePresence mode="wait">
      {view === 'landing'
        ? <motion.div key="landing" {...fade}><LandingPage onLaunch={handleLaunch} /></motion.div>
        : <motion.div key="tracker" {...fade}><TrackerPage onBack={handleBack} /></motion.div>
      }
    </AnimatePresence>
  )
}
