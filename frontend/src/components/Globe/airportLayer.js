// frontend/src/components/Globe/airportLayer.js

import AIRPORT_DATA from './airportData'

export function getAirportList() {
  return Object.values(
    AIRPORT_DATA
  )
}

export function getVisibleAirports(
  zoomLevel
) {
  // FAR VIEW
  if (zoomLevel > 1.9) {
    return []
  }

  // MEDIUM VIEW
  if (zoomLevel > 1.3) {
    return Object.values(
      AIRPORT_DATA
    ).filter((airport) =>
      [
        'CCU',
        'DEL',
        'BOM',
        'BLR',
        'MAA',
        'HYD',
      ].includes(
        airport.iata
      )
    )
  }

  // CLOSE VIEW
  return Object.values(
    AIRPORT_DATA
  )
}

export function createAirportLabel(
  airport
) {
  return `
    <div style="
      background: rgba(0,0,0,0.94);
      border: 1px solid rgba(0,255,255,0.35);
      border-radius: 18px;
      padding: 14px;
      width: 240px;
      color: white;
      font-family: Arial;
      backdrop-filter: blur(12px);
      box-shadow:
        0 0 25px rgba(0,255,255,0.15);
    ">

      <div style="
        color:#00ffff;
        font-size:22px;
        font-weight:bold;
        margin-bottom:10px;
      ">
        ✈ ${airport.iata}
      </div>

      <div style="
        font-size:16px;
        margin-bottom:6px;
        line-height:1.4;
      ">
        ${airport.name}
      </div>

      <div style="
        opacity:0.7;
        margin-bottom:10px;
      ">
        ${airport.city},
        ${airport.country}
      </div>

      <div style="
        display:flex;
        justify-content:space-between;
        font-size:13px;
        opacity:0.7;
      ">
        <div>
          ICAO:
          ${airport.icao}
        </div>

        <div>
          IATA:
          ${airport.iata}
        </div>
      </div>

    </div>
  `
}

export function getAirportByICAO(
  icao
) {
  return AIRPORT_DATA[icao]
}