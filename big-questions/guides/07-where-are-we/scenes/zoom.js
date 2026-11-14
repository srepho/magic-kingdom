/* Centrepiece — the big zoom.
 * One slider. All the way left: the roof of home, seen from above. Slide right and the view
 * lifts: the street, the city, the country, the whole Earth, the planets. Slide back and it
 * all comes home again. A red dot marks home at every step.
 * The zoom maths lives in where-sim.js; this file draws the six pictures and listens.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, S = BQ.whereSim, A = BQ.atlas, D = BQ.draw, INK = BQ.ink;
  var VW = S.VW, VH = S.VH, C = S.C;
  var ROOFS = ['#c96f52', '#8d99a6', '#d9c7a3', '#7f8c6b', '#b5653f', '#a3a9b0'];
  var CAPS = [
    'This is home, seen from up high.',
    'Home is in a street, with lots of other homes.',
    'The streets are part of a big <b>city</b>. This one is Sydney.',
    'Sydney is in a <b>country</b> called Australia.',
    'Australia is on a <b>planet</b> called Earth. Earth is a ball.',
    'Earth is one of eight planets going around the Sun.'
  ];

  var el, frame, surf, loop, offs = [], track, thumb, st, buf;

  function fresh() { return { z: 0, target: 0, clock: 0, at: 0, dog: 0, dragging: false }; }

  function start(stage, api) {
    frame = api; el = stage; st = fresh();
    el.innerHTML =
      '<div class="zm-view"></div>' +
      '<div class="zm-bar"><span class="zm-end zm-house"></span>' +
      '<div class="zm-track"><div class="zm-thumb"></div></div><span class="zm-end zm-planet"></span></div>';
    surf = BQ.surface(el.querySelector('.zm-view'), draw);
    track = el.querySelector('.zm-track'); thumb = el.querySelector('.zm-thumb');
    buf = document.createElement('canvas'); buf.width = VW * 2; buf.height = VH * 2;

    function slide(p) {
      var half = thumb.offsetWidth / 2;
      st.target = S.clampZ((p.x - half) / (track.clientWidth - 2 * half) * S.TOP);
      placeThumb();
    }
    offs.push(BQ.touch(track, {
      down: function (p) { st.dragging = true; slide(p); },
      move: function (p) { if (st.dragging) slide(p); },
      up: function () { st.dragging = false; }
    }));
    offs.push(BQ.touch(surf.c, {
      tap: function (q) {                                  // at home, the dog likes a pat
        var p = surf.toView(q);
        if (st.z < 0.2 && Math.hypot(p.x - 250, p.y - 258) < 40) { st.dog = 1; BQ.sound.squeak(); }
      }
    }));
    function wheel(e) { st.target = S.clampZ(st.target + e.deltaY * 0.002); placeThumb(); e.preventDefault(); }
    surf.c.addEventListener('wheel', wheel, { passive: false });
    offs.push(function () { surf.c.removeEventListener('wheel', wheel); });
    root.addEventListener('resize', placeThumb);
    offs.push(function () { root.removeEventListener('resize', placeThumb); });

    placeThumb();
    frame.caption(CAPS[0]);
    loop = BQ.loop(tick);
  }
  function placeThumb() {
    if (!thumb) return;
    thumb.style.transform = 'translateX(' + (st.target / S.TOP * (track.clientWidth - thumb.offsetWidth)) + 'px)';
  }

  function tick(dt) {
    st.clock += dt;
    st.z += (st.target - st.z) * (1 - Math.exp(-dt / 0.14));
    if (Math.abs(st.target - st.z) < 0.0005) st.z = st.target;
    st.dog = Math.max(0, st.dog - dt * 1.4);
    var n = S.nearest(st.z);
    if (n !== st.at) { st.at = n; frame.caption(CAPS[n]); BQ.sound.click(); }
    draw();
  }

  /* ---------- the six pictures, each drawn in a 480 × 300 box ---------- */
  function house(g, x, y, w, h, roof) {                    // a roof from above
    g.fillStyle = roof; g.fillRect(x, y, w, h);
    g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = Math.max(0.6, w * 0.02);
    g.strokeRect(x, y, w, h);
    var q = Math.min(w, h) * 0.5;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + q, y + h / 2); g.lineTo(x, y + h);
    g.moveTo(x + w, y); g.lineTo(x + w - q, y + h / 2); g.lineTo(x + w, y + h);
    g.moveTo(x + q, y + h / 2); g.lineTo(x + w - q, y + h / 2); g.stroke();
  }
  function tree(g, x, y, r) {
    g.fillStyle = '#5da24c'; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
    g.fillStyle = '#7cc36a'; g.beginPath(); g.arc(x - r * 0.2, y - r * 0.2, r * 0.65, 0, 6.283); g.fill();
  }

  function drawHome(g) {
    g.fillStyle = '#b9dca8'; g.fillRect(0, 0, VW, VH);
    g.fillStyle = '#8f8c86'; g.fillRect(0, 0, VW, 14);               // the street, along the top
    g.fillStyle = '#d6d2c8'; g.fillRect(0, 14, VW, 10);              // footpath
    g.fillStyle = '#c9c5bd'; g.fillRect(366, 24, 70, 150);           // driveway
    g.fillStyle = '#5b86c9'; D.round(g, 378, 70, 46, 84, 12); g.fill();   // the car
    g.fillStyle = '#cfe3f5'; D.round(g, 384, 84, 34, 20, 5); g.fill(); D.round(g, 384, 126, 34, 16, 5); g.fill();
    g.fillStyle = '#d6d2c8'; g.fillRect(232, 24, 16, 40);            // front path
    house(g, 140, 62, 200, 132, ROOFS[0]);
    g.fillStyle = '#3d5a80';                                         // solar panels
    for (var k = 0; k < 3; k++) g.fillRect(262 + k * 22, 146, 18, 30);
    g.fillStyle = '#9b7b55'; g.fillRect(404, 196, 60, 88);           // veggie patch
    g.fillStyle = '#7cc36a'; for (k = 0; k < 6; k++) { g.beginPath(); g.arc(418 + (k % 2) * 30, 212 + Math.floor(k / 2) * 28, 8, 0, 6.283); g.fill(); }
    g.strokeStyle = '#59636b'; g.lineWidth = 2.5;                    // rotary clothesline
    g.strokeRect(46, 84, 44, 44); g.beginPath(); g.moveTo(46, 84); g.lineTo(90, 128); g.moveTo(90, 84); g.lineTo(46, 128); g.stroke();
    g.fillStyle = '#f2788f'; g.fillRect(52, 82, 12, 6); g.fillStyle = '#6fb6d9'; g.fillRect(70, 124, 14, 6);
    g.fillStyle = '#2f3a44'; g.beginPath(); g.arc(78, 232, 34, 0, 6.283); g.fill();       // trampoline
    g.strokeStyle = '#6fb6d9'; g.lineWidth = 6; g.beginPath(); g.arc(78, 232, 34, 0, 6.283); g.stroke();
    tree(g, 22, 44, 24); tree(g, 340, 262, 26);
    // the dog
    var spin = st ? Math.sin(st.dog * Math.PI) * 6.283 : 0;
    g.save(); g.translate(250, 258); g.rotate(spin);
    g.fillStyle = '#a17a55'; g.beginPath(); g.ellipse(0, 0, 16, 10, 0, 0, 6.283); g.fill();
    g.beginPath(); g.arc(15, 0, 8, 0, 6.283); g.fill();
    g.fillStyle = '#6b4a2e'; g.beginPath(); g.arc(15, -7, 3.5, 0, 6.283); g.arc(15, 7, 3.5, 0, 6.283); g.fill();
    g.strokeStyle = '#a17a55'; g.lineWidth = 4; g.beginPath(); g.moveTo(-15, 0);
    g.lineTo(-25, (BQ.calm() || !st) ? 0 : Math.sin(st.clock * 9) * 5); g.stroke();
    g.restore();
    g.strokeStyle = '#b89f7c'; g.lineWidth = 4; g.strokeRect(2, 26, VW - 4, VH - 28);    // fence
  }

  function drawStreet(g) {
    g.fillStyle = '#b9dca8'; g.fillRect(0, 0, VW, VH);
    g.fillStyle = '#8f8c86'; g.fillRect(0, 120, VW, 24); g.fillRect(300, 0, 22, VH);
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1.5; g.setLineDash([8, 8]);
    g.beginPath(); g.moveTo(0, 132); g.lineTo(VW, 132); g.moveTo(311, 0); g.lineTo(311, VH); g.stroke(); g.setLineDash([]);
    var n = 0, x, row, ys = [[40, 30], [70, 32], [163, 26], [208, 30], [258, 30]];
    for (row = 0; row < ys.length; row++) {
      for (x = 8; x < 470; x += 46) {
        n++;
        if (x + 40 > 296 && x < 326) continue;                        // the cross street
        if (row >= 2 && x > 330) continue;                            // the park
        if (row === 2 && Math.abs(x + 20 - 196) < 24) continue;       // home's own block
        g.fillStyle = '#a9d196'; g.fillRect(x, ys[row][0] - 6, 40, ys[row][1] + 12);
        house(g, x + 8, ys[row][0], 24, ys[row][1] - 8, ROOFS[1 + (n * 7) % 5]);
      }
    }
    // home's block: the home picture, made small (1/12)
    g.fillStyle = '#a9d196'; g.fillRect(176, 163.5, 40, 25);
    house(g, 187.7, 168.7, 16.6, 11, ROOFS[0]);
    g.fillStyle = '#5b86c9'; g.fillRect(207.5, 169.3, 3.8, 7);
    // the park
    g.fillStyle = '#9ccf8a'; D.round(g, 334, 156, 138, 136, 10); g.fill();
    tree(g, 352, 176, 11); tree(g, 452, 172, 12); tree(g, 448, 272, 13); tree(g, 356, 270, 10);
    g.fillStyle = '#e8d9a8'; g.beginPath(); g.ellipse(402, 226, 34, 24, 0, 0, 6.283); g.fill();   // sandpit
    g.strokeStyle = '#f5b942'; g.lineWidth = 5; g.beginPath(); g.moveTo(386, 218); g.lineTo(418, 236); g.stroke();
    g.fillStyle = '#e4534a'; g.beginPath(); g.arc(386, 218, 5, 0, 6.283); g.fill();
    // a car pottering along
    var cx = st && !BQ.calm() ? (st.clock * 22) % 540 - 30 : 120;
    g.fillStyle = '#f5b942'; D.round(g, cx, 123, 16, 8, 3); g.fill();
  }

  function drawCity(g) {
    g.fillStyle = '#d9e3c4'; g.fillRect(0, 0, VW, VH);
    g.fillStyle = '#9ccf8a';                                             // bushland: north, south, and the mountains out west
    g.beginPath(); g.ellipse(300, 6, 110, 34, 0, 0, 6.283); g.fill();
    g.beginPath(); g.ellipse(300, 296, 90, 36, 0, 0, 6.283); g.fill();
    g.fillStyle = '#86bd7a'; g.fillRect(0, 0, 34, VH);
    var s = 12345, i;
    for (i = 0; i < 260; i++) {                                          // a sprinkle of roofs
      s = (s * 1664525 + 1013904223) >>> 0; var x = 40 + (s % 3200) / 10;
      s = (s * 1664525 + 1013904223) >>> 0; var y = 30 + (s % 2400) / 10;
      g.fillStyle = ROOFS[i % 6]; g.fillRect(x, y, 3.2, 2.4);
    }
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 2.5;          // big roads
    g.beginPath(); g.moveTo(36, 170); g.quadraticCurveTo(180, 200, 312, 162);
    g.moveTo(150, 300); g.quadraticCurveTo(200, 200, 316, 136); g.lineTo(330, 40); g.stroke();
    g.fillStyle = INK.water;                                             // the sea, to the east
    g.beginPath(); g.moveTo(384, 0); g.quadraticCurveTo(360, 70, 372, 136); g.quadraticCurveTo(352, 190, 340, 300);
    g.lineTo(VW, 300); g.lineTo(VW, 0); g.closePath(); g.fill();
    g.beginPath();                                                       // the harbour, reaching west as a river
    g.moveTo(376, 132); g.quadraticCurveTo(340, 128, 322, 140); g.quadraticCurveTo(290, 132, 262, 146);
    g.quadraticCurveTo(220, 140, 150, 148); g.lineTo(150, 152); g.quadraticCurveTo(220, 150, 262, 156);
    g.quadraticCurveTo(292, 150, 320, 156); g.quadraticCurveTo(345, 152, 376, 150); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(338, 222, 20, 15, 0, 0, 6.283); g.fill();   // a round bay to the south
    g.fillRect(338, 216, 30, 12);
    g.beginPath(); g.moveTo(388, 30); g.quadraticCurveTo(350, 26, 330, 14); g.lineTo(334, 8); g.quadraticCurveTo(356, 18, 388, 18); g.closePath(); g.fill();
    g.fillStyle = '#6d7b88';                                             // tall buildings in the middle of the city
    [[306, 158, 5, 12], [312, 156, 5, 16], [318, 159, 5, 11], [309, 168, 6, 8], [316, 167, 6, 9]].forEach(function (b) { g.fillRect(b[0], b[1], b[2], b[3]); });
    g.strokeStyle = '#4d5a66'; g.lineWidth = 2.5;                        // the bridge
    g.beginPath(); g.moveTo(314, 156); g.lineTo(314, 140); g.stroke();
    g.beginPath(); g.arc(314, 148, 8, Math.PI * 0.5, Math.PI * 1.5); g.stroke();
  }

  function drawCountry(g) { A.globe(g, C.x, C.y, S.MAP_R, S.VIEW.lon, S.VIEW.lat); }
  function drawEarth(g, inset) {
    if (!inset) A.sky(g, 0, 0, VW, VH, 77, 70, st ? st.clock : 0);
    A.globe(g, C.x, C.y, S.GLOBE_R, S.VIEW.lon, S.VIEW.lat);
  }
  function drawSpace(g) {
    A.sky(g, 0, 0, VW, VH, 5, 90, st ? st.clock : 0);
    var sun = g.createRadialGradient(S.SUN_AT.x, S.SUN_AT.y, 20, S.SUN_AT.x, S.SUN_AT.y, 74);
    sun.addColorStop(0, 'rgba(255,210,63,.55)'); sun.addColorStop(1, 'rgba(255,210,63,0)');
    g.fillStyle = sun; g.beginPath(); g.arc(S.SUN_AT.x, S.SUN_AT.y, 74, 0, 6.283); g.fill();
    g.fillStyle = INK.sun; g.beginPath(); g.arc(S.SUN_AT.x, S.SUN_AT.y, 44, 0, 6.283); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 1.2;
    for (var i = 0; i < 8; i++) { g.beginPath(); g.arc(S.SUN_AT.x, S.SUN_AT.y, S.ORBITS[i], 0, 6.283); g.stroke(); }
    for (i = 0; i < 8; i++) { var p = S.planetSpot(i); A.planet(g, i, p.x, p.y, p.r); }
  }
  var PICTURES = [drawHome, drawStreet, drawCity, drawCountry, drawEarth, drawSpace];

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH, 6), fr = S.frame(st.z);
    g.save(); D.round(g, 0, 0, VW, VH, 14); g.clip();
    if (fr.fade < 1) {                                       // the bigger place, arriving
      g.save();
      g.translate(fr.W.x, fr.W.y); g.scale(fr.k1, fr.k1); g.translate(-fr.W.x, -fr.W.y);
      PICTURES[fr.upper](g, false);
      g.restore();
    }
    if (fr.fade >= 1) {                                      // the smaller place, plain
      g.save(); g.translate(fr.at.x, fr.at.y); g.scale(fr.k0, fr.k0); g.translate(-C.x, -C.y);
      g.beginPath(); g.rect(0, 0, VW, VH); g.clip();
      PICTURES[fr.lower](g, false);
      g.restore();
    } else if (fr.fade > 0) {                                // …and shrinking away into it
      var b = buf.getContext('2d');
      b.setTransform(2, 0, 0, 2, 0, 0); b.clearRect(0, 0, VW, VH); b.lineJoin = b.lineCap = 'round';
      PICTURES[fr.lower](b, true);
      g.save(); g.globalAlpha = fr.fade;
      g.translate(fr.at.x, fr.at.y); g.scale(fr.k0, fr.k0); g.translate(-C.x, -C.y);
      g.drawImage(buf, 0, 0, VW, VH);
      g.restore();
    }
    // home is here
    var h = S.homeOnScreen(st.z), a = fr.lower === 0 ? 1 - fr.fade : 1;
    if (st.z > 4.5) {                                        // out here Earth is a dot: ring it rather than cover it
      var far = Math.min(1, (st.z - 4.5) * 4), pr = 6 + 5 * far;
      g.strokeStyle = '#e4534a'; g.lineWidth = 2.5;
      g.beginPath(); g.arc(h.x, h.y, pr + (BQ.calm() ? 0 : Math.sin(st.clock * 3) * 1.2), 0, 6.283); g.stroke();
      A.pin(g, h.x, h.y, 6 - 4.5 * far, st.clock, 1 - far);
    } else A.pin(g, h.x, h.y, 6, st.clock, a);
    g.restore();
    g.strokeStyle = INK.line; g.lineWidth = 3; D.round(g, 0, 0, VW, VH, 14); g.stroke();
  }

  function reset() { if (!st) return; st = fresh(); placeThumb(); frame.caption(CAPS[0]); draw(); }
  function cleanup() {
    if (loop) loop.destroy();
    offs.forEach(function (off) { off(); }); offs = [];
    if (surf) surf.destroy();
    if (el) el.innerHTML = '';
    el = surf = loop = track = thumb = st = buf = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.zoom = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; },
    setZoom: function (z) { st.target = S.clampZ(z); placeThumb(); },
    pictures: PICTURES };
})(window);
