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
  updateFlightTrail,
} from './flightLayer'

import {
  createRoutes,
} from './routeLayer'

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

  const [menuOpen, setMenuOpen] =
    useState(false)

  const [showRoutes, setShowRoutes] =
    useState(true)

  const [showAirports, setShowAirports] =
    useState(true)

  const [showAtmosphere, setShowAtmosphere] =
    useState(true)

  const [autoRotate, setAutoRotate] =
    useState(false)

  const [showFlightGlow, setShowFlightGlow] =
    useState(true)

  const [globeView, setGlobeView] =
    useState('default')

  const [searchTerm, setSearchTerm] =
    useState('')

  const isMobile =
    window.innerWidth < 768

  const MAPS = {

    default:
      'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',

    night:
      'https://unpkg.com/three-globe/example/img/earth-night.jpg',
  }

  const airports = useMemo(() => {

    return Object.values(
      AIRPORT_DATA
    )

  }, [])

  const routes = useMemo(() => {

    if (
      !selectedFlight ||
      selectedFlight.isAirport ||
      !showRoutes
    ) {
      return []
    }

    return createRoutes(
      selectedFlight
    )

  }, [
    selectedFlight,
    showRoutes,
  ])

  const stars = useMemo(() => {

    return Array.from({
      length: 260,
    }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size:
        Math.random() * 1.4 +
        0.2,
      delay:
        Math.random() * 5,
    }))

  }, [])

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

  useEffect(() => {

    if (!globeRef.current)
      return

    const globe =
      globeRef.current

    const controls =
      globe.controls()

    controls.enableZoom = true
    controls.enableRotate = true
    controls.enablePan = false

    controls.enableDamping = true
    controls.dampingFactor = 0.08

    controls.autoRotate =
      autoRotate

    controls.autoRotateSpeed =
      0.35

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

  }, [autoRotate])

  const visibleFlights =
    useMemo(() => {

      try {

        return getVisibleFlights(
          flightData || [],
          zoomLevel
        )
          .map(
            createFlightObject
          )
          .filter(Boolean)
          .slice(0, 1000)

      } catch {

        return []
      }

    }, [
      flightData,
      zoomLevel,
    ])

  const filteredFlights =
    useMemo(() => {

      if (!searchTerm)
        return []

      return visibleFlights
        .filter((flight) => {

          const callsign =
            flight.callsign || ''

          return callsign
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            )
        })
        .slice(0, 8)

    }, [
      searchTerm,
      visibleFlights,
    ])

  useEffect(() => {

    visibleFlights.forEach(
      (flight) => {

        if (flight) {

          updateFlightTrail(
            flight
          )
        }
      }
    )

  }, [visibleFlights])

  const globePoints =
    useMemo(() => {

      const base =
        visibleFlights.map(
          (f) => ({
            ...f,
            size: 0.055,
            color:
              showFlightGlow
                ? '#00ffff'
                : '#66b3ff',
            isAirport: false,
          })
        )

      if (
        selectedFlight &&
        !selectedFlight.isAirport
      ) {

        base.push({
          ...selectedFlight,
          size: 0.12,
          color:
            '#00ff99',
          isAirport: false,
        })
      }

      return base

    }, [
      visibleFlights,
      selectedFlight,
      showFlightGlow,
    ])

  const airportPoints =
    useMemo(() => {

      if (
        !showAirports
      ) {
        return []
      }

      if (zoomLevel >= 1.45)
        return []

      return airports.map(
        (airport) => ({
          ...airport,
          lat: airport.lat,
          lng: airport.lng,
          size: 0.08,
          color: '#ffcc00',
          isAirport: true,
        })
      )

    }, [
      airports,
      zoomLevel,
      showAirports,
    ])

  const closePanel = () => {

    setSelectedFlight(null)

    onFlightSelect?.(null)

    globeRef.current?.pointOfView(
      {
        lat: 20,
        lng: 78,
        altitude: 2,
      },
      1200
    )
  }

  const Toggle = ({
    active,
    onClick,
  }) => (

    <div
      onClick={onClick}
      style={{
        width: 42,
        height: 22,
        borderRadius: 999,
        background: active
          ? '#00ffff'
          : 'rgba(255,255,255,0.15)',
        position: 'relative',
        cursor: 'pointer',
      }}
    >

      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#fff',
          position: 'absolute',
          top: 3,
          left: active ? 22 : 4,
          transition: '0.3s',
        }}
      />

    </div>
  )

  return (

    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'none',
        background:
          'radial-gradient(circle at center, #020817 0%, #000000 70%)',
      }}
    >

      {/* STARS */}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >

        {stars.map((s) => (

          <div
            key={s.id}
            style={{
              position: 'absolute',
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              background: '#fff',
              opacity: 0.8,
            }}
          />
        ))}
      </div>

      {/* TOP LEFT */}

      <div
        style={{
          position: 'absolute',
          top: 18,
          left: 18,
          width: 220,
          borderRadius: 18,
          padding: 18,
          background:
            'rgba(0,0,0,0.35)',
          border:
            '1px solid rgba(0,255,255,0.12)',
          backdropFilter:
            'blur(18px)',
          zIndex: 1000,
          color: 'white',
        }}
      >

        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#00ffff',
          }}
        >
          ✈ AEROSPHERE
        </div>

        <div
          style={{
            marginTop: 14,
            display: 'flex',
            justifyContent:
              'space-between',
          }}
        >

          <div>

            <div
              style={{
                fontSize: 10,
                opacity: 0.5,
              }}
            >
              AIRBORNE
            </div>

            <div
              style={{
                fontSize: 22,
                color: '#00ffff',
                fontWeight: 700,
              }}
            >
              {visibleFlights.length}
            </div>

          </div>

          <div>

            <div
              style={{
                fontSize: 10,
                opacity: 0.5,
              }}
            >
              AIRPORTS
            </div>

            <div
              style={{
                fontSize: 22,
                color: '#ffcc00',
                fontWeight: 700,
              }}
            >
              {airports.length}
            </div>

          </div>

        </div>
      </div>

      {/* TOP RIGHT */}

      <div
        style={{
          position: 'absolute',
          top: 18,
          right: 18,
          width: 170,
          borderRadius: 18,
          padding: 16,
          background:
            'rgba(0,0,0,0.35)',
          border:
            '1px solid rgba(0,255,255,0.12)',
          backdropFilter:
            'blur(18px)',
          zIndex: 1000,
          color: 'white',
          textAlign: 'right',
        }}
      >

        <div
          style={{
            fontSize: 20,
            color: '#00ffff',
            fontWeight: 700,
          }}
        >
          {currentTime}
        </div>

        <div
          style={{
            marginTop: 6,
            fontSize: 9,
            opacity: 0.6,
          }}
        >
          LIVE TRACKING
        </div>

      </div>

      {/* GLOBE */}

      <Globe
        ref={globeRef}
        width={window.innerWidth}
        height={window.innerHeight}
        backgroundColor='rgba(0,0,0,0)'
        globeImageUrl={
          globeView === 'night'
            ? MAPS.night
            : MAPS.default
        }
        bumpImageUrl='https://unpkg.com/three-globe/example/img/earth-topology.png'
        showAtmosphere={
          showAtmosphere
        }
        atmosphereColor='#00ffff'
        atmosphereAltitude={0.1}
        arcsData={
          selectedFlight &&
          !selectedFlight.isAirport &&
          showRoutes
            ? routes
            : []
        }
        arcStartLat={(d) =>
          d.startLat
        }
        arcStartLng={(d) =>
          d.startLng
        }
        arcEndLat={(d) =>
          d.endLat
        }
        arcEndLng={(d) =>
          d.endLng
        }
        arcColor={(d) =>
          d.color
        }
        arcAltitude={0.03}
        arcStroke={0.18}
        pointsData={[
          ...globePoints,
          ...airportPoints,
        ]}
        pointLat={(d) => d.lat}
        pointLng={(d) => d.lng}
        pointAltitude={(d) =>
          d.isAirport ? 0.02 : 0.01
        }
        pointRadius={(d) =>
          d.size || 0.05
        }
        pointColor={(d) =>
          d.color || '#00ffff'
        }

        onPointClick={(point) => {

          if (!point)
            return

          try {

            if (point.isAirport) {

              const airportData = {

                ...point,

                isAirport: true,

                airportName:
                  point.name ||
                  point.airportName ||
                  'Unknown Airport',

                city:
                  point.city ||
                  'Unknown City',

                country:
                  point.country ||
                  'Unknown Country',

                iata:
                  point.iata ||
                  'N/A',

                icao:
                  point.icao ||
                  'N/A',

                lat:
                  Number(point.lat) || 0,

                lng:
                  Number(point.lng) || 0,
              }

              setSelectedFlight(
                airportData
              )

              globeRef.current?.pointOfView(
                {
                  lat: airportData.lat,
                  lng: airportData.lng,
                  altitude: 0.7,
                },
                1200
              )

              return
            }

            const flightInfo = {

              ...point,

              isAirport: false,

              callsign:
                point.callsign ||
                point.flight ||
                point.flightNumber ||
                'UNKNOWN',

              airline:
                point.airline ||
                point.operator ||
                'Unknown Airline',

              aircraft:
                point.aircraft ||
                point.aircraftModel ||
                'Commercial Aircraft',

              altitude:
                Number(
                  point.baro_altitude ||
                  point.altitude ||
                  0
                ),

              speed:
                Number(
                  point.velocity ||
                  point.speed ||
                  0
                ),

              heading:
                Number(
                  point.true_track ||
                  point.heading ||
                  0
                ),

              origin:
                point.estDepartureAirport ||
                point.origin ||
                point.departure ||
                'Unknown',

              destination:
                point.estArrivalAirport ||
                point.destination ||
                point.arrival ||
                'Unknown',

              icao24:
                point.icao24 ||
                'N/A',

              origin_country:
                point.origin_country ||
                'Unknown',

              vertical_rate:
                point.vertical_rate ||
                0,

              on_ground:
                point.on_ground ||
                false,

              lat:
                Number(point.lat) || 0,

              lng:
                Number(point.lng) || 0,
            }

            setSelectedFlight(
              flightInfo
            )

            onFlightSelect?.(
              flightInfo
            )

            globeRef.current?.pointOfView(
              {
                lat: flightInfo.lat,
                lng: flightInfo.lng,
                altitude: 0.7,
              },
              1200
            )

          } catch (err) {

            console.log(
              'Point click error:',
              err
            )
          }
        }}
      />

      {/* BOTTOM LEFT */}

      <div
        style={{
          position: 'absolute',
          bottom: 18,
          left: 18,
          width: 170,
          borderRadius: 18,
          padding: 16,
          background:
            'rgba(0,0,0,0.32)',
          border:
            '1px solid rgba(0,255,255,0.12)',
          backdropFilter:
            'blur(18px)',
          zIndex: 1000,
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

      {/* BOTTOM RIGHT */}

<div
  style={{
    position: 'absolute',
    bottom: 18,
    right: 18,
    width: 260,
    borderRadius: 18,
    padding: 16,
    background:
      'rgba(0,0,0,0.32)',
    border:
      '1px solid rgba(0,255,255,0.12)',
    backdropFilter:
      'blur(18px)',
    zIndex: 1000,
  }}
>

  {/* SEARCH BAR */}

  <input
    type='text'
    placeholder='Search Flights...'
    value={searchTerm}
    onChange={(e) =>
      setSearchTerm(
        e.target.value
      )
    }
    style={{
      width: '100%',
      padding:
        '12px 14px',
      borderRadius: 12,
      border:
        '1px solid rgba(0,255,255,0.15)',
      background:
        'rgba(255,255,255,0.05)',
      color: 'white',
      outline: 'none',
      fontSize: 12,
      marginBottom: 12,
    }}
  />

  {/* SEARCH SUGGESTIONS */}

  {searchTerm &&
    filteredFlights.length > 0 && (

    <div
      style={{
        marginBottom: 12,
        maxHeight: 180,
        overflowY: 'auto',
        borderRadius: 12,
        background:
          'rgba(0,0,0,0.9)',
        border:
          '1px solid rgba(0,255,255,0.12)',
      }}
    >

      {filteredFlights.map(
        (flight, index) => (

        <div
          key={index}

          onClick={() => {

            const flightInfo = {

              ...flight,

              callsign:
                flight.callsign ||
                'UNKNOWN',

              origin:
                flight.estDepartureAirport ||
                flight.origin ||
                'Unknown',

              destination:
                flight.estArrivalAirport ||
                flight.destination ||
                'Unknown',

              airline:
                flight.airline ||
                'Unknown Airline',
            }

            setSelectedFlight(
              flightInfo
            )

            onFlightSelect?.(
              flightInfo
            )

            setSearchTerm('')

            globeRef.current?.pointOfView(
              {
                lat:
                  Number(
                    flight.lat
                  ) || 0,

                lng:
                  Number(
                    flight.lng
                  ) || 0,

                altitude: 0.7,
              },
              1200
            )
          }}

          style={{
            padding:
              '10px 12px',

            cursor: 'pointer',

            borderBottom:
              '1px solid rgba(255,255,255,0.06)',
          }}
        >

          <div
            style={{
              color:
                '#00ffff',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {
              flight.callsign ||
              'Unknown Flight'
            }
          </div>

          <div
            style={{
              color:
                'rgba(255,255,255,0.6)',
              fontSize: 10,
              marginTop: 2,
            }}
          >
            {
              flight.origin_country ||
              'Unknown Country'
            }

            {' • '}

            {
              flight.estDepartureAirport ||
              'UNKNOWN'
            }

            {' → '}

            {
              flight.estArrivalAirport ||
              'UNKNOWN'
            }
          </div>

        </div>

      ))}
    </div>
  )}

  {/* PANEL HEADER */}

  <div
    style={{
      display: 'flex',
      justifyContent:
        'space-between',
      alignItems: 'center',
    }}
  >

    <div
      style={{
        color:
          'rgba(255,255,255,0.5)',
        fontSize: 10,
      }}
    >
      NETWORK STATUS
    </div>

    <button
      onClick={() =>
        setMenuOpen(
          !menuOpen
        )
      }
      style={{
        width: 30,
        height: 30,
        borderRadius: 10,
        border:
          '1px solid rgba(0,255,255,0.15)',
        background:
          'rgba(255,255,255,0.04)',
        color: '#00ffff',
        cursor: 'pointer',
      }}
    >
      ☰
    </button>

  </div>

  {/* SETTINGS MENU */}

  {menuOpen && (

    <div
      style={{
        marginTop: 16,
        paddingTop: 16,
        borderTop:
          '1px solid rgba(255,255,255,0.08)',
      }}
    >

      {/* GLOBE VIEWS */}

      <div
        style={{
          marginBottom: 18,
        }}
      >

        <div
          style={{
            color:
              'rgba(255,255,255,0.5)',
            fontSize: 9,
            marginBottom: 10,
          }}
        >
          GLOBE VIEW
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
          }}
        >

          {[
            'default',
            'night',
          ].map((type) => (

            <button
              key={type}

              onClick={() =>
                setGlobeView(type)
              }

              style={{
                flex: 1,
                padding:
                  '8px 6px',

                borderRadius: 10,

                border:
                  globeView === type
                    ? '1px solid #00ffff'
                    : '1px solid rgba(255,255,255,0.08)',

                background:
                  globeView === type
                    ? 'rgba(0,255,255,0.12)'
                    : 'rgba(255,255,255,0.03)',

                color:
                  globeView === type
                    ? '#00ffff'
                    : 'white',

                cursor: 'pointer',

                textTransform:
                  'capitalize',

                fontSize: 10,
              }}
            >
              {type}
            </button>

          ))}
        </div>

      </div>

      {/* TOGGLES */}

      {[
        {
          label: 'Routes',
          state:
            showRoutes,
          action:
            setShowRoutes,
        },

        {
          label: 'Airports',
          state:
            showAirports,
          action:
            setShowAirports,
        },

        {
          label:
            'Atmosphere',
          state:
            showAtmosphere,
          action:
            setShowAtmosphere,
        },

        {
          label:
            'Auto Rotate',
          state:
            autoRotate,
          action:
            setAutoRotate,
        },

        {
          label:
            'Flight Glow',
          state:
            showFlightGlow,
          action:
            setShowFlightGlow,
        },

      ].map((item) => (

        <div
          key={item.label}

          style={{
            display: 'flex',
            justifyContent:
              'space-between',

            alignItems: 'center',
            marginBottom: 14,
          }}
        >

          <div
            style={{
              color: 'white',
              fontSize: 12,
            }}
          >
            {item.label}
          </div>

          <Toggle
            active={
              item.state
            }

            onClick={() =>
              item.action(
                !item.state
              )
            }
          />

        </div>

      ))}

    </div>
  )}

</div>

      {/* INFO PANEL */}

      {selectedFlight && (

        <div
          style={{
            position:
              'absolute',

            right: isMobile
              ? 12
              : 28,

            top: isMobile
              ? 'auto'
              : '50%',

            bottom: isMobile
              ? 12
              : 'auto',

            transform:
              isMobile
                ? 'none'
                : 'translateY(-50%)',

            width: isMobile
              ? 'calc(100vw - 24px)'
              : 390,

            background:
              'rgba(0,0,0,0.45)',

            border:
              '1px solid rgba(0,255,255,0.14)',

            borderRadius: 28,

            padding: 24,

            backdropFilter:
              'blur(28px)',

            zIndex: 999999,

            color: 'white',

            maxHeight: '85vh',

            overflowY: 'auto',
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
              width: 32,
              height: 32,
              borderRadius:
                '50%',
              border: 'none',
              background:
                '#00ffff',
              color: '#000',
              cursor: 'pointer',
            }}
          >
            ×
          </button>

          <div
            style={{
              color: '#00ffff',
              fontSize: 22,
              fontWeight:
                'bold',
              marginBottom: 24,
            }}
          >
            {
              selectedFlight.isAirport
                ? `🛬 ${
                    selectedFlight.airportName ||
                    selectedFlight.name ||
                    'Airport'
                  }`
                : `✈ ${
                    selectedFlight.callsign ||
                    'FLIGHT'
                  }`
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

            {selectedFlight.isAirport ? (
              <>

                <Info
                  title='AIRPORT'
                  value={
                    selectedFlight.airportName ||
                    selectedFlight.name
                  }
                />

                <Info
                  title='CITY'
                  value={
                    selectedFlight.city
                  }
                />

                <Info
                  title='COUNTRY'
                  value={
                    selectedFlight.country
                  }
                />

                <Info
                  title='IATA'
                  value={
                    selectedFlight.iata
                  }
                />

                <Info
                  title='ICAO'
                  value={
                    selectedFlight.icao
                  }
                />

                <Info
                  title='LATITUDE'
                  value={
                    Number(
                      selectedFlight.lat || 0
                    ).toFixed(2)
                  }
                />

                <Info
                  title='LONGITUDE'
                  value={
                    Number(
                      selectedFlight.lng || 0
                    ).toFixed(2)
                  }
                />

                <Info
                  title='STATUS'
                  value='ACTIVE'
                  color='#00ff99'
                />

              </>
            ) : (
              <>

                <Info
                  title='FLIGHT'
                  value={
                    selectedFlight.callsign
                  }
                />

                <Info
                  title='ICAO24'
                  value={
                    selectedFlight.icao24
                  }
                />

                <Info
                  title='AIRLINE'
                  value={
                    selectedFlight.airline
                  }
                />

                <Info
                  title='AIRCRAFT'
                  value={
                    selectedFlight.aircraft
                  }
                />

                <Info
                  title='COUNTRY'
                  value={
                    selectedFlight.origin_country
                  }
                />

                <Info
                  title='DEPARTURE'
                  value={
                    selectedFlight.origin
                  }
                />

                <Info
                  title='ARRIVAL'
                  value={
                    selectedFlight.destination
                  }
                />

                <Info
                  title='ALTITUDE'
                  value={`${Math.round(
                    selectedFlight.altitude || 0
                  )} ft`}
                />

                <Info
                  title='SPEED'
                  value={`${Math.round(
                    selectedFlight.speed || 0
                  )} km/h`}
                />

                <Info
                  title='HEADING'
                  value={`${Math.round(
                    selectedFlight.heading || 0
                  )}°`}
                />

                <Info
                  title='VERTICAL RATE'
                  value={`${
                    Math.round(
                      selectedFlight.vertical_rate || 0
                    )
                  } m/s`}
                />

                <Info
                  title='STATUS'
                  value={
                    selectedFlight.on_ground
                      ? 'ON GROUND'
                      : 'AIRBORNE'
                  }
                  color={
                    selectedFlight.on_ground
                      ? '#ffcc00'
                      : '#00ff99'
                  }
                />

              </>
            )}

          </div>

        </div>
      )}

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
          fontSize: 10,
          marginBottom: 5,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 15,
          color,
          lineHeight: 1.5,
          wordBreak:
            'break-word',
        }}
      >
        {value || 'N/A'}
      </div>

    </div>
  )
}
