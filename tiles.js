'use strict';

// Tile face artwork. Every face is a flat SVG icon in a 60x80 box. Each of the
// 34 regular tiles is a distinct picture (no counting pips or reading numbers),
// drawn with bold outlines and solid colors so they read at a glance.

const Tiles = (() => {
  const OL = 'stroke="#2b2b2b" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"';

  const STEEL = '#b0bec5';
  const STEEL_DARK = '#78909c';
  const WOOD = '#8d6e63';
  const WOOD_DARK = '#5d4037';
  const GOLD = '#fbc02d';
  const GOLD_DARK = '#f57f17';

  const rect = (x, y, w, h, fill, extra = '') =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${OL} ${extra}/>`;
  const circle = (cx, cy, r, fill, extra = '') =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${OL} ${extra}/>`;
  const poly = (points, fill) => `<polygon points="${points}" fill="${fill}" ${OL}/>`;
  const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${OL} ${extra}/>`;
  const line = (x1, y1, x2, y2, color, width) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;

  function starPoints(cx, cy, outer, inner, points) {
    const pts = [];
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 ? inner : outer;
      const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  // ---- The 34 regular faces (four of each in a game) ----

  const ICONS = {
    sword: ['Sword', () =>
      poly('30,8 35,15 35,50 25,50 25,15', '#e0e6ea') +
      rect(16, 49, 28, 6, GOLD, 'rx="2"') +
      rect(27, 55, 6, 12, WOOD_DARK) +
      circle(30, 70, 3.5, GOLD)],

    axe: ['Battle Axe', () =>
      rect(28, 12, 4, 58, WOOD, 'rx="2"') +
      path('M32 18 C46 14 52 28 49 42 C44 36 38 34 32 34 Z', STEEL) +
      path('M28 18 C14 14 8 28 11 42 C16 36 22 34 28 34 Z', STEEL)],

    bow: ['Bow', () =>
      path('M22 10 Q50 40 22 70', 'none', 'stroke-width="5" stroke="#6d4c41"') +
      line(22, 10, 22, 70, '#555', 1.2) +
      line(10, 40, 46, 40, '#3e2723', 2.5) +
      poly('53,40 45,35 45,45', STEEL_DARK) +
      poly('10,40 6,35 14,35 16,40 14,45 6,45', '#e53935')],

    trident: ['Trident', () =>
      rect(28.5, 28, 3, 44, WOOD, 'rx="1.5"') +
      path('M17 14 L17 26 Q30 36 43 26 L43 14', 'none', 'stroke-width="4" stroke="#0277bd"') +
      line(30, 10, 30, 32, '#0277bd', 4) +
      poly('17,6 13,15 21,15', '#4fc3f7') +
      poly('30,2 26,11 34,11', '#4fc3f7') +
      poly('43,6 39,15 47,15', '#4fc3f7')],

    hammer: ['War Hammer', () =>
      rect(28, 28, 4, 44, WOOD, 'rx="2"') +
      rect(12, 14, 36, 16, STEEL_DARK, 'rx="3"') +
      rect(10, 17, 4, 10, STEEL) + rect(46, 17, 4, 10, STEEL)],

    mace: ['Mace', () => {
      let spikes = '';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        spikes += line(30 + Math.cos(a) * 10, 28 + Math.sin(a) * 10, 30 + Math.cos(a) * 17, 28 + Math.sin(a) * 17, '#424242', 4);
      }
      return rect(28, 38, 4, 34, WOOD, 'rx="2"') + spikes + circle(30, 28, 11, '#757575');
    }],

    helmet: ['Helmet', () =>
      path('M30 21 C32 10 42 6 50 9 C44 12 38 16 36 23 Z', '#c62828') +
      path('M13 54 L13 36 C13 16 47 16 47 36 L47 54 Z', STEEL) +
      rect(17, 35, 26, 5, '#263238') +
      rect(28, 35, 4, 19, STEEL_DARK)],

    crown: ['Crown', () =>
      poly('11,56 11,26 21,40 30,20 39,40 49,26 49,56', GOLD) +
      rect(11, 49, 38, 8, GOLD_DARK) +
      circle(20, 53, 2.6, '#e53935') + circle(30, 53, 2.6, '#1e88e5') + circle(40, 53, 2.6, '#43a047')],

    key: ['Key', () =>
      circle(30, 21, 9, 'none', 'stroke-width="5" stroke="#f9a825"') +
      rect(28, 30, 5, 38, GOLD) +
      rect(33, 56, 9, 4, GOLD) + rect(33, 63, 6, 4, GOLD)],

    potion: ['Potion', () =>
      rect(25, 14, 10, 18, '#e3f2fd') +
      circle(30, 48, 16, '#e53935') +
      path('M16 46 Q30 40 44 46', 'none', 'stroke="#ffcdd2" stroke-width="2"') +
      rect(23, 8, 14, 7, WOOD, 'rx="2"') +
      '<ellipse cx="23" cy="44" rx="3" ry="5" fill="#fff" opacity="0.7"/>'],

    book: ['Spellbook', () =>
      poly('30,27 8,20 8,62 30,69 52,62 52,20', '#6a1b9a') +
      poly('30,25 12,18 12,58 30,64', '#fff8e1') +
      poly('30,25 48,18 48,58 30,64', '#fff8e1') +
      line(16, 28, 26, 31, '#9e9e9e', 1.5) + line(16, 35, 26, 38, '#9e9e9e', 1.5) + line(16, 42, 26, 45, '#9e9e9e', 1.5) +
      line(34, 31, 44, 28, '#9e9e9e', 1.5) + line(34, 38, 44, 35, '#9e9e9e', 1.5) + line(34, 45, 44, 42, '#9e9e9e', 1.5)],

    scroll: ['Scroll', () =>
      rect(16, 18, 28, 44, '#ffe0b2') +
      rect(11, 12, 38, 9, '#c8935a', 'rx="4.5"') +
      rect(11, 59, 38, 9, '#c8935a', 'rx="4.5"') +
      line(21, 29, 39, 29, '#8d6e63', 2) + line(21, 36, 39, 36, '#8d6e63', 2) +
      line(21, 43, 39, 43, '#8d6e63', 2) + line(21, 50, 33, 50, '#8d6e63', 2)],

    candle: ['Candle', () =>
      '<ellipse cx="30" cy="68" rx="15" ry="4" fill="#8d6e63" stroke="#2b2b2b" stroke-width="1.6"/>' +
      rect(23, 34, 14, 33, '#fff3e0') +
      line(30, 29, 30, 34, '#333', 1.6) +
      path('M30 10 C37 19 37 27 30 31 C23 27 23 19 30 10 Z', '#ff9800') +
      '<path d="M30 18 C33 22 33 26 30 28 C27 26 27 22 30 18 Z" fill="#ffee58"/>'],

    orb: ['Crystal Ball', () =>
      poly('17,68 43,68 39,56 21,56', WOOD_DARK) +
      circle(30, 37, 18, '#7e57c2') +
      '<circle cx="23" cy="30" r="5" fill="#d1c4e9"/>' +
      '<circle cx="35" cy="44" r="2" fill="#d1c4e9"/>'],

    wand: ['Magic Wand', () =>
      line(14, 70, 38, 28, '#2b2b2b', 7) +
      line(14, 70, 38, 28, WOOD_DARK, 4) +
      poly(starPoints(41, 22, 14, 6, 5), '#fdd835')],

    ring: ['Ring', () =>
      circle(30, 50, 16, 'none', 'stroke="#f9a825" stroke-width="7"') +
      poly('30,12 42,25 30,38 18,25', '#29b6f6')],

    chest: ['Treasure Chest', () =>
      path('M11 36 L11 30 Q30 14 49 30 L49 36 Z', '#a1887f') +
      rect(11, 36, 38, 28, WOOD) +
      rect(17, 22, 4, 42, GOLD) + rect(39, 22, 4, 42, GOLD) +
      rect(26, 33, 8, 10, GOLD, 'rx="1.5"')],

    tower: ['Castle Tower', () =>
      rect(16, 26, 28, 42, '#b0bec5') +
      rect(13, 16, 7, 11, '#b0bec5') + rect(26.5, 16, 7, 11, '#b0bec5') + rect(40, 16, 7, 11, '#b0bec5') +
      rect(13, 24, 34, 5, '#90a4ae') +
      path('M24 68 L24 54 Q30 46 36 54 L36 68 Z', '#4e342e') +
      rect(27, 34, 6, 9, '#263238', 'rx="3"')],

    moon: ['Moon', () =>
      '<mask id="moon-cut"><rect width="60" height="80" fill="#fff"/><circle cx="41" cy="33" r="16" fill="#000"/></mask>' +
      '<g mask="url(#moon-cut)">' + circle(28, 41, 21, '#90caf9', 'stroke-width="2.2"') + '</g>'],

    sun: ['Sun', () => {
      let rays = '';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        rays += line(30 + Math.cos(a) * 16, 40 + Math.sin(a) * 16, 30 + Math.cos(a) * 25, 40 + Math.sin(a) * 25, '#ef6c00', 4.5);
      }
      return rays + circle(30, 40, 12, '#ff9800');
    }],

    star: ['Star', () => poly(starPoints(30, 41, 23, 10, 5), '#ffd54f')],

    tree: ['Tree', () =>
      rect(27, 54, 6, 15, WOOD_DARK) +
      poly('30,30 46,56 14,56', '#2e7d32') +
      poly('30,20 43,42 17,42', '#388e3c') +
      poly('30,10 39,28 21,28', '#43a047')],

    mountain: ['Mountain', () =>
      poly('6,66 24,24 42,66', STEEL_DARK) +
      poly('28,66 42,38 56,66', '#546e7a') +
      poly('24,24 30,38 25,35 21,39 18,38', '#ffffff')],

    flame: ['Fire', () =>
      path('M30 8 C42 24 47 36 45 48 C43 64 17 64 15 48 C14 38 21 32 23 22 C26 30 30 32 30 32 C30 22 29 15 30 8 Z', '#e64a19') +
      '<path d="M30 30 C37 40 38 46 37 52 C35 60 25 60 23 52 C22 46 26 42 30 30 Z" fill="#ffca28"/>'],

    lightning: ['Lightning', () => poly('35,8 15,44 27,44 21,72 45,32 33,32 41,8', '#fdd835')],

    skull: ['Skull', () =>
      rect(21, 43, 18, 15, '#eeeeee', 'rx="3"') +
      circle(30, 34, 16, '#eeeeee') +
      '<rect x="22" y="40" width="16" height="6" fill="#eeeeee"/>' +
      '<circle cx="24" cy="35" r="4.5" fill="#212121"/><circle cx="36" cy="35" r="4.5" fill="#212121"/>' +
      '<polygon points="30,40 27,45 33,45" fill="#212121"/>' +
      line(26, 51, 26, 57, '#616161', 1.5) + line(30, 51, 30, 57, '#616161', 1.5) + line(34, 51, 34, 57, '#616161', 1.5)],

    mushroom: ['Mushroom', () =>
      rect(23, 40, 14, 26, '#fff3e0', 'rx="5"') +
      path('M8 44 C8 14 52 14 52 44 Z', '#e53935') +
      '<circle cx="21" cy="30" r="4" fill="#fff"/><circle cx="36" cy="25" r="3.5" fill="#fff"/>' +
      '<circle cx="42" cy="37" r="3" fill="#fff"/><circle cx="29" cy="39" r="2.5" fill="#fff"/>'],

    feather: ['Feather', () =>
      path('M45 8 C24 16 14 38 17 62 C30 50 44 32 45 8 Z', '#4fc3f7') +
      line(45, 8, 13, 72, '#37474f', 2)],

    heart: ['Heart', () =>
      path('M30 66 C8 50 6 36 10 28 C15 18 27 18 30 28 C33 18 45 18 50 28 C54 36 52 50 30 66 Z', '#d81b60')],

    eye: ['Eye', () =>
      path('M6 40 Q30 14 54 40 Q30 66 6 40 Z', '#ffffff') +
      circle(30, 40, 10, '#43a047') +
      '<circle cx="30" cy="40" r="4.5" fill="#111"/><circle cx="33" cy="37" r="1.8" fill="#fff"/>'],

    hourglass: ['Hourglass', () =>
      poly('18,15 42,15 32,40 42,65 18,65 28,40', '#e3f2fd') +
      '<polygon points="22,19 38,19 30,32" fill="#ffb300"/>' +
      '<polygon points="20,63 40,63 30,51" fill="#ffb300"/>' +
      rect(13, 10, 34, 6, WOOD_DARK, 'rx="2"') + rect(13, 64, 34, 6, WOOD_DARK, 'rx="2"')],

    d20: ['Twenty-Sided Die', () =>
      poly('30,18 49,29 49,51 30,62 11,51 11,29', '#5e35b1') +
      poly('30,25 44,49 16,49', '#7e57c2') +
      line(30, 18, 30, 25, '#2b2b2b', 1.5) + line(49, 51, 44, 49, '#2b2b2b', 1.5) + line(11, 51, 16, 49, '#2b2b2b', 1.5) +
      `<text x="30" y="45" font-size="11" font-weight="bold" font-family="Arial, sans-serif" fill="#fff" text-anchor="middle">20</text>`],

    web: ['Spider Web', () => {
      let web = '';
      const R = 24, rings = [8, 15, 22];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        web += line(30, 40, 30 + Math.cos(a) * R, 40 + Math.sin(a) * R, '#546e7a', 1.6);
      }
      for (const r of rings) {
        const pts = [];
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          pts.push(`${(30 + Math.cos(a) * r).toFixed(1)},${(40 + Math.sin(a) * r).toFixed(1)}`);
        }
        web += `<polygon points="${pts.join(' ')}" fill="none" stroke="#546e7a" stroke-width="1.6"/>`;
      }
      return web + '<circle cx="38" cy="30" r="4" fill="#212121"/>' + line(38, 26, 38, 18, '#212121', 1);
    }],

    cauldron: ['Cauldron', () =>
      '<circle cx="24" cy="25" r="4" fill="#66bb6a"/><circle cx="35" cy="20" r="5" fill="#66bb6a"/>' +
      '<circle cx="29" cy="11" r="3" fill="#66bb6a"/>' +
      rect(16, 62, 4, 7, '#424242') + rect(40, 62, 4, 7, '#424242') +
      path('M11 34 L49 34 C51 56 43 65 30 65 C17 65 9 56 11 34 Z', '#424242') +
      rect(9, 30, 42, 7, '#616161', 'rx="3.5"') +
      '<rect x="12" y="31.5" width="36" height="3" rx="1.5" fill="#66bb6a"/>'],
  };

  // ---- Bonus families: any Gem matches any Gem, any Shield matches any Shield ----

  const GEM_COLORS = [['#e53935', '#ffcdd2'], ['#43a047', '#c8e6c9'], ['#1e88e5', '#bbdefb'], ['#8e24aa', '#e1bee7']];

  function gem(n) {
    const [base, light] = GEM_COLORS[n - 1];
    return poly('11,30 20,14 40,14 49,30 30,68', base) +
      `<polygon points="20,14 40,14 36,30 24,30" fill="${light}"/>` +
      `<polygon points="11,30 24,30 30,68" fill="${light}" opacity="0.5"/>` +
      line(11, 30, 49, 30, '#2b2b2b', 1.2);
  }

  const SHIELD_PATH = 'M12 16 L48 16 L48 38 C48 54 38 62 30 68 C22 62 12 54 12 38 Z';

  function shield(n) {
    const clip = `<clipPath id="sh${n}"><path d="${SHIELD_PATH}"/></clipPath>`;
    let pattern = '';
    if (n === 1) { // split down the middle
      pattern = '<rect x="12" y="16" width="18" height="52" fill="#1e88e5"/><rect x="30" y="16" width="18" height="52" fill="#fbc02d"/>';
    } else if (n === 2) { // chevron
      pattern = '<rect x="12" y="16" width="36" height="52" fill="#c62828"/><polygon points="12,52 30,30 48,52 48,62 30,40 12,62" fill="#fff"/>';
    } else if (n === 3) { // cross
      pattern = '<rect x="12" y="16" width="36" height="52" fill="#fff"/><rect x="26" y="16" width="8" height="52" fill="#2e7d32"/><rect x="12" y="32" width="36" height="8" fill="#2e7d32"/>';
    } else { // quartered
      pattern = '<rect x="12" y="16" width="18" height="20" fill="#6a1b9a"/><rect x="30" y="16" width="18" height="20" fill="#fbc02d"/>' +
        '<rect x="12" y="36" width="18" height="32" fill="#fbc02d"/><rect x="30" y="36" width="18" height="32" fill="#6a1b9a"/>';
    }
    return `<defs>${clip}</defs><g clip-path="url(#sh${n})">${pattern}</g>` + path(SHIELD_PATH, 'none', 'stroke-width="2.2"');
  }

  // ---- Public API ----

  // Face ids: an icon name for regular tiles, gem1-4 and shield1-4 for bonus tiles.
  const QUAD_FACES = Object.keys(ICONS); // 34 kinds x 4 = 136 tiles
  const GEMS = ['gem1', 'gem2', 'gem3', 'gem4'];
  const SHIELDS = ['shield1', 'shield2', 'shield3', 'shield4'];

  function matchKey(id) {
    if (id.startsWith('gem')) return 'gem';
    if (id.startsWith('shield')) return 'shield';
    return id;
  }

  function label(id) {
    if (id.startsWith('gem')) return 'Gem (matches any Gem)';
    if (id.startsWith('shield')) return 'Shield (matches any Shield)';
    return ICONS[id][0];
  }

  // Gems and Shields match anything in their family, so they get a gold frame
  // and a caption to make that obvious on the board.
  function isWild(id) {
    return id.startsWith('gem') || id.startsWith('shield');
  }

  function wildFrame(caption) {
    return '<rect x="3" y="3" width="54" height="74" rx="5" fill="none" stroke="#c9a227" stroke-width="2.5"/>' +
      `<text x="30" y="72" font-size="7.5" font-weight="bold" font-family="Arial, sans-serif" ` +
      `fill="#8a6d12" text-anchor="middle">${caption}</text>`;
  }

  function svg(id) {
    const open = `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`;
    if (isWild(id)) {
      const isGem = id.startsWith('gem');
      const body = isGem ? gem(+id.slice(3)) : shield(+id.slice(6));
      return open + wildFrame(isGem ? 'ANY GEM' : 'ANY SHIELD') +
        `<g transform="translate(30 35) scale(0.8) translate(-30 -40)">${body}</g></svg>`;
    }
    // Icons are drawn with some breathing room; nudge them up a little to fill the tile.
    return open + `<g transform="translate(30 40) scale(1.1) translate(-30 -40)">${ICONS[id][1]()}</g></svg>`;
  }

  return { QUAD_FACES, GEMS, SHIELDS, matchKey, isWild, label, svg };
})();
