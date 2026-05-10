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

  if (!flight)
    return null

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
  | FALLBACK
  |--------------------------------------------------------------------------
  */

  if (
    !departure ||
    !arrival
  ) {

    return {
      startLat:
        Number(flight.lat) -
        2,

      startLng:
        Number(flight.lng) -
        2,

      endLat:
        Number(flight.lat),

      endLng:
        Number(flight.lng),

      color:
        '#00ffff',
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

    color:
      '#00ffff',
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

  if (!route)
    return []

  return [route]
}