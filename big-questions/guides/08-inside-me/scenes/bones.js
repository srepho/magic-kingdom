/* Moment — bones hold you up.
 * Her skeleton shows faintly inside her. Drag it out sideways: with no bones the body
 * sinks into a wobbly puddle. Drag it back in and she stands up again.
 * Poke the puddle and it wobbles.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, B = BQ.body, D = BQ.draw, INK = BQ.ink;
  var VW = 480, VH = 300, FX = 180, FY = 270, MAX = 180, FULL = 110;

  var frame, surf, loop, off, st;

  function fresh() { return { off: 0, flop: 0, drag: null, wob: 0, was: false, clock: 0, told: false }; }
  function goal() { return Math.max(0, Math.min(1, st.off / FULL)); }

  function start(stage, api) {
    frame = api; st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      down: function (q) {
        var p = surf.toView(q);
        if (Math.abs(p.x - (FX + st.off)) < 62 && p.y > 20 && p.y < 290) st.drag = { dx: st.off - p.x };
      },
      move: function (q) {
        if (!st.drag) return;
        st.off = Math.max(0, Math.min(MAX, surf.toView(q).x + st.drag.dx));
      },
      up: function () { if (st.drag && st.off < 16) st.off = 0; st.drag = null; },
      tap: function (q) {
        var p = surf.toView(q);
        if (st.flop > 0.5 && Math.abs(p.x - FX) < 90 && p.y > 170) { st.wob = 1; BQ.sound.blup(); }
      }
    });
    loop = BQ.loop(tick);
  }

  function tick(dt) {
    st.clock += dt;
    st.flop += (goal() - st.flop) * Math.min(1, dt * 7);
    st.wob = Math.max(0, st.wob - dt * 0.9);
    var down = st.flop > 0.8;
    if (down && !st.was) {
      BQ.sound.plop(); st.wob = 0.7;
      if (!st.told) { st.told = true; frame.caption("Your <b>skeleton</b> holds you up. Without bones you'd be a wobbly puddle!"); }
    }
    if (down) st.was = true;
    else if (st.was && st.flop < 0.15) { st.was = false; BQ.sound.lock(); }   // bones back in: she stands
    draw();
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), f = st.flop, calm = BQ.calm();
    g.fillStyle = INK.sky; D.round(g, 4, 4, VW - 8, VH - 8, 14); g.fill();
    g.fillStyle = '#e6d9c3'; g.fillRect(4, 250, VW - 8, VH - 254);
    g.fillStyle = '#d6c7ad'; g.fillRect(4, 250, VW - 8, 4);
    g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.ellipse(FX, FY + 3, 46 + 50 * f, 7, 0, 0, 6.283); g.fill();

    // the body: stands while the bones are in, sinks as they leave
    var q = B.stand(), i;
    for (i = 0; i < 2; i++) { q.arm[i].a = 0.22 + 1.15 * f; q.leg[i].a = 0.06 + 1.0 * f; }
    var jig = Math.sin(st.clock * 11) * (0.03 * f + 0.09 * st.wob);
    g.save(); g.translate(FX, FY); g.scale(1 + 0.75 * f + jig, 1 - 0.7 * f - jig);
    B.draw(g, q, { skin: 1, face: f > 0.45 ? 'wobbly' : 'smile', t: st.clock, breath: 0.3 });
    g.restore();

    // the skeleton: inside her at first (seen faintly through her), then standing on its own
    var hint = (!calm && st.off === 0 && !st.drag) ? Math.sin(st.clock * 4) * 2 : 0;
    g.save(); g.translate(FX + st.off + hint, FY);
    g.globalAlpha = 1;
    var sk = B.stand();
    if (st.off > FULL * 0.6) { sk.arm[1].a = 2.4; sk.arm[1].b = 0.3 * Math.sin(st.clock * 9); }   // it waves hello
    B.draw(g, sk, { bones: st.off < 4 ? 0.5 : 0.5 + 0.5 * Math.min(1, st.off / 40), plain: true });
    g.restore();

    if (st.off === 0 && !st.drag) {                        // a small arrow: this way
      var ax = FX + 62 + (calm ? 0 : Math.sin(st.clock * 4) * 5);
      g.strokeStyle = 'rgba(59,58,54,.45)'; g.lineWidth = 4; g.lineCap = g.lineJoin = 'round';
      g.beginPath(); g.moveTo(ax, 150); g.lineTo(ax + 26, 150); g.moveTo(ax + 16, 141); g.lineTo(ax + 26, 150); g.lineTo(ax + 16, 159); g.stroke();
    }
  }

  function reset() { if (!st) return; st = fresh(); frame.caption(''); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.bones = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; }, origin: { x: FX, y: FY }, full: FULL };
})(window);
