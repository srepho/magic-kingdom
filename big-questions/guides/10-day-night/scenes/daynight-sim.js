/* Day and night — the geometry and the spinning rule (no DOM), so they can be tested in Node.
 *
 * The picture: we look down on the Earth from above the South Pole. The Sun is far off to
 * the LEFT and never moves. It lights the left half of the Earth. From this side the real
 * Earth turns CLOCKWISE (from above the North Pole it would be anticlockwise).
 *
 * Angles are canvas angles: 0 points right, and they grow clockwise because y points down.
 * So a growing spin angle is the Earth turning the real way.
 *
 * Simplified on purpose (logged in notes.md): no tilt, so no seasons; every day is half
 * light and half dark; the Moon is held a quarter-turn behind the Sun.
 */
(function (root) {
  'use strict';
  var TAU = Math.PI * 2, RAD = Math.PI / 180;
  var SUN_AT = Math.PI;                 // the Sun is to the left
  var SYDNEY = { lat: 34, lon: 151 };
  var RIO = { lat: 23, lon: -43 };      // Rio de Janeiro: close to the far side of the world from Sydney
  var START = 130 * RAD;                // where Sydney sits at the start: mid-morning
  var COAST_MAX = 5, COAST_FADE = 0.4;  // a flick coasts, then slows

  function wrap(a) { a = (a + Math.PI) % TAU; if (a < 0) a += TAU; return a - Math.PI; }
  function smooth(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

  /* where a place is drawn: its angle round the pole for a given spin */
  function angleOf(place, spin) { return START + (place.lon - SYDNEY.lon) * RAD + spin; }
  /* hour angle: 0 at midday, negative in the morning, positive in the afternoon, ±π at midnight */
  function hourAngle(place, spin) { return wrap(angleOf(place, spin) - SUN_AT); }
  function isDay(H) { return Math.cos(H) > 0; }
  /* how high the Sun is (radians above the horizon; negative means below it) */
  function altitude(H, latDeg) { return Math.asin(Math.cos(latDeg * RAD) * Math.cos(H)); }
  /* where the Sun sits across a sky seen facing NORTH (the way to face it from Australia):
   * +1 is far right (east, morning), -1 is far left (west, evening) */
  function sunSide(H) { return -Math.sin(H); }

  /* everything a sky picture needs for one place */
  function sky(place, spin) {
    var H = hourAngle(place, spin), alt = altitude(H, place.lat);
    var Hm = wrap(H - Math.PI / 2), altM = altitude(Hm, place.lat);   // the Moon, a quarter-turn behind
    return {
      H: H, alt: alt, day: isDay(H), side: sunSide(H),
      light: smooth(-0.2, 0.15, alt),                    // 0 dark … 1 full daylight
      glow: Math.max(0, 1 - Math.abs(alt) / 0.25),       // orange near sunrise and sunset
      stars: 1 - smooth(-0.25, -0.05, alt),
      moonAlt: altM, moonSide: sunSide(Hm)
    };
  }

  /* a shadow on flat ground: points away from the Sun, long when the Sun is low */
  function shadow(H, latDeg) {
    var alt = altitude(H, latDeg);
    if (alt <= 0.03) return null;
    return { side: -sunSide(H), length: Math.min(6, 1 / Math.tan(alt)) };
  }

  /* the Earth she spins. Dragging turns it either way (backwards is rewinding).
   * Left alone it only ever coasts the real way, and it never starts by itself. */
  function create() {
    var s = { spin: 0, speed: 0, turned: 0 };
    return {
      state: s,
      dragBy: function (d) { s.spin += d; s.turned += Math.abs(d); s.speed = 0; },
      release: function (speed) { s.speed = Math.max(0, Math.min(COAST_MAX, speed || 0)); },
      stop: function () { s.speed = 0; },
      tick: function (dt) {
        if (s.speed <= 0) return;
        s.spin += s.speed * dt; s.turned += s.speed * dt;
        s.speed *= Math.exp(-COAST_FADE * dt);
        if (s.speed < 0.05) s.speed = 0;
      },
      days: function () { return Math.floor(s.spin / TAU); },
      reset: function () { s.spin = 0; s.speed = 0; s.turned = 0; }
    };
  }

  var api = {
    create: create, wrap: wrap, angleOf: angleOf, hourAngle: hourAngle, isDay: isDay,
    altitude: altitude, sunSide: sunSide, sky: sky, shadow: shadow,
    SYDNEY: SYDNEY, RIO: RIO, SUN_AT: SUN_AT, TAU: TAU, RAD: RAD
  };
  root.BQ = root.BQ || {};
  root.BQ.dayNightSim = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
