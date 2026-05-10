// frontend/src/components/Globe/flightLayer.js

/*
|--------------------------------------------------------------------------
| FILTER FLIGHTS
|--------------------------------------------------------------------------
*/

export function getVisibleFlights(
  flights,
  zoomLevel
) {
  if (!Array.isArray(flights))
    return []

  let limit = 2500

  if (zoomLevel < 1)
    limit = 4000
  else if (zoomLevel < 1.5)
    limit = 2500
  else if (zoomLevel < 2)
    limit = 1400
  else limit = 700

  return flights
    .filter(
      (f) =>
        typeof f.latitude ===
          'number' &&
        typeof f.longitude ===
          'number'
    )
    .slice(0, limit)
}

/*
|--------------------------------------------------------------------------
| CREATE FLIGHT OBJECT
|--------------------------------------------------------------------------
*/

export function createFlightObject(
  flight
) {
  return {
    ...flight,

    lat: Number(
      flight.latitude
    ),

    lng: Number(
      flight.longitude
    ),

    altitude:
      flight.baro_altitude || 0,

    speed:
      Math.round(
        flight.velocity || 0
      ),

    heading:
      Math.round(
        flight.true_track || 0
      ),

    callsign:
      flight.callsign?.trim() ||
      'UNKNOWN',

    country:
      flight.origin_country ||
      'Unknown',

    departure:
      flight.estDepartureAirport ||
      'N/A',

    arrival:
      flight.estArrivalAirport ||
      'N/A',
  }
}

/*
|--------------------------------------------------------------------------
| HOVER LABEL
|--------------------------------------------------------------------------
*/

export function createFlightLabel(
  flight
) {
  return `
    <div style="
      background: rgba(0,0,0,0.94);
      border: 1px solid rgba(0,255,255,0.4);
      border-radius: 18px;
      padding: 14px;
      color: white;
      min-width: 240px;
      backdrop-filter: blur(12px);
      box-shadow: 0 0 20px rgba(0,255,255,0.2);
      font-family: sans-serif;
    ">

      <div style="
        color:#00ffff;
        font-size:18px;
        font-weight:bold;
        margin-bottom:10px;
      ">
        ✈ ${flight.callsign}
      </div>

      <div style="margin-bottom:6px;">
        <b>Country:</b>
        ${flight.country}
      </div>

      <div style="margin-bottom:6px;">
        <b>Speed:</b>
        ${flight.speed} km/h
      </div>

      <div style="margin-bottom:6px;">
        <b>Heading:</b>
        ${flight.heading}°
      </div>

      <div style="
        margin-top:10px;
        color:#00ffff;
        font-weight:bold;
      ">
        ${flight.departure}
        →
        ${flight.arrival}
      </div>

    </div>
  `
}

/*
|--------------------------------------------------------------------------
| AIRCRAFT ICONS
|--------------------------------------------------------------------------
*/

export function createAircraftElement(
  flight,
  zoomLevel
) {
  // ONLY SHOW ICONS WHEN ZOOMED

  if (zoomLevel > 1.35)
    return null

  const el =
    document.createElement('div')

  el.innerHTML = '✈'

  let size = 16

  if (zoomLevel < 0.9)
    size = 28
  else if (zoomLevel < 1.1)
    size = 22

  el.style.fontSize =
    `${size}px`

  el.style.color = '#00ffff'

  el.style.textShadow =
    '0 0 12px #00ffff'

  el.style.pointerEvents =
    'none'

  el.style.userSelect = 'none'

  el.style.transform =
    `rotate(${flight.heading}deg)`

  return el
}