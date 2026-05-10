# ✈️ AeroSphere — Real-Time Global Flight Intelligence Platform

> A futuristic real-time aviation tracking platform featuring a cinematic 3D globe, live aircraft intelligence, airport systems, interactive search, and immersive HUD-style UI.

![Status](https://img.shields.io/badge/Status-Live%20Development-00D4FF?style=flat-square)
![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-0066FF?style=flat-square)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-00FFD1?style=flat-square)
![Data](https://img.shields.io/badge/Data-OpenSky%20Network-00FFD1?style=flat-square)

---

# 🌍 AeroSphere

AeroSphere is a modern aviation visualization platform that displays real-time airborne aircraft on an interactive animated 3D globe.

The platform combines:
- Live aircraft tracking
- Real-time flight intelligence
- Airport visualization
- Animated route systems
- Smart aircraft search
- Interactive flight information panels
- Cinematic aerospace-inspired UI

---

# 🚀 Features

## 🌎 Interactive Globe
- Fully interactive 3D Earth
- Smooth zoom & drag controls
- Auto rotation system
- Globe atmosphere rendering
- Multiple globe themes
- Night mode Earth

---

## ✈️ Real-Time Flight Tracking
- Live aircraft rendering
- Dynamic aircraft updates
- Aircraft glow effects
- Flight route visualization
- Real-time positioning
- Interactive aircraft selection

---

## 🛬 Airport System
- Airport markers
- Airport information panel
- ICAO & IATA display
- City & country information
- Interactive airport focus

---

## 🔎 Smart Flight Search
- Live aircraft suggestions
- Search dropdown system
- Click-to-focus aircraft tracking
- Instant callsign filtering
- Route preview in search

---

## 📊 Flight Information Panel

Displays:
- Callsign
- ICAO24
- Airline
- Aircraft type
- Speed
- Heading
- Altitude
- Departure airport
- Arrival airport
- Origin country
- Flight status
- Vertical rate

---

## 🎛️ Globe Controls

Users can toggle:
- Routes
- Airports
- Atmosphere
- Auto Rotation
- Flight Glow
- Globe Themes

---

# 🛰️ Data Source

Flight tracking data is powered by:

## OpenSky Network
- Real-time ADS-B aircraft states
- Global aircraft coverage
- Live telemetry data

---

# 🏗️ Project Architecture

```bash
aerosphere-2/
│
├── backend/
│   ├── node_modules/
│   ├── src/
│   │   └── index.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Globe/
│   │   │   │   ├── CesiumGlobe.jsx
│   │   │   │   ├── flightLayer.js
│   │   │   │   ├── routeLayer.js
│   │   │   │   └── airportData.js
│   │   │   │
│   │   │   └── TrackerPage.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/your-username/aerosphere-2.git
cd aerosphere-2
```

---

# 📦 Backend Setup

```bash
cd backend
npm install
npm start
```

Backend runs on:

```bash
http://localhost:3001
```

---

# 💻 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# 🔑 Environment Variables

## backend/.env

```env
PORT=3001
```

---

# 🛠️ Technologies Used

| Category | Technology |
|----------|------------|
| Frontend | React + Vite |
| Globe Engine | react-globe.gl |
| Backend | Node.js + Express |
| Flight Data | OpenSky Network |
| Styling | Glassmorphism UI |
| Animation | Dynamic Rendering |

---

# 🌌 Globe Themes

Currently available:
- Default Earth
- Night Earth

Planned:
- Satellite View
- Dark Matter Theme
- Terrain Mode
- Infrared Theme

---

# 📡 Real-Time System

AeroSphere:
- fetches live aircraft data
- filters visible aircraft
- updates aircraft trails
- renders airport systems
- updates flight positions
- refreshes tracking continuously

---

# 🎨 UI Design

The interface uses:
- Glassmorphism panels
- Neon aviation aesthetics
- HUD-inspired overlays
- Dynamic information systems
- Animated live visuals

---

# 🧠 Current Capabilities

✅ Live flight tracking  
✅ Interactive airport system  
✅ Smart flight search  
✅ Aircraft suggestions  
✅ Click-to-focus tracking  
✅ Real-time information panels  
✅ Flight route visualization  
✅ Auto rotating globe  
✅ Globe theme switching  
✅ Mobile responsive panels  

---

# 🚧 Future Improvements

- Live weather overlays
- Radar systems
- Flight history playback
- Heatmap visualization
- Military aircraft filtering
- AI aviation analytics
- Real-time weather radar
- Satellite cloud rendering

---

# 📜 License

MIT License

Free to use, modify, and distribute.

---

# 👨‍💻 Developer

Rahul Debnath

---

# 🌍 AeroSphere

> “Track the skies in real time.”