'use strict';

// Tile face artwork. Every face is a flat SVG in a 60x80 box, kept deliberately
// simple: solid shapes, high contrast, and a distinct color per family.

const Tiles = (() => {
  const BLUE = '#1d4fa3';
  const GREEN = '#1c7a3a';
  const RED = '#c62828';
  const INK = '#1a1a1a';

  // ---- Dots (circles) ----

  const DOT_LAYOUTS = {
    1: [[30, 40, 17]],
    2: [[30, 22], [30, 58]],
    3: [[15, 17], [30, 40], [45, 63]],
    4: [[17, 22], [43, 22], [17, 58], [43, 58]],
    5: [[16, 18], [44, 18], [30, 40], [16, 62], [44, 62]],
    6: [[18, 16], [42, 16], [18, 40], [42, 40], [18, 64], [42, 64]],
    7: [[13, 12], [30, 21], [47, 30], [18, 50], [42, 50], [18, 67], [42, 67]],
    8: [[18, 12], [42, 12], [18, 31], [42, 31], [18, 49], [42, 49], [18, 68], [42, 68]],
    9: [[15, 17], [30, 17], [45, 17], [15, 40], [30, 40], [45, 40], [15, 63], [30, 63], [45, 63]],
  };

  const DOT_COLORS = {
    1: [RED],
    2: [GREEN, BLUE],
    3: [BLUE, RED, GREEN],
    4: [BLUE, GREEN, GREEN, BLUE],
    5: [BLUE, GREEN, RED, GREEN, BLUE],
    6: [GREEN, GREEN, RED, RED, RED, RED],
    7: [GREEN, GREEN, GREEN, RED, RED, RED, RED],
    8: Array(8).fill(BLUE),
    9: [BLUE, BLUE, BLUE, RED, RED, RED, GREEN, GREEN, GREEN],
  };

  function dots(n) {
    const r = n <= 2 ? 10 : n <= 6 ? 8.5 : 7.5;
    return DOT_LAYOUTS[n].map(([x, y, rr], i) => {
      const rad = rr || r;
      const c = DOT_COLORS[n][i];
      return `<circle cx="${x}" cy="${y}" r="${rad}" fill="${c}"/>` +
        `<circle cx="${x}" cy="${y}" r="${rad * 0.45}" fill="#fdfaf0"/>`;
    }).join('');
  }

  // ---- Bamboo (sticks) ----

  function stick(cx, cy, h, color, w = 7) {
    const y = cy - h / 2;
    return `<rect x="${cx - w / 2}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="${color}"/>` +
      `<rect x="${cx - w / 2 - 1}" y="${cy - 1}" width="${w + 2}" height="2" fill="${color}"/>`;
  }

  function grid(cols, rows, top, bottom, h, colorAt) {
    const out = [];
    const xs = cols.length;
    for (let r = 0; r < rows; r++) {
      const cy = rows === 1 ? (top + bottom) / 2 : top + (r * (bottom - top)) / (rows - 1);
      for (let c = 0; c < xs; c++) out.push(stick(cols[c], cy, h, colorAt(r, c)));
    }
    return out.join('');
  }

  function bamboo(n) {
    const g = () => GREEN;
    switch (n) {
      case 1: return stick(30, 40, 54, GREEN, 14) + `<circle cx="30" cy="12" r="5" fill="${RED}"/>`;
      case 2: return stick(30, 22, 26, GREEN) + stick(30, 58, 26, BLUE);
      case 3: return stick(30, 22, 26, GREEN) + stick(19, 58, 26, GREEN) + stick(41, 58, 26, GREEN);
      case 4: return grid([19, 41], 2, 22, 58, 26, (r, c) => (r === c ? GREEN : BLUE));
      case 5: return grid([15, 45], 2, 22, 58, 26, g) + stick(30, 40, 26, RED);
      case 6: return grid([14, 30, 46], 2, 22, 58, 26, g);
      case 7: return stick(30, 13, 18, RED) + grid([14, 30, 46], 2, 38, 64, 20, g);
      case 8: return grid([11, 23, 37, 49], 2, 22, 58, 26, g);
      case 9: return grid([14, 30, 46], 3, 15, 65, 19, (r, c) => (c === 1 ? RED : GREEN));
    }
    return '';
  }

  // ---- Characters, winds, dragons ----

  function text(str, x, y, size, color, weight = 'bold', family = 'Georgia, serif') {
    return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" ` +
      `font-family="${family}" fill="${color}" text-anchor="middle">${str}</text>`;
  }

  const CJK = '"Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", "SimHei", sans-serif';

  function character(n) {
    return text(n, 30, 38, 34, BLUE) + text('萬', 30, 70, 26, RED, 'bold', CJK);
  }

  const WIND_CHARS = { E: '東', S: '南', W: '西', N: '北' };

  function wind(letter) {
    return text(letter, 30, 50, 44, INK, 'bold', 'Arial, Helvetica, sans-serif') +
      text(WIND_CHARS[letter], 30, 72, 14, '#666', 'normal', CJK);
  }

  function dragon(kind) {
    if (kind === 'r') return text('中', 30, 55, 42, RED, 'bold', CJK);
    if (kind === 'g') return text('發', 30, 55, 42, GREEN, 'bold', CJK);
    return `<rect x="12" y="14" width="36" height="52" rx="3" fill="none" stroke="${BLUE}" stroke-width="5"/>` +
      `<rect x="20" y="22" width="20" height="36" rx="2" fill="none" stroke="${BLUE}" stroke-width="2"/>`;
  }

  // ---- Flowers and seasons (bonus tiles; any flower matches any flower) ----

  const FLOWER_COLORS = ['#d81b60', '#8e24aa', '#ef6c00', '#1e88e5'];

  function flower(n) {
    const c = FLOWER_COLORS[n - 1];
    let petals = '';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      petals += `<circle cx="${30 + Math.cos(a) * 11}" cy="${36 + Math.sin(a) * 11}" r="9" fill="${c}"/>`;
    }
    return petals + `<circle cx="30" cy="36" r="6" fill="#fbc02d"/>` +
      `<rect x="29" y="50" width="2.5" height="18" fill="${GREEN}"/>` + corner(n);
  }

  function season(n) {
    let art = '';
    if (n === 1) { // spring: sprout
      art = `<rect x="29" y="38" width="3" height="30" fill="${GREEN}"/>` +
        `<ellipse cx="20" cy="36" rx="11" ry="6" fill="#43a047" transform="rotate(-30 20 36)"/>` +
        `<ellipse cx="40" cy="30" rx="11" ry="6" fill="#43a047" transform="rotate(30 40 30)"/>`;
    } else if (n === 2) { // summer: sun
      let rays = '';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        rays += `<line x1="${30 + Math.cos(a) * 15}" y1="${40 + Math.sin(a) * 15}" ` +
          `x2="${30 + Math.cos(a) * 23}" y2="${40 + Math.sin(a) * 23}" stroke="#f9a825" stroke-width="4" stroke-linecap="round"/>`;
      }
      art = rays + `<circle cx="30" cy="40" r="11" fill="#f9a825"/>`;
    } else if (n === 3) { // autumn: leaf
      art = `<path d="M30 14 C48 24 48 52 30 64 C12 52 12 24 30 14 Z" fill="#e65100"/>` +
        `<path d="M30 20 L30 70" stroke="#6d2c00" stroke-width="2.5"/>`;
    } else { // winter: snowflake
      let arms = '';
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const x = 30 + Math.cos(a) * 22, y = 40 + Math.sin(a) * 22;
        arms += `<line x1="30" y1="40" x2="${x}" y2="${y}" stroke="#0277bd" stroke-width="4" stroke-linecap="round"/>`;
      }
      art = arms + `<circle cx="30" cy="40" r="4" fill="#0277bd"/>`;
    }
    return art + corner(n);
  }

  function corner(n) {
    return text(n, 52, 14, 11, '#555', 'bold', 'Arial, sans-serif');
  }

  // ---- Public API ----

  // All 42 distinct faces. ids: d1-d9, b1-b9, c1-c9, wE wS wW wN, xr xg xw, f1-f4, s1-s4
  const SUITED = [];
  for (const s of ['d', 'b', 'c']) for (let n = 1; n <= 9; n++) SUITED.push(s + n);
  const HONORS = ['wE', 'wS', 'wW', 'wN', 'xr', 'xg', 'xw'];
  const FLOWERS = ['f1', 'f2', 'f3', 'f4'];
  const SEASONS = ['s1', 's2', 's3', 's4'];

  // Faces that appear four times each (34 kinds x 4 = 136 tiles).
  const QUAD_FACES = SUITED.concat(HONORS);

  function matchKey(id) {
    if (id[0] === 'f') return 'flower';
    if (id[0] === 's') return 'season';
    return id;
  }

  function label(id) {
    const n = id.slice(1);
    switch (id[0]) {
      case 'd': return `${n} of Dots`;
      case 'b': return `${n} of Bamboo`;
      case 'c': return `${n} of Characters`;
      case 'w': return { E: 'East', S: 'South', W: 'West', N: 'North' }[n] + ' Wind';
      case 'x': return { r: 'Red', g: 'Green', w: 'White' }[n] + ' Dragon';
      case 'f': return 'Flower';
      case 's': return 'Season';
    }
    return id;
  }

  function svg(id) {
    const kind = id[0];
    const v = id.slice(1);
    let body = '';
    if (kind === 'd') body = dots(+v);
    else if (kind === 'b') body = bamboo(+v);
    else if (kind === 'c') body = character(v);
    else if (kind === 'w') body = wind(v);
    else if (kind === 'x') body = dragon(v);
    else if (kind === 'f') body = flower(+v);
    else if (kind === 's') body = season(+v);
    return `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
  }

  return { QUAD_FACES, FLOWERS, SEASONS, matchKey, label, svg };
})();
