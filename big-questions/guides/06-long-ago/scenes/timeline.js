/* Centrepiece — the zooming timeline.
 * "Now" is at the right. She slides (or drags the picture) to zoom out: everything she was
 * just looking at squashes towards now, and a far older landmark comes in from the left.
 * Slide back and it all opens out again. At every moment the line is an honest ruler.
 * The numbers live in long-ago-sim.js; this file draws and listens.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, S = BQ.longAgoSim, P = BQ.longAgoPics, D = BQ.draw, INK = BQ.ink;
  var VW = 480, VH = 240, X0 = 26, X1 = 412, TY = 176, TH = 24, PY = 104;
  var LIFE = '#f2788f';
  var BAND = ['#fbd5dc', '#9fc7ea', '#ffd98a', '#b9dca8', '#e8c77a', '#f6b08a', '#c9b6e6', '#9cd3c2', '#f0a08a'];

  var CAPTION = [
    'This <b>timeline</b> is your life so far. Slide to <b>zoom out</b>.',
    'Back when Dad was a baby. Your whole life is the little pink bit.',
    'The Harbour Bridge was brand new. The oldest people alive were babies.',
    'Castles and knights. Too long ago for anyone to remember.',
    'The pyramids. They are <b>ancient</b>: very, very old.',
    'People already lived in Australia, and so did giant wombat cousins.',
    'The first people like us, far away in Africa.',
    'The last giant dinosaurs. No people anywhere yet.',
    'The Earth was brand new. Your pink bit is far too small to see.'
  ];
  var NAME = {
    baby: 'You, brand new.', dad: 'Dad as a baby. Yes, really.',
    bridge: 'The Sydney Harbour Bridge, just finished.', castle: 'A castle, when castles were new.',
    pyramid: 'A pyramid in Egypt.', camp: 'A campfire, and a giant wombat cousin.',
    first: 'Some of the very first people.', dino: 'A long-necked dinosaur.', earth: 'The Earth, hot and new.'
  };
  var NOISE = { baby: 'squeak', dad: 'squeak', bridge: 'clink', castle: 'whoosh', pyramid: 'click',
                camp: 'plop', first: 'squeak', dino: 'plop', earth: 'whoosh' };

  var el, frame, surf, loop, track, thumb, offs = [], st;

  function fresh() { return { target: 0, z: 0, level: 0, drag: null, sliding: false, hop: {}, wave: 0, clock: 0 }; }

  function start(stage, api) {
    el = stage; frame = api; st = fresh();
    el.innerHTML =
      '<div class="la-view"></div>' +
      '<div class="la-bar">' +
        '<span class="la-end la-past"></span>' +
        '<div class="la-track"><div class="la-thumb"></div></div>' +
        '<span class="la-end la-now"></span>' +
      '</div>';
    surf = BQ.surface(el.querySelector('.la-view'), draw);
    track = el.querySelector('.la-track'); thumb = el.querySelector('.la-thumb');

    function slide(p) {                                     // right end is now; left is long ago
      var half = thumb.offsetWidth / 2;
      var v = Math.max(0, Math.min(1, (p.x - half) / (track.clientWidth - 2 * half)));
      st.target = (1 - v) * S.MAX; placeThumb();
    }
    offs.push(BQ.touch(track, {
      down: function (p) { st.sliding = true; slide(p); },
      move: function (p) { if (st.sliding) slide(p); },
      up: function () { st.sliding = false; }
    }));
    offs.push(BQ.touch(surf.c, {
      down: function (q) { st.drag = { x: q.x, z: st.target }; },
      move: function (q) {                                   // push things towards now = zoom out
        if (!st.drag) return;
        st.target = S.clampZ(st.drag.z + (q.x - st.drag.x) / (surf.k * 70)); placeThumb();
      },
      up: function () { st.drag = null; },
      tap: function (q) {
        var p = surf.toView(q), best = null, bd = 34;
        if (Math.hypot(p.x - (X1 + 30), p.y - (TY - 30)) < 36) { st.wave = 1.6; BQ.sound.squeak(); return; }
        S.marks(st.z).forEach(function (m) {
          if (m.alpha < 0.6 || m.size < 0.45) return;
          var d = Math.hypot(p.x - xOf(m.pos), p.y - (PY + (1 - m.size) * 46));
          if (d < bd) { bd = d; best = m; }
        });
        if (best) { st.hop[best.key] = 1; BQ.sound[NOISE[best.key]](); frame.caption(NAME[best.key]); }
      }
    }));
    root.addEventListener('resize', placeThumb);
    offs.push(function () { root.removeEventListener('resize', placeThumb); });
    placeThumb();
    frame.caption(CAPTION[0]);
    loop = BQ.loop(tick);
  }

  function xOf(pos) { return X1 - pos * (X1 - X0); }
  function placeThumb() {
    if (!thumb) return;
    var v = 1 - st.target / S.MAX;
    thumb.style.transform = 'translateX(' + (v * (track.clientWidth - thumb.offsetWidth)) + 'px)';
  }

  function tick(dt) {
    st.clock += dt;
    st.z += (st.target - st.z) * Math.min(1, 9 * dt);
    if (Math.abs(st.target - st.z) < 0.002) st.z = st.target;
    st.wave = Math.max(0, st.wave - dt);
    Object.keys(st.hop).forEach(function (k) { st.hop[k] = Math.max(0, st.hop[k] - dt * 2.2); });
    var lv = S.reached(st.z);
    if (lv !== st.level) { st.level = lv; frame.caption(CAPTION[lv]); BQ.sound.click(); }
    draw();
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH, 6), W = X1 - X0, span = S.span(st.z), i, calm = BQ.calm();
    g.fillStyle = INK.sky; D.round(g, 2, 2, VW - 4, VH - 4, 14); g.fill();
    g.fillStyle = '#e9e2d3'; g.fillRect(2, TY + TH + 12, VW - 4, VH - TY - TH - 14);

    // the line. Each stretch she has already seen is a coloured band, nested inside the next.
    g.save(); D.round(g, X0, TY, W, TH, 8); g.clip();
    g.fillStyle = INK.paper; g.fillRect(X0, TY, W, TH);
    for (i = S.MAX; i >= 0; i--) {
      var w = Math.min(1, S.LEVELS[i].span / span) * W;
      if (w < 0.35) continue;                               // too thin to see: that is the point
      g.fillStyle = BAND[i]; g.fillRect(X1 - w, TY, w, TH);
      if (w < W) { g.fillStyle = 'rgba(59,58,54,.35)'; g.fillRect(X1 - w, TY, 1, TH); }
    }
    var life = S.lifeShare(st.z) * W;                       // her own life, always the same pink
    if (life >= 0.35) { g.fillStyle = LIFE; g.fillRect(X1 - life, TY, life, TH); }
    g.restore();
    g.strokeStyle = INK.line; g.lineWidth = 3; D.round(g, X0, TY, W, TH, 8); g.stroke();
    if (st.z < S.MAX - 0.05) {                              // there is more beyond the left end
      var fog = g.createLinearGradient(X0 - 22, 0, X0 + 26, 0);
      fog.addColorStop(0, INK.sky); fog.addColorStop(1, 'rgba(223,238,245,0)');
      g.fillStyle = fog; g.fillRect(X0 - 24, TY - 100, 50, TH + 104);
    }

    // landmarks: a stem on the line and a picture above it
    S.marks(st.z).forEach(function (m) {
      if (m.alpha <= 0.02) return;
      var x = xOf(Math.min(m.pos, 1.2)), s = 30 * m.size, hop = Math.sin((st.hop[m.key] || 0) * Math.PI) * 16;
      var py = PY + (1 - m.size) * 46 - hop;
      g.globalAlpha = m.alpha;
      g.strokeStyle = INK.line; g.lineWidth = 2;
      g.beginPath(); g.moveTo(x, TY); g.lineTo(x, py + s * 0.9); g.stroke();
      g.fillStyle = INK.line; g.beginPath(); g.arc(x, TY, 3, 0, 6.283); g.fill();
      P.pic(g, m.key, x, py, s, calm ? 0 : st.clock);
      g.globalAlpha = 1;
    });

    // now: a star on the end of the line, and her
    D.star(g, X1, TY - 6, 9);
    P.kid(g, X1 + 30, TY + TH, 62, 5, st.clock, st.wave > 0);
  }

  function reset() { if (!st) return; st = fresh(); placeThumb(); frame.caption(CAPTION[0]); draw(); }
  function cleanup() {
    if (loop) loop.destroy();
    offs.forEach(function (off) { off(); }); offs = [];
    if (surf) surf.destroy();
    if (el) el.innerHTML = '';
    el = surf = loop = track = thumb = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.timeline = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; },
    setZoom: function (z) { st.target = S.clampZ(z); placeThumb(); },
    spots: { xOf: xOf, picY: PY, kid: { x: X1 + 30, y: TY - 30 }, vw: VW, vh: VH, pad: 6 } };
})(window);
