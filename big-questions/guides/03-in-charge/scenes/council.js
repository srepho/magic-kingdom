/* Three already-elected representatives choose a plan together.
 * Native buttons keep every choice reachable by touch and keyboard. */
(function (root) {
  'use strict';
  var BQ = root.BQ, D = BQ.draw;
  var host, board, surf, sim, frame, buttons, voteButton;
  var kinds = ['wombat', 'koala', 'frog'], names = ['Wombat, the leader', 'Koala', 'Frog'];
  var colours = ['#f5a742', '#5aa9dc'];
  var plans = ['hill', 'river'];
  function icon(side) {
    return '<svg viewBox="0 0 60 40" aria-hidden="true"><rect x="2" y="2" width="56" height="36" rx="8" fill="' + colours[side] + '"/>' +
      (side === 0 ? '<path d="M9 32L28 9l23 23z" fill="#fff" stroke="#3b3a36" stroke-width="3"/>' :
        '<path d="M8 15q11-12 22 0t22 0M8 29q11-12 22 0t22 0" fill="none" stroke="#fff" stroke-width="5"/>') + '</svg>';
  }
  function start(stage, api) {
    host = stage; frame = api; sim = BQ.councilSim.create();
    host.innerHTML = '<div class="council-layout"><div class="council-board"></div>' +
      '<div class="council-choices" role="group" aria-label="Choose each representative’s plan"></div>' +
      '<button class="council-count" aria-label="Count the council votes"><svg viewBox="0 0 48 48" aria-hidden="true"><rect x="8" y="19" width="32" height="24" rx="4" fill="#8a7fd1" stroke="#3b3a36" stroke-width="3"/><path d="M16 26h16" stroke="#3b3a36" stroke-width="3"/><rect x="19" y="4" width="12" height="18" rx="2" fill="#fff" stroke="#3b3a36" stroke-width="2"/></svg>Count votes</button></div>';
    board = host.querySelector('.council-board');
    var row = host.querySelector('.council-choices');
    buttons = names.map(function (name, i) {
      var b = document.createElement('button'); b.className = 'council-choice';
      b.onclick = function () { sim.flip(i); paintButtons(); draw(); BQ.sound.click(); frame.caption('A different plan. Count the votes to decide together.'); };
      row.appendChild(b); return b;
    });
    voteButton = host.querySelector('.council-count');
    voteButton.onclick = function () {
      var r = sim.vote(); draw(); BQ.sound.plop();
      frame.caption(r.leaderAgrees ? 'They voted together. The plan with more votes is agreed.' : 'The others chose differently. The <b>leader</b> has just one vote too.');
    };
    paintButtons(); surf = BQ.surface(board, draw); draw();
    frame.caption('These three were elected. Tap their plans, then count their votes.');
  }
  function paintButtons() {
    buttons.forEach(function (b, i) {
      var side = sim.state.choices[i];
      b.innerHTML = icon(side) + '<span>' + (i === 0 ? 'Leader' : names[i]) + '</span>';
      b.setAttribute('aria-label', names[i] + ' chooses the ' + plans[side] + '. Change to ' + plans[1 - side]);
    });
  }
  function draw() {
    if (!surf || !sim) return;
    var g = surf.begin(480, 245, 6), s = sim.state;
    board.setAttribute('role', 'img');
    board.setAttribute('aria-label', s.agreed === null ? 'No plan agreed yet. Each representative has one vote.' :
      'Agreed playground by the ' + plans[s.agreed] + '. Last count: ' + s.tally[0] + ' for the hill, ' + s.tally[1] + ' for the river.');
    D.paper(g, 4, 4, 472, 237); D.glasses(g, 28, 23, 9);
    [80, 240, 400].forEach(function (x, i) {
      // calm until the count; then pleased if their plan was agreed, a little flat if not
      var mood = s.agreed === null ? 'want' : s.choices[i] === s.agreed ? 'happy' : 'meh';
      BQ.cast.critter(g, kinds[i], x, 73, 26, mood, 0);
      g.fillStyle = colours[s.choices[i]]; g.strokeStyle = BQ.ink.line; g.lineWidth = 2;
      D.round(g, x - 24, 114, 48, 34, 6); g.fill(); g.stroke();
      g.strokeStyle = '#fff'; g.lineWidth = 4; g.beginPath();
      if (s.choices[i] === 0) { g.moveTo(x - 16, 140); g.lineTo(x, 121); g.lineTo(x + 16, 140); }
      else { g.moveTo(x - 17, 129); g.quadraticCurveTo(x - 8, 118, x, 129); g.quadraticCurveTo(x + 8, 140, x + 17, 129); }
      g.stroke();
      if (i === 0) { D.star(g, x - 30, 25, 8); g.fillStyle = BQ.ink.line; g.font = '600 13px system-ui'; g.textAlign = 'center'; g.fillText('Leader', x + 6, 30); }
    });
    g.strokeStyle = BQ.ink.line; g.lineWidth = 2; g.beginPath(); g.moveTo(30, 159); g.lineTo(450, 159); g.stroke();
    g.textAlign = 'center'; g.font = '600 17px system-ui'; g.fillStyle = BQ.ink.line;
    if (s.agreed === null) { g.fillText('Which plan will they agree on?', 240, 199); return; }
    var side = s.agreed;
    g.fillStyle = '#d6efd8'; D.round(g, 40, 170, 400, 63, 12); g.fill();
    // The same two landmarks as the ballots, with the playground at the agreed one.
    g.fillStyle = colours[0]; g.beginPath(); g.moveTo(65, 224); g.lineTo(105, 179); g.lineTo(145, 224); g.closePath(); g.fill();
    g.strokeStyle = colours[1]; g.lineWidth = 6;
    [193, 212, 228].forEach(function (y) { g.beginPath(); g.moveTo(345, y); g.quadraticCurveTo(365, y - 12, 385, y); g.quadraticCurveTo(405, y + 12, 425, y); g.stroke(); });
    var px = side === 0 ? 161 : 300;
    g.strokeStyle = BQ.ink.line; g.lineWidth = 4; g.beginPath();
    g.moveTo(px - 13, 225); g.lineTo(px - 13, 189); g.lineTo(px + 2, 189); g.lineTo(px + 24, 225);
    g.moveTo(px - 13, 202); g.lineTo(px + 2, 202); g.stroke();
    g.strokeStyle = '#8a7fd1'; g.lineWidth = 7; g.beginPath(); g.moveTo(px + 2, 189); g.lineTo(px + 24, 225); g.stroke();
    // One token per member in the last decision, kept until the next count.
    s.tally.forEach(function (count, choice) {
      for (var j = 0; j < count; j++) {
        g.fillStyle = colours[choice]; g.strokeStyle = BQ.ink.line; g.lineWidth = 2;
        g.beginPath(); g.arc(216 + (j + (choice ? s.tally[0] : 0)) * 24, 194, 8, 0, Math.PI * 2); g.fill(); g.stroke();
      }
    });
  }
  function reset() { if (!sim) return; sim.reset(); paintButtons(); draw(); frame.caption('Keep the leader’s plan. Can the other two choose something else?'); }
  function cleanup() { if (surf) surf.destroy(); if (host) host.innerHTML = ''; host = board = surf = sim = frame = buttons = voteButton = null; }
  BQ.scenes = BQ.scenes || {};
  BQ.scenes.council = { start: start, reset: reset, cleanup: cleanup, state: function () { return sim && sim.state; } };
})(window);
