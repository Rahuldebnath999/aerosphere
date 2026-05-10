// frontend/src/components/Globe/flightLayer.js

const flightTrails = new Map()

/*
|--------------------------------------------------------------------------
| CREATE FLIGHT OBJECT
|--------------------------------------------------------------------------
*/

export function createFlightObject(
  flight
) {

  if (!flight)
    return null

  const lat =
    flight.latitude ??
    flight.lat

  const lng =
    flight.longitude ??
    flight.lng

  if (
    typeof lat !== 'number' ||
    typeof lng !== 'number'
  ) {
    return null
  }

  return {
    id:
      flight.icao24 ||
      Math.random(),

    callsign:
      flight.callsign?.trim() ||
      'UNKNOWN',

    lat,
    lng,

    altitude:
      flight.baro_altitude ||
      flight.altitude ||
      0,

    speed:
      flight.velocity ||
      flight.speed ||
      0,

    heading:
      flight.true_track ||
      flight.heading ||
      0,

    country:
      flight.origin_country ||
      'Unknown',

    departure:
      flight.estDepartureAirport ||
      'Unknown',

    arrival:
      flight.estArrivalAirport ||
      'Unknown',
  }
}

/*
|--------------------------------------------------------------------------
| GET VISIBLE FLIGHTS
|--------------------------------------------------------------------------
*/

export function getVisibleFlights(
  flights = [],
  zoomLevel = 2
) {

  if (!Array.isArray(flights))
    return []

  return flights.filter(
    (flight) => {

      const lat =
        flight.latitude ??
        flight.lat

      const lng =
        flight.longitude ??
        flight.lng

      return (
        typeof lat ===
          'number' &&
        typeof lng ===
          'number'
      )
    }
  )
}

/*
|--------------------------------------------------------------------------
| UPDATE TRAILS
|--------------------------------------------------------------------------
*/

export function updateFlightTrail(
  flight
) {

  if (!flight)
    return

  const id =
    flight.id ||
    flight.callsign

  if (!id)
    return

  if (
    !flightTrails.has(id)
  ) {
    flightTrails.set(
      id,
      []
    )
  }

  const trail =
    flightTrails.get(id)

  trail.push({
    lat: flight.lat,
    lng: flight.lng,
  })

  if (trail.length > 8) {
    trail.shift()
  }
}

/*
|--------------------------------------------------------------------------
| GET FLIGHT TRAILS
|--------------------------------------------------------------------------
*/

export function getFlightTrails() {

  const arcs = []

  flightTrails.forEach(
    (trail) => {

      for (
        let i = 1;
        i < trail.length;
        i++
      ) {

        arcs.push({
          startLat:
            trail[i - 1].lat,

          startLng:
            trail[i - 1].lng,

          endLat:
            trail[i].lat,

          endLng:
            trail[i].lng,

          color:
            'rgba(0,255,255,0.35)',
        })
      }
    }
  )

  return arcs
}