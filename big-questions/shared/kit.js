/* Big Questions — shared kit: loop, canvas surface, touch, sound, drawing, guide frame.
 * Classic script (no modules) so pages run from file://. Everything hangs off window.BQ.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ = root.BQ || {};

  /* ---------- comfort ---------- */
  var mq = root.matchMedia ? root.matchMedia('(prefers-reduced-motion: reduce)') : null;
  BQ.calm = function () { return !!(mq && mq.matches); };

  /* ---------- animation loop: pauses when the page is hidden ---------- */
  BQ.loop = function (tick) {
    var raf = 0, last = 0, on = false, wanted = true;
    function frame(t) {
      if (!on) return;
      var dt = last ? Math.min((t - last) / 1000, 0.05) : 1 / 60;
      last = t;
      tick(BQ.calm() ? dt * 0.5 : dt);
      raf = requestAnimationFrame(frame);
    }
    function go() { if (on || !wanted) return; on = true; last = 0; raf = requestAnimationFrame(frame); }
    function halt() { on = false; cancelAnimationFrame(raf); }
    function vis() { if (document.hidden) halt(); else go(); }
    document.addEventListener('visibilitychange', vis);
    go();
    return {
      pause: function () { wanted = false; halt(); },
      resume: function () { wanted = true; go(); },
      // step by hand; used by tests, where requestAnimationFrame may be frozen
      advance: function (s) { for (var left = s; left > 1e-6; left -= 1 / 60) tick(Math.min(1 / 60, left)); },
      destroy: function () { wanted = false; halt(); document.removeEventListener('visibilitychange', vis); }
    };
  };

  /* ---------- a canvas that fills its host ---------- */
  BQ.surface = function (host, redraw) {
    var c = document.createElement('canvas');
    host.appendChild(c);
    var s = { c: c, g: c.getContext('2d'), w: 1, h: 1, d: 1 };
    s.fit = function () {
      s.d = Math.min(root.devicePixelRatio || 1, 2);
      s.w = c.clientWidth || 1; s.h = c.clientHeight || 1;
      c.width = Math.round(s.w * s.d); c.height = Math.round(s.h * s.d);
      if (redraw) redraw();
    };
    /* clear, then scale so a vw × vh picture sits centred with padding */
    s.begin = function (vw, vh, pad) {
      var g = s.g; pad = pad == null ? 12 : pad;
      g.setTransform(s.d, 0, 0, s.d, 0, 0);
      g.clearRect(0, 0, s.w, s.h);
      s.k = Math.min((s.w - 2 * pad) / vw, (s.h - 2 * pad) / vh);
      s.ox = (s.w - vw * s.k) / 2; s.oy = (s.h - vh * s.k) / 2;
      g.translate(s.ox, s.oy); g.scale(s.k, s.k);
      g.lineJoin = g.lineCap = 'round';
      return g;
    };
    s.toView = function (p) { return { x: (p.x - s.ox) / s.k, y: (p.y - s.oy) / s.k }; };
    s.destroy = function () { root.removeEventListener('resize', s.fit); c.remove(); };
    root.addEventListener('resize', s.fit);
    s.fit();
    return s;
  };

  /* ---------- one-finger input: down / move / up, plus tap ---------- */
  BQ.touch = function (el, h) {
    var p = null;
    function pt(e) { var r = el.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function down(e) {
      try { el.setPointerCapture(e.pointerId); } catch (_) {}
      var q = pt(e); p = { x: q.x, y: q.y, t: performance.now(), moved: false };
      if (h.down) h.down(q);
      e.preventDefault();
    }
    function move(e) {
      if (!p) return;
      var q = pt(e);
      if (Math.hypot(q.x - p.x, q.y - p.y) > 10) p.moved = true;
      if (h.move) h.move(q);
    }
    function up(e) {
      if (!p) return;
      var q = pt(e), tap = !p.moved && performance.now() - p.t < 400;
      p = null;
      if (h.up) h.up(q);
      if (tap && h.tap) h.tap(q);
    }
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return function off() {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  };

  /* ---------- sound: tiny synth, no audio files ---------- */
  var ac = null, muted = false;
  try { muted = root.localStorage.getItem('bq-muted') === '1'; } catch (_) {}
  function audio() {
    if (muted) return null;
    try {
      if (!ac) { var A = root.AudioContext || root.webkitAudioContext; if (!A) return null; ac = new A(); }
      if (ac.state === 'suspended') ac.resume();
      return ac;
    } catch (_) { return null; }
  }
  function blip(f0, f1, dur, type, vol, delay) {
    var a = audio(); if (!a) return;
    try {
      var o = a.createOscillator(), g = a.createGain(), t = a.currentTime + (delay || 0);
      o.type = type || 'sine';
      o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.03);
    } catch (_) {}
  }
  BQ.sound = {
    clink: function () { blip(2100, 1700, 0.14, 'triangle', 0.10); blip(2700, 2300, 0.10, 'triangle', 0.06, 0.05); },
    squeak: function () { blip(650, 1350, 0.13, 'sine', 0.12); },
    blup: function () { blip(170 + Math.random() * 130, 430, 0.09, 'sine', 0.05); },
    click: function () { blip(900, 620, 0.05, 'triangle', 0.07); },
    lock: function () { blip(1250, 1000, 0.05, 'triangle', 0.06); blip(1500, 1200, 0.05, 'triangle', 0.06, 0.07); },
    drip: function () { blip(1300, 520, 0.11, 'sine', 0.09); },
    plop: function () { blip(320, 110, 0.2, 'sine', 0.14); },
    whoosh: function () { blip(300, 900, 0.25, 'sine', 0.05); },
    nope: function () { blip(300, 210, 0.16, 'triangle', 0.08); },
    coin: function () { blip(1650, 2150, 0.09, 'triangle', 0.09); blip(2300, 2500, 0.08, 'triangle', 0.05, 0.06); },
    muted: function () { return muted; },
    toggle: function () {
      muted = !muted;
      try { root.localStorage.setItem('bq-muted', muted ? '1' : '0'); } catch (_) {}
      if (!muted) BQ.sound.click();
      return muted;
    }
  };

  /* ---------- drawing shared by every model picture ---------- */
  var INK = BQ.ink = {
    line: '#3b3a36', bit: '#4a90d9', bitEdge: '#2f6fb5', water: '#7ec4ee', waterDeep: '#5aa9dc',
    ice: '#eaf7ff', iceEdge: '#9cc9e6', paper: '#fbf6e3', paperEdge: '#c9bb92',
    sun: '#ffd23f', warm: '#ff8a5c', sky: '#dfeef5'
  };
  BQ.draw = {
    /* a water bit: a blob with two small bumps. Crayon look: flat fill, darker edge. */
    bit: function (g, x, y, R, ang, star, alpha) {
      if (alpha != null) { if (alpha <= 0.02) return; g.globalAlpha = alpha; }
      g.fillStyle = INK.bitEdge;
      shape(g, x, y, R + 1.4, ang); g.fill();
      g.fillStyle = INK.bit;
      shape(g, x, y, R, ang); g.fill();
      if (star) BQ.draw.star(g, x, y, R * 0.9);
      if (alpha != null) g.globalAlpha = 1;
    },
    star: function (g, x, y, r) {
      g.fillStyle = INK.sun; g.strokeStyle = '#a66a00'; g.lineWidth = 1;
      g.beginPath();
      for (var k = 0; k < 10; k++) {
        var a = -Math.PI / 2 + k * Math.PI / 5, q = k % 2 ? r * 0.45 : r;
        g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q);
      }
      g.closePath(); g.fill(); g.stroke();
    },
    /* the model card: cream paper, ruled lines, tape. Never a lens. */
    paper: function (g, x, y, w, h) {
      g.fillStyle = 'rgba(0,0,0,.12)'; round(g, x + 2, y + 3, w, h, 8); g.fill();
      g.fillStyle = INK.paper; round(g, x, y, w, h, 8); g.fill();
      g.strokeStyle = INK.paperEdge; g.lineWidth = 1.5; round(g, x, y, w, h, 8); g.stroke();
      g.strokeStyle = 'rgba(120,150,190,.18)'; g.lineWidth = 1;
      for (var ly = y + 16; ly < y + h - 6; ly += 14) { g.beginPath(); g.moveTo(x + 6, ly); g.lineTo(x + w - 6, ly); g.stroke(); }
      g.fillStyle = 'rgba(230,205,130,.85)';
      g.save(); g.translate(x + 4, y + 4); g.rotate(-0.7); g.fillRect(-13, -5, 26, 10); g.restore();
      g.save(); g.translate(x + w - 4, y + 4); g.rotate(0.7); g.fillRect(-13, -5, 26, 10); g.restore();
    },
    glasses: function (g, x, y, s) {
      g.strokeStyle = INK.line; g.lineWidth = s * 0.12;
      g.beginPath(); g.arc(x - s * 0.55, y, s * 0.4, 0, 6.283); g.stroke();
      g.beginPath(); g.arc(x + s * 0.55, y, s * 0.4, 0, 6.283); g.stroke();
      g.beginPath(); g.moveTo(x - s * 0.15, y); g.lineTo(x + s * 0.15, y); g.stroke();
    },
    round: round
  };
  function shape(g, x, y, R, ang) {
    g.beginPath(); g.arc(x, y, R, 0, 6.283);
    for (var s = -1; s <= 1; s += 2) {
      var a = ang + s * 0.91;
      g.moveTo(x + Math.cos(a) * R * 0.95 + R * 0.48, y + Math.sin(a) * R * 0.95);
      g.arc(x + Math.cos(a) * R * 0.95, y + Math.sin(a) * R * 0.95, R * 0.48, 0, 6.283);
    }
  }
  function round(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
    g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
    g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
  }

  /* ---------- the guide frame: parts, corner buttons, caption ---------- */
  var ICON = {
    home: '<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',
    toy: '<circle cx="7" cy="13" r="4"/><circle cx="17" cy="13" r="4"/><path d="M11 13h2M3 12l1-5M21 12l-1-5"/>',
    reset: '<path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5"/>',
    sound: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
    quiet: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9l5 6M21 9l-5 6"/>'
  };
  function svg(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
           'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[name] + '</svg>';
  }

  BQ.frame = (function () {
    var opts, scenes, parts, current = null, btn = {}, cap;

    function init(o) {
      opts = o; scenes = o.scenes || {};
      var bar = document.createElement('div');
      bar.className = 'bq-chrome';
      bar.innerHTML =
        '<button class="bq-btn" data-act="home" aria-label="Back">' + svg('home') + '</button>' +
        '<p class="bq-caption" aria-live="polite" hidden></p>' +
        '<button class="bq-btn" data-act="toy" aria-label="The toy">' + svg('toy') + '</button>' +
        '<button class="bq-btn" data-act="reset" aria-label="Start again">' + svg('reset') + '</button>' +
        '<button class="bq-btn" data-act="sound" aria-label="Sound"></button>';
      document.body.appendChild(bar);
      cap = bar.querySelector('.bq-caption');
      [].forEach.call(bar.querySelectorAll('.bq-btn'), function (b) { btn[b.dataset.act] = b; });
      btn.home.onclick = function () {
        if (name() === 'cover') root.location.href = opts.shelf; else root.location.hash = '#cover';
      };
      btn.toy.onclick = function () { root.location.hash = '#toy'; };
      btn.reset.onclick = function () { if (current && current.reset) current.reset(); BQ.sound.click(); };
      btn.sound.onclick = function () { BQ.sound.toggle(); paintSound(); };
      paintSound();

      parts = [].slice.call(document.querySelectorAll('[data-part]'));
      [].forEach.call(document.querySelectorAll('[data-hold]'), hold);
      root.addEventListener('hashchange', route);
      document.addEventListener('pointerdown', audio, { passive: true });
      route();
      if (opts.sw && 'serviceWorker' in navigator && root.location.protocol === 'https:') {
        navigator.serviceWorker.register(opts.sw).catch(function () {});
      }
    }
    function paintSound() { btn.sound.innerHTML = svg(BQ.sound.muted() ? 'quiet' : 'sound'); }
    function name() {
      var n = (root.location.hash || '#cover').slice(1);
      return document.querySelector('[data-part="' + n + '"]') ? n : 'cover';
    }
    function route() {
      var n = name();
      if (current) { current.cleanup(); current = null; }
      caption(''); nudgeToy(false);
      parts.forEach(function (p) { p.hidden = p.dataset.part !== n; });
      document.body.dataset.at = n;
      var sc = scenes[n], part = document.querySelector('[data-part="' + n + '"]');
      btn.toy.hidden = n === 'cover' || n === 'toy';
      btn.reset.hidden = !sc;
      part.scrollTop = 0;
      if (sc) { sc.start(part.querySelector('.stage') || part, api); current = sc; }
    }
    function caption(html) {
      cap.innerHTML = html || '';
      cap.hidden = !html;
    }
    function nudgeToy(on) { btn.toy.classList.toggle('bq-nudge', on !== false); }

    /* grown-up door: press and hold. Keeps small fingers on the child's side. */
    function hold(el) {
      var timer = 0;
      function open() { root.location.hash = el.dataset.hold; }
      function start(e) { el.classList.add('holding'); timer = setTimeout(open, 1200); e.preventDefault(); }
      function stop() { el.classList.remove('holding'); clearTimeout(timer); }
      el.addEventListener('pointerdown', start);
      el.addEventListener('pointerup', stop);
      el.addEventListener('pointerleave', stop);
      el.addEventListener('pointercancel', stop);
      el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter') open(); });
    }

    var api = { init: init, caption: caption, nudgeToy: nudgeToy, current: function () { return current; } };
    return api;
  })();
})(window);
