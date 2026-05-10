# ✈️ AeroSphere — Real-Time Global Flight Intelligence

> A cinematic, production-grade aviation tracking platform with a 3D globe, live ADS-B flight data, and a futuristic HUD interface.

![AeroSphere Preview](https://img.shields.io/badge/Status-Production%20Ready-00D4FF?style=flat-square)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20CesiumJS%20%7C%20Node.js-0066FF?style=flat-square)
![Data Source](https://img.shields.io/badge/Data-OpenSky%20Network-00FFD1?style=flat-square)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **npm 9+** or **pnpm**
- Free [Cesium Ion token](https://cesium.com/ion/signup)
- Optional: [OpenSky Network account](https://opensky-network.org/) for higher rate limits

---

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-org/aerosphere.git
cd aerosphere

# Install backend dependencies
cd backend
npm install
cp .env.example .env     # then edit .env with your values

# Install frontend dependencies
cd ../frontend
npm install
cp .env.example .env     # then add your VITE_CESIUM_TOKEN
```

### 2. Configure Environment

**`backend/.env`**
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
# Optional for higher OpenSky rate limits:
# OPENSKY_USERNAME=your_username
# OPENSKY_PASSWORD=your_password
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:3001
VITE_CESIUM_TOKEN=your_cesium_ion_token_here
```

> **Getting a Cesium Token:** Sign up free at [cesium.com/ion](https://cesium.com/ion/signup) → My Account → Access Tokens → Create New Token. The default token on your account page works fine.

### 3. Run in Development

```bash
# Terminal 1 — Start backend API server
cd backend
npm run dev
# → API running on http://localhost:3001

# Terminal 2 — Start frontend dev server
cd frontend
npm run dev
# → App running on http://localhost:5173
```

Open **http://localhost:5173** in your browser. 🎉

---

## 🏗️ Architecture

```
aerosphere/
├── backend/                    # Node.js + Express API server
│   ├── src/
│   │   └── index.js            # Main server with OpenSky proxy + caching
│   ├── .env.example
│   └── package.json
│
└── frontend/                   # React + Vite SPA
    ├── public/
    │   └── favicon.svg
    ├── src/
    │   ├── components/
    │   │   ├── LandingPage/    # Cinematic landing page with starfield + GSAP
    │   │   │   └── index.jsx
    │   │   ├── Globe/
    │   │   │   └── CesiumGlobe.jsx    # Full 3D globe with aircraft entities
    │   │   ├── FlightPanel/
    │   │   │   └── index.jsx          # Glassmorphism flight detail panel
    │   │   ├── SearchBar/
    │   │   │   └── index.jsx          # Animated flight search + dropdown
    │   │   ├── HUD/
    │   │   │   └── index.jsx          # Futuristic HUD overlay + loading screen
    │   │   ├── LandingPage.jsx        # Barrel export
    │   │   └── TrackerPage.jsx        # Main tracker view orchestrator
    │   ├── hooks/
    │   │   └── useFlightData.js       # Real-time flight polling hook
    │   ├── utils/
    │   │   └── flightUtils.js         # Aircraft icons, formatters, helpers
    │   ├── App.jsx                    # Root component + page transitions
    │   ├── main.jsx                   # Entry point + GSAP plugin registration
    │   └── index.css                  # Global styles + design tokens
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🛰️ Data Flow

```
ADS-B Transponders (1090 MHz)
         ↓
OpenSky Ground Receivers (6,000+)
         ↓
OpenSky REST API (opensky-network.org)
         ↓
AeroSphere Backend (Express proxy + 30s cache)
         ↓
Frontend Hook (useFlightData — polls every 30s)
         ↓
CesiumGlobe (Cesium.Entity billboards on 3D globe)
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |
| GET | `/api/flights` | All airborne aircraft states |
| GET | `/api/flights?bbox=lat_min,lon_min,lat_max,lon_max` | Aircraft in bounding box |
| GET | `/api/flights/:icao24` | Single aircraft by ICAO24 |
| GET | `/api/stats` | Aggregated traffic statistics |

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--color-void` | `#02060F` | Page background |
| `--color-space` | `#050D1F` | Card backgrounds |
| `--color-nebula` | `#091428` | Panel backgrounds |
| `--color-ion` | `#00D4FF` | Primary accent (cyan) |
| `--color-plasma` | `#00FFD1` | Secondary accent (teal) |
| `--color-stellar` | `#0066FF` | Highlight blue |
| `--color-corona` | `#FF6B35` | Warning / alert orange |

**Typography**
- Display: `Orbitron` — headings, logo, HUD values
- Heading: `Exo 2` — section titles, card headers
- Body: `Rajdhani` — descriptive text
- Mono: `Fira Code` — data values, coordinates, timestamps

---

## ⚡ Performance Notes

- **OpenSky rate limit:** Anonymous requests are capped at ~100/hour. The backend caches for 30 seconds to stay within limits. Add credentials in `.env` for higher limits.
- **Entity count:** Frontend caps at 6,000 aircraft entities to avoid GPU overload on Cesium. Increase `MAX_FLIGHTS` in `useFlightData.js` if your hardware supports it.
- **Aircraft icon cache:** Canvas-rendered aircraft icons are cached by heading (rounded to nearest 5°) and color to avoid expensive re-renders.
- **Lazy loading:** `CesiumGlobe` is dynamically imported to keep the initial bundle lean.

---

## 🚢 Deployment

### Frontend — Vercel / Netlify

```bash
cd frontend
npm run build
# → dist/ is your static output

# Vercel
vercel deploy --prod

# Netlify
netlify deploy --prod --dir=dist
```

Set environment variable `VITE_API_URL` to your production backend URL.

### Backend — Railway / Render / Fly.io

```bash
cd backend
# Deploy to Railway
railway up

# Or Render: connect GitHub repo, set build command to `npm install`, start to `npm start`
```

Set `FRONTEND_URL` to your production frontend URL in the platform's env settings.

### Docker (Full Stack)

```dockerfile
# backend/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src/ ./src/
EXPOSE 3001
CMD ["node", "src/index.js"]
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18 + Vite |
| 3D Globe | CesiumJS 1.115 |
| Animation | Framer Motion 11 + GSAP 3 |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| HTTP client | Axios |
| Backend | Node.js + Express 4 |
| Caching | node-cache |
| Rate limiting | express-rate-limit |
| Flight data | OpenSky Network REST API |

---

## 📄 License

MIT — free to use, modify, and deploy.

---

*Built with ❤️ and a passion for aviation.*
