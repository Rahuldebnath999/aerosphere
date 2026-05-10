// frontend/src/components/Globe/CesiumGlobe.jsx

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import Globe from 'react-globe.gl'

import {
  getVisibleFlights,
  createFlightObject,
} from './flightLayer'

import AIRPORT_DATA from './airportData'

export default function CesiumGlobe({
  flightData,
  onFlightSelect,
}) {
  const globeRef = useRef(null)

  const [zoomLevel, setZoomLevel] =
    useState(2)

  const [selectedFlight, setSelectedFlight] =
    useState(null)

  const [currentTime, setCurrentTime] =
    useState('00:00:00')

  /*
  |--------------------------------------------------------------------------
  | AIRPORTS
  |--------------------------------------------------------------------------
  */

  const airports = useMemo(() => {
    return Object.values(
      AIRPORT_DATA
    )
  }, [])

  /*
  |--------------------------------------------------------------------------
  | STARS
  |--------------------------------------------------------------------------
  */

  const stars = useMemo(() => {
    return Array.from({
      length: 240,
    }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size:
        Math.random() * 1 +
        0.2,
      delay:
        Math.random() * 5,
    }))
  }, [])

  /*
  |--------------------------------------------------------------------------
  | CLOCK
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(
        new Date().toLocaleTimeString(
          'en-GB',
          {
            hour12: false,
          }
        )
      )
    }

    updateClock()

    const interval =
      setInterval(
        updateClock,
        1000
      )

    return () =>
      clearInterval(interval)
  }, [])

  /*
  |--------------------------------------------------------------------------
  | INIT
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!globeRef.current) return

    const globe =
      globeRef.current

    const controls =
      globe.controls()

    controls.enableZoom = true
    controls.enableRotate = true
    controls.enablePan = false

    controls.enableDamping = true
    controls.dampingFactor = 0.06

    controls.autoRotate = false
    controls.autoRotateSpeed = 0

    controls.minDistance = 160
    controls.maxDistance = 400

    globe.pointOfView(
      {
        lat: 20,
        lng: 78,
        altitude: 2,
      },
      0
    )

    const interval =
      setInterval(() => {
        try {
          const altitude =
            globe.pointOfView()
              ?.altitude || 2

          setZoomLevel(
            altitude
          )
        } catch {}
      }, 500)

    return () =>
      clearInterval(interval)
  }, [])

  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handler = (e) => {
      const flight = e.detail

      if (
        !flight ||
        !globeRef.current
      )
        return

      const processedFlight =
        createFlightObject(
          flight
        )

      setSelectedFlight(
        processedFlight
      )

      onFlightSelect(
        processedFlight
      )

      globeRef.current.pointOfView(
        {
          lat: processedFlight.lat,
          lng: processedFlight.lng,
          altitude: 0.7,
        },
        1200
      )
    }

    window.addEventListener(
      'focusFlight',
      handler
    )

    return () => {
      window.removeEventListener(
        'focusFlight',
        handler
      )
    }
  }, [onFlightSelect])

  /*
  |--------------------------------------------------------------------------
  | FLIGHTS
  |--------------------------------------------------------------------------
  */

  const visibleFlights =
    useMemo(() => {
      try {
        return getVisibleFlights(
          flightData,
          zoomLevel
        )
          .map(
            createFlightObject
          )
          .slice(0, 1000)
      } catch {
        return []
      }
    }, [
      flightData,
      zoomLevel,
    ])

  /*
  |--------------------------------------------------------------------------
  | FLIGHT POINTS
  |--------------------------------------------------------------------------
  */

  const globePoints =
    useMemo(() => {
      const base =
        visibleFlights.map(
          (f) => ({
            ...f,
            size: 0.05,
            color:
              '#00ffff',
            isAirport: false,
          })
        )

      if (
        selectedFlight &&
        !selectedFlight.isAirport
      ) {
        base.push({
          ...selectedFlight,
          size: 0.13,
          color:
            '#00ff99',
          isAirport: false,
        })
      }

      return base
    }, [
      visibleFlights,
      selectedFlight,
    ])

  /*
  |--------------------------------------------------------------------------
  | AIRPORT POINTS
  |--------------------------------------------------------------------------
  */

  const airportPoints =
    useMemo(() => {

      if (zoomLevel >= 1.45)
        return []

      return airports.map(
        (airport) => ({
          ...airport,

          lat: airport.lat,
          lng: airport.lng,

          size: 0.09,

          color: '#ffcc00',

          isAirport: true,
        })
      )

    }, [
      airports,
      zoomLevel,
    ])

  /*
  |--------------------------------------------------------------------------
  | CLOSE PANEL
  |--------------------------------------------------------------------------
  */

  const closePanel = () => {

    setSelectedFlight(null)

    onFlightSelect(null)

    if (globeRef.current) {

      globeRef.current.pointOfView(
        {
          lat: 20,
          lng: 78,
          altitude: 2,
        },
        1200
      )
    }
  }

  /*
  |--------------------------------------------------------------------------
  | PANEL STYLE
  |--------------------------------------------------------------------------
  */

  const glassPanel = {
    background:
      'rgba(2,10,30,0.52)',

    border:
      '1px solid rgba(0,255,255,0.12)',

    backdropFilter:
      'blur(18px)',

    boxShadow:
      '0 0 25px rgba(0,255,255,0.05)',

    zIndex: 1000,
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',

        background:
          'radial-gradient(circle at center, #020817 0%, #000000 70%)',

        overflow: 'hidden',

        position: 'relative',

        isolation: 'isolate',
      }}
    >

      {/* ====================================================== */}
      {/* SPACE BACKGROUND */}
      {/* ====================================================== */}

      <div
        style={{
          position: 'absolute',

          inset: 0,

          zIndex: 0,

          overflow: 'hidden',

          pointerEvents:
            'none',
        }}
      >

        {/* STARS */}

        {stars.map((s) => (
          <div
            key={s.id}
            style={{
              position:
                'absolute',

              left: `${s.x}%`,
              top: `${s.y}%`,

              width: s.size,
              height: s.size,

              borderRadius:
                '50%',

              background:
                '#ffffff',

              boxShadow:
                '0 0 3px rgba(255,255,255,0.7)',

              opacity: 0.8,

              animation:
                `twinkle 4s infinite ${s.delay}s`,
            }}
          />
        ))}

        {/* COMET */}

        <div
          style={{
            position:
              'absolute',

            top: '18%',
            left: '-15%',

            width: 120,
            height: 1,

            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.8))',

            transform:
              'rotate(-18deg)',

            animation:
              'comet 18s linear infinite',

            opacity: 0.4,
          }}
        />

        {/* FALLING STARS */}

        {Array.from({
          length: 10,
        }).map((_, i) => (
          <div
            key={`falling-${i}`}
            style={{
              position:
                'absolute',

              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`,

              width: 1.5,
              height: 1.5,

              borderRadius: '50%',

              background: '#ffffff',

              boxShadow:
                '0 0 6px rgba(255,255,255,0.8)',

              animation:
                `fallingStar ${
                  8 +
                  Math.random() * 10
                }s linear infinite`,

              animationDelay: `${
                Math.random() * 10
              }s`,
            }}
          />
        ))}

        {/* ASTEROIDS */}

        {Array.from({
          length: 6,
        }).map((_, i) => (
          <div
            key={i}
            style={{
              position:
                'absolute',

              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 30}%`,

              width: 2,
              height: 2,

              borderRadius:
                '50%',

              background:
                '#ffaa44',

              boxShadow:
                '0 0 5px rgba(255,170,68,0.5)',

              animation:
                `asteroid ${
                  20 +
                  Math.random() * 20
                }s linear infinite`,

              animationDelay:
                `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* ====================================================== */}
      {/* GLOBE */}
      {/* ====================================================== */}

      <Globe
        ref={globeRef}

        style={{
          zIndex: 2,
        }}

        width={window.innerWidth}

        height={window.innerHeight}

        backgroundColor='rgba(0,0,0,0)'

        globeImageUrl='https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'

        bumpImageUrl='https://unpkg.com/three-globe/example/img/earth-topology.png'

        showAtmosphere={true}

        atmosphereColor='#00ffff'

        atmosphereAltitude={0.12}

        pointsData={[
          ...globePoints,
          ...airportPoints,
        ]}

        pointLat={(d) => d.lat}

        pointLng={(d) => d.lng}

        pointAltitude={(d) =>
          d.isAirport
            ? 0.02
            : 0.01
        }

        pointRadius={(d) =>
          d.size || 0.05
        }

        pointResolution={4}

        pointColor={(d) =>
          d.color || '#00ffff'
        }

        onPointClick={(point) => {

          if (!point)
            return

          if (point.isAirport) {

            setSelectedFlight({
              isAirport: true,

              callsign:
                point.iata,

              country:
                point.country,

              speed: 'N/A',

              altitude:
                'AIRPORT',

              heading:
                point.icao,

              departure:
                point.city,

              arrival:
                point.country,

              airportName:
                point.name,

              icao:
                point.icao,

              iata:
                point.iata,
            })

            globeRef.current.pointOfView(
              {
                lat: point.lat,
                lng: point.lng,
                altitude: 0.7,
              },
              1200
            )

            return
          }

          setSelectedFlight(
            point
          )

          onFlightSelect(
            point
          )

          globeRef.current.pointOfView(
            {
              lat: point.lat,
              lng: point.lng,
              altitude: 0.7,
            },
            1200
          )
        }}
      />

      {/* ====================================================== */}
      {/* TOP LEFT */}
      {/* ====================================================== */}

      <div
        style={{
          position: 'absolute',
          top: 18,
          left: 18,
          width: 240,
          borderRadius: 18,
          padding: 18,
          ...glassPanel,
        }}
      >
        <div
          style={{
            color: 'white',
            fontWeight: 700,
            fontSize: 20,
            marginBottom: 16,
          }}
        >
          ✈ AEROSPHERE
        </div>

        <div
          style={{
            display: 'flex',
            gap: 24,
          }}
        >
          <div>
            <div
              style={{
                color:
                  'rgba(255,255,255,0.45)',
                fontSize: 10,
              }}
            >
              AIRBORNE
            </div>

            <div
              style={{
                color:
                  '#00e5ff',
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {
                flightData?.length
              }
            </div>
          </div>

          <div>
            <div
              style={{
                color:
                  'rgba(255,255,255,0.45)',
                fontSize: 10,
              }}
            >
              AIRPORTS
            </div>

            <div
              style={{
                color:
                  '#ffcc00',
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {
                airports.length
              }
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* TOP RIGHT */}
      {/* ====================================================== */}

      <div
        style={{
          position: 'absolute',
          top: 18,
          right: 18,
          width: 220,
          borderRadius: 18,
          padding: 18,
          textAlign: 'right',
          ...glassPanel,
        }}
      >
        <div
          style={{
            color: '#00f0ff',
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          {currentTime}
        </div>

        <div
          style={{
            marginTop: 8,
            color:
              'rgba(255,255,255,0.6)',
            fontSize: 11,
          }}
        >
          OPENSKY NETWORK
        </div>
      </div>

      {/* ====================================================== */}
      {/* BOTTOM LEFT */}
      {/* ====================================================== */}

      <div
        style={{
          position: 'absolute',

          bottom: 18,
          left: 18,

          width: 170,

          borderRadius: 18,

          padding: 16,

          ...glassPanel,
        }}
      >
        <div
          style={{
            color:
              'rgba(255,255,255,0.5)',

            fontSize: 10,

            marginBottom: 12,
          }}
        >
          DATA STREAM
        </div>

        <div
          style={{
            display: 'flex',

            gap: 3,

            alignItems: 'end',

            height: 30,
          }}
        >
          {Array.from({
            length: 18,
          }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 3,

                height:
                  5 +
                  Math.random() * 18,

                background:
                  '#00e5ff',

                borderRadius: 999,

                opacity: 0.9,
              }}
            />
          ))}
        </div>

        <div
          style={{
            marginTop: 12,

            color:
              'rgba(255,255,255,0.5)',

            fontSize: 10,
          }}
        >
          LIVE SIGNAL FLOW
        </div>
      </div>

      {/* ====================================================== */}
      {/* BOTTOM RIGHT */}
      {/* ====================================================== */}

      <div
        style={{
          position: 'absolute',

          bottom: 18,
          right: 18,

          width: 190,

          borderRadius: 18,

          padding: 16,

          ...glassPanel,
        }}
      >
        <div
          style={{
            color:
              'rgba(255,255,255,0.5)',

            fontSize: 10,

            marginBottom: 10,
          }}
        >
          NETWORK STATUS
        </div>

        <div
          style={{
            color: '#00ff99',

            fontSize: 18,

            fontWeight: 700,

            marginBottom: 6,
          }}
        >
          ONLINE
        </div>

        <div
          style={{
            color:
              'rgba(255,255,255,0.65)',

            fontSize: 11,

            lineHeight: 1.5,
          }}
        >
          OpenSky Realtime Feed
          <br />
          Globe Render Active
        </div>
      </div>

      {/* ====================================================== */}
      {/* INFO PANEL */}
      {/* ====================================================== */}

      {selectedFlight && (
        <div
          style={{
            position:
              'absolute',

            right: 28,

            top: '50%',

            transform:
              'translateY(-50%)',

            width: 420,

            background:
              'rgba(0,0,0,0.84)',

            border:
              '1px solid rgba(0,255,255,0.18)',

            borderRadius: 28,

            padding: 26,

            backdropFilter:
              'blur(24px)',

            boxShadow:
              '0 0 35px rgba(0,255,255,0.08)',

            zIndex: 999999,

            color: 'white',
          }}
        >
          <button
            onClick={
              closePanel
            }
            style={{
              position:
                'absolute',

              top: 16,
              right: 16,

              width: 34,
              height: 34,

              borderRadius:
                '50%',

              border: 'none',

              background:
                '#00ffff',

              color: '#000',

              fontSize: 18,

              fontWeight:
                'bold',

              cursor: 'pointer',
            }}
          >
            ×
          </button>

          <div
            style={{
              color: '#00ffff',
              fontSize: 26,
              fontWeight:
                'bold',
              marginBottom: 24,
            }}
          >
            {
              selectedFlight.isAirport
                ? '🛬 ' +
                  selectedFlight.airportName
                : '✈ ' +
                  selectedFlight.callsign
            }
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '1fr 1fr',
              gap: 18,
            }}
          >

            <Info
              title='COUNTRY'
              value={
                selectedFlight.country
              }
            />

            <Info
              title='CITY'
              value={
                selectedFlight.departure
              }
            />

            <Info
              title='ICAO'
              value={
                selectedFlight.isAirport
                  ? selectedFlight.icao
                  : 'LIVE'
              }
            />

            <Info
              title='IATA'
              value={
                selectedFlight.isAirport
                  ? selectedFlight.iata
                  : selectedFlight.callsign
              }
            />

            {!selectedFlight.isAirport && (
              <>
                <Info
                  title='SPEED'
                  value={`${Math.round(
                    selectedFlight.speed || 0
                  )} km/h`}
                />

                <Info
                  title='ALTITUDE'
                  value={`${Math.round(
                    selectedFlight.altitude || 0
                  )} ft`}
                />

                <Info
                  title='HEADING'
                  value={`${selectedFlight.heading}°`}
                />

                <Info
                  title='STATUS'
                  value='LIVE'
                  color='#00ff99'
                />
              </>
            )}
          </div>

          <div
            style={{
              marginTop: 28,
            }}
          >
            <div
              style={{
                opacity: 0.45,
                marginBottom: 8,
                fontSize: 11,
              }}
            >
              ROUTE
            </div>

            <div
              style={{
                color: '#00ffff',
                fontSize: 22,
                fontWeight:
                  'bold',
                lineHeight: 1.4,
              }}
            >
              {
                selectedFlight.departure
              }{' '}
              →
              {' '}
              {
                selectedFlight.arrival
              }
            </div>
          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* ANIMATIONS */}
      {/* ====================================================== */}

      <style>
        {`
          @keyframes twinkle {

            0% {
              opacity: 0.15;
            }

            50% {
              opacity: 1;
            }

            100% {
              opacity: 0.15;
            }
          }

          @keyframes comet {

            0% {
              transform:
                translateX(0)
                rotate(-18deg);

              opacity: 0;
            }

            10% {
              opacity: 0.4;
            }

            100% {
              transform:
                translateX(180vw)
                rotate(-18deg);

              opacity: 0;
            }
          }

          @keyframes asteroid {

            0% {
              transform:
                translateY(-10vh)
                translateX(0);

              opacity: 0;
            }

            10% {
              opacity: 0.5;
            }

            100% {
              transform:
                translateY(120vh)
                translateX(40vw);

              opacity: 0;
            }
          }

          @keyframes fallingStar {

            0% {
              transform:
                translateY(-10vh)
                translateX(0);

              opacity: 0;
            }

            10% {
              opacity: 1;
            }

            100% {
              transform:
                translateY(120vh)
                translateX(-30vw);

              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  )
}

function Info({
  title,
  value,
  color = 'white',
}) {
  return (
    <div>
      <div
        style={{
          opacity: 0.45,
          fontSize: 11,
          marginBottom: 5,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 18,
          color,
        }}
      >
        {value}
      </div>
    </div>
  )
}