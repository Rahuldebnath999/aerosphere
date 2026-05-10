// backend/src/index.js

import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())

const PORT = 3001

/*
|--------------------------------------------------------------------------
| AIRPORT DATABASE
|--------------------------------------------------------------------------
*/

const AIRPORTS = {
  India: [
    'DEL',
    'BOM',
    'CCU',
    'BLR',
    'HYD',
    'MAA',
  ],

  Germany: [
    'FRA',
    'MUC',
    'BER',
  ],

  France: [
    'CDG',
    'ORY',
    'NCE',
  ],

  Italy: [
    'FCO',
    'MXP',
    'VCE',
  ],

  Spain: [
    'MAD',
    'BCN',
    'AGP',
  ],

  'United Kingdom': [
    'LHR',
    'LGW',
    'MAN',
  ],

  Turkey: [
    'IST',
    'SAW',
  ],

  Qatar: ['DOH'],

  UAE: ['DXB', 'AUH'],

  Russia: [
    'SVO',
    'LED',
  ],

  Canada: [
    'YYZ',
    'YVR',
  ],

  Brazil: [
    'GRU',
    'GIG',
  ],

  Australia: [
    'SYD',
    'MEL',
  ],

  Japan: ['HND', 'NRT'],

  China: [
    'PEK',
    'PVG',
  ],

  USA: [
    'JFK',
    'LAX',
    'ORD',
    'SFO',
  ],
}

/*
|--------------------------------------------------------------------------
| AIRLINE PREFIXES
|--------------------------------------------------------------------------
*/

const AIRLINES = {
  AIC: 'Air India',
  UAE: 'Emirates',
  BAW: 'British Airways',
  QTR: 'Qatar Airways',
  IGO: 'IndiGo',
  VTI: 'Vistara',
  DLH: 'Lufthansa',
  AFR: 'Air France',
  THY: 'Turkish Airlines',
  AAL: 'American Airlines',
  UAL: 'United Airlines',
}

/*
|--------------------------------------------------------------------------
| RANDOM HELPERS
|--------------------------------------------------------------------------
*/

function randomItem(list) {
  if (
    !list ||
    !list.length
  )
    return 'N/A'

  return list[
    Math.floor(
      Math.random() *
        list.length
    )
  ]
}

function randomAirline() {
  const keys =
    Object.keys(AIRLINES)

  return randomItem(keys)
}

/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

function generateDeparture(
  country
) {
  return randomItem(
    AIRPORTS[country]
  )
}

function generateArrival() {
  const allAirports =
    Object.values(
      AIRPORTS
    ).flat()

  return randomItem(
    allAirports
  )
}

/*
|--------------------------------------------------------------------------
| AIRLINE NAME
|--------------------------------------------------------------------------
*/

function getAirlineName(
  callsign
) {
  if (!callsign)
    return 'Unknown'

  const prefix =
    callsign.slice(0, 3)

  return (
    AIRLINES[prefix] ||
    'Unknown Airline'
  )
}

/*
|--------------------------------------------------------------------------
| CACHE
|--------------------------------------------------------------------------
*/

let cachedFlights = []

/*
|--------------------------------------------------------------------------
| FETCH REAL FLIGHTS
|--------------------------------------------------------------------------
*/

async function fetchFlights() {
  try {
    const response =
      await fetch(
        'https://opensky-network.org/api/states/all'
      )

    const data =
      await response.json()

    if (!data.states)
      return

    cachedFlights =
      data.states
        .filter(
          (state) =>
            typeof state[5] ===
              'number' &&
            typeof state[6] ===
              'number'
        )
        .map((state) => {
          /*
          |--------------------------------------------------------------------------
          | REAL CALLSIGN
          |--------------------------------------------------------------------------
          */

          let callsign =
            state[1]?.trim()

          /*
          |--------------------------------------------------------------------------
          | IF MISSING, GENERATE
          |--------------------------------------------------------------------------
          */

          if (
            !callsign ||
            callsign.length < 3
          ) {
            const airline =
              randomAirline()

            callsign = `${airline}${Math.floor(
              100 +
                Math.random() *
                  900
            )}`
          }

          const country =
            state[2] ||
            'Unknown'

          return {
            icao24:
              state[0],

            callsign,

            airline:
              getAirlineName(
                callsign
              ),

            origin_country:
              country,

            longitude:
              state[5],

            latitude:
              state[6],

            baro_altitude:
              Math.round(
                state[7] || 0
              ),

            velocity:
              Math.round(
                (state[9] ||
                  0) * 3.6
              ),

            true_track:
              Math.round(
                state[10] || 0
              ),

            vertical_rate:
              state[11],

            geo_altitude:
              state[13],

            squawk:
              state[14],

            spi:
              state[15],

            position_source:
              state[16],

            /*
            |--------------------------------------------------------------------------
            | ROUTES
            |--------------------------------------------------------------------------
            */

            estDepartureAirport:
              generateDeparture(
                country
              ),

            estArrivalAirport:
              generateArrival(),
          }
        })

    console.log(
      `Loaded ${cachedFlights.length} REAL flights`
    )
  } catch (err) {
    console.error(
      'OpenSky Error:',
      err.message
    )
  }
}

/*
|--------------------------------------------------------------------------
| INITIAL FETCH
|--------------------------------------------------------------------------
*/

fetchFlights()

/*
|--------------------------------------------------------------------------
| REFRESH
|--------------------------------------------------------------------------
*/

setInterval(() => {
  fetchFlights()
}, 15000)

/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

app.get(
  '/api/flights',
  (req, res) => {
    res.json(cachedFlights)
  }
)

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

app.listen(PORT, () => {
  console.log(
    `REAL AeroSphere API running on ${PORT}`
  )
})