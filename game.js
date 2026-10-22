'use strict';

(() => {
  // ---------- Layout ----------
  // The classic "Turtle": 144 tiles on 5 layers. Coordinates are in half-tile
  // units so tiles can sit offset by half a tile (the end caps and the peak).

  const LAYOUT = (() => {
    const tiles = [];
    const add = (x, y, z) => tiles.push({ x: x * 2, y: y * 2, z });

    const baseRows = [[1, 12], [3, 10], [2, 11], [1, 12], [1, 12], [2, 11], [3, 10], [1, 12]];
    baseRows.forEach(([from, to], y) => { for (let x = from; x <= to; x++) add(x, y, 0); });
    add(0, 3.5, 0);
    add(13, 3.5, 0);
    add(14, 3.5, 0);

    for (let y = 1; y <= 6; y++) for (let x = 4; x <= 9; x++) add(x, y, 1);
    for (let y = 2; y <= 5; y++) for (let x = 5; x <= 8; x++) add(x, y, 2);
    for (let y = 3; y <= 4; y++) for (let x = 6; x <= 7; x++) add(x, y, 3);
    add(6.5, 3.5, 4);

    return tiles;
  })();

  const COUNT = LAYOUT.length; // 144

  // Precompute which tiles sit on top of / beside each tile.
  const ABOVE = [], LEFT = [], RIGHT = [];
  for (let i = 0; i < COUNT; i++) {
    const a = LAYOUT[i];
    ABOVE[i] = []; LEFT[i] = []; RIGHT[i] = [];
    for (let j = 0; j < COUNT; j++) {
      if (i === j) continue;
      const b = LAYOUT[j];
      const overlapY = Math.abs(a.y - b.y) < 2;
      if (b.z === a.z + 1 && Math.abs(a.x - b.x) < 2 && overlapY) ABOVE[i].push(j);
      if (b.z === a.z && overlapY) {
        if (b.x === a.x - 2) LEFT[i].push(j);
        if (b.x === a.x + 2) RIGHT[i].push(j);
      }
    }
  }

  function isFree(i, present) {
    if (!present[i]) return false;
    if (ABOVE[i].some(j => present[j])) return false;
    return !LEFT[i].some(j => present[j]) || !RIGHT[i].some(j => present[j]);
  }

  // ---------- Dealing ----------
  // Deals are seeded by game number, so "Game 1234" is always the same board.
  // Every deal is guaranteed solvable: we simulate clearing the board by removing
  // random free pairs, then assign matching faces to each pair in that order.

  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(arr, rng) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function deal(gameNumber) {
    const rng = mulberry32(gameNumber * 2654435761);

    for (let attempt = 0; attempt < 500; attempt++) {
      const present = new Array(COUNT).fill(true);
      const order = [];
      let left = COUNT;

      while (left > 0) {
        const free = [];
        for (let i = 0; i < COUNT; i++) if (isFree(i, present)) free.push(i);
        if (free.length < 2) break;
        shuffle(free, rng);
        const [a, b] = free;
        present[a] = present[b] = false;
        order.push([a, b]);
        left -= 2;
      }
      if (left > 0) continue;

      const pairs = [];
      for (const face of Tiles.QUAD_FACES) pairs.push([face, face], [face, face]);
      const gems = shuffle(Tiles.GEMS.slice(), rng);
      const shields = shuffle(Tiles.SHIELDS.slice(), rng);
      pairs.push([gems[0], gems[1]], [gems[2], gems[3]]);
      pairs.push([shields[0], shields[1]], [shields[2], shields[3]]);
      shuffle(pairs, rng);

      const faces = new Array(COUNT);
      order.forEach(([a, b], k) => { faces[a] = pairs[k][0]; faces[b] = pairs[k][1]; });
      return { faces, solution: order };
    }
    throw new Error('Could not generate a solvable deal');
  }

  // ---------- State ----------

  const POINTS_MATCH = 10;
  const POINTS_HINT = -20;

  const state = {
    game: 0,
    faces: [],
    solution: [],  // one known winning sequence of pairs (used for testing)
    present: [],
    history: [],   // [{ a, b }] removed pairs, most recent last
    selected: -1,
    score: 0,
    startedAt: 0,
    finishedAt: 0,
    over: false,
  };

  // ---------- Rendering ----------

  const TILE_W = 56, TILE_H = 72, DEPTH = 8;
  const MAX_Z = Math.max(...LAYOUT.map(t => t.z));
  const BOARD_W = 15 * TILE_W + MAX_Z * DEPTH + 20;
  const BOARD_H = 8 * TILE_H + MAX_Z * DEPTH + 20;

  const stage = document.getElementById('stage');
  const board = document.getElementById('board');
  const tileEls = [];

  function buildBoard() {
    board.style.width = BOARD_W + 'px';
    board.style.height = BOARD_H + 'px';
    for (let i = 0; i < COUNT; i++) {
      const t = LAYOUT[i];
      const el = document.createElement('div');
      el.className = 'tile';
      el.dataset.i = i;
      el.style.width = (TILE_W - 1) + 'px';
      el.style.height = (TILE_H - 1) + 'px';
      el.style.left = (t.x / 2 * TILE_W - t.z * DEPTH + MAX_Z * DEPTH) + 'px';
      el.style.top = (t.y / 2 * TILE_H - t.z * DEPTH + MAX_Z * DEPTH) + 'px';
      // Higher layers on top; within a layer, draw left-to-right and top-to-bottom
      // so each tile's edge is tucked under its right/lower neighbour.
      el.style.zIndex = t.z * 1000 + t.x + t.y;
      board.appendChild(el);
      tileEls.push(el);
    }
  }

  function fitBoard() {
    const pad = Math.min(stage.clientWidth, stage.clientHeight) < 500 ? 4 : 12;
    const scale = Math.min(
      (stage.clientWidth - pad * 2) / BOARD_W,
      (stage.clientHeight - pad * 2) / BOARD_H,
    );
    const x = (stage.clientWidth - BOARD_W * scale) / 2;
    const y = (stage.clientHeight - BOARD_H * scale) / 2;
    board.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  }

  function renderTiles() {
    for (let i = 0; i < COUNT; i++) {
      const el = tileEls[i];
      el.innerHTML = Tiles.svg(state.faces[i]);
      el.title = Tiles.label(state.faces[i]);
      el.classList.toggle('removed', !state.present[i]);      el.classList.remove('selected', 'hint', 'blocked');
    }
  }

  const $ = id => document.getElementById(id);

  function tilesLeft() {
    return state.present.filter(Boolean).length;
  }

  function renderStatus() {
    $('st-game').textContent = '#' + state.game;
    $('st-tiles').textContent = tilesLeft();
    $('st-score').textContent = state.score;
    $('btn-undo').disabled = state.history.length === 0;
  }

  function renderTime() {
    if (!state.startedAt) { $('st-time').textContent = '0:00'; return; }
    const end = state.finishedAt || Date.now();
    const s = Math.floor((end - state.startedAt) / 1000);
    $('st-time').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  // ---------- Game flow ----------

  function newGame(number) {
    const dealt = deal(number);
    state.game = number;
    state.faces = dealt.faces;
    state.solution = dealt.solution;
    state.present = new Array(COUNT).fill(true);
    state.history = [];
    state.selected = -1;
    state.score = 0;
    state.startedAt = 0;
    state.finishedAt = 0;
    state.over = false;
    history.replaceState(null, '', '#' + number);
    renderTiles();
    renderStatus();
    renderTime();
  }

  function randomGameNumber() {
    return 1 + Math.floor(Math.random() * 99999);
  }

  function select(i) {
    if (state.selected >= 0) tileEls[state.selected].classList.remove('selected');
    state.selected = i;
    if (i >= 0) tileEls[i].classList.add('selected');
  }

  function flashBlocked(i) {
    const el = tileEls[i];
    el.classList.remove('blocked');
    void el.offsetWidth; // restart the animation
    el.classList.add('blocked');
  }

  function clearHints() {
    tileEls.forEach(el => el.classList.remove('hint'));
  }

  function onTileClick(i) {
    if (state.over || !state.present[i]) return;
    clearHints();

    if (!isFree(i, state.present)) { flashBlocked(i); Sound.play('blocked'); return; }
    if (!state.startedAt) state.startedAt = Date.now();

    const sel = state.selected;
    if (sel === i) { select(-1); Sound.play('deselect'); return; }
    if (sel >= 0 && Tiles.matchKey(state.faces[sel]) === Tiles.matchKey(state.faces[i])) {
      removePair(sel, i);
      return;
    }
    select(i);
    Sound.play('select');
  }

  function removePair(a, b) {
    select(-1);
    state.present[a] = state.present[b] = false;
    tileEls[a].classList.add('removed');
    tileEls[b].classList.add('removed');
    state.history.push({ a, b });
    state.score += POINTS_MATCH;
    renderStatus();
    Sound.play('match');
    checkEnd();
  }

  function undo() {
    const last = state.history.pop();
    if (!last) return;
    clearHints();
    select(-1);
    state.present[last.a] = state.present[last.b] = true;
    tileEls[last.a].classList.remove('removed');
    tileEls[last.b].classList.remove('removed');
    state.score -= POINTS_MATCH;
    state.over = false;
    state.finishedAt = 0;
    renderStatus();
  }

  function availablePairs() {
    const groups = new Map();
    for (let i = 0; i < COUNT; i++) {
      if (!isFree(i, state.present)) continue;
      const key = Tiles.matchKey(state.faces[i]);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(i);
    }
    const pairs = [];
    for (const list of groups.values()) {
      for (let p = 0; p < list.length; p++) {
        for (let q = p + 1; q < list.length; q++) pairs.push([list[p], list[q]]);
      }
    }
    return pairs;
  }

  let hintCursor = 0;

  function hint() {
    if (state.over) return;
    const pairs = availablePairs();
    if (!pairs.length) { checkEnd(); return; }
    clearHints();
    select(-1);
    const [a, b] = pairs[hintCursor++ % pairs.length];
    for (const i of [a, b]) {
      void tileEls[i].offsetWidth;
      tileEls[i].classList.add('hint');
    }
    state.score += POINTS_HINT;
    renderStatus();
    Sound.play('hint');
  }

  function checkEnd() {
    if (tilesLeft() === 0) {
      state.over = true;
      state.finishedAt = Date.now();
      renderTime();
      Sound.play('win');
      showDialog('You win!', `
        <p>You cleared Game #${state.game} in ${$('st-time').textContent}.</p>
        <p>Final score: <b>${state.score}</b></p>`,
        [['New Game', () => newGame(randomGameNumber())], ['Close']]);
      return;
    }
    if (availablePairs().length === 0) {
      state.over = true;
      Sound.play('lose');
      showDialog('No more moves', `
        <p>There are no matching pairs left to remove.</p>
        <p>Every game can be won — try backing up a few moves or starting over.</p>`,
        [['Undo', undo], ['Restart', () => newGame(state.game)], ['New Game', () => newGame(randomGameNumber())]]);
    }
  }

  // ---------- Dialogs ----------

  const backdrop = $('dialog-backdrop');

  function showDialog(title, html, buttons) {
    $('dlg-title').textContent = title;
    $('dlg-body').innerHTML = html;
    const bar = $('dlg-buttons');
    bar.innerHTML = '';
    buttons.forEach(([label, action]) => {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.addEventListener('click', () => {
        if (action && action() === false) return;
        hideDialog();
      });
      bar.appendChild(btn);
    });
    backdrop.hidden = false;
    (backdrop.querySelector('input') || bar.firstChild).focus();
  }

  function hideDialog() {
    backdrop.hidden = true;
  }

  function selectGameDialog() {
    showDialog('Select Game', `
      <p>Enter a game number from 1 to 99999. The same number always deals the same board.</p>
      <input id="game-number" type="number" min="1" max="99999" value="${state.game}">`,
      [['OK', () => {
        const n = parseInt($('game-number').value, 10);
        if (!(n >= 1 && n <= 99999)) { $('game-number').focus(); return false; }
        newGame(n);
      }], ['Cancel']]);
    $('game-number').select();
  }

  function helpDialog() {
    showDialog('How to Play', `
      <p>Clear the board by removing matching pairs of tiles.</p>
      <ul>
        <li>A tile can be removed only if nothing is on top of it <i>and</i> its left or right side is open.</li>
        <li>Click a tile, then click its match. <b>Any Gem matches any Gem</b> (look for the sparkle in the corner), and <b>any Shield matches any Shield</b> (look for the tiny sword).</li>
        <li>Each pair is worth ${POINTS_MATCH} points. A hint costs ${-POINTS_HINT}.</li>
      </ul>
      <p>Keys: <b>H</b> hint, <b>Ctrl+Z</b> undo, <b>N</b> new game, <b>M</b> sound on/off.</p>`,
      [['OK']]);
  }

  // ---------- Wiring ----------

  board.addEventListener('click', e => {
    const el = e.target.closest('.tile');
    if (el) onTileClick(+el.dataset.i);
  });

  $('btn-new').addEventListener('click', () => newGame(randomGameNumber()));
  $('btn-restart').addEventListener('click', () => newGame(state.game));
  $('btn-select').addEventListener('click', selectGameDialog);
  $('btn-undo').addEventListener('click', undo);
  $('btn-hint').addEventListener('click', hint);
  $('btn-help').addEventListener('click', helpDialog);

  document.addEventListener('keydown', e => {
    if (!backdrop.hidden) {
      if (e.key === 'Escape') hideDialog();
      if (e.key === 'Enter') backdrop.querySelector('.dialog-buttons button').click();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === 'h') hint();
    else if (k === 'n') newGame(randomGameNumber());
    else if (k === 'm') toggleMute();
    else if (e.key === 'Escape' && state.selected >= 0) { select(-1); Sound.play('deselect'); }
  });

  const muteBtn = $('btn-mute');

  function renderMute() {
    const muted = Sound.isMuted();
    muteBtn.textContent = muted ? '🔇' : '🔊';
    muteBtn.title = muted ? 'Sound off (M)' : 'Sound on (M)';
    muteBtn.setAttribute('aria-pressed', String(muted));
  }

  function toggleMute() {
    Sound.setMuted(!Sound.isMuted());
    renderMute();
  }

  muteBtn.addEventListener('click', toggleMute);
  renderMute();

  // "Turn your phone sideways" tip, shown on narrow portrait screens until dismissed.
  const TIP_KEY = 'mahjong-rotate-tip-dismissed';
  try { if (localStorage.getItem(TIP_KEY) === '1') document.body.classList.add('tip-dismissed'); } catch (e) { /* storage unavailable */ }
  $('rotate-tip-close').addEventListener('click', () => {
    document.body.classList.add('tip-dismissed');
    try { localStorage.setItem(TIP_KEY, '1'); } catch (e) { /* storage unavailable */ }
  });

  window.addEventListener('resize', fitBoard);
  setInterval(renderTime, 1000);

  buildBoard();
  fitBoard();
  const fromHash = parseInt(location.hash.slice(1), 10);
  newGame(fromHash >= 1 && fromHash <= 99999 ? fromHash : randomGameNumber());

  // Exposed for debugging in the console.
  window.mahjong = { state, availablePairs, isFree, LAYOUT };
})();
