// frontend/src/components/Globe/routeLayer.js

import AIRPORT_DATA from './airportData'

/*
|--------------------------------------------------------------------------
| CREATE ROUTE
|--------------------------------------------------------------------------
*/

export function createFlightRoute(
  flight
) {
  if (!flight) return null

  const departure =
    AIRPORT_DATA[
      flight.departure
    ]

  const arrival =
    AIRPORT_DATA[
      flight.arrival
    ]

  /*
  |--------------------------------------------------------------------------
  | FALLBACK ROUTE
  |--------------------------------------------------------------------------
  */

  if (
    !departure ||
    !arrival
  ) {
    // create small visible route around aircraft

    return {
      startLat:
        Number(flight.lat) - 2,

      startLng:
        Number(flight.lng) - 2,

      endLat:
        Number(flight.lat),

      endLng:
        Number(flight.lng),

      color: '#00ffff',

      callsign:
        flight.callsign,

      departure:
        flight.departure ||
        'Unknown',

      arrival:
        flight.arrival ||
        'Unknown',
    }
  }

  /*
  |--------------------------------------------------------------------------
  | REAL ROUTE
  |--------------------------------------------------------------------------
  */

  return {
    startLat:
      departure.lat,

    startLng:
      departure.lng,

    endLat:
      arrival.lat,

    endLng:
      arrival.lng,

    color: '#00ffff',

    callsign:
      flight.callsign,

    departure:
      departure.iata,

    arrival:
      arrival.iata,
  }
}

/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

export function createRoutes(
  selectedFlight
) {
  if (!selectedFlight)
    return []

  const route =
    createFlightRoute(
      selectedFlight
    )

  if (!route) return []

  return [route]
}

/*
|--------------------------------------------------------------------------
| TRAILS
|--------------------------------------------------------------------------
*/

export function createTrails(
  flights
) {
  if (!flights?.length)
    return []

  return flights.map(
    (flight) => ({
      startLat:
        Number(flight.lat) -
        0.6,

      startLng:
        Number(flight.lng) -
        0.6,

      endLat:
        Number(flight.lat),

      endLng:
        Number(flight.lng),

      color:
        'rgba(0,255,255,0.7)',
    })
  )
}