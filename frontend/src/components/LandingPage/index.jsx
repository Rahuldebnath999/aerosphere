import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Globe, Zap, Shield, Activity, Radio, Layers,
  ChevronDown, ArrowRight, Wind, Navigation
} from 'lucide-react'

// ─── CANVAS STARFIELD + AIRCRAFT TRAILS ──────────────────────────────────────

function useStarfield(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animId
    let W = window.innerWidth
    let H = window.innerHeight

    const resize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    resize()

    // Stars
    const STAR_COUNT = Math.min(280, Math.floor((W * H) / 8000))
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.2,
      opacity: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.003 + 0.001,
    }))

    // Moving aircraft trails
    const PLANE_COUNT = 8
    const planes = Array.from({ length: PLANE_COUNT }, () => createPlane(W, H))

    function createPlane(W, H) {
      const angle = (Math.random() * 60 - 30) * (Math.PI / 180)  // slight diagonal
      const speed = Math.random() * 0.4 + 0.15
      const fromLeft = Math.random() > 0.5
      return {
        x:     fromLeft ? -20 : W + 20,
        y:     Math.random() * H * 0.7 + H * 0.1,
        vx:    fromLeft ? speed : -speed,
        vy:    (Math.random() - 0.5) * 0.08,
        size:  Math.random() * 3 + 2,
        trail: [],
        color: Math.random() > 0.5 ? '#00D4FF' : '#00FFD1',
        maxTrail: Math.floor(Math.random() * 80 + 60),
        opacity: Math.random() * 0.5 + 0.3,
      }
    }

    let t = 0
    function draw() {
      ctx.clearRect(0, 0, W, H)

      // ── Gradient background vignette
      const vign = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W * 0.7)
      vign.addColorStop(0, 'rgba(9,20,40,0)')
      vign.addColorStop(1, 'rgba(2,6,15,0.6)')
      ctx.fillStyle = vign
      ctx.fillRect(0, 0, W, H)

      // ── Stars
      t += 0.012
      stars.forEach(s => {
        const pulse = Math.sin(t * s.speed * 60 + s.pulse) * 0.3
        ctx.globalAlpha = Math.max(0, s.opacity + pulse)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = '#E8F4FF'
        ctx.fill()
      })

      // ── Subtle grid lines (horizon perspective)
      ctx.globalAlpha = 0.04
      ctx.strokeStyle = '#00D4FF'
      ctx.lineWidth = 0.5
      const gridY = H * 0.65
      const VP_X = W / 2
      for (let i = 0; i <= 20; i++) {
        const x = (i / 20) * W
        ctx.beginPath()
        ctx.moveTo(x, H)
        ctx.lineTo(VP_X + (x - VP_X) * 0.1, gridY)
        ctx.stroke()
      }
      for (let i = 0; i <= 8; i++) {
        const progress = i / 8
        const lineY = gridY + (H - gridY) * progress
        const spreadFactor = 1 - progress * 0.9
        ctx.beginPath()
        ctx.moveTo(VP_X - (W/2) * spreadFactor, lineY)
        ctx.lineTo(VP_X + (W/2) * spreadFactor, lineY)
        ctx.stroke()
      }

      // ── Aircraft trails
      ctx.globalAlpha = 1
      planes.forEach((p, idx) => {
        p.x += p.vx
        p.y += p.vy
        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > p.maxTrail) p.trail.shift()

        // Reset plane when off-screen
        if (p.x < -100 || p.x > W + 100 || p.y < -50 || p.y > H + 50) {
          planes[idx] = createPlane(W, H)
          return
        }

        // Draw trail
        for (let i = 1; i < p.trail.length; i++) {
          const progress = i / p.trail.length
          ctx.globalAlpha = progress * p.opacity * 0.6
          ctx.strokeStyle = p.color
          ctx.lineWidth = progress * 1.5
          ctx.beginPath()
          ctx.moveTo(p.trail[i-1].x, p.trail[i-1].y)
          ctx.lineTo(p.trail[i].x, p.trail[i].y)
          ctx.stroke()
        }

        // Draw aircraft dot with glow
        ctx.globalAlpha = p.opacity
        ctx.shadowColor = p.color
        ctx.shadowBlur = 12
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      })

      ctx.globalAlpha = 1
      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [canvasRef])
}

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────

function AnimatedCounter({ to, suffix = '', decimals = 0 }) {
  const ref = useRef(null)
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: to,
          duration: 2.5,
          ease: 'power2.out',
          onUpdate: function () {
            setDisplayed(+this.targets()[0].val.toFixed(decimals))
          }
        })
      },
      once: true,
    })
    return () => trigger.kill()
  }, [to, decimals])

  return (
    <span ref={ref} className="stat-value">
      {displayed.toLocaleString()}{suffix}
    </span>
  )
}

// ─── FEATURE CARD ─────────────────────────────────────────────────────────────

const features = [
  {
    icon: Globe,
    title: 'Cinematic 3D Globe',
    body: 'Powered by CesiumJS — photorealistic Earth rendered in real time with atmospheric scattering and satellite imagery.',
    color: '#00D4FF',
  },
  {
    icon: Activity,
    title: 'Real-Time Tracking',
    body: 'Live ADS-B data from thousands of ground stations, updated every 30 seconds from the OpenSky Network.',
    color: '#00FFD1',
  },
  {
    icon: Zap,
    title: 'Instant Intelligence',
    body: 'Click any aircraft for detailed telemetry — callsign, altitude, speed, heading, and origin country.',
    color: '#0066FF',
  },
  {
    icon: Shield,
    title: 'Military-Grade UI',
    body: 'Futuristic HUD overlay with atmospheric lighting, glassmorphism panels, and cinematic transitions.',
    color: '#FF6B35',
  },
  {
    icon: Radio,
    title: 'Global Coverage',
    body: 'Track over 10,000 simultaneous flights across all 7 continents with 6,000+ active OpenSky receivers.',
    color: '#00D4FF',
  },
  {
    icon: Layers,
    title: 'Smart Filtering',
    body: 'Search by callsign, airline, or region. Filter by altitude band, aircraft type, and origin country.',
    color: '#00FFD1',
  },
]

const stats = [
  { label: 'Flights Tracked Daily',  to: 120000, suffix: '+' },
  { label: 'Global Airports',         to: 10000,  suffix: '+' },
  { label: 'Ground Stations',         to: 6000,   suffix: '+' },
  { label: 'Data Refresh (seconds)',  to: 30,     suffix: 's' },
]

// ─── MAIN LANDING PAGE ────────────────────────────────────────────────────────

export default function LandingPage({ onLaunch }) {
  const canvasRef = useRef(null)
  const heroRef   = useRef(null)
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const heroY       = useTransform(scrollYProgress, [0, 0.4], [0, -80])

  useStarfield(canvasRef)

  // GSAP scroll-triggered section reveals
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stats bar
      gsap.from('.stat-card', {
        scrollTrigger: { trigger: '.stats-section', start: 'top 80%' },
        opacity: 0, y: 40, stagger: 0.15, duration: 0.8,
      })

      // Feature cards
      gsap.from('.feature-card', {
        scrollTrigger: { trigger: '.features-section', start: 'top 75%' },
        opacity: 0, y: 60, stagger: 0.1, duration: 0.8,
      })

      // CTA section
      gsap.from('.cta-section > *', {
        scrollTrigger: { trigger: '.cta-section', start: 'top 80%' },
        opacity: 0, y: 30, stagger: 0.2, duration: 0.8,
      })
    })
    return () => ctx.revert()
  }, [])

  const staggerChildren = {
    animate: { transition: { staggerChildren: 0.12 } }
  }

  const fadeUp = {
    initial: { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
  }

  const charReveal = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  }

  return (
    <div className="relative bg-void text-text-primary overflow-x-hidden">
      {/* ── CANVAS BACKGROUND ─────────────────────────────────────────────── */}
      <canvas ref={canvasRef} className="canvas-bg" />

      {/* ── NAVIGATION ────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full border border-ion flex items-center justify-center glow-ion">
                <Navigation size={16} className="text-ion" />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-plasma animate-ping opacity-70" />
            </div>
            <span className="font-display text-lg font-bold tracking-widest text-white">
              AERO<span className="text-ion">SPHERE</span>
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            {['Globe', 'Features', 'About'].map(link => (
              <a key={link} href="#" className="font-heading text-sm text-text-secondary hover:text-ion transition-colors duration-200 tracking-widest uppercase">
                {link}
              </a>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={onLaunch}
            className="btn-ion hidden sm:block"
          >
            <span>Launch Tracker</span>
          </button>
        </div>
      </motion.nav>

      {/* ── HERO SECTION ──────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 pb-12">

        {/* Atmospheric glow behind hero */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,102,255,0.12) 0%, transparent 70%)',
          }}
        />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 max-w-5xl w-full"
        >
          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-10 border border-ion/20"
          >
            <span className="w-2 h-2 rounded-full bg-plasma animate-pulse" />
            <span className="font-mono text-xs text-text-secondary tracking-widest">
              LIVE GLOBAL TRACKING ACTIVE
            </span>
          </motion.div>

          {/* Main heading - character-by-character reveal */}
          <motion.div variants={staggerChildren} initial="initial" animate="animate">
            <div className="overflow-hidden mb-4">
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
              >
                <h1 className="font-display font-black text-white leading-none tracking-tight"
                    style={{ fontSize: 'clamp(3.5rem, 9vw, 9rem)', letterSpacing: '-0.02em' }}>
                  AERO
                  <span className="gradient-text-ion">SPHERE</span>
                </h1>
              </motion.div>
            </div>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.8 }}
              className="font-heading text-xl md:text-2xl text-text-secondary mb-4 max-w-2xl mx-auto font-light"
            >
              Real-time global flight intelligence
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.0 }}
              className="font-body text-base text-text-muted mb-10 max-w-xl mx-auto tracking-wide"
            >
              Track every airborne aircraft on an immersive 3D globe.
              Live ADS-B data. Cinematic visualization. Zero latency.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button onClick={onLaunch} className="btn-ion text-sm px-8 py-4">
                <span className="flex items-center gap-2">
                  Launch Global Tracker
                  <ArrowRight size={14} />
                </span>
              </button>
              <button className="btn-ghost text-sm px-8 py-4">
                <span className="flex items-center gap-2">
                  <Wind size={14} />
                  Watch Demo
                </span>
              </button>
            </motion.div>
          </motion.div>

          {/* Live aircraft visual elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1.2 }}
            className="mt-16 relative"
          >
            {/* HUD frame preview */}
            <div className="glass border border-ion/20 rounded-2xl p-3 inline-block w-full max-w-2xl mx-auto overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-corona" />
                <div className="w-2.5 h-2.5 rounded-full bg-ion opacity-50" />
                <div className="w-2.5 h-2.5 rounded-full bg-plasma opacity-30" />
                <span className="font-mono text-xs text-text-muted ml-2">AeroSphere // Global Tracker</span>
                <span className="ml-auto flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-plasma animate-pulse" />
                  <span className="font-mono text-xs text-plasma">LIVE</span>
                </span>
              </div>

              {/* Mock HUD display */}
              <div className="bg-space/80 rounded-xl h-48 relative overflow-hidden border border-horizon/40">
                {/* Grid overlay */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                />

                {/* Curved earth line */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <radialGradient id="earthGlow" cx="50%" cy="100%">
                      <stop offset="0%" stopColor="#0066FF" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <ellipse cx="50%" cy="110%" rx="60%" ry="50%" fill="url(#earthGlow)" />
                  <path d="M -5% 75% Q 50% 55% 105% 75%" stroke="#00D4FF" strokeWidth="1" fill="none" opacity="0.4" />
                </svg>

                {/* Floating aircraft dots */}
                {[
                  { x: '20%', y: '35%', color: '#00D4FF' },
                  { x: '55%', y: '25%', color: '#00FFD1' },
                  { x: '75%', y: '50%', color: '#00D4FF' },
                  { x: '40%', y: '60%', color: '#00FFD1' },
                  { x: '85%', y: '30%', color: '#00D4FF' },
                ].map((dot, i) => (
                  <div
                    key={i}
                    className="absolute"
                    style={{ left: dot.x, top: dot.y }}
                  >
                    <div
                      className="w-2 h-2 rounded-full animate-ping"
                      style={{ background: dot.color, animationDelay: `${i * 0.4}s`, animationDuration: '2.5s' }}
                    />
                    <div
                      className="absolute inset-0.5 rounded-full"
                      style={{ background: dot.color }}
                    />
                  </div>
                ))}

                {/* HUD data overlays */}
                <div className="absolute top-3 left-3 font-mono text-xs text-ion space-y-0.5">
                  <div className="hud-label">AIRCRAFT</div>
                  <div className="hud-value">12,847</div>
                </div>
                <div className="absolute top-3 right-3 text-right font-mono text-xs space-y-0.5">
                  <div className="hud-label">STATUS</div>
                  <div className="text-plasma text-xs font-mono">TRACKING</div>
                </div>
                <div className="absolute bottom-3 left-3 font-mono text-xs text-text-muted">
                  48.8°N  2.3°E  ALT 35,000 FT
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-mono text-xs text-text-muted tracking-widest uppercase">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <ChevronDown size={16} className="text-ion opacity-60" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS SECTION ─────────────────────────────────────────────────── */}
      <section className="stats-section relative z-10 py-20 px-6">
        <div className="divider-ion mb-16" />
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="stat-card glass rounded-2xl p-6 text-center border border-horizon/50 hover:border-ion/30 transition-all duration-300 group">
              <AnimatedCounter to={s.to} suffix={s.suffix} />
              <p className="font-heading text-xs text-text-muted mt-2 tracking-wider uppercase group-hover:text-text-secondary transition-colors">
                {s.label}
              </p>
            </div>
          ))}
        </div>
        <div className="divider-ion mt-16" />
      </section>

      {/* ── FEATURES SECTION ──────────────────────────────────────────────── */}
      <section className="features-section relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-mono text-xs text-ion tracking-widest uppercase mb-3">Platform Capabilities</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
              Built for <span className="gradient-text-ion">Aviation Intelligence</span>
            </h2>
            <p className="font-body text-text-secondary max-w-xl mx-auto text-lg">
              Every pixel engineered for situational awareness at global scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, i) => {
              const Icon = feat.icon
              return (
                <div
                  key={i}
                  className="feature-card glass rounded-2xl p-7 border border-horizon/50 group hover:border-ion/30 transition-all duration-400 cursor-default"
                  style={{ '--feat-color': feat.color }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: `rgba(${feat.color === '#00D4FF' ? '0,212,255' : feat.color === '#00FFD1' ? '0,255,209' : feat.color === '#0066FF' ? '0,102,255' : '255,107,53'},0.1)`,
                      border: `1px solid ${feat.color}25`,
                    }}
                  >
                    <Icon size={22} style={{ color: feat.color }} />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-white mb-3">{feat.title}</h3>
                  <p className="font-body text-text-secondary text-sm leading-relaxed">{feat.body}</p>

                  <div
                    className="mt-5 flex items-center gap-2 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ color: feat.color }}
                  >
                    <span>Learn more</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-xs text-ion tracking-widest uppercase mb-3 text-center">How It Works</p>
          <h2 className="font-display text-3xl font-bold text-center text-white mb-16" style={{ letterSpacing: '-0.02em' }}>
            From Orbit to Your Screen
          </h2>

          <div className="space-y-0">
            {[
              { step: '01', title: 'ADS-B Transponders', desc: 'Aircraft broadcast their position, altitude, and velocity 1,000× per second via ADS-B transponders operating at 1090 MHz.' },
              { step: '02', title: 'Ground Receiver Network', desc: '6,000+ OpenSky receivers worldwide capture transponder signals and relay them to our aggregation servers in real time.' },
              { step: '03', title: 'Data Pipeline', desc: 'Raw state vectors are parsed, filtered, and cached. Our backend delivers clean, structured data to the AeroSphere frontend.' },
              { step: '04', title: 'Cinematic Visualization', desc: 'CesiumJS renders aircraft on a photorealistic 3D globe with smooth interpolation, custom HUD overlays, and interactive telemetry panels.' },
            ].map((item, i, arr) => (
              <div key={i} className="flex gap-6 md:gap-10 group">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl glass-bright flex items-center justify-center font-display text-sm font-bold text-ion shrink-0 group-hover:glow-ion transition-all duration-300">
                    {item.step}
                  </div>
                  {i < arr.length - 1 && (
                    <div className="w-px flex-1 my-3" style={{ background: 'linear-gradient(180deg, rgba(0,212,255,0.4), transparent)' }} />
                  )}
                </div>
                <div className="pb-10 pt-2">
                  <h3 className="font-heading text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="font-body text-text-secondary leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ───────────────────────────────────────────────────── */}
      <section className="cta-section relative z-10 py-24 px-6">
        <div
          className="max-w-4xl mx-auto rounded-3xl p-12 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(0,102,255,0.15) 0%, rgba(0,212,255,0.1) 50%, rgba(0,255,209,0.08) 100%)',
            border: '1px solid rgba(0,212,255,0.2)',
          }}
        >
          {/* Background decorations */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #00D4FF, transparent)' }} />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #0066FF, transparent)' }} />

          <div className="relative z-10">
            <p className="font-mono text-xs text-plasma tracking-widest uppercase mb-4">Ready for Liftoff?</p>
            <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-6" style={{ letterSpacing: '-0.03em' }}>
              See the World
              <br />
              <span className="gradient-text-ion">In Motion</span>
            </h2>
            <p className="font-body text-text-secondary text-lg mb-10 max-w-md mx-auto">
              Launch the 3D tracker and watch 10,000+ aircraft paint their paths across the globe.
            </p>
            <button onClick={onLaunch} className="btn-ion px-12 py-5 text-base">
              <span className="flex items-center gap-3">
                Open AeroSphere Globe
                <Globe size={18} />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 py-10 px-6 border-t border-horizon/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Navigation size={16} className="text-ion" />
            <span className="font-display text-sm font-bold tracking-widest">
              AERO<span className="text-ion">SPHERE</span>
            </span>
          </div>
          <p className="font-mono text-xs text-text-muted text-center">
            Flight data provided by OpenSky Network · 3D Rendering by CesiumJS
          </p>
          <p className="font-mono text-xs text-text-muted">
            © {new Date().getFullYear()} AeroSphere
          </p>
        </div>
      </footer>
    </div>
  )
}
