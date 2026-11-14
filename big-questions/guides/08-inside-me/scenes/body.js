/* Inside me — the figure, shared by this guide's scenes (BQ.body).
 *
 * A simple friendly child, facing us, drawn in three layers that sit on top of one another:
 * bones, then organs, then the outside. Fading the top layers lets her "lift them away".
 * Figure units: feet at y = 0, top of the head near y = -236. She faces us, so HER left is
 * on OUR right (+x): the heart sits a little to +x, as a real heart sits a little to the left.
 * Blood is red everywhere, including on its way back to the heart (a darker red).
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, INK = BQ.ink;
  var SKIN = '#e2ad84', SHIRT = '#57b5a6', SHORTS = '#5b6ea8', HAIR = '#5a4030', SHOE = '#e4534a';
  var PALE = '#f8e9dc', PALE_EDGE = '#cfa98f', BONE = '#fffdf4', BONE_EDGE = '#a39c8a';
  var BLOOD = '#d8394a', BLOOD_BACK = '#a12c3c', NERVE = '#f5b942';

  /* ---------- poses ---------- */
  function stand() {
    return { bob: 0, arm: [{ a: 0.22, b: 0.08 }, { a: 0.22, b: 0.08 }], leg: [{ a: 0.06, b: 0 }, { a: 0.06, b: 0 }] };
  }
  /* running on the spot: p counts strides, amt blends from standing (0) to running (1) */
  function run(p, amt) {
    var q = stand();
    for (var i = 0; i < 2; i++) {
      var lift = Math.max(0, Math.sin(6.283 * p + i * Math.PI));
      var swing = Math.sin(6.283 * p + (1 - i) * Math.PI);
      q.leg[i].a = 0.06 + 0.75 * lift * amt; q.leg[i].b = -1.85 * lift * amt;
      q.arm[i].a = 0.22 + 0.2 * amt; q.arm[i].b = 0.08 + (1.82 + 0.45 * swing) * amt;
    }
    q.bob = -7 * Math.abs(Math.sin(6.283 * p)) * amt;
    return q;
  }
  function joints(q) {
    var b = q.bob;
    var J = { head: { x: 0, y: -204 + b }, neck: { x: 0, y: -172 + b }, heart: { x: 6, y: -136 + b },
              tummy: { x: 0, y: -106 + b }, pelvis: { x: 0, y: -92 + b }, sh: [], el: [], ha: [], hip: [], kn: [], ft: [] };
    for (var i = 0; i < 2; i++) {
      var s = i ? 1 : -1, A = q.arm[i], L = q.leg[i];
      var sh = { x: s * 30, y: -160 + b }, hip = { x: s * 14, y: -88 + b };
      var el = { x: sh.x + s * Math.sin(A.a) * 33, y: sh.y + Math.cos(A.a) * 33 };
      var ha = { x: el.x + s * Math.sin(A.a + A.b) * 31, y: el.y + Math.cos(A.a + A.b) * 31 };
      var kn = { x: hip.x + s * Math.sin(L.a) * 44, y: hip.y + Math.cos(L.a) * 44 };
      var ft = { x: kn.x + s * Math.sin(L.a + L.b) * 44, y: kn.y + Math.cos(L.a + L.b) * 44 };
      J.sh.push(sh); J.el.push(el); J.ha.push(ha); J.hip.push(hip); J.kn.push(kn); J.ft.push(ft);
    }
    return J;
  }
  /* routes through the body: used for blood, for nerves and for messages */
  function paths(J) {
    var top = { x: 0, y: J.head.y - 6 };
    return {
      hand: [0, 1].map(function (i) { return [top, J.neck, J.sh[i], J.el[i], J.ha[i]]; }),
      foot: [0, 1].map(function (i) { return [top, J.neck, J.pelvis, J.hip[i], J.kn[i], J.ft[i]]; })
    };
  }
  /* a point u (0..1) of the way along a list of points */
  function along(pts, u) {
    var total = 0, k, lens = [];
    for (k = 1; k < pts.length; k++) { lens.push(Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y)); total += lens[k - 1]; }
    var d = Math.max(0, Math.min(1, u)) * total;
    for (k = 0; k < lens.length; k++) {
      if (d <= lens[k] || k === lens.length - 1) {
        var f = lens[k] ? Math.min(1, d / lens[k]) : 0;
        return { x: pts[k].x + (pts[k + 1].x - pts[k].x) * f, y: pts[k].y + (pts[k + 1].y - pts[k].y) * f };
      }
      d -= lens[k];
    }
    return pts[0];
  }

  /* ---------- drawing helpers ---------- */
  function line(g, pts, w, col) {
    g.strokeStyle = col; g.lineWidth = w; g.lineCap = g.lineJoin = 'round';
    g.beginPath(); g.moveTo(pts[0].x, pts[0].y);
    for (var k = 1; k < pts.length; k++) g.lineTo(pts[k].x, pts[k].y);
    g.stroke();
  }
  function dot(g, x, y, r, col) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
  function oval(g, x, y, rx, ry, rot, fill, edge, w) {
    g.beginPath(); g.ellipse(x, y, rx, ry, rot || 0, 0, 6.283);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (edge) { g.strokeStyle = edge; g.lineWidth = w || 2; g.stroke(); }
  }
  function torso(g, b, grow) { BQ.draw.round(g, -33 - grow, -174 + b, 66 + 2 * grow, 86, 14); }

  /* the plain body shape: pale, so what is inside shows up against it */
  function silhouette(g, J, b) {
    [[PALE_EDGE, 3], [PALE, 0]].forEach(function (pass) {
      var c = pass[0], extra = pass[1], i;
      for (i = 0; i < 2; i++) { line(g, [J.hip[i], J.kn[i], J.ft[i]], 16 + extra, c); line(g, [J.sh[i], J.el[i], J.ha[i]], 13 + extra, c); }
      g.fillStyle = c; torso(g, b, extra / 2); g.fill();
      g.fillRect(-7 - extra / 2, -180 + b, 14 + extra, 12);
      dot(g, J.head.x, J.head.y, 30 + extra / 2, c);
    });
  }

  function skin(g, J, b, o) {
    var i, breath = o.breath || 0, hy = J.head.y;
    for (i = 0; i < 2; i++) {
      line(g, [J.hip[i], J.kn[i], J.ft[i]], 15, SKIN);
      oval(g, J.ft[i].x + (i ? 3 : -3), J.ft[i].y + 2, 12, 7, 0, SHOE, INK.line, 2);
    }
    g.fillStyle = SHORTS; BQ.draw.round(g, -31, -102 + b, 62, 34, 9); g.fill();
    for (i = 0; i < 2; i++) {
      line(g, [J.sh[i], J.el[i], J.ha[i]], 12, SKIN);
      line(g, [J.sh[i], { x: J.sh[i].x + (J.el[i].x - J.sh[i].x) * 0.45, y: J.sh[i].y + (J.el[i].y - J.sh[i].y) * 0.45 }], 15, SHIRT);
    }
    g.fillStyle = SKIN; g.fillRect(-6, -180 + b, 12, 12);
    g.fillStyle = SHIRT; torso(g, b, breath * 1.6); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 2; torso(g, b, breath * 1.6); g.stroke();
    // head
    dot(g, -29, hy + 2, 6, SKIN); dot(g, 29, hy + 2, 6, SKIN);
    dot(g, 0, hy, 30, SKIN);
    g.fillStyle = HAIR; g.beginPath(); g.arc(0, hy - 3, 31, Math.PI * 1.03, Math.PI * 1.97); g.quadraticCurveTo(0, hy - 22, -31, hy - 6); g.fill();
    dot(g, -18, hy + 10, 5, 'rgba(240,120,120,.35)'); dot(g, 18, hy + 10, 5, 'rgba(240,120,120,.35)');
    face(g, hy, o.face || 'smile', o.t || 0);
  }
  function face(g, hy, mood, t) {
    g.strokeStyle = INK.line; g.lineWidth = 2.5; g.lineCap = 'round';
    if (mood === 'laugh') {
      [-10, 10].forEach(function (x) { g.beginPath(); g.arc(x, hy + 1, 4, Math.PI, 0); g.stroke(); });
      g.fillStyle = '#7a3b3b'; g.beginPath(); g.arc(0, hy + 11, 8, 0, Math.PI); g.closePath(); g.fill();
    } else if (mood === 'puff') {
      dot(g, -10, hy, 3, INK.line); dot(g, 10, hy, 3, INK.line);
      oval(g, 0, hy + 13, 4, 3 + 2 * Math.abs(Math.sin(t * 5)), 0, '#7a3b3b');
    } else if (mood === 'wobbly') {
      dot(g, -10, hy, 4, '#fff'); dot(g, 10, hy, 4, '#fff'); dot(g, -10, hy, 2, INK.line); dot(g, 10, hy, 2, INK.line);
      g.beginPath(); g.moveTo(-9, hy + 13); g.quadraticCurveTo(-4, hy + 9, 0, hy + 13); g.quadraticCurveTo(4, hy + 17, 9, hy + 13); g.stroke();
    } else {
      dot(g, -10, hy, 3, INK.line); dot(g, 10, hy, 3, INK.line);
      g.beginPath(); g.arc(0, hy + 7, 8, 0.25, Math.PI - 0.25); g.stroke();
    }
  }

  function organs(g, J, b, o) {
    var show = o.show || {}, i, k, beat = o.beat || 0, breath = o.breath || 0, hy = J.head.y;
    var P = paths(J);
    if (show.vessels !== false) {                        // blood out to the ends and back again
      var routes = [P.hand[0], P.hand[1], P.foot[0], P.foot[1]].map(function (r) { return [J.heart].concat(r.slice(1)); });
      routes.push([J.heart, J.neck, { x: 0, y: hy - 4 }]);
      routes.forEach(function (r) { line(g, r, 2.5, 'rgba(216,57,74,.45)'); });
      routes.forEach(function (r, n) {
        for (k = 0; k < 3; k++) {
          var u = ((o.flow || 0) + k / 3 + n * 0.13) % 1, out = u < 0.5, p = along(r, out ? u * 2 : (1 - u) * 2);
          dot(g, p.x + (out ? 0 : 3), p.y, 2.4, out ? BLOOD : BLOOD_BACK);
        }
      });
    }
    if (show.nerves) {                                   // drawn as a diagram: real nerves are far finer
      [P.hand[0], P.hand[1], P.foot[0], P.foot[1]].forEach(function (r) { line(g, r, 2.5, NERVE); });
    }
    if (show.brain !== false) {
      oval(g, 0, hy - 6, 23, 17, 0, '#f4aebb', '#d98a98', 2);
      g.strokeStyle = '#d98a98'; g.lineWidth = 1.6; g.lineCap = 'round';
      for (i = -1; i <= 1; i++) {
        g.beginPath(); g.moveTo(i * 13 - 5, hy - 12); g.quadraticCurveTo(i * 13, hy - 18, i * 13 + 5, hy - 11);
        g.moveTo(i * 13 - 5, hy - 1); g.quadraticCurveTo(i * 13, hy - 7, i * 13 + 5, hy); g.stroke();
      }
      g.fillStyle = '#f4aebb'; g.fillRect(-4, hy + 9, 8, 9);
    }
    if (show.lungs !== false) {
      line(g, [{ x: 0, y: -176 + b }, { x: 0, y: -156 + b }], 4, '#e6a3ad');
      line(g, [{ x: -8, y: -150 + b }, { x: 0, y: -156 + b }, { x: 8, y: -150 + b }], 3, '#e6a3ad');
      var gx = 1 + 0.14 * breath, gy = 1 + 0.08 * breath;
      oval(g, -15, -138 + b, 12 * gx, 21 * gy, 0.08, '#f7c1c8', '#d98a98', 2);
      oval(g, 16, -140 + b, 10.5 * gx, 18 * gy, -0.08, '#f7c1c8', '#d98a98', 2);   // her left lung is the smaller one
    }
    if (show.gut !== false) {
      oval(g, 9, -111 + b, 11, 7, -0.5, '#f3c592', '#c9965f', 2);                  // stomach, on her left
      g.strokeStyle = '#e8a98f'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath();
      g.moveTo(-16, -99 + b);
      for (k = 0; k < 4; k++) g.quadraticCurveTo(-12 + k * 8, -106 + b + (k % 2) * 12, -8 + k * 8, -99 + b + ((k + 1) % 2) * 1);
      g.stroke();
    }
    if (show.heart !== false) {                          // about the size of her fist, a little to her left
      var r = 9.5 * (1 + 0.22 * beat);
      g.save(); g.translate(J.heart.x, J.heart.y); g.rotate(0.45);
      line(g, [{ x: -3, y: -r * 0.6 }, { x: -4, y: -r * 1.35 }], 4, BLOOD);
      line(g, [{ x: 3, y: -r * 0.6 }, { x: 5, y: -r * 1.3 }], 3.5, BLOOD_BACK);
      g.beginPath(); g.moveTo(0, r * 1.15);
      g.bezierCurveTo(-r * 1.25, r * 0.2, -r * 1.0, -r * 0.9, 0, -r * 0.7);
      g.bezierCurveTo(r * 1.0, -r * 0.9, r * 1.25, r * 0.2, 0, r * 1.15);
      g.fillStyle = BLOOD; g.fill(); g.strokeStyle = BLOOD_BACK; g.lineWidth = 1.6; g.stroke();
      g.restore();
    }
  }

  function bone(g, a, c, w) {
    line(g, [a, c], w + 3, BONE_EDGE); line(g, [a, c], w, BONE);
    [a, c].forEach(function (p) { dot(g, p.x, p.y, w * 0.72 + 1.5, BONE_EDGE); dot(g, p.x, p.y, w * 0.72, BONE); });
  }
  function bones(g, J, b) {
    var i, k, hy = J.head.y;
    for (i = 0; i < 2; i++) {
      bone(g, J.hip[i], J.kn[i], 6); bone(g, J.kn[i], J.ft[i], 5);
      oval(g, J.ft[i].x + (i ? 4 : -4), J.ft[i].y + 2, 8, 4, 0, BONE, BONE_EDGE, 1.5);
    }
    for (i = 0; i < 2; i++) oval(g, (i ? 1 : -1) * 11, -90 + b, 13, 9, (i ? -1 : 1) * 0.5, BONE, BONE_EDGE, 1.5);   // hips
    for (k = 0; k < 10; k++) {                            // backbone
      g.fillStyle = BONE; g.strokeStyle = BONE_EDGE; g.lineWidth = 1.2;
      BQ.draw.round(g, -4.5, -172 + b + k * 8.4, 9, 6, 2); g.fill(); g.stroke();
    }
    for (k = 0; k < 5; k++) {                             // ribs
      [-1, 1].forEach(function (s) {
        var y = -160 + b + k * 9, far = 25 - k * 1.2;
        [[BONE_EDGE, 5.5], [BONE, 3]].forEach(function (pass) {
          g.strokeStyle = pass[0]; g.lineWidth = pass[1]; g.lineCap = 'round';
          g.beginPath(); g.moveTo(s * 4, y); g.quadraticCurveTo(s * (far + 3), y - 3, s * far, y + 9); g.quadraticCurveTo(s * (far - 6), y + 13, s * 6, y + 10); g.stroke();
        });
      });
    }
    bone(g, { x: -5, y: -168 + b }, J.sh[0], 3.5); bone(g, { x: 5, y: -168 + b }, J.sh[1], 3.5);   // collarbones
    for (i = 0; i < 2; i++) {
      bone(g, J.sh[i], J.el[i], 5); bone(g, J.el[i], J.ha[i], 4);
      oval(g, J.ha[i].x, J.ha[i].y + 3, 5, 6, 0, BONE, BONE_EDGE, 1.5);
    }
    // skull: round and friendly, with a smile
    g.fillStyle = BONE; g.strokeStyle = BONE_EDGE; g.lineWidth = 2;
    BQ.draw.round(g, -14, hy + 8, 28, 20, 8); g.fill(); g.stroke();
    oval(g, 0, hy - 3, 26, 24, 0, BONE, BONE_EDGE, 2);
    g.fillStyle = BONE; g.fillRect(-12, hy + 8, 24, 10);
    dot(g, -10, hy - 2, 6.5, '#6b6558'); dot(g, 10, hy - 2, 6.5, '#6b6558');
    g.fillStyle = '#6b6558'; g.beginPath(); g.moveTo(0, hy + 5); g.lineTo(-3, hy + 11); g.lineTo(3, hy + 11); g.closePath(); g.fill();
    g.strokeStyle = '#6b6558'; g.lineWidth = 1.6;
    g.beginPath(); g.arc(0, hy + 13, 10, 0.3, Math.PI - 0.3); g.stroke();
    for (k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(k * 3.5, hy + 20); g.lineTo(k * 3.5, hy + 23.5); g.stroke(); }
  }

  /* draw(g, pose, o): o.skin / o.organs / o.bones are 0..1 (how visible each layer is);
   * o.beat, o.breath, o.flow animate the insides; o.face, o.t the outside;
   * o.show switches parts of the organ layer; o.plain leaves out the pale body shape. */
  function draw(g, q, o) {
    var J = joints(q), b = q.bob, inside = Math.max(o.organs || 0, o.bones || 0);
    if (inside > 0.01 && (o.skin || 0) < 0.99 && !o.plain) { g.globalAlpha = inside; silhouette(g, J, b); }
    if ((o.bones || 0) > 0.01) { g.globalAlpha = o.bones; bones(g, J, b); }
    if ((o.organs || 0) > 0.01 && (o.skin || 0) < 0.99) { g.globalAlpha = o.organs; organs(g, J, b, o); }
    if ((o.skin || 0) > 0.01) { g.globalAlpha = o.skin; skin(g, J, b, o); }
    g.globalAlpha = 1;
    return J;
  }

  BQ.body = { stand: stand, run: run, joints: joints, paths: paths, along: along, draw: draw,
              colours: { blood: BLOOD, nerve: NERVE } };
})(window);
