export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#02060F', space: '#050D1F', nebula: '#091428', horizon: '#0D1F3C',
        ion: '#00D4FF', plasma: '#00FFD1', stellar: '#0066FF', corona: '#FF6B35',
        'text-primary': '#E8F4FF', 'text-secondary': '#7BA7CC', 'text-muted': '#3D6080',
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        heading: ['"Exo 2"', 'sans-serif'],
        body: ['Rajdhani', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'scan-line': 'scanLine 4s linear infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'spin-slow': 'spin 20s linear infinite',
        'radar-ping': 'radarPing 2s ease-out infinite',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-18px)' } },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 15px rgba(0,212,255,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0,212,255,0.6)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '10%': { opacity: '1' }, '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
        shimmer: { '0%': { backgroundPosition: '-200% center' }, '100%': { backgroundPosition: '200% center' } },
        radarPing: { '0%': { transform: 'scale(0.8)', opacity: '0.8' }, '70%,100%': { transform: 'scale(2.5)', opacity: '0' } },
      },
      boxShadow: {
        'ion': '0 0 20px rgba(0,212,255,0.4)',
        'glass': '0 8px 32px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
