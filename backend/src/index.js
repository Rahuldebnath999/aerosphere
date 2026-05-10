// backend/src/index.js

import express from 'express'
import cors from 'cors'
import axios from 'axios'

const app = express()

app.use(cors())
app.use(express.json())

const PORT = 3001

/*
|--------------------------------------------------------------------------
| CACHE
|--------------------------------------------------------------------------
*/

let cachedFlights = []

/*
|--------------------------------------------------------------------------
| FALLBACK FLIGHTS
|--------------------------------------------------------------------------
*/

function generateFallbackFlights() {

  const flights = []

  for (
    let i = 0;
    i < 2500;
    i++
  ) {

    flights.push({

      icao24:
        `demo_${i}`,

      callsign:
        `AIR${1000 + i}`,

      origin_country:
        [
          'India',
          'USA',
          'UK',
          'Germany',
          'France',
          'Japan',
        ][
          Math.floor(
            Math.random() * 6
          )
        ],

      longitude:
        -180 +
        Math.random() * 360,

      latitude:
        -80 +
        Math.random() * 160,

      baro_altitude:
        2000 +
        Math.random() * 38000,

      velocity:
        300 +
        Math.random() * 500,

      true_track:
        Math.random() * 360,

      vertical_rate:
        Math.random() * 20,

      estDepartureAirport:
        'LIVE',

      estArrivalAirport:
        'TRACKING',
    })
  }

  return flights
}

/*
|--------------------------------------------------------------------------
| FETCH FLIGHTS
|--------------------------------------------------------------------------
*/

async function fetchFlights() {

  try {

    console.log(
      'Fetching OpenSky flights...'
    )

    const response =
      await axios.get(
        'https://opensky-network.org/api/states/all',
        {
          timeout: 12000,
        }
      )

    const states =
      response.data?.states

    if (
      !states ||
      !Array.isArray(states)
    ) {

      throw new Error(
        'No states returned'
      )
    }

    const mappedFlights =
      states
        .map((s) => ({

          icao24: s[0],

          callsign:
            s[1]?.trim() ||
            'UNKNOWN',

          origin_country:
            s[2] ||
            'Unknown',

          longitude: s[5],

          latitude: s[6],

          baro_altitude:
            s[7] || 0,

          velocity:
            s[9] || 0,

          true_track:
            s[10] || 0,

          vertical_rate:
            s[11] || 0,

          estDepartureAirport:
            'LIVE',

          estArrivalAirport:
            'TRACKING',
        }))
        .filter(
          (f) =>
            typeof f.latitude ===
              'number' &&
            typeof f.longitude ===
              'number'
        )

    if (
      mappedFlights.length === 0
    ) {

      throw new Error(
        '0 valid flights'
      )
    }

    cachedFlights =
      mappedFlights

    console.log(
      `OpenSky Flights Loaded: ${cachedFlights.length}`
    )

  } catch (err) {

    console.log(
      'OpenSky Failed → Using Fallback Flights'
    )

    cachedFlights =
      generateFallbackFlights()

    console.log(
      `Fallback Flights Loaded: ${cachedFlights.length}`
    )
  }
}

/*
|--------------------------------------------------------------------------
| INITIAL LOAD
|--------------------------------------------------------------------------
*/

fetchFlights()

/*
|--------------------------------------------------------------------------
| AUTO REFRESH
|--------------------------------------------------------------------------
*/

setInterval(() => {

  fetchFlights()

}, 15000)

/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

app.get(
  '/',
  (req, res) => {

    res.send(
      'AeroSphere Backend Running'
    )
  }
)

app.get(
  '/api/flights',
  (req, res) => {

    res.json(
      cachedFlights
    )
  }
)

/*
|--------------------------------------------------------------------------
| SERVER
|--------------------------------------------------------------------------
*/

app.listen(
  PORT,
  () => {

    console.log(
      `REAL AeroSphere API running on ${PORT}`
    )
  }
)