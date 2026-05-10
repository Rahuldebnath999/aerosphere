// frontend/src/components/TrackerPage.jsx

import {
  useEffect,
  useState,
} from 'react'

import axios from 'axios'

import CesiumGlobe from './Globe/CesiumGlobe'

export default function TrackerPage() {
  const [flightData, setFlightData] =
    useState([])

  const [selectedFlight, setSelectedFlight] =
    useState(null)

  const [currentTime, setCurrentTime] =
    useState(new Date())

  const [search, setSearch] =
    useState('')

  const [searchResults, setSearchResults] =
    useState([])

  /*
  |--------------------------------------------------------------------------
  | CLOCK
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date()
      )
    }, 1000)

    return () =>
      clearInterval(timer)
  }, [])

  /*
  |--------------------------------------------------------------------------
  | LOAD FLIGHTS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    async function fetchFlights() {
      try {
        const res = await axios.get(
          'http://localhost:3001/api/flights'
        )

        setFlightData(
          res.data || []
        )
      } catch (err) {
        console.error(
          'Flight API error:',
          err
        )
      }
    }

    fetchFlights()

    const interval = setInterval(
      fetchFlights,
      5000
    )

    return () =>
      clearInterval(interval)
  }, [])

  /*
  |--------------------------------------------------------------------------
  | COUNTRIES
  |--------------------------------------------------------------------------
  */

  const countries = new Set(
    flightData
      .map(
        (f) =>
          f.origin_country
      )
      .filter(Boolean)
  ).size

  /*
  |--------------------------------------------------------------------------
  | SELECT FLIGHT
  |--------------------------------------------------------------------------
  */

  const selectFlight = (
    flight
  ) => {
    setSelectedFlight(flight)

    window.dispatchEvent(
      new CustomEvent(
        'focusFlight',
        {
          detail: flight,
        }
      )
    )
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        background: '#000',
      }}
    >
      {/* GLOBE */}

      <CesiumGlobe
        flightData={flightData}
        onFlightSelect={
          setSelectedFlight
        }
      />

      {/* TOP LEFT */}

      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 9999,

          background:
            'rgba(0,0,0,0.65)',

          border:
            '1px solid rgba(0,255,255,0.3)',

          borderRadius: 24,

          padding: 22,

          width: 280,

          backdropFilter:
            'blur(18px)',

          boxShadow:
            '0 0 30px rgba(0,255,255,0.15)',

          color: 'white',
        }}
      >
        <h1
          style={{
            margin: 0,
            color: '#00e5ff',
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          AEROSPHERE
        </h1>

        <div
          style={{
            marginTop: 20,
            display: 'flex',
            justifyContent:
              'space-between',
          }}
        >
          <div>
            <div
              style={{
                opacity: 0.7,
                fontSize: 12,
              }}
            >
              AIRBORNE
            </div>

            <div
              style={{
                color: '#00ffff',
                fontSize: 24,
                fontWeight:
                  'bold',
              }}
            >
              {flightData.length.toLocaleString()}
            </div>
          </div>

          <div>
            <div
              style={{
                opacity: 0.7,
                fontSize: 12,
              }}
            >
              COUNTRIES
            </div>

            <div
              style={{
                color: '#00ffff',
                fontSize: 24,
                fontWeight:
                  'bold',
              }}
            >
              {countries}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            color: '#ff8a00',
          }}
        >
          ● LIVE TRACKING ACTIVE
        </div>
      </div>

      {/* SEARCH */}

      <div
        style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform:
            'translateX(-50%)',

          zIndex: 99999,
        }}
      >
        <div
          style={{
            position: 'relative',
          }}
        >
          <input
            value={search}
            onChange={(e) => {
              const value =
                e.target.value

              setSearch(value)

              if (!value) {
                setSearchResults(
                  []
                )

                return
              }

              const results =
                flightData
                  .filter(
                    (f) =>
                      f.callsign
                        ?.toLowerCase()
                        .includes(
                          value.toLowerCase()
                        ) ||
                      f.origin_country
                        ?.toLowerCase()
                        .includes(
                          value.toLowerCase()
                        ) ||
                      f.estDepartureAirport
                        ?.toLowerCase()
                        .includes(
                          value.toLowerCase()
                        ) ||
                      f.estArrivalAirport
                        ?.toLowerCase()
                        .includes(
                          value.toLowerCase()
                        )
                  )
                  .slice(0, 8)

              setSearchResults(
                results
              )
            }}
            placeholder='Search callsign, airline, airport or country...'
            style={{
              width: 520,

              padding:
                '18px 24px',

              background:
                'rgba(0,0,0,0.65)',

              border:
                '1px solid rgba(0,255,255,0.25)',

              borderRadius: 18,

              color: 'white',

              fontSize: 18,

              outline: 'none',
            }}
          />

          {/* SEARCH RESULTS */}

          {searchResults.length >
            0 && (
            <div
              style={{
                position:
                  'absolute',

                top: 70,

                width: '100%',

                background:
                  'rgba(0,0,0,0.92)',

                border:
                  '1px solid rgba(0,255,255,0.25)',

                borderRadius: 18,

                overflow:
                  'hidden',
              }}
            >
              {searchResults.map(
                (
                  flight,
                  index
                ) => (
                  <div
                    key={index}
                    onClick={() => {
                      selectFlight(
                        flight
                      )

                      setSearch(
                        flight.callsign
                      )

                      setSearchResults(
                        []
                      )
                    }}
                    style={{
                      padding: 16,

                      cursor:
                        'pointer',

                      color:
                        'white',

                      borderBottom:
                        '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div
                      style={{
                        color:
                          '#00ffff',

                        fontWeight:
                          'bold',
                      }}
                    >
                      ✈{' '}
                      {
                        flight.callsign
                      }
                    </div>

                    <div
                      style={{
                        opacity: 0.7,
                        marginTop: 6,
                      }}
                    >
                      {
                        flight.origin_country
                      }{' '}
                      •{' '}
                      {
                        flight.estDepartureAirport
                      }{' '}
                      →
                      {' '}
                      {
                        flight.estArrivalAirport
                      }
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* TOP RIGHT */}

      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,

          zIndex: 9999,

          background:
            'rgba(0,0,0,0.65)',

          border:
            '1px solid rgba(0,255,255,0.25)',

          borderRadius: 24,

          padding: 24,

          width: 260,

          backdropFilter:
            'blur(18px)',

          color: 'white',
        }}
      >
        <div
          style={{
            fontSize: 44,
            color: '#00ffff',
            fontWeight: 'bold',
            textAlign: 'right',
          }}
        >
          {currentTime.toLocaleTimeString()}
        </div>

        <div
          style={{
            marginTop: 16,
            textAlign: 'right',
          }}
        >
          LIVE WORLDWIDE TRACKING
        </div>

        <div
          style={{
            marginTop: 12,
            color: '#00ff99',
            textAlign: 'right',
          }}
        >
          UPDATED JUST NOW
        </div>
      </div>
    </div>
  )
}