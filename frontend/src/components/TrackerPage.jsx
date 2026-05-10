// frontend/src/components/TrackerPage.jsx

import { useEffect, useState } from 'react'
import axios from 'axios'
import CesiumGlobe from './Globe/CesiumGlobe'

export default function TrackerPage() {

  const [flightData, setFlightData] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  /*
  |--------------------------------------------------------------------------
  | FETCH FLIGHTS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    async function fetchFlights() {

      try {

        console.log(
          'Fetching flights...'
        )

        const res =
          await axios.get(
            'http://localhost:3001/api/flights'
          )

        console.log(
          'Flights received:',
          res.data
        )

        if (
          Array.isArray(res.data)
        ) {

          setFlightData(
            res.data
          )

        } else {

          console.log(
            'Invalid response'
          )

          setFlightData([])
        }

      } catch (err) {

        console.log(
          'FRONTEND ERROR:',
          err
        )

        setFlightData([])
      }

      setLoading(false)
    }

    fetchFlights()

    const interval =
      setInterval(
        fetchFlights,
        10000
      )

    return () =>
      clearInterval(interval)

  }, [])

  return (

    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#000',
      }}
    >

      {loading && (

        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 999999,
            color: 'white',
            fontSize: 24,
          }}
        >
          Loading Flights...
        </div>
      )}

      <CesiumGlobe
        flightData={flightData}
        onFlightSelect={() => {}}
      />
    </div>
  )
}