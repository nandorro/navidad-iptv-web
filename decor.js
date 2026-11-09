/* Decoración navideña y eventos aleatorios (canvas 2D). Portado de decoracion.py. */
(function () {
  'use strict';
  const TAU = Math.PI * 2, D2R = Math.PI / 180;

  // ------------------------------------------------------------------ utilidades de color
  function rgb(c) { const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function col(c, a) {                       // a = 0..255
    if (a === undefined) return c;
    const [r, g, b] = rgb(c); return `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`;
  }
  function darker(c, p) { const [r, g, b] = rgb(c); const k = 100 / p; return `rgb(${r * k | 0},${g * k | 0},${b * k | 0})`; }
  function lighter(c, p) { const [r, g, b] = rgb(c); const k = p / 100; return `rgb(${Math.min(255, r * k) | 0},${Math.min(255, g * k) | 0},${Math.min(255, b * k) | 0})`; }
  function rng(seed) { let a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // ------------------------------------------------------------------ primitivas
  function ell(c, x, y, rx, ry, fill, stroke, lw, rot) {
    c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), (rot || 0) * D2R, 0, TAU);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1; c.stroke(); }
  }
  function poly(c, pts, fill, stroke, lw) {
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1; c.stroke(); }
  }
  function rect(c, x, y, w, h, fill, stroke, lw) {
    if (fill) { c.fillStyle = fill; c.fillRect(x, y, w, h); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1; c.strokeRect(x, y, w, h); }
  }
  function rrect(c, x, y, w, h, r, fill, stroke, lw) {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1; c.stroke(); }
  }
  function line(c, x1, y1, x2, y2, stroke, lw, cap) {
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.strokeStyle = stroke; c.lineWidth = lw; c.lineCap = cap || 'round'; c.stroke();
  }
  function glow(c, x, y, r, color, a) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col(color, a === undefined ? 120 : a)); g.addColorStop(1, col(color, 0));
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  }
  function star(c, cx, cy, r, fill, points, inner, outline) {
    points = points || 5; inner = inner === undefined ? 0.45 : inner;
    const pts = [];
    for (let i = 0; i < points * 2; i++) {
      const ang = Math.PI * i / points - Math.PI / 2, rr = i % 2 === 0 ? r : r * inner;
      pts.push([cx + rr * Math.cos(ang), cy + rr * Math.sin(ang)]);
    }
    poly(c, pts, fill, outline, 1.2);
  }
  function ball(c, x, y, r, color) {
    const g = c.createRadialGradient(x - r * .35, y - r * .4, 0, x - r * .35, y - r * .4, r * 1.2);
    g.addColorStop(0, lighter(color, 190)); g.addColorStop(.45, color); g.addColorStop(1, darker(color, 170));
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    ell(c, x - r * .38, y - r * .42, r * .2, r * .13, 'rgba(255,255,255,.75)');
  }
  function heart(c, x, y, sz, color, a) {
    c.beginPath(); c.moveTo(x, y + sz * .9);
    c.bezierCurveTo(x + sz * 1.5, y - sz * .1, x + sz * .7, y - sz * 1.2, x, y - sz * .4);
    c.bezierCurveTo(x - sz * .7, y - sz * 1.2, x - sz * 1.5, y - sz * .1, x, y + sz * .9);
    c.fillStyle = col(color, a); c.fill(); c.strokeStyle = col('#a0103a', a); c.lineWidth = 1.2; c.stroke();
    ell(c, x - sz * .5, y - sz * .35, sz * .22, sz * .14, `rgba(255,255,255,${(a / 255 * .7).toFixed(2)})`);
  }
  function bubble(c, x, y, w, h, text, color, size) {
    rrect(c, x, y, w, h, 10, 'rgba(255,255,255,.96)', '#333', 1.5);
    c.fillStyle = color || '#222'; c.font = `bold ${size || 12}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(text, x + w / 2, y + h / 2 + 1);
  }

  // ------------------------------------------------------------------ paletas
  const PAL = {
    grinch: { tree: '#1f8a2a', hi: '#52d65c', lo: '#0b4a12', orn: ['#e8161b', '#b6ff3a', '#ffe14a', '#ffffff'], gifts: [['#e8161b', '#b6ff3a'], ['#2fae3a', '#ffe14a'], ['#b6ff3a', '#e8161b']] },
    belen: { tree: '#1f6a3a', hi: '#3fae6a', lo: '#0b3a20', orn: ['#ffd34d', '#fff3c4', '#ffb347', '#ffffff'], gifts: [['#ffd34d', '#ffffff'], ['#7a4fbf', '#ffd34d'], ['#2f6fd0', '#ffe9a8']] },
    santa: { tree: '#1c8a35', hi: '#4fd068', lo: '#0b4a1a', orn: ['#e11d1d', '#ffd24a', '#ffffff', '#2f7fe0'], gifts: [['#ffffff', '#e11d1d'], ['#e11d1d', '#ffd24a'], ['#2f9f45', '#ffffff']] },
    disney: { tree: '#2a7fb8', hi: '#6fc8f0', lo: '#124a78', orn: ['#ffd84a', '#ffffff', '#ff8fd0', '#a98cff'], gifts: [['#a98cff', '#ffd84a'], ['#ff8fd0', '#ffffff'], ['#4fb0ff', '#ffd84a']] },
    solo: { tree: '#1f7a30', hi: '#4cbc5e', lo: '#0b3f16', orn: ['#ff9f1c', '#e11d1d', '#ffe14a', '#58c46a'], gifts: [['#e11d1d', '#ffe14a'], ['#2f9f45', '#ff9f1c'], ['#ffe14a', '#e11d1d']] },
    gremlins: { tree: '#1f7a3a', hi: '#52c66a', lo: '#0b3f20', orn: ['#e8161b', '#ffe14a', '#7fc45a', '#ffffff'], gifts: [['#e8161b', '#ffe14a'], ['#3a9a4a', '#ffffff'], ['#8a6a45', '#ffe14a']] },
    halloween: { tree: '#2a1a3a', hi: '#4a2a6a', lo: '#120a1e', orn: ['#ff7a1a', '#b36bff', '#7dff4a', '#ffffff'], gifts: [['#ff7a1a', '#2a1a3a'], ['#7a3fd0', '#ff7a1a'], ['#3a8a2a', '#ff7a1a']] },
    spain: { tree: '#2f5a2a', hi: '#5a9a4a', lo: '#1a3a16', orn: ['#c60b1e', '#ffc400', '#c60b1e', '#ffffff'], gifts: [['#c60b1e', '#ffc400'], ['#ffc400', '#c60b1e'], ['#ffffff', '#c60b1e']] },
    futbol: { tree: '#1f8a2a', hi: '#52d65c', lo: '#0b4a12', orn: ['#ffd400', '#ffffff', '#ff4040', '#40a0ff'], gifts: [['#ffd400', '#1f8a2a'], ['#ffffff', '#ff4040'], ['#40a0ff', '#ffd400']] },
    personal: { tree: '#1c8a35', hi: '#4fd068', lo: '#0b4a1a', orn: ['#ff5c5c', '#7dffb0', '#ffe14a', '#6cb6ff'], gifts: [['#ff5c5c', '#ffffff'], ['#6cb6ff', '#ffe14a'], ['#7dffb0', '#ff5c5c']] },
  };

  // ------------------------------------------------------------------ piezas estáticas
  function tree(c, x, base, h, tick, pal, seed) {
    const r = rng(seed || 1), w = h * .72;
    rect(c, x - w * .07, base - h * .13, w * .14, h * .13, '#5a3a1a');
    const tiers = [];
    for (let i = 0; i < 3; i++) {
      const apex = base - h * .95 + i * h * .24, bot = apex + h * .46, hw = w * (.27 + .17 * i);
      const g = c.createLinearGradient(x - hw, apex, x + hw, bot);
      g.addColorStop(0, pal.hi); g.addColorStop(1, pal.tree);
      c.beginPath(); c.moveTo(x, apex); c.lineTo(x + hw, bot);
      const segs = 4, step = 2 * hw / segs;
      for (let k = 0; k < segs; k++) { const x1 = x + hw - step * (k + 1); c.quadraticCurveTo(x1 + step / 2, bot + h * .06, x1, bot); }
      c.closePath(); c.fillStyle = g; c.fill(); c.strokeStyle = pal.lo; c.lineWidth = 1.4; c.stroke();
      tiers.push([apex, bot, hw]);
      for (let k = 0; k < 3; k++) ell(c, x - hw * (.2 + .7 * r()), bot - h * .005, hw * .13, h * .02, 'rgba(255,255,255,.92)');
    }
    c.strokeStyle = '#ffd34d'; c.lineWidth = 2.2; c.lineCap = 'round';
    tiers.forEach(([apex, bot, hw]) => {
      const y = apex + (bot - apex) * .55;
      c.beginPath(); c.moveTo(x - hw * .75, y + h * .04); c.quadraticCurveTo(x, y + h * .16, x + hw * .78, y - h * .02); c.stroke();
    });
    for (let k = 0; k < 10; k++) {
      const [a, b, hw] = tiers[Math.floor(r() * 3)], f = .25 + .6 * r();
      ball(c, x + (r() * 1.5 - .75) * hw * f, a + (b - a) * f, h * .035, pal.orn[k % pal.orn.length]);
    }
    for (let k = 0; k < 9; k++) {
      const [a, b, hw] = tiers[Math.floor(r() * 3)], f = .2 + .7 * r();
      const xx = x + (r() * 1.6 - .8) * hw * f, yy = a + (b - a) * f;
      if ((Math.floor(tick / 10) + k) % 3 !== 0) { glow(c, xx, yy, h * .06, '#fff3a0', 150); ell(c, xx, yy, h * .014, h * .014, '#fffbd0'); }
    }
    const pulse = .85 + .15 * Math.sin(tick / 8), top = base - h * .95;
    glow(c, x, top, h * .2 * pulse, '#ffe27a', 150);
    star(c, x, top - h * .01, h * .1, '#ffd34d', 5, .45, '#c98b00');
  }

  function gift(c, x, base, w, h, color, rib) {
    rrect(c, x - w / 2, base - h, w, h, 3, color, darker(color, 150), 1.2);
    rrect(c, x - w / 2 - 2, base - h * 1.2, w + 4, h * .22, 3, lighter(color, 118), darker(color, 150), 1);
    rect(c, x - w * .09, base - h * 1.2, w * .18, h * 1.2, rib);
    rect(c, x - w / 2, base - h * .55, w, h * .15, rib);
    c.save(); c.translate(x, base - h * 1.2);
    [-1, 1].forEach(sg => { c.save(); c.rotate(sg * 32 * D2R); ell(c, -sg * w * .2, -h * .04, w * .2, h * .1, rib, darker(rib, 140), 1); c.restore(); });
    ell(c, 0, 0, w * .08, w * .08, darker(rib, 115)); c.restore();
  }

  function snowman(c, x, base, r, tick) {
    const c1 = base - r, c2 = c1 - r * .85 - r * .62, c3 = c2 - r * .62 - r * .42, hr = r * .52;
    [[r, c1], [r * .72, c2], [r * .52, c3]].forEach(([rr, cy]) => {
      const g = c.createRadialGradient(x - rr * .3, cy - rr * .35, 0, x - rr * .3, cy - rr * .35, rr * 1.3);
      g.addColorStop(0, '#fff'); g.addColorStop(1, '#cfdcf0');
      c.fillStyle = g; c.beginPath(); c.arc(x, cy, rr, 0, TAU); c.fill(); c.strokeStyle = '#b8c8e0'; c.lineWidth = 1.2; c.stroke();
    });
    const sw = Math.sin(tick / 14) * 4;
    line(c, x - r * .65, c2, x - r * 1.5, c2 - r * .5 + sw, '#6b4423', 2.4);
    line(c, x + r * .65, c2, x + r * 1.5, c2 - r * .6 - sw, '#6b4423', 2.4);
    rrect(c, x - hr * .95, c3 + hr * .7, hr * 1.9, hr * .38, 4, '#e11d1d');
    rrect(c, x + hr * .3, c3 + hr * .8, hr * .38, hr * 1.2 + sw * .4, 3, '#e11d1d');
    rect(c, x - hr * .62, c3 - hr * 1.75, hr * 1.24, hr, '#1b1b24');
    rrect(c, x - hr, c3 - hr * .8, hr * 2, hr * .22, 3, '#1b1b24');
    rect(c, x - hr * .62, c3 - hr, hr * 1.24, hr * .2, '#e11d1d');
    ell(c, x - hr * .35, c3 - hr * .2, hr * .1, hr * .1, '#1b1b24'); ell(c, x + hr * .35, c3 - hr * .2, hr * .1, hr * .1, '#1b1b24');
    for (let k = 0; k < 5; k++) { const a = (30 + k * 30) * D2R; ell(c, x + Math.cos(a) * hr * .5, c3 + hr * .1 + Math.sin(a) * hr * .3, hr * .05, hr * .05, '#1b1b24'); }
    poly(c, [[x, c3 + hr * .02], [x + hr * .95, c3 + hr * .18], [x, c3 + hr * .3]], '#ff7a1a');
    ell(c, x - hr * .62, c3 + hr * .15, hr * .17, hr * .12, 'rgba(255,159,176,.6)'); ell(c, x + hr * .62, c3 + hr * .15, hr * .17, hr * .12, 'rgba(255,159,176,.6)');
    for (let k = 0; k < 3; k++) ell(c, x, c2 - r * .25 + k * r * .28, r * .07, r * .07, '#1b1b24');
  }

  function candyCane(c, x, base, h) {
    const r = h * .15;
    const path = () => { c.beginPath(); c.moveTo(x, base); c.lineTo(x, base - h * .7); c.arc(x + r, base - h * .7, r, Math.PI, 0, false); c.lineTo(x + 2 * r, base - h * .7 + h * .07); };
    path(); c.strokeStyle = '#fff'; c.lineWidth = 9; c.lineCap = 'round'; c.stroke();
    path(); c.strokeStyle = '#e11d1d'; c.lineWidth = 9; c.lineCap = 'butt'; c.setLineDash([6, 11]); c.stroke(); c.setLineDash([]);
  }

  function sheep(c, x, base, s, tick) {
    const bob = Math.sin(tick / 18 + x) * 1.5;
    [-.55, -.2, .25, .6].forEach(dx => line(c, x + dx * s, base - s * .35, x + dx * s, base, '#2b2b2b', 3));
    [[-.6, -.65, .4], [-.15, -.8, .45], [.35, -.72, .42], [.7, -.6, .36], [-.3, -.5, .42], [.2, -.5, .42]].forEach(([dx, dy, rr]) => ell(c, x + dx * s, base + dy * s, rr * s, rr * s, '#fff', '#cfd6e6', 1));
    const hx = x + s, hy = base - .75 * s + bob;
    ell(c, hx, hy, s * .28, s * .22, '#2b2b2b'); ell(c, hx - s * .18, hy - s * .2, s * .1, s * .16, '#2b2b2b'); ell(c, hx + s * .08, hy - s * .05, s * .05, s * .05, '#fff');
  }

  function bell(c, x, y, s, tick, ph) {
    const sw = Math.sin(tick / 16 + ph) * .2;
    c.save(); c.translate(x, y); c.rotate(sw);
    c.beginPath(); c.moveTo(-s * .2, 0); c.bezierCurveTo(-s * .2, s * .6, -s * .55, s * .7, -s * .6, s * 1.05); c.lineTo(s * .6, s * 1.05);
    c.bezierCurveTo(s * .55, s * .7, s * .2, s * .6, s * .2, 0); c.closePath();
    const g = c.createLinearGradient(-s * .6, 0, s * .6, 0); g.addColorStop(0, '#c98b00'); g.addColorStop(.4, '#ffe27a'); g.addColorStop(1, '#b87a00');
    c.fillStyle = g; c.fill(); c.strokeStyle = '#8a5a00'; c.lineWidth = 1; c.stroke();
    ell(c, 0, s * 1.12, s * .14, s * .14, '#8a5a00'); ell(c, -s * .18, -s * .05, s * .2, s * .12, '#e11d1d'); ell(c, s * .18, -s * .05, s * .2, s * .12, '#e11d1d');
    c.restore();
  }

  function garlandY(x) { return 6 + 24 * Math.sin(Math.PI * ((x % 150) / 150)); }

  function garland(c, w, tick, bulbs) {
    c.beginPath(); c.strokeStyle = 'rgba(10,10,10,.86)'; c.lineWidth = 2;
    for (let x = 0; x <= w + 6; x += 6) { const y = garlandY(x); x === 0 ? c.moveTo(x, y) : c.lineTo(x, y); }
    c.stroke();
    let i = 0;
    for (let x = 14; x < w; x += 38, i++) {
      const y = garlandY(x), on = (Math.floor(tick / 12) + i) % 3 !== 0, color = bulbs[i % bulbs.length];
      if (on) glow(c, x, y + 8, 16, color, 130);
      ell(c, x, y + 7, 4.5, 6.5, col(color, on ? 255 : 90));
    }
  }

  function hangers(c, w, tick, pal, key) {
    if (key === 'halloween' || key === 'futbol' || key === 'spain') return hangersSpecial(c, w, tick, key);
    const kinds = ['ball', 'bell', 'ball', 'star', 'ball', 'bell'];
    let i = 0;
    for (let x = 80; x < w; x += 170, i++) {
      const y0 = garlandY(x) + 6, ln = 8 + (i * 7) % 14, k = kinds[i % kinds.length];
      const bx = x + Math.sin(tick / 22 + i) * 4;
      line(c, x, y0, bx, y0 + ln, 'rgba(216,216,216,.8)', 1.2);
      if (k === 'ball') { rect(c, bx - 3, y0 + ln - 2, 6, 5, '#ffd34d'); ball(c, bx, y0 + ln + 11, 11, pal.orn[i % pal.orn.length]); }
      else if (k === 'bell') bell(c, bx, y0 + ln, 12, tick, i);
      else { glow(c, bx, y0 + ln + 8, 18, '#fff1a0', 120); star(c, bx, y0 + ln + 8, 11, '#ffd34d', 5, .45, '#c98b00'); }
    }
  }

  // ------------------------------------------------------------------ personajes
  function reindeer(c, x, y, phase, lead, tick) {
    c.save(); c.translate(x, y);
    const brown = '#8b5a2b', dark = '#5a3a1a', sw = [0, 1, 2, 3].map(k => Math.sin(phase + k * Math.PI / 2));
    [[-22, sw[0]], [-12, sw[1]], [16, sw[2]], [26, sw[3]]].forEach(([lx, s]) => line(c, lx, 8, lx + s * 16, 38 - Math.abs(s) * 6, dark, 5));
    ell(c, 0, 0, 36, 17, brown); ell(c, 6, 8, 24, 8, '#f4e6d0'); ell(c, -36, -5, 7, 6, '#fff');
    poly(c, [[20, -8], [34, -14], [38, -36], [26, -34]], brown); ell(c, 42, -38, 13, 9, brown); ell(c, 52, -35, 8, 6, brown);
    ell(c, 37, -43, 7, 3.5, dark); ell(c, 44, -41, 1.8, 1.8, '#111');
    line(c, 24, -26, 36, -22, '#d4a017', 2.5);
    [36, 42].forEach(ax => { line(c, ax, -46, ax - 12, -70, dark, 2.6); line(c, ax - 6, -58, ax + 4, -68, dark, 2.6); line(c, ax - 10, -66, ax - 20, -64, dark, 2.6); });
    if (lead) glow(c, 60, -35, 20 + 4 * Math.sin(tick / 4), '#ff3a3a', 170);
    ell(c, 59, -35, 4.5, 4.5, lead ? '#ff2a2a' : '#3a2a1a');
    c.restore();
  }

  function sleighSanta(c, tick) {
    c.beginPath(); c.moveTo(-86, 52); c.lineTo(60, 52); c.bezierCurveTo(86, 52, 92, 30, 74, 22);
    c.strokeStyle = '#d4a017'; c.lineWidth = 4; c.lineCap = 'round'; c.stroke();
    line(c, -50, 52, -50, 36, '#d4a017', 4); line(c, 30, 52, 30, 36, '#d4a017', 4);
    c.beginPath(); c.moveTo(-84, 14); c.lineTo(-84, 38); c.quadraticCurveTo(-80, 46, -60, 46); c.lineTo(50, 46); c.quadraticCurveTo(80, 42, 76, 14);
    c.lineTo(48, 24); c.lineTo(-60, 24); c.quadraticCurveTo(-80, 24, -84, 14);
    const g = c.createLinearGradient(0, 14, 0, 46); g.addColorStop(0, '#e8261f'); g.addColorStop(1, '#a30f0f');
    c.fillStyle = g; c.fill(); c.strokeStyle = '#6b0808'; c.lineWidth = 1.5; c.stroke();
    line(c, -80, 30, 60, 30, '#ffd34d', 2.5, 'butt');
    ell(c, -52, 6, 30, 26, '#b98a45', '#6b4a1e', 1.2);
    [[-70, -12, '#4fb0ff'], [-52, -18, '#ffd34d'], [-36, -10, '#3fdc6a']].forEach(([gx, gy, gc]) => { rect(c, gx - 8, gy - 8, 16, 16, gc); rect(c, gx - 1.5, gy - 8, 3, 16, '#fff'); });
    ell(c, 4, 6, 24, 26, '#e11d1d', '#7a0a0a', 1.2); rect(c, -16, 18, 40, 6, '#fff'); rect(c, -16, 4, 40, 7, '#2a2a2a'); rect(c, 0, 3, 8, 9, '#ffd34d');
    c.save(); c.translate(24, 0); c.rotate((-50 + Math.sin(tick / 4) * 14) * D2R); rrect(c, 0, -5, 28, 10, 5, '#e11d1d'); ell(c, 30, 0, 7, 7, '#fff'); c.restore();
    ell(c, 6, -26, 15, 15, '#f6c9a0'); ell(c, 8, -15, 14, 12, '#fff'); ell(c, -4, -22, 6, 6, '#fff');
    ell(c, 12, -24, 4, 3, 'rgba(255,159,160,.67)'); ell(c, 11, -29, 1.8, 1.8, '#111'); ell(c, 15, -26, 3, 3, '#f6c9a0');
    poly(c, [[-8, -34], [20, -36], [-6, -62]], '#e11d1d'); rrect(c, -10, -40, 32, 9, 4, '#fff'); ell(c, -6, -62, 6, 6, '#fff');
  }

  function camel(c, phase) {
    [[-28, 0], [-16, 2], [18, 1], [30, 3]].forEach(([lx, k]) => { const s = Math.sin(phase + k * Math.PI / 2); line(c, lx, -46, lx + s * 13, -3 - Math.abs(s) * 5, '#8a6a3a', 7); });
    ell(c, 0, -62, 44, 20, '#d2a35e'); ell(c, -4, -84, 14, 14, '#d2a35e');
    line(c, 34, -68, 58, -106, '#d2a35e', 13); ell(c, 68, -112, 15, 8.5, '#d2a35e'); ell(c, 58, -121, 4, 7, '#b98a4a'); ell(c, 64, -115, 1.8, 1.8, '#111');
    line(c, -44, -66, -52, -48, '#b98a4a', 3);
  }

  function king(c, i, tick, phase) {
    const robes = ['#c41e3a', '#2a5fc4', '#2e9e4f'], skin = ['#f6c9a0', '#f6c9a0', '#8a5a3a'], beard = ['#f4f4f4', '#a9a9a9', '#1a1a1a'];
    const r = robes[i], bob = Math.sin(phase * 2) * 1.5;
    poly(c, [[-18, -80], [18, -80], [24, -50], [-24, -50]], darker(r, 115), '#ffd34d', 1.4);
    poly(c, [[-11, -96 + bob], [11, -96 + bob], [17, -66], [-17, -66]], r, '#ffd34d', 1.4);
    rect(c, -11, -84 + bob, 22, 3, '#ffd34d');
    ell(c, 0, -108 + bob, 9, 9, skin[i]);
    c.beginPath(); c.ellipse(0, -103.5 + bob, 9, 8.5, 0, 20 * D2R, 160 * D2R); c.closePath(); c.fillStyle = beard[i]; c.fill();
    poly(c, [[-9, -114 + bob], [-9, -126 + bob], [-4, -119 + bob], [0, -129 + bob], [4, -119 + bob], [9, -126 + bob], [9, -114 + bob]], '#ffd34d');
    ell(c, 3, -109 + bob, 1.3, 1.3, '#111');
    line(c, 10, -92 + bob, 26, -102 + bob, r, 5);
    rect(c, 23, -118 + bob, 14, 14, '#ffd34d'); rect(c, 29, -118 + bob, 3, 14, r);
    glow(c, 30, -111 + bob, 20, '#ffe27a', 80);
  }

  function shepherd(c, tick, flail, mood) {
    c.save(); c.translate(18, -14); c.rotate(flail * 18 * D2R);
    c.beginPath(); c.moveTo(0, 54); c.lineTo(0, -42); c.arc(0, -49, 9, Math.PI, Math.PI * 2 + .2, false);
    c.strokeStyle = '#6b4423'; c.lineWidth = 4; c.lineCap = 'round'; c.stroke(); c.restore();
    const sw = Math.sin(tick / 3) * (mood === 0 ? 6 : 10 + flail * 6);
    line(c, -6, 18, -9 + sw, 40, '#8a5a2a', 6); line(c, 6, 18, 9 - sw, 40, '#8a5a2a', 6);
    ell(c, -9 + sw, 41, 6, 3, '#3b2a1a'); ell(c, 9 - sw, 41, 6, 3, '#3b2a1a');
    poly(c, [[-14, -26], [14, -26], [19, 22], [-19, 22]], '#c79a52'); poly(c, [[-15, -27], [15, -27], [10, -8], [-12, -8]], '#7a4a2a');
    line(c, -16, 2, 16, 2, '#5a3a1a', 2.5, 'butt');
    line(c, -13, -22, -26, -6 - flail * 18, '#a67c3c', 5); line(c, 13, -22, 19, -12 + flail * 6, '#a67c3c', 5);
    ell(c, -27, -7 - flail * 18, 4, 4, '#f1c9a0'); ell(c, 0, -38, 11, 11, '#f1c9a0');
    c.beginPath(); c.ellipse(0, -31, 10, 9, 0, 20 * D2R, 160 * D2R); c.closePath(); c.fillStyle = '#5a3a1a'; c.fill();
    c.beginPath(); c.ellipse(0, -42, 12, 10, 0, 190 * D2R, 350 * D2R); c.closePath(); c.fillStyle = '#f4ead0'; c.fill();
    rect(c, -12, -43, 24, 3, '#2b6cc4');
    if (mood === 2) { [-4, 4].forEach(ex => { line(c, ex - 2, -41, ex + 2, -37, '#111', 1.6); line(c, ex + 2, -41, ex - 2, -37, '#111', 1.6); }); }
    else { ell(c, -4, -39, 1.6, 1.6, '#111'); ell(c, 4, -39, 1.6, 1.6, '#111'); }
    if (mood) ell(c, 0, -32, 3.2, 4, '#7a1a1a');
  }

  function mogwai(c, x, y, s, t, hat, wave, idle) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.translate(0, -(idle ? 0 : Math.abs(Math.sin(t * 6)) * 6));
    const fur = '#8a6a45', cream = '#f2e4c9', pink = '#d9a58b';
    ell(c, -12, -3, 10, 5, darker(fur, 115)); ell(c, 12, -3, 10, 5, darker(fur, 115));
    ell(c, 0, -22, 24, 22, fur); ell(c, 0, -16, 14, 14, cream); ell(c, -23, -20, 6, 11, fur, null, 0, 15);
    c.save(); c.translate(22, -28); c.rotate((wave ? -35 + Math.sin(t * 9) * 25 : 10) * D2R); ell(c, 0, -6, 6, 12, fur); c.restore();
    [-1, 1].forEach(sg => { ell(c, sg * 31, -62, 11, 22, fur, null, 0, sg * 25); ell(c, sg * 31, -62, 6, 15, pink, null, 0, sg * 25); });
    ell(c, 0, -48, 27, 21, fur); ell(c, 0, -42, 16, 11, cream);
    [-11, 11].forEach(ex => { ell(c, ex, -49, 6.5, 8.5, '#111'); ell(c, ex + 2, -52, 2.2, 2.6, '#fff'); });
    ell(c, 0, -43, 3, 2.2, '#222');
    c.beginPath(); c.moveTo(-5, -38); c.quadraticCurveTo(0, -34, 5, -38); c.strokeStyle = '#5a3a1a'; c.lineWidth = 1.4; c.stroke();
    ell(c, -16, -41, 4, 3, 'rgba(255,159,176,.5)'); ell(c, 16, -41, 4, 3, 'rgba(255,159,176,.5)');
    if (hat) { poly(c, [[-18, -62], [18, -64], [30, -86], [22, -90], [2, -80]], '#e11d1d'); rrect(c, -21, -68, 42, 9, 4, '#fff'); ell(c, 27, -90, 6, 6, '#fff'); }
    c.restore();
  }

  function gremlin(c, x, y, s, t, run, drag, kiss, jump) {
    c.save(); c.translate(x, y - (jump || 0)); c.scale(s, s);
    const ph = t * 12, skin = '#468c3a', light = '#7fc45a', dark = '#2f6a28';
    [-8, 8].forEach((hx, k) => {
      const sw = Math.sin(ph + k * Math.PI) * (run ? 13 : 0), lift = run ? Math.max(0, Math.sin(ph + k * Math.PI)) * 7 : 0;
      line(c, hx, -26, hx + sw, -4 - lift, dark, 8);
      if (drag) poly(c, [[hx + sw - 7, -2 - lift], [hx + sw + 9, -2 - lift], [hx + sw + 3, -14 - lift]], '#d4143a');
      else ell(c, hx + sw + 3, -3 - lift, 9, 4, dark);
    });
    if (drag) [-60, -52, -44, -36].forEach(hy => { ell(c, -14, hy, 9, 8, '#d9b441'); ell(c, 20, hy, 9, 8, '#d9b441'); });
    ell(c, 0, -38, 15, 17, skin);
    if (drag) {
      poly(c, [[-13, -50], [13, -50], [26, -14], [-26, -14]], '#ff5fa8', '#b0206a', 1.2);
      rect(c, -14, -38, 28, 4, '#ffd34d');
      [[-12, -22], [0, -26], [12, -20], [-5, -44], [8, -42]].forEach(([dx, dy]) => star(c, dx, dy, 2.6, '#fff', 4, .3));
    } else ell(c, 2, -34, 9, 12, light);
    const sw2 = run ? Math.sin(ph) * 22 : 0;
    line(c, -11, -46, -26, -46 - 14 - sw2 * .5 - (run ? 10 : 0), darker(skin, 110), 6);
    const hand = kiss > 0 ? [16 + 14 * Math.max(0, kiss - .5) * 2, -62] : [26, -46 - 12 + sw2 * .5 - (run ? 10 : 0)];
    line(c, 11, -46, hand[0], hand[1], darker(skin, 110), 6); ell(c, hand[0], hand[1], 5, 5, darker(skin, 115));
    if (drag) { rrect(c, -34, -52, 14, 11, 3, '#8a3fc4'); c.beginPath(); c.arc(-27, -52, 5, Math.PI, 0); c.strokeStyle = '#5a2a80'; c.lineWidth = 1.5; c.stroke(); }
    [[[-12, -70], [-44, -88], [-14, -56]], [[18, -70], [50, -92], [20, -56]]].forEach((pts, i) => {
      poly(c, pts, skin);
      poly(c, i === 0 ? [[-14, -68], [-35, -80], [-15, -60]] : [[19, -68], [40, -83], [20, -60]], '#e29aa0');
    });
    ell(c, 3, -66, 18, 16, skin);
    if (drag) {
      [[-12, -78, 8], [-3, -83, 9], [8, -84, 9], [18, -80, 8], [-16, -70, 7], [22, -70, 7]].forEach(([cx, cy, rr]) => ell(c, cx, cy, rr, rr, '#e8c455', '#c9a22f', 1));
      ell(c, -13, -56, 4, 5, null, '#d4a017', 2);
    } else [-7, 0, 7].forEach(dx => poly(c, [[3 + dx - 3, -80], [3 + dx, -93], [3 + dx + 3, -80]], dark));
    const wink = drag && kiss > .25;
    [-3, 11].forEach(ex => {
      if (drag) {
        ell(c, ex, -67, 5.5, 4.5, '#fff'); ell(c, ex + 1, -67, 3, 3.4, '#7a2bd0');
        [-4, -1, 2].forEach(lx => line(c, ex + lx, -71, ex + lx - 1, -75, '#111', 1.6));
        if (wink && ex > 0) { ell(c, ex, -67, 6.5, 5.5, skin); line(c, ex - 5, -67, ex + 5, -67, '#111', 2); }
      } else {
        ell(c, ex, -68, 5.5, 4.5, '#ffe24a', null, 0, ex < 0 ? -15 : 15); ell(c, ex + 1, -68, 1.6, 4, '#111');
        line(c, ex - 6, -75 + (ex < 0 ? 3 : 0), ex + 6, -73 + (ex < 0 ? 0 : 3), '#14380f', 2.4);
      }
    });
    ell(c, 4, -62, 1.2, 1.6, '#14380f'); ell(c, 8, -62, 1.2, 1.6, '#14380f');
    if (drag) {
      ell(c, -9, -61, 4, 3, 'rgba(255,159,176,.55)'); ell(c, 18, -61, 4, 3, 'rgba(255,159,176,.55)');
      if (kiss > 0) { ell(c, 9, -56, 5.5 + kiss * 2, 4, '#e0143c'); ell(c, 8, -57.5, 2, 1, 'rgba(255,255,255,.75)'); }
      else { c.beginPath(); c.ellipse(8, -56, 8, 5, 0, 0, Math.PI); c.closePath(); c.fillStyle = '#e0143c'; c.fill(); }
    } else {
      c.beginPath(); c.ellipse(5, -56.5, 9, 5.5, 0, 0, Math.PI); c.closePath(); c.fillStyle = '#3a0f0f'; c.fill();
      [-2, 3, 8, 13].forEach(tx => poly(c, [[tx, -57], [tx + 2.4, -57], [tx + 1.2, -53]], '#fff'));
    }
    c.restore();
  }

  // ------------------------------------------------------------------ Halloween
  function pumpkin(c, x, base, r, tick, seed, face) {
    const cy = base - r * .78, fl = .82 + .18 * Math.sin(tick / 3 + seed * 2);
    glow(c, x, cy, r * 1.7 * fl, '#ff9a1a', 95);
    [-.52, .52, -.2, .2].forEach(dx => {
      const gx = x + dx * r - r * .15, gy = cy - r * .2, g = c.createRadialGradient(gx, gy, 0, gx, gy, r * .95);
      g.addColorStop(0, '#ffb040'); g.addColorStop(1, '#d2560a');
      ell(c, x + dx * r, cy, (Math.abs(dx) > .3 ? .62 : .7) * r, .78 * r, g, '#8a2f00', 1.4);
    });
    poly(c, [[x - r * .12, cy - r * .7], [x + r * .14, cy - r * .72], [x + r * .22, cy - r * 1.02], [x - r * .02, cy - r * .98]], '#3d6b1f');
    if (face === false) return;
    [-1, 1].forEach(sx => poly(c, [[x + sx * r * .44, cy - r * .26], [x + sx * r * .14, cy - r * .26], [x + sx * r * .29, cy - r * .54]], '#ffe14a'));
    poly(c, [[x, cy - r * .1], [x - r * .09, cy + r * .07], [x + r * .09, cy + r * .07]], '#ffe14a');
    poly(c, [[-.52, .14], [-.32, .42], [-.16, .24], [0, .46], [.16, .24], [.32, .42], [.52, .14], [.3, .08], [0, .16], [-.3, .08]].map(([a, b]) => [x + a * r, cy + b * r]), '#ffe14a');
  }

  function tombstone(c, x, base, w, h, rip) {
    c.beginPath(); c.moveTo(x - w / 2, base); c.lineTo(x - w / 2, base - h + w / 2); c.arc(x, base - h + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w / 2, base); c.closePath();
    const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, '#8d8f9c'); g.addColorStop(1, '#4a4c5a');
    c.fillStyle = g; c.fill(); c.strokeStyle = '#2a2b36'; c.lineWidth = 1.5; c.stroke();
    ell(c, x - w * .25, base - 2, w * .22, 4, 'rgba(79,122,58,.78)'); ell(c, x + w * .3, base - 3, w * .16, 3, 'rgba(79,122,58,.78)');
    if (rip !== false) {
      c.fillStyle = '#22232c'; c.font = `bold ${Math.max(7, w * .28) | 0}px Georgia,serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('RIP', x, base - h * .63);
      line(c, x - w * .12, base - h * .42, x + w * .12, base - h * .42, '#2a2b36', 1.2); line(c, x, base - h * .5, x, base - h * .28, '#2a2b36', 1.2);
    }
  }

  function skull(c, x, base, s) {
    ell(c, x, base - s * .62, s * .5, s * .45, '#efe9d8', '#8a8470', 1.2);
    rrect(c, x - s * .28, base - s * .3, s * .56, s * .3, 3, '#efe9d8', '#8a8470', 1.2);
    ell(c, x - s * .19, base - s * .62, s * .13, s * .15, '#15121c'); ell(c, x + s * .19, base - s * .62, s * .13, s * .15, '#15121c');
    poly(c, [[x, base - s * .5], [x - s * .06, base - s * .38], [x + s * .06, base - s * .38]], '#15121c');
    for (let k = -2; k <= 2; k++) line(c, x + k * s * .1, base - s * .28, x + k * s * .1, base - s * .04, '#8a8470', 1, 'butt');
  }

  function ghost(c, x, y, s, t, alpha) {
    const a = alpha === undefined ? 225 : alpha;
    c.save(); c.translate(x, y + Math.sin(t * 2.2) * 5 * s); c.scale(s, s);
    glow(c, 0, -4, 36, '#cfd8ff', 60);
    c.beginPath(); c.moveTo(-18, 12); c.lineTo(-18, -8); c.arc(0, -8, 18, Math.PI, 0); c.lineTo(18, 12);
    c.quadraticCurveTo(12, 22, 6, 12); c.quadraticCurveTo(0, 22, -6, 12); c.quadraticCurveTo(-12, 22, -18, 12); c.closePath();
    c.fillStyle = col('#f6f6ff', a); c.fill(); c.strokeStyle = col('#b8c0e8', a); c.lineWidth = 1.2; c.stroke();
    ell(c, -7, -10, 3.2, 4.8, '#1a1a2a'); ell(c, 7, -10, 3.2, 4.8, '#1a1a2a'); ell(c, 0, 1, 4, 5.5, '#1a1a2a');
    c.restore();
  }

  function bat(c, x, y, s, flap) {
    c.save(); c.translate(x, y); c.scale(s, s);
    const wing = 1 + .6 * Math.sin(flap);
    [-1, 1].forEach(sg => poly(c, [[sg * 3, -3], [sg * 16, -16 * wing], [sg * 34, -9 * wing], [sg * 30, 2], [sg * 24, -2], [sg * 18, 6], [sg * 11, 0], [sg * 5, 7]], '#241238', '#0a0612', 1));
    ell(c, 0, 0, 5, 8, '#120a1e'); ell(c, 0, -9, 4.2, 4.2, '#120a1e');
    poly(c, [[-4, -11], [-6, -17], [-1.5, -12.5]], '#120a1e'); poly(c, [[4, -11], [6, -17], [1.5, -12.5]], '#120a1e');
    ell(c, -1.8, -9.5, 1, 1, '#ff3a3a'); ell(c, 1.8, -9.5, 1, 1, '#ff3a3a');
    c.restore();
  }

  function spider(c, x, ytop, ylen, tick, ph) {
    const ln = ylen + Math.sin(tick / 14 + (ph || 0)) * 8;
    line(c, x, ytop, x, ytop + ln, 'rgba(216,216,224,.75)', 1);
    const cy = ytop + ln + 8;
    [-1, 1].forEach(sg => [-30, -10, 10, 30].forEach((a, k) => {
      const kx = x + sg * (8 + 3 * k), ky = cy + a * .25;
      c.beginPath(); c.moveTo(x + sg * 3, cy + a * .12); c.lineTo(kx, ky - 7); c.lineTo(kx + sg * 4, ky + 6); c.strokeStyle = '#0c0814'; c.lineWidth = 1.6; c.lineCap = 'round'; c.stroke();
    }));
    ell(c, x, cy, 6.5, 8, '#14101e'); ell(c, x, cy - 8, 4.2, 4.2, '#14101e');
    ell(c, x - 1.6, cy - 9, 1, 1, '#ff5a5a'); ell(c, x + 1.6, cy - 9, 1, 1, '#ff5a5a'); ell(c, x, cy + 1, 2, 2.6, '#c0392b');
  }

  function cobwebs(c, w) {
    const web = (cx, cy, r, sgx) => {
      const angs = [0, 18, 38, 58, 78, 90];
      c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1.1; c.lineCap = 'butt';
      angs.forEach(a => { c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + sgx * r * Math.cos(a * D2R), cy + r * Math.sin(a * D2R)); c.stroke(); });
      [.3, .52, .76, 1].forEach(f => {
        c.beginPath(); let px0 = 0, py0 = 0;
        angs.forEach((a, i) => {
          const px = cx + sgx * r * f * Math.cos(a * D2R), py = cy + r * f * Math.sin(a * D2R);
          if (i === 0) c.moveTo(px, py); else c.quadraticCurveTo((px0 + px) / 2 - sgx * 3 * f, (py0 + py) / 2 - 3 * f, px, py);
          px0 = px; py0 = py;
        });
        c.stroke();
      });
    };
    web(0, 0, 90, 1); web(w, 0, 90, -1);
  }

  function vampire(c, x, y, s, t, walk, bare, arm) {
    c.save(); c.translate(x, y); c.scale(s, s);
    const sw = Math.sin(t * 5) * (walk ? 10 : 0), wave = walk ? Math.sin(t * 4) * 6 : Math.sin(t * 2) * 2;
    const g = c.createLinearGradient(0, -66, -40, 0); g.addColorStop(0, '#a3162b'); g.addColorStop(1, '#4a0813');
    poly(c, [[-4, -66], [10, -66], [-26 + wave, -6], [-44 + wave * 1.4, -2], [-20, -9], [-9, -4]], g, '#14040a', 1.2);
    line(c, -5, -30, -6 + sw, -4, '#0c0c12', 7); line(c, 5, -30, 6 - sw, -4, '#0c0c12', 7);
    ell(c, -4 + sw, -2, 8, 3.4, '#0c0c12'); ell(c, 8 - sw, -2, 8, 3.4, '#0c0c12');
    poly(c, [[-13, -66], [13, -66], [11, -29], [-11, -29]], '#0c0c12');
    poly(c, [[-5, -66], [5, -66], [0, -38]], '#f4f1f8');
    poly(c, [[-4, -64], [0, -61], [-4, -58]], '#c01234'); poly(c, [[4, -64], [0, -61], [4, -58]], '#c01234');
    poly(c, [[-15, -70], [-5, -66], [-13, -58]], '#7a0f1f'); poly(c, [[15, -70], [5, -66], [13, -58]], '#7a0f1f');
    const a = arm || 0;
    line(c, -11, -62, -18, -42 + sw * .3, '#0c0c12', 6); line(c, 11, -62, 20 + 16 * a, -46 - 16 * a, '#0c0c12', 6);
    ell(c, -18, -41 + sw * .3, 3.6, 3.6, '#e8e3ee'); ell(c, 20 + 16 * a, -46 - 16 * a, 3.6, 3.6, '#e8e3ee');
    ell(c, 0, -79, 11, 13, '#e8e3ee');
    c.beginPath(); c.ellipse(0, -84, 11.5, 10, 0, 190 * D2R, 350 * D2R); c.closePath(); c.fillStyle = '#0c0c12'; c.fill();
    poly(c, [[-4, -92], [0, -83], [4, -92]], '#0c0c12');
    poly(c, [[-10, -82], [-17, -90], [-9, -76]], '#e8e3ee'); poly(c, [[10, -82], [17, -90], [9, -76]], '#e8e3ee');
    glow(c, -4, -80, 7, '#ff2a2a', 120); glow(c, 5, -80, 7, '#ff2a2a', 120);
    ell(c, -4, -80, 2.4, 2, '#ff2a2a'); ell(c, 5, -80, 2.4, 2, '#ff2a2a');
    line(c, -8, -85, -1, -83, '#0c0c12', 1.6); line(c, 9, -85, 2, -83, '#0c0c12', 1.6);
    if (bare) { ell(c, 0, -71.5, 5.5, 4, '#3a0a12'); poly(c, [[-3.6, -74], [-1.4, -74], [-2.5, -68]], '#fff'); poly(c, [[1.4, -74], [3.6, -74], [2.5, -68]], '#fff'); }
    else line(c, -4, -72, 4, -72, '#7a1a2a', 1.6);
    c.restore();
  }

  function zombie(c, x, y, s, t, v) {
    v = v || 0;
    const skin = ['#8fb06a', '#9bb87a', '#7fa35f'][v % 3], shirt = ['#6b4a8a', '#8a5a3a', '#3f6a8a'][v % 3], ph = t * 3.2 + v * 1.3;
    c.save(); c.translate(x, y); c.scale(s, s);
    line(c, -5, -30, -6 + Math.sin(ph) * 9, -4, '#2b2f45', 7); line(c, 5, -30, 6 + Math.sin(ph + Math.PI) * 6, -8 + Math.abs(Math.sin(ph + Math.PI)) * 4, '#2b2f45', 7);
    ell(c, -4 + Math.sin(ph) * 9, -3, 8, 3.4, '#24182a'); ell(c, 9 + Math.sin(ph + Math.PI) * 6, -5, 8, 3.4, '#24182a');
    poly(c, [[-12, -64], [12, -62], [11, -30], [7, -26], [3, -31], [-2, -26], [-7, -31], [-11, -27]], shirt);
    ell(c, -3, -48, 3, 4, darker(skin, 130));
    const sw = Math.sin(ph * .7) * 3;
    line(c, 8, -60, 34, -58 + sw, skin, 6); line(c, 6, -55, 30, -50 - sw, skin, 6);
    ell(c, 35, -58 + sw, 4, 4, skin); ell(c, 31, -50 - sw, 4, 4, skin);
    c.save(); c.translate(5, -76); c.rotate((10 + Math.sin(ph * .6) * 6) * D2R);
    ell(c, 0, 0, 11, 12, skin); ell(c, -6, -10, 5, 3, '#2a2418'); ell(c, 3, -12, 4, 2.6, '#2a2418');
    ell(c, -4, -2, 4.4, 4.4, '#f4f4e8'); ell(c, 5, -2, 3, 3, '#f4f4e8'); ell(c, -3, -2, 1.6, 1.6, '#222'); ell(c, 5.5, -2, 1.1, 1.1, '#222');
    ell(c, 0, 6.5, 5, 3.4 + Math.abs(Math.sin(ph)) * 1.5, '#3a0a12'); rect(c, -3, 4.3, 2, 2, '#e8e0c0'); rect(c, 1, 4.3, 2, 2, '#e8e0c0');
    for (let k = 0; k < 3; k++) line(c, -7 + k * 3, -8, -7 + k * 3, -5, '#4a3a2a', 1, 'butt');
    ell(c, 6.5, 3, 2.6, 1.6, '#7a1a1a');
    c.restore(); c.restore();
  }

  function drawVampire(c, prog, w, h, d, S) {
    const foot = h - 14, stop = w * .5, dur = DUR.vampire, t = prog * dur;
    if (prog < .34) {
      const f = prog / .34, x = d > 0 ? -90 + (stop + 90) * f : w + 90 - (w + 90 - stop) * f;
      c.save(); c.translate(x, foot); c.scale(d * 1.5 * S, 1.5 * S); vampire(c, 0, 0, 1, t, true, false, 0); c.restore();
    } else if (prog < .64) {
      c.save(); c.translate(stop, foot); c.scale(d * 1.5 * S, 1.5 * S); vampire(c, 0, 0, 1, t, false, true, .6 + .4 * Math.sin(t * 3)); c.restore();
      if (prog > .4) bubble(c, stop - (d < 0 ? 70 : -4), foot - 190 * S, 150, 30, '¡Quiero tu sangre!', '#a0102a', 12);
    } else {
      const f = (prog - .64) / .36;
      for (let k = 0; k < 7; k++) { const u = Math.max(0, 1 - f * 3 + k * .05); glow(c, stop + (k - 3) * 14, foot - 60 - k * 6, 30 * u + 4, '#6a4a8a', 150 * u); }
      bat(c, stop + d * w * .8 * f, foot - 90 - (foot - 40) * f + Math.sin(f * 14) * 14, 1.8 * S, t * 22);
    }
  }

  function drawZombies(c, prog, w, h, d, S) {
    const foot = h - 14, span = w + 520 * S, lead = d > 0 ? -130 * S + span * prog : w + 130 * S - span * prog, t = prog * DUR.zombies;
    for (let i = 0; i < 3; i++) {
      c.save(); c.translate(lead - d * i * 135 * S + Math.sin(t * 1.3 + i) * 6, foot); c.scale(d * 1.4 * S, 1.4 * S); zombie(c, 0, 0, 1, t, i); c.restore();
    }
    if (prog > .12 && prog < .85 && Math.floor(t * 1.2) % 3 !== 2) bubble(c, lead + d * 20 - (d > 0 ? 80 : 0), foot - 175 * S, 140, 28, '¡Cerebrooos…!', '#3a5a1a', 12);
  }

  function drawBats(c, prog, w, h, d, S) {
    const t = prog * DUR.bats;
    for (let i = 0; i < 14; i++) {
      const f = prog * 1.25 + i * .035 - .12, x = d > 0 ? -50 + (w + 100) * f : w + 50 - (w + 100) * f;
      bat(c, x, (80 + 60 * Math.sin(i * 1.3 + prog * 9) + i * 9) * S, (.9 + (i % 3) * .25) * S, t * 20 + i);
    }
  }

  function drawGhost(c, prog, w, h, d, S) {
    const x = d > 0 ? -60 + (w + 120) * prog : w + 60 - (w + 120) * prog, y = h * .42 + Math.sin(prog * 9) * 40;
    ghost(c, x, y, 2.6 * S, prog * DUR.ghost);
    if (prog > .3 && prog < .7) bubble(c, x - 40, y - 100 * S, 80, 26, '¡Buuuu!', '#4a3a8a', 12);
  }

  // ------------------------------------------------------------------ fútbol
  function soccerBall(c, cx, cy, r, rot) {
    c.save(); c.translate(cx, cy); c.rotate((rot || 0) * D2R);
    const g = c.createRadialGradient(-r * .3, -r * .35, 0, -r * .3, -r * .35, r * 1.3); g.addColorStop(0, '#fff'); g.addColorStop(1, '#c9ccd6');
    ell(c, 0, 0, r, r, g, '#2a2a34', Math.max(1, r * .06));
    c.save(); c.beginPath(); c.arc(0, 0, r, 0, TAU); c.clip();
    const pent = [0, 72, 144, 216, 288].map(a => [r * .34 * Math.cos((a - 90) * D2R), r * .34 * Math.sin((a - 90) * D2R)]);
    poly(c, pent, '#23232d', '#2a2a34', Math.max(1, r * .05));
    for (let a = 0; a < 360; a += 72) {
      const an = (a - 90) * D2R; line(c, r * .34 * Math.cos(an), r * .34 * Math.sin(an), r * .72 * Math.cos(an), r * .72 * Math.sin(an), '#2a2a34', Math.max(1, r * .05), 'butt');
      const a2 = (a - 54) * D2R; ell(c, r * 1.02 * Math.cos(a2), r * 1.02 * Math.sin(a2), r * .3, r * .3, '#23232d', '#2a2a34', 1);
    }
    c.restore(); c.restore();
  }
  function cone(c, x, base, h) {
    poly(c, [[x, base - h], [x - h * .4, base], [x + h * .4, base]], '#ff7a1a', '#a03a00', 1.2);
    poly(c, [[x - h * .17, base - h * .5], [x + h * .17, base - h * .5], [x + h * .24, base - h * .3], [x - h * .24, base - h * .3]], '#fff');
    rrect(c, x - h * .5, base - 3, h, 4, 2, '#d0580a');
  }
  function cornerFlag(c, x, base, h, tick) {
    line(c, x, base, x, base - h, '#f2f2f2', 3);
    const wv = Math.sin(tick / 6) * 3;
    poly(c, [[x, base - h], [x + h * .38 + wv, base - h * .9], [x, base - h * .72]], '#ffd400');
  }
  function bunting(c, w, tick, colors) {
    c.beginPath(); c.strokeStyle = 'rgba(32,32,32,.86)'; c.lineWidth = 1.6;
    for (let x = 0; x <= w + 6; x += 6) { const y = garlandY(x); x === 0 ? c.moveTo(x, y) : c.lineTo(x, y); }
    c.stroke();
    let i = 0;
    for (let x = 14; x < w; x += 36, i++) {
      const y = garlandY(x), sway = Math.sin(tick / 10 + i) * 2;
      poly(c, [[x - 12, y], [x + 12, y + 1], [x + sway, y + 28]], colors[i % colors.length], 'rgba(32,32,32,.8)', 1);
    }
  }
  function footerHalloween(c, w, h, tick, S) {
    const base = h - 10, narrow = w < 600;
    const items = narrow ? [[.07, 'pumpkin', 46], [.25, 'tomb', 34], [.40, 'skull', 26], [.60, 'skull', 26], [.75, 'tomb', 34], [.93, 'pumpkin', 46]]
      : [[.035, 'pumpkin', 50], [.10, 'tomb', 38], [.155, 'pumpkin', 28], [.205, 'skull', 28], [.245, 'tombs', 26],
         [.755, 'tombs', 26], [.795, 'skull', 28], [.845, 'pumpkin', 28], [.90, 'tomb', 38], [.965, 'pumpkin', 50]];
    items.forEach(([xf, kind, a], n) => {
      const x = w * xf; c.save(); c.translate(x, base); c.scale(S, S);
      if (kind === 'pumpkin') pumpkin(c, 0, 0, a, tick, n); else if (kind === 'tomb') tombstone(c, 0, 0, a, a * 1.55, true);
      else if (kind === 'tombs') tombstone(c, 0, 0, a, a * 1.3, false); else skull(c, 0, 0, a);
      c.restore();
    });
  }
  function footerFutbol(c, w, h, tick, S) {
    const base = h - 10, narrow = w < 600;
    const items = narrow ? [[.07, 'ball', 22], [.22, 'cone', 38], [.78, 'cone', 38], [.93, 'ball', 22]]
      : [[.04, 'ball', 24], [.09, 'cone', 40], [.14, 'ball', 16], [.2, 'flag', 78], [.8, 'flag', 78], [.86, 'ball', 16], [.91, 'cone', 40], [.96, 'ball', 24]];
    items.forEach(([xf, kind, a], n) => {
      const x = w * xf; c.save(); c.translate(x, base); c.scale(S, S);
      if (kind === 'ball') soccerBall(c, 0, -a, a, n * 40); else if (kind === 'cone') cone(c, 0, 0, a); else cornerFlag(c, 0, 0, a, tick);
      c.restore();
    });
  }
  function hangersSpecial(c, w, tick, key) {
    const kinds = key === 'halloween' ? ['bat', 'spider', 'ghost', 'bat', 'spider', 'skull'] : key === 'spain' ? ['jamon', 'farol', 'ajos', 'farol', 'jamon', 'farol'] : ['soccer', 'star', 'soccer'];
    let i = 0;
    for (let x = 80; x < w; x += 170, i++) {
      const y0 = garlandY(x) + 6, k = kinds[i % kinds.length], sway = Math.sin(tick / 22 + i) * 4;
      if (k === 'spider') spider(c, x, y0, 26 + (i * 7) % 30, tick, i);
      else if (k === 'bat') { line(c, x, y0, x + sway, y0 + 14, 'rgba(216,216,216,.6)', 1); c.save(); c.translate(x + sway, y0 + 26); c.rotate(Math.PI); bat(c, 0, 0, .8, Math.sin(tick / 9 + i) * .5 + .4); c.restore(); }
      else if (k === 'ghost') ghost(c, x + sway, y0 + 30, .9, tick / 6 + i, 215);
      else if (k === 'skull') { line(c, x, y0, x + sway, y0 + 14, 'rgba(216,216,216,.6)', 1); skull(c, x + sway, y0 + 38, 22); }
      else if (k === 'jamon') { line(c, x, y0, x + sway, y0 + 12, '#7a5a2a', 1.4); jamon(c, x + sway, y0 + 12, 15, sway * 2); }
      else if (k === 'farol') { line(c, x, y0, x + sway, y0 + 12, 'rgba(216,216,216,.8)', 1.2); farolillo(c, x + sway, y0 + 12, 20, tick, i); }
      else if (k === 'ajos') ajos(c, x + sway, y0, 12);
      else if (k === 'soccer') { line(c, x, y0, x + sway, y0 + 14, 'rgba(216,216,216,.8)', 1.2); soccerBall(c, x + sway, y0 + 26, 12, tick * 2 + i * 30); }
      else { line(c, x, y0, x + sway, y0 + 14, 'rgba(216,216,216,.8)', 1.2); glow(c, x + sway, y0 + 24, 16, '#fff1a0', 110); star(c, x + sway, y0 + 24, 11, '#ffd34d', 5, .45, '#c98b00'); }
    }
  }
  function drawBall(c, prog, w, h, d, S) {
    const foot = h - 14, x = d > 0 ? -40 + (w + 80) * prog : w + 40 - (w + 80) * prog;
    const bounce = ph => Math.abs(Math.sin(ph * Math.PI * 6)) * 150 * S * (1 - ph * .6);
    for (let k = 0; k < 8; k++) { const f = k / 8; glow(c, x - d * (20 + k * 18), foot - 24 * S - bounce(prog - f * .03), 14 * (1 - f * .6), '#fff', 110 * (1 - f)); }
    soccerBall(c, x, foot - 24 * S - bounce(prog), 26 * S, prog * 1500 * d);
    if (prog > .55) {
      bubble(c, w * .5 - 70, foot - 210 * S, 140, 34, '¡GOOOL!', '#c01020', 15);
      for (let k = 0; k < 18; k++) {
        const ang = k * .7 + prog * 6;
        star(c, w * .5 + Math.cos(ang) * (60 + (prog - .55) * 400) * (1 + k % 3 * .3), foot - 120 * S + Math.sin(ang * 1.3) * 90 - (prog - .55) * 120, 5, ['#ffd400', '#fff', '#ff4040', '#40a0ff'][k % 4], 4, .3);
      }
    }
  }

  // ------------------------------------------------------------------ España: Guardia Civil, paellas, fabadas…
  const ROJO = '#c60b1e', AMARILLO = '#ffc400';
  function spanishFlag(c, x, y, wd, ht, tick) {
    line(c, x, y + ht + 40, x, y - 6, '#e8e8e8', 3); ell(c, x, y - 8, 3.5, 3.5, '#ffd34d');
    const n = 14, sw = wd / n;
    for (let i = 0; i < n; i++) {
      const yo = Math.sin(tick / 5 + i * .55) * 3.2 * (i / n + .15), x0 = x + 1 + i * sw;
      rect(c, x0, y + yo, sw + .8, ht * .25, ROJO); rect(c, x0, y + yo + ht * .25, sw + .8, ht * .5, AMARILLO); rect(c, x0, y + yo + ht * .75, sw + .8, ht * .25 + .5, ROJO);
    }
  }
  function steam(c, cx, cy, r, tick, n) {
    n = n || 3;
    for (let i = 0; i < n; i++) {
      const ph = (tick / 40 + i / n) % 1, yy = cy - ph * r * 1.6, xx = cx + Math.sin(ph * 6 + i * 2) * r * .25 + (i - (n - 1) / 2) * r * .45;
      glow(c, xx, yy, r * (.28 + ph * .3), '#ffffff', 120 * (1 - ph));
    }
  }
  function shrimp(c, x, y, s, rot) {
    c.save(); c.translate(x, y); c.rotate((rot || 0) * D2R);
    c.beginPath(); c.moveTo(-s, 0); c.bezierCurveTo(-s * .6, -s * .9, s * .7, -s * .9, s, .1 * s); c.bezierCurveTo(s * .6, -s * .35, -s * .5, -s * .35, -s, 0);
    c.fillStyle = '#ff8a4a'; c.fill(); c.strokeStyle = '#b8400f'; c.lineWidth = Math.max(1, s * .12); c.stroke();
    poly(c, [[s, .1 * s], [s * 1.35, -s * .15], [s * 1.3, s * .3]], '#ff6a2a'); ell(c, -s * .8, -s * .12, s * .07, s * .07, '#222');
    c.restore();
  }
  function paella(c, cx, cy, r) {
    const ry = r * .42;
    line(c, cx - r * 1.28, cy, cx - r * .95, cy, '#2a2a2e', Math.max(2, r * .07)); line(c, cx + r * .95, cy, cx + r * 1.28, cy, '#2a2a2e', Math.max(2, r * .07));
    ell(c, cx, cy + r * .07, r * 1.02, ry * 1.08, '#4a4a52', '#1c1c20', 1.4);
    const g = c.createRadialGradient(cx - r * .2, cy - ry * .3, 0, cx - r * .2, cy - ry * .3, r * 1.1); g.addColorStop(0, '#ffdf5a'); g.addColorStop(1, '#e0a41c');
    ell(c, cx, cy, r * .9, ry * .88, g);
    const R = rng(7);
    for (let k = 0; k < 16; k++) { const a = R() * 6.28, d = .1 + R() * .65; ell(c, cx + Math.cos(a) * r * d, cy + Math.sin(a) * ry * d * .85, r * .045, r * .035, R() < .6 ? '#4caf3a' : '#c8541a'); }
    for (let k = 0; k < 5; k++) { const a = k * 1.26 + .4, x0 = cx + Math.cos(a) * r * .55, y0 = cy + Math.sin(a) * ry * .5; line(c, x0, y0, x0 + r * .22, y0 + ry * .12, '#d0182a', Math.max(2, r * .07)); }
    for (let k = 0; k < 5; k++) { const a = k * 1.26 + 1.1; ell(c, cx + Math.cos(a) * r * .66, cy + Math.sin(a) * ry * .64, r * .1, r * .06, '#26263a'); }
    for (let k = 0; k < 4; k++) { const a = k * 1.57 + .2; shrimp(c, cx + Math.cos(a) * r * .36, cy + Math.sin(a) * ry * .4, r * .15, a / D2R * .3); }
    for (let k = 0; k < 6; k++) {
      const a = k * 1.05 + .5, lx = cx + Math.cos(a) * r * .97, ly = cy + Math.sin(a) * ry * .97;
      c.beginPath(); c.arc(lx, ly, r * .1, Math.PI, TAU); c.closePath(); c.fillStyle = '#ffe94a'; c.fill(); c.strokeStyle = '#b89a10'; c.lineWidth = 1; c.stroke();
    }
  }
  function cazuela(c, cx, cy, r) {
    const ry = r * .4, g = c.createLinearGradient(cx - r, 0, cx + r, 0); g.addColorStop(0, '#8a3f1a'); g.addColorStop(.4, '#c4693a'); g.addColorStop(1, '#7a3416');
    c.beginPath(); c.moveTo(cx - r, cy); c.bezierCurveTo(cx - r * .95, cy + r * .95, cx + r * .95, cy + r * .95, cx + r, cy); c.closePath();
    c.fillStyle = g; c.fill(); c.strokeStyle = '#5a2a10'; c.lineWidth = 1.6; c.stroke();
    ell(c, cx - r * 1.08, cy + r * .05, r * .14, r * .1, '#7a3416'); ell(c, cx + r * 1.08, cy + r * .05, r * .14, r * .1, '#7a3416');
    ell(c, cx, cy, r * 1.02, ry, '#a04e22', '#5a2a10', 1.6); ell(c, cx, cy + 2, r * .9, ry * .82, '#e9d9a4');
    const R = rng(11);
    for (let k = 0; k < 26; k++) { const a = R() * 6.28, d = .05 + R() * .8; ell(c, cx + Math.cos(a) * r * d * .9, cy + 2 + Math.sin(a) * ry * d * .78, r * .07, r * .045, '#fbf1cc'); }
    for (let k = 0; k < 4; k++) { const a = k * 1.6 + .3, x0 = cx + Math.cos(a) * r * .5, y0 = cy + 2 + Math.sin(a) * ry * .5; ell(c, x0, y0, r * .13, r * .08, '#d2401a', '#7a1a08', 1); ell(c, x0 - r * .03, y0 - r * .01, r * .025, r * .02, 'rgba(255,138,80,.8)'); }
    for (let k = 0; k < 3; k++) { const a = k * 2.2 + 1; ell(c, cx + Math.cos(a) * r * .62, cy + 2 + Math.sin(a) * ry * .6, r * .16, r * .075, '#2a1410'); }
    rrect(c, cx - r * .12, cy - ry * .25, r * .36, r * .1, 4, '#e8a48a');
  }
  function jamon(c, x, y, s, rot) {
    c.save(); c.translate(x, y); c.rotate((rot || 0) * D2R);
    c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(s * .9, s * .3, s * .8, s * 1.5, 0, s * 1.7); c.bezierCurveTo(-s * .8, s * 1.5, -s * .9, s * .3, 0, 0);
    c.fillStyle = '#b04a3a'; c.fill(); c.strokeStyle = '#5a2a10'; c.lineWidth = 1.2; c.stroke();
    ell(c, 0, s * 1.68, s * .16, s * .1, '#f0d9b0'); ell(c, -s * .2, s * .6, s * .2, s * .35, 'rgba(232,180,160,.67)');
    c.restore();
  }
  function farolillo(c, x, y, s, tick, i) {
    c.save(); c.translate(x, y); c.rotate(Math.sin(tick / 18 + i) * .04);
    glow(c, 0, s * .8, s * 1.3, '#ffd34d', 70);
    [ROJO, AMARILLO, ROJO, AMARILLO, ROJO].forEach((cc, k) => rect(c, -s * .5 + k * s * .2, 0, s * .2, s * 1.4, cc, '#5a1010', 1));
    rect(c, -s * .55, -s * .12, s * 1.1, s * .14, '#7a2a10'); rect(c, -s * .55, s * 1.38, s * 1.1, s * .14, '#7a2a10');
    c.restore();
  }
  function ajos(c, x, y, s) {
    line(c, x, y, x, y + s * 2.1, '#7a5a2a', 1.6);
    for (let k = 0; k < 3; k++) for (const sx of [-1, 1]) {
      const yy = y + s * (.5 + k * .62), xx = x + sx * s * .28;
      ell(c, xx, yy, s * .3, s * .34, '#f6f0e0', '#b9aa90', 1); poly(c, [[xx - 3, yy - s * .28], [xx + 3, yy - s * .28], [xx + sx * -.08 * s, yy - s * .5]], '#e6dcc4');
    }
  }
  function guardiaCivil(c, x, base, s, t, salute) {
    c.save(); c.translate(x, base); c.scale(s, s);
    const sw = salute ? 0 : Math.sin(t * 8), K = '#14180e';
    rrect(c, -16 + sw * 6, -48, 13, 46, 4, '#2c3b1c', K, 1.4); rrect(c, 3 - sw * 6, -48, 13, 46, 4, '#2c3b1c', K, 1.4);
    rrect(c, -19 + sw * 6, -9, 18, 10, 4, '#0e0e10', K, 1.4); rrect(c, 1 - sw * 6, -9, 18, 10, 4, '#0e0e10', K, 1.4);
    rrect(c, -24, -104, 48, 62, 9, '#3f5a26', K, 1.4);
    rect(c, -24, -58, 48, 7, '#171712', K, 1); rect(c, -4, -59, 8, 9, '#ffd34d');
    for (let k = 0; k < 3; k++) ell(c, 0, -98 + k * 12, 2, 2, '#ffd34d');
    poly(c, [[-8, -104], [8, -104], [0, -90]], '#c8d8b0'); rect(c, -2, -101, 4, 14, '#16160f');
    rrect(c, -37, -102, 14, 44, 7, '#3f5a26', K, 1.4);
    if (salute) {
      c.save(); c.translate(24, -98); c.rotate(-130 * D2R); rrect(c, -4, -2, 14, 40, 7, '#3f5a26', K, 1.4); c.restore();
      ell(c, 10, -118, 6, 6, '#f1c9a0');
    } else {
      rrect(c, 23, -102, 14, 44, 7, '#3f5a26', K, 1.4); ell(c, -30, -56, 6, 6, '#f1c9a0'); ell(c, 30, -56, 6, 6, '#f1c9a0'); line(c, 30, -58, 40, -30, '#101010', 4);
    }
    ell(c, 0, -122, 16, 17, '#f1c9a0', '#a0703a', 1);
    ell(c, -6, -125, 1.8, 2.2, '#1c1c1c'); ell(c, 6, -125, 1.8, 2.2, '#1c1c1c'); rrect(c, -9, -117, 18, 4.5, 2.5, '#1c1c1c');
    poly(c, [[-20, -146], [20, -146], [15, -132], [-15, -132]], '#101114', '#10120a', 1.2);
    poly(c, [[-25, -134], [25, -134], [17, -126], [-17, -126]], '#101114', '#10120a', 1.2);
    rect(c, -14, -143, 28, 3, 'rgba(255,255,255,.27)'); ell(c, 0, -134, 3.4, 3.4, '#ffd34d');
    c.restore();
  }
  function cocheGC(c, x, base, s, tick, d) {
    c.save(); c.translate(x, base); c.scale(s * d, s);
    const K = '#11160c';
    rrect(c, -80, -52, 160, 34, 10, '#f2f2f2', K, 1.6); poly(c, [[-80, -42], [80, -42], [80, -52], [-72, -52]], '#2f5a2a', K, 1.6);
    poly(c, [[-50, -52], [-34, -80], [34, -80], [54, -52]], '#f2f2f2', K, 1.6);
    poly(c, [[-40, -54], [-30, -75], [-4, -75], [-4, -54]], '#7ec8f0', K, 1.6); poly(c, [[2, -54], [2, -75], [30, -75], [46, -54]], '#7ec8f0', K, 1.6);
    rect(c, -80, -34, 160, 9, '#2f5a2a', K, 1.6);
    c.fillStyle = '#fff'; c.font = 'bold 7px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    if (d < 0) { c.save(); c.translate(7, -29.5); c.scale(-1, 1); c.fillText('GUARDIA CIVIL', 0, 0); c.restore(); } else c.fillText('GUARDIA CIVIL', 7, -29.5);
    const on = Math.floor(tick / 4) % 2 === 0;
    glow(c, -14, -86, 38, on ? '#2a7aff' : '#ff2a2a', 170); rrect(c, -24, -86, 14, 7, 3, on ? '#2a7aff' : '#5a1a1a'); rrect(c, -8, -86, 14, 7, 3, on ? '#ff2a2a' : '#5a1a1a');
    ell(c, 76, -40, 5, 6, '#ffe9a0');
    [-48, 48].forEach(wx => {
      ell(c, wx, -16, 16, 16, '#17171a', '#0a0a0a', 1); ell(c, wx, -16, 8, 8, '#c8c8cc');
      const a = tick * .5 * d; line(c, wx + Math.cos(a) * 7, -16 + Math.sin(a) * 7, wx - Math.cos(a) * 7, -16 - Math.sin(a) * 7, '#555560', 1.5);
    });
    c.restore();
  }
  function drawGuardia(c, prog, w, h, d, S) {
    const base = h - 22, x0 = d > 0 ? w * .12 : w * .88, x1 = d > 0 ? w * .88 : w * .12, stop = prog > .42 && prog < .66;
    const x = prog < .42 ? x0 + (w * .5 - x0) * (prog / .42) : prog < .66 ? w * .5 : w * .5 + (x1 - w * .5) * (prog - .66) / .34;
    c.globalAlpha = prog < .08 ? prog / .08 : prog > .94 ? (1 - prog) / .06 : 1;
    guardiaCivil(c, x, base, 1.5 * S, prog * DUR.guardia, stop); c.globalAlpha = 1;
    if (stop) bubble(c, x - 95, base - 262 * S, 190, 30, '¡Buen provecho, España!', '#9a0f1c', 12);
  }
  function drawPatrulla(c, prog, w, h, d, S) {
    const base = h - 14, x = d > 0 ? -140 + (w + 280) * prog : w + 140 - (w + 280) * prog, tick = Math.floor(prog * DUR.patrulla * 15);
    cocheGC(c, x, base, 1.5 * S, tick, d);
    const flash = Math.floor(prog * 60) % 2 === 0;
    for (let k = 0; k < 6; k++) glow(c, x - d * (30 + k * 24) * S, base - (28 + k * 3) * S, 20, flash ? '#2a7aff' : '#ff2a2a', 40);
  }
  function drawPlato(c, prog, w, h, d, S, kind) {
    const cx = w * (d > 0 ? .32 : .68), gy = h * .6, r = 86 * S, t = prog * DUR[kind];
    let y;
    if (prog < .22) { const q = prog / .22; y = -140 + (gy + 140) * q * q; }
    else if (prog < .32) { const q = (prog - .22) / .1; y = gy - Math.sin(q * Math.PI) * 38; }
    else if (prog < .88) y = gy; else y = gy - (prog - .88) / .12 * (gy + 160);
    if (kind === 'paella') paella(c, cx, y, r); else cazuela(c, cx, y, r * .92);
    if (prog > .3 && prog < .9) {
      steam(c, cx, y - 8, r, t * 30);
      for (let i = 0; i < 7; i++) {
        const ph = (t * .55 + i * .37) % 1, hx = cx + (i - 3) * r * .26, hy = y - Math.sin(ph * Math.PI) * (80 + (i % 3) * 36) * S;
        if (kind === 'paella') { if (i % 2) shrimp(c, hx, hy, 10 * S, ph * 360); else { c.beginPath(); c.arc(hx, hy, 8 * S, Math.PI, TAU); c.closePath(); c.fillStyle = '#ffe94a'; c.fill(); } }
        else ell(c, hx, hy, 6 * S, 4 * S, i % 2 ? '#fbf1cc' : '#d2401a');
      }
    }
    if (prog > .42 && prog < .84) bubble(c, cx - 70, y - 190 * S, 140, 30, kind === 'paella' ? '¡Paella!' : '¡Fabada!', '#9a0f1c', 15);
    if (prog > .38 && prog < .86) for (let k = 0; k < 10; k++) { const ang = k * .9 + t * 3; star(c, cx + Math.cos(ang) * (r * 1.6 + k * 6), y - 60 * S + Math.sin(ang * 1.3) * 90 * S, 5, [ROJO, AMARILLO][k % 2], 4, .3); }
  }
  function footerSpain(c, w, h, tick, S) {
    const base = h - 10, narrow = w < 600;
    const put = (xf, fn) => { c.save(); c.translate(w * xf, base); c.scale(S, S); fn(); c.restore(); };
    if (!narrow) {
      put(.03, () => spanishFlag(c, 0, -150, 110, 70, tick)); put(.96 - 110 / w, () => spanishFlag(c, 0, -150, 110, 70, tick));
    }
    const pa = narrow ? .22 : .115, ca = narrow ? .39 : .205;
    put(pa, () => { paella(c, 0, -20, 62); steam(c, 0, -26, 60, tick + 20, 2); }); put(ca, () => { cazuela(c, 0, -32, 44); steam(c, 0, -40, 44, tick); });
    put(1 - ca, () => { cazuela(c, 0, -32, 44); steam(c, 0, -40, 44, tick + 10); }); put(1 - pa, () => { paella(c, 0, -20, 62); steam(c, 0, -26, 60, tick + 33, 2); });
  }

  // ------------------------------------------------------------------ eventos
  const DUR = { santa: 3.4, star: 3.0, kings: 11.0, shepherd: 6.8, gizmo: 7.0, chase: 7.0, kiss: 8.0, vampire: 8.0, zombies: 11.0, bats: 4.0, ghost: 6.0, ball: 5.0, guardia: 9.0, patrulla: 5.0, paella: 7.0, fabada: 7.0 };
  const POOLS = { default: { santa: 3, star: 2, kings: 2, shepherd: 2 }, gremlins: { gizmo: 2, chase: 3, kiss: 3, santa: 1, star: 1 }, halloween: { vampire: 3, zombies: 3, bats: 2, ghost: 2 }, futbol: { ball: 1 }, spain: { guardia: 3, patrulla: 2, paella: 3, fabada: 3 } };

  function drawSanta(c, prog, w, h, d, S) {
    const total = 560 * S, x = d > 0 ? -total + (w + 2 * total) * prog : w + total - (w + 2 * total) * prog;
    const y = 70 * S + 30 * S * Math.sin(prog * Math.PI * 1.2) - 24 * S * prog;
    for (let i = 0; i < 18; i++) {
      const f = i / 18, tx = x - d * (60 + i * 22) * S, ty = y + Math.sin(i * 1.7 + prog * 18) * 16 * S + i * .6;
      glow(c, tx, ty, 14 * S * (1 - f * .5), '#ffe27a', 230 * (1 - f) / 2); star(c, tx, ty, 7 * S * (1 - f * .5), '#fff6c0', 4, .3);
    }
    c.save(); c.translate(x, y); c.scale(d * S, S);
    line(c, 70, 6, 190, -4, '#d4a017', 2); line(c, 190, -4, 300, 0, '#d4a017', 2);
    c.save(); c.translate(330, 20); const ph = prog * 70, tk = prog * 160;
    reindeer(c, 0, 0, ph, false, tk); reindeer(c, 120, -6, ph + 1.2, false, tk); reindeer(c, 240, 0, ph + 2.4, true, tk); c.restore();
    c.translate(0, 10); sleighSanta(c, tk); c.restore();
  }

  function drawStar(c, prog, w, h, d, S) {
    const x = d > 0 ? -80 + (w + 160) * prog : w + 80 - (w + 160) * prog, y = 90 * S - 45 * S * Math.sin(prog * Math.PI) + 110 * S * prog, tail = 300 * S;
    c.save(); c.translate(x, y); c.rotate(Math.atan2(110 * S, d * (w + 160)) + (d > 0 ? 0 : Math.PI));
    const g = c.createLinearGradient(0, 0, -tail, 0); g.addColorStop(0, 'rgba(255,243,176,.9)'); g.addColorStop(.4, 'rgba(255,211,77,.43)'); g.addColorStop(1, 'rgba(255,211,77,0)');
    poly(c, [[0, -9 * S], [-tail, 0], [0, 9 * S]], g); c.restore();
    glow(c, x, y, 70 * S, '#ffe27a', 170);
    c.save(); c.translate(x, y); c.rotate(prog * 540 * D2R); star(c, 0, 0, 30 * S, '#fff1a8', 8, .28); star(c, 0, 0, 16 * S, '#fff', 4, .25); c.restore();
    for (let i = 0; i < 10; i++) { const f = i / 10; star(c, x - d * (30 + i * 28) * S, y + Math.sin(i * 2.1 + prog * 20) * 14, 6 * S * (1 - f), '#fff', 4, .3); }
  }

  function drawKings(c, prog, w, h, d, S) {
    const gy = h - 20, span = w + 700 * S, head = d > 0 ? -250 * S + span * prog : w + 250 * S - span * prog;
    const sx = head + d * 80 * S, sy = gy - 215 * S, pulse = .8 + .2 * Math.sin(prog * 60);
    const g = c.createLinearGradient(sx, sy, sx, gy); g.addColorStop(0, 'rgba(255,226,122,.35)'); g.addColorStop(1, 'rgba(255,226,122,0)');
    poly(c, [[sx, sy], [sx - 70 * S, gy], [sx + 70 * S, gy]], g);
    glow(c, sx, sy, 80 * S * pulse, '#ffe27a', 190);
    c.save(); c.translate(sx, sy); c.rotate(Math.sin(prog * 10) * 6 * D2R); star(c, 0, 0, 34 * S * pulse, '#fff1a8', 8, .28); star(c, 0, 0, 17 * S, '#fff', 4, .25); c.restore();
    for (let i = 0; i < 3; i++) {
      c.save(); c.translate(head - d * i * 175 * S, gy); c.scale(d * .95 * S, .95 * S);
      const ph = prog * 90 + i; camel(c, ph); king(c, i, prog * 160, ph); c.restore();
    }
  }

  function drawShepherd(c, t, w, h, d, x0, S) {
    const gy = h - 55 * S, lie = gy + 30 * S, fall = 1.6;
    let x = x0, y, rot, flail, mood, tick;
    if (t < fall) { const f = t / fall; y = -70 + (lie + 70) * f * f; rot = 90 + 560 * (1 - f); flail = Math.sin(t * 16); mood = 1; tick = t * 30; }
    else if (t < fall + .45) { const f = (t - fall) / .45; y = lie - 34 * S * Math.sin(Math.PI * f); rot = 90; flail = Math.sin(t * 20) * .5; mood = 1; tick = t * 30; }
    else if (t < 4.0) { y = lie; rot = 90; flail = 0; mood = 2; tick = t * 6; }
    else if (t < 4.7) { const f = (t - 4.0) / .7; y = lie + (gy - lie) * f; rot = 90 * (1 - f); flail = .2; mood = 0; tick = t * 10; }
    else { const f = t - 4.7; x = x0 + d * f * 95 * S; y = gy - Math.abs(Math.sin(f * 7)) * 4; rot = 0; flail = 0; mood = 0; tick = t * 14; }
    c.save(); c.translate(x, y); c.scale(S, S); c.rotate(rot * D2R); if (t >= 4.7 && d < 0) c.scale(-1, 1); shepherd(c, tick, flail, mood); c.restore();
    if (t >= fall && t < 4.0) {
      for (let k = 0; k < 3; k++) { const a = t * 6 + k * 2.09; star(c, x + Math.cos(a) * 26 * S, lie - 40 * S + Math.sin(a) * 8, 6, '#ffd34d', 5, .45); }
      if (t > 2.0) bubble(c, x + 18, lie - 98 * S, 124, 30, '¡Ay, mi pastor!', '#222', 12);
    }
  }

  function drawGizmo(c, prog, w, h, d, S, dur) {
    const x = d > 0 ? -90 + (w + 180) * prog : w + 90 - (w + 180) * prog, foot = h - 12, t = prog * dur;
    c.save(); c.translate(x, foot); c.scale(d * S, S); mogwai(c, 0, 0, 1.25, t, true, true, false); c.restore();
    if (prog > .45 && prog < .62) bubble(c, x - 30, foot - 130 * S, 60, 24, '¡Kiii!', '#222', 11);
  }

  function drawChase(c, prog, w, h, d, S, dur) {
    const foot = h - 12, span = w + 700 * S, lead = d > 0 ? -150 * S + span * prog : w + 150 * S - span * prog, t = prog * dur;
    c.save(); c.translate(lead, foot); c.scale(d * S, S); mogwai(c, 0, 0, 1.2, t, true, false, false); c.restore();
    [170, 250, 330].forEach((gap, i) => {
      const jump = i === 1 ? Math.abs(Math.sin(t * 5 + i * 1.7)) * 26 : 0;
      c.save(); c.translate(lead - d * gap * S, foot); c.scale(d * S, S); gremlin(c, 0, 0, 1.1, t + i * .3, true, false, 0, jump); c.restore();
    });
  }

  function drawKiss(c, prog, w, h, d, S, dur) {
    const foot = h - 12, t = prog * dur, stop = w * .5, tIn = .28, tOut = .72;
    let x, moving, kiss = 0;
    if (prog < tIn) { const f = prog / tIn; x = d > 0 ? -100 + (stop + 100) * f : w + 100 - (w + 100 - stop) * f; moving = true; }
    else if (prog < tOut) { x = stop; moving = false; kiss = Math.min(1, (prog - tIn) / .1); if (prog - tIn > .28) kiss = 0; }
    else { const f = (prog - tOut) / (1 - tOut); x = d > 0 ? stop + (w + 120 - stop) * f : stop - (stop + 120) * f; moving = true; }
    c.save(); c.translate(x, foot); c.scale(d * 1.25 * S, 1.25 * S); gremlin(c, moving ? 0 : Math.sin(t * 5) * 2, 0, 1, t, moving, true, kiss, 0); c.restore();
    if (!moving) {
      const kt = (prog - tIn) * dur - .6, colors = ['#ff4f7b', '#ff8fb0', '#e0143c', '#ff6fa0'];
      for (let i = 0; i < 4; i++) {
        const u = (kt - i * .45) / 1.6;
        if (u >= 0 && u <= 1) heart(c, x + d * (60 + 130 * u) * S, foot - (105 + 170 * u) * S + Math.sin(u * 7 + i) * 14, (9 + 9 * u) * S, colors[i], 255 * (1 - u * .8));
      }
      if (kt + .6 > .3 && kt + .6 < 2.4) bubble(c, x - d * 20 - (d < 0 ? 70 : 0), foot - 190 * S, 70, 26, '¡Muac!', '#c0104a', 12);
    }
  }

  // ------------------------------------------------------------------ gestor de eventos
  const Events = {
    cur: null, last: null, t0: 0, dir: 1, param: .5, theme: 'default', next: performance.now() / 1000 + 4 + Math.random() * 4,
    setTheme(k) { this.theme = POOLS[k] ? k : 'default'; },
    trigger(kind) {
      if (this.cur) return;
      const pool = POOLS[this.theme]; let kinds = Object.keys(pool).filter(k => k !== this.last); if (!kinds.length) kinds = Object.keys(pool);
      if (!kind) { const tot = kinds.reduce((a, k) => a + pool[k], 0); let r = Math.random() * tot; for (const k of kinds) { r -= pool[k]; if (r <= 0) { kind = k; break; } } kind = kind || kinds[0]; }
      this.cur = this.last = kind; this.t0 = performance.now() / 1000; this.dir = Math.random() < .5 ? 1 : -1; this.param = Math.random();
    },
    update() {
      const now = performance.now() / 1000;
      if (!this.cur) { if (now >= this.next) this.trigger(); }
      else if (now - this.t0 > DUR[this.cur]) { this.cur = null; this.next = now + 7 + Math.random() * 9; }
    },
    clear() { this.cur = null; this.next = performance.now() / 1000 + 4; },
    paint(c, w, h, S) {
      if (!this.cur) return;
      const t = performance.now() / 1000 - this.t0, dur = DUR[this.cur], prog = Math.max(0, Math.min(1, t / dur)), k = this.cur, d = this.dir;
      c.save();
      if (k === 'santa') drawSanta(c, prog, w, h, d, S); else if (k === 'star') drawStar(c, prog, w, h, d, S);
      else if (k === 'kings') drawKings(c, prog, w, h, d, S); else if (k === 'gizmo') drawGizmo(c, prog, w, h, d, S, dur);
      else if (k === 'chase') drawChase(c, prog, w, h, d, S, dur); else if (k === 'kiss') drawKiss(c, prog, w, h, d, S, dur);
      else if (k === 'vampire') drawVampire(c, prog, w, h, d, S); else if (k === 'zombies') drawZombies(c, prog, w, h, d, S);
      else if (k === 'bats') drawBats(c, prog, w, h, d, S); else if (k === 'ghost') drawGhost(c, prog, w, h, d, S); else if (k === 'ball') drawBall(c, prog, w, h, d, S);
      else if (k === 'guardia') drawGuardia(c, prog, w, h, d, S); else if (k === 'patrulla') drawPatrulla(c, prog, w, h, d, S);
      else if (k === 'paella' || k === 'fabada') drawPlato(c, prog, w, h, d, S, k);
      else drawShepherd(c, t, w, h, d, w * (.15 + .7 * this.param), S);
      c.restore();
    },
  };

  // ------------------------------------------------------------------ escenarios (fondo)
  function hills(c, w, h, color, base, amp, wl, ph) {
    c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= w + 8; x += 8) c.lineTo(x, h - base - amp * Math.sin(x / wl + ph));
    c.lineTo(w, h); c.closePath(); c.fillStyle = color; c.fill();
  }
  function windowLit(c, x, y, w, h) { glow(c, x + w / 2, y + h / 2, w * 1.4, '#ffcc55', 90); rect(c, x, y, w, h, '#ffd86b'); }

  function scenery(c, w, h, scene) {
    if (scene === 'grinch') {
      glow(c, w * .55, 80, 90, '#b6ff3a', 70);
      poly(c, [[w * .5, h], [w * .66, h - 150], [w * .72, h - 110], [w * .8, h - 175], [w * .93, h - 90], [w, h]], '#0b2a0e');
      poly(c, [[w * .66, h - 150], [w * .7, h - 123], [w * .62, h - 125]], '#e9fff0'); poly(c, [[w * .8, h - 175], [w * .84, h - 140], [w * .76, h - 142]], '#e9fff0');
      hills(c, w, h, '#0f4d14', 30, 14, 90, .5); hills(c, w, h, '#e8f6e8', 8, 5, 60, 1);
    } else if (scene === 'belen') {
      glow(c, w * .55, 80, 90, '#ffd34d', 130); star(c, w * .55, 80, 34, '#fff1a8', 8, .28); star(c, w * .55, 80, 16, '#fff', 4, .25);
      hills(c, w, h, '#241848', 45, 22, 140, .3); hills(c, w, h, '#3b2a1a', 20, 10, 80, 2);
      const bx = w - 410 > w * .3 ? w - 410 : w * .55;
      poly(c, [[bx - 20, h - 55], [bx + 80, h - 105], [bx + 100, h - 55]], '#5a3a1c'); rect(c, bx, h - 75, 80, 40, '#6e4a26'); windowLit(c, bx + 28, h - 68, 24, 30);
    } else if (scene === 'santa') {
      glow(c, w * .55, 80, 110, '#fff3c0', 110); ell(c, w * .55, 80, 38, 38, '#fff7d6');
      hills(c, w, h, '#f0f4ff', 40, 20, 110, .2); hills(c, w, h, '#fff', 15, 8, 70, 1.4);
    } else if (scene === 'disney') {
      glow(c, w * .5, h - 90, 260, '#b9a0ff', 90);
      const cx = w * .5;
      [[-130, 40, 90], [-80, 34, 120], [-35, 40, 160], [0, 46, 200], [40, 40, 160], [90, 34, 120], [130, 40, 90]].forEach(([dx, tw, th]) => {
        const x0 = cx + dx - tw / 2; rect(c, x0, h - th, tw, th, '#1a1650'); poly(c, [[x0 - 4, h - th], [x0 + tw / 2, h - th - tw * 1.3], [x0 + tw + 4, h - th]], '#3a2f9a');
      });
      [[0, 170], [-35, 130], [40, 130]].forEach(([dx, ty]) => windowLit(c, cx + dx - 4, h - ty, 8, 14));
      hills(c, w, h, '#241e66', 20, 10, 100, .8); hills(c, w, h, '#eef2ff', 6, 4, 60, 2.2);
    } else if (scene === 'gremlins') {
      glow(c, w * .55, 80, 90, '#cfe8ff', 90); ell(c, w * .55, 80, 30, 30, '#e8f2ff'); hills(c, w, h, '#16253f', 36, 12, 110, .7);
      [[.30, '#5a2a2a', 70], [.42, '#2a3f5a', 88], [.58, '#3f2a55', 80], [.70, '#2a4a3a', 66]].forEach(([xf, cc, rh]) => {
        const x0 = w * xf; rect(c, x0, h - rh - 30, 64, rh, cc); poly(c, [[x0 - 6, h - rh - 30], [x0 + 32, h - rh - 62], [x0 + 70, h - rh - 30]], '#f4f8ff');
        windowLit(c, x0 + 10, h - rh - 14, 16, 18); windowLit(c, x0 + 38, h - rh - 14, 16, 18);
      });
      hills(c, w, h, '#e9f1ff', 8, 5, 70, 1.3);
    } else if (scene === 'halloween') {
      glow(c, w * .55, 80, 130, '#ff9a1a', 110); ell(c, w * .55, 80, 38, 38, '#ffcf6a'); ell(c, w * .55 - 10, 72, 10, 8, 'rgba(255,160,40,.27)'); ell(c, w * .55 + 12, 90, 7, 6, 'rgba(255,160,40,.27)');
      hills(c, w, h, '#1a0d2a', 60, 26, 130, .6);
      [[.12, 190], [.9, 170]].forEach(([xf, hh]) => {
        const x0 = w * xf; line(c, x0, h - 20, x0 + 6, h - hh, '#0a0512', 7);
        [[.55, -55, -38], [.7, 58, -48], [.9, -38, -42], [.82, 40, -34]].forEach(([fy, ex, ey]) => {
          const by = h - 20 - (hh - 20) * fy; line(c, x0 + 4, by, x0 + 4 + ex, by + ey, '#0a0512', 4); line(c, x0 + 4 + ex, by + ey, x0 + 4 + ex * 1.35, by + ey * 1.5, '#0a0512', 2.4);
        });
      });
      const hx = Math.min(w * .62, w - 150);
      rect(c, hx, h - 150, 120, 110, '#0e0716'); rect(c, hx + 90, h - 205, 34, 165, '#0e0716');
      poly(c, [[hx - 10, h - 150], [hx + 60, h - 205], [hx + 130, h - 150]], '#0e0716'); poly(c, [[hx + 84, h - 205], [hx + 107, h - 245], [hx + 130, h - 205]], '#0e0716');
      [[16, -130], [60, -130], [16, -88], [98, -190]].forEach(([ox, oy]) => { glow(c, hx + ox + 8, h + oy + 10, 22, '#ff9a1a', 110); rect(c, hx + ox, h + oy, 16, 22, '#ffb52e'); });
      [[.2, 22, 120], [.5, 14, 160], [.8, 24, 130]].forEach(([fx, fy, fr]) => ell(c, w * fx, h - fy, fr, 20, 'rgba(210,190,255,.15)'));
      hills(c, w, h, '#120a1c', 14, 8, 80, 1.7);
    } else if (scene === 'futbol') {
      [.022, .978].forEach(xf => {
        const x0 = w * xf; glow(c, x0, 80, 150, '#fff6c0', 80); rect(c, x0 - 3, 96, 6, h - 96 - 60, '#3a4a40');
        for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) rect(c, x0 - 22 + k * 15, 60 + r * 14, 12, 10, '#fffbe0');
      });
      const y0 = h - 130;
      for (let i = -1; i < w / 70 + 2; i++) rect(c, i * 70, y0, 70, 130, i % 2 === 0 ? '#1f7a2a' : '#26912f');
      line(c, 0, y0, w, y0, 'rgba(255,255,255,.82)', 3, 'butt'); line(c, w / 2, y0, w / 2, h, 'rgba(255,255,255,.82)', 3, 'butt');
      ell(c, w / 2, h - 44, 130, 34, null, 'rgba(255,255,255,.82)', 3); ell(c, w / 2, h - 44, 4, 3, '#fff');
    } else if (scene === 'spain') {
      glow(c, w * .58, 96, 170, '#ffb020', 120); ell(c, w * .58, 96, 46, 46, '#ffd45a');
      hills(c, w, h, '#7a2a14', 90, 30, 150, .8);
      const cx0 = Math.min(w * .17, w - 190);
      [[0, 120, 120], [-18, 170, 34], [116, 150, 30], [50, 195, 44]].forEach(([dx, hh, ww]) => {
        rect(c, cx0 + dx, h - 100 - hh, ww, hh, '#4a1a10'); poly(c, [[cx0 + dx - 4, h - 100 - hh], [cx0 + dx + ww / 2, h - 100 - hh - ww * .9], [cx0 + dx + ww + 4, h - 100 - hh]], '#2e0f0a');
      });
      [[22, 190], [60, 250], [80, 190], [126, 215]].forEach(([ox, oy]) => rect(c, cx0 + ox, h - oy, 8, 14, '#ffb52e'));
      const bx = w * .68, by = h - 140;
      ell(c, bx, by, 52, 24, '#0c0505'); ell(c, bx + 50, by - 18, 17, 14, '#0c0505');
      poly(c, [[bx + 56, by - 28], [bx + 70, by - 52], [bx + 62, by - 24]], '#0c0505'); poly(c, [[bx + 44, by - 28], [bx + 38, by - 54], [bx + 52, by - 26]], '#0c0505');
      [-36, -18, 20, 40].forEach(lx => line(c, bx + lx, by + 16, bx + lx, by + 62, '#0c0505', 8));
      hills(c, w, h, '#d8892a', 24, 10, 110, 1.5);
    } else if (scene === 'solo') {
      glow(c, w * .55, 80, 90, '#fff1c4', 90); ell(c, w * .55, 80, 32, 32, '#fff1c4'); hills(c, w, h, '#2a1a10', 28, 10, 120, .4);
      const hx = w * .5 - 90;
      rect(c, hx, h - 150, 180, 120, '#7a2f1b'); poly(c, [[hx - 16, h - 150], [hx + 90, h - 215], [hx + 196, h - 150]], '#3b1d12');
      poly(c, [[hx - 16, h - 150], [hx + 90, h - 215], [hx + 196, h - 150], [hx + 180, h - 150], [hx + 90, h - 200], [hx, h - 150]], '#f4f4f4');
      [hx + 20, hx + 120].forEach(wx => { windowLit(c, wx, h - 135, 34, 36); windowLit(c, wx, h - 85, 34, 36); });
      rect(c, hx + 76, h - 78, 28, 48, '#3a1a0c'); hills(c, w, h, '#f6efe2', 8, 5, 70, 1.3);
    }
  }

  // ------------------------------------------------------------------ pie de página
  function footer(c, w, h, key, tick, S) {
    if (key === 'halloween') return footerHalloween(c, w, h, tick, S);
    if (key === 'futbol') return footerFutbol(c, w, h, tick, S);
    if (key === 'spain') return footerSpain(c, w, h, tick, S);
    const pal = PAL[key] || PAL.personal, base = h - 10;
    const narrow = w < 600;
    const items = narrow
      ? [[.07, 'tree', 120], [.24, 'gifts', 0], [.40, 'man', 22], [.60, 'man', 22], [.76, 'gifts', 0], [.93, 'tree', 120]]
      : [[.03, 'tree', 135], [.085, 'gifts', 0], [.15, 'man', 26], [.205, 'cane', 62], [.237, 'gift1', 0],
         [.763, 'gift1', 0], [.795, 'cane', 62], [.85, 'man', 26], [.915, 'gifts', 0], [.97, 'tree', 135]];
    items.forEach(([xf, kind, a], n) => {
      const x = w * xf;
      c.save();
      if (kind === 'tree') tree(c, x, base, a * S, tick, pal, n + 3);
      else if (kind === 'gifts') { const [[c1, r1], [c2, r2], [c3, r3]] = pal.gifts; c.translate(x, base); c.scale(S, S); gift(c, -16, 0, 30, 26, c1, r1); gift(c, 14, 0, 26, 34, c2, r2); gift(c, -2, -26, 20, 20, c3, r3); }
      else if (kind === 'gift1') { const [cc, rr] = pal.gifts[n % 3]; c.translate(x, base); c.scale(S, S); gift(c, 0, 0, 24, 22, cc, rr); }
      else if (kind === 'cane') { c.translate(x, base); c.scale(S, S); candyCane(c, 0, 0, a); }
      else if (kind === 'man') {
        c.translate(x, base); c.scale(S, S);
        if (key === 'gremlins') { if (xf < .5) mogwai(c, 0, 0, .9, tick / 25, true, true, true); else { c.scale(-1, 1); gremlin(c, 0, 0, .8, tick / 25, false, false, 0, 0); } }
        else if (key === 'belen') sheep(c, -18, 0, a, tick);
        else snowman(c, 0, 0, a, tick);
      }
      c.restore();
    });
  }

  // ------------------------------------------------------------------ motor
  const Decor = {
    paused: false, grinch: false, key: 'grinch', theme: null, bgImg: null,
    tick: 0, parts: [], _static: null, _sKey: '', _fx: null, _fKey: '', _fxTick: -99, W: 0, H: 0, dpr: 1, S: 1, last: 0,
    init(bg, fx) {
      this.bg = bg; this.fx = fx; this.bc = bg.getContext('2d'); this.fc = fx.getContext('2d');
      window.addEventListener('resize', () => this.resize()); this.resize();
      const loop = (ts) => { requestAnimationFrame(loop); if (ts - this.last < 33) return; this.last = ts; this.frame(); };
      requestAnimationFrame(loop);
    },
    resize() {
      this.dpr = Math.min(window.devicePixelRatio || 1, 2); this.W = window.innerWidth; this.H = window.innerHeight;
      this.S = Math.max(.5, Math.min(1, this.W / 900));
      [this.bg, this.fx].forEach(cv => { cv.width = this.W * this.dpr; cv.height = this.H * this.dpr; cv.style.width = this.W + 'px'; cv.style.height = this.H + 'px'; });
      this._sKey = ''; this._fKey = '';
    },
    setTheme(key, theme) {
      this.key = key; this.theme = theme; Events.setTheme(key); Events.clear();
      this.parts = Array.from({ length: 90 }, () => [Math.random(), Math.random(), 1.2 + Math.random() * 3, .0012 + Math.random() * .003, Math.random() * 6.28]);
      this._sKey = ''; this._fKey = '';
    },
    setBgImage(img) { this.bgImg = img; this._sKey = ''; },
    setPaused(on) { this.paused = on; Events.clear(); this.clearFx(); },
    setGrinch(on) { this.grinch = on; Events.clear(); this.clearFx(); this._fKey = ''; },
    trigger() { if (!this.paused && !this.grinch) Events.trigger(); },
    clearFx() { const c = this.fc; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, this.fx.width, this.fx.height); },
    layer() { const cv = document.createElement('canvas'); cv.width = this.W * this.dpr; cv.height = this.H * this.dpr; const c = cv.getContext('2d'); c.scale(this.dpr, this.dpr); return [cv, c]; },
    frame() {
      if (!this.theme) return;
      const w = this.W, h = this.H, key = this.key, th = this.theme, c = this.bc;
      if (!this.paused) this.tick++;
      const sk = [w, h, key, !!this.bgImg].join('|');
      if (this._sKey !== sk) {
        const [cv, q] = this.layer();
        const g = q.createLinearGradient(0, 0, 0, h); g.addColorStop(0, th.top); g.addColorStop(1, th.bottom); q.fillStyle = g; q.fillRect(0, 0, w, h);
        if (this.bgImg && this.bgImg.naturalWidth) {
          const im = this.bgImg, k = Math.max(w / im.naturalWidth, h / im.naturalHeight), iw = im.naturalWidth * k, ih = im.naturalHeight * k;
          q.globalAlpha = key === 'personal' ? 1 : .55; q.drawImage(im, (w - iw) / 2, (h - ih) / 2, iw, ih); q.globalAlpha = 1;
          q.fillStyle = `rgba(0,0,0,${key === 'personal' ? .27 : .18})`; q.fillRect(0, 0, w, h);
        }
        scenery(q, w, h, th.scene); this._static = cv; this._sKey = sk;
      }
      const fk = sk + '|' + this.grinch;
      if (this._fKey !== fk || this.tick - this._fxTick >= 4) {
        const [cv, q] = this.layer();
        if (!this.grinch) {
          footer(q, w, h, key, this.tick, this.S);
          if (key === 'futbol' || key === 'spain') bunting(q, w, this.tick, th.bulbs); else garland(q, w, this.tick, th.bulbs);
          hangers(q, w, this.tick, PAL[key] || PAL.personal, key);
          if (key === 'halloween') cobwebs(q, w);
        }
        this._fx = cv; this._fKey = fk; this._fxTick = this.tick;
      }
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, this.bg.width, this.bg.height);
      c.drawImage(this._static, 0, 0);
      c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      c.fillStyle = th.pcolor;
      this.parts.forEach(p => {
        if (!this.paused) { p[1] += p[3]; p[4] += .04; p[0] += Math.sin(p[4]) * .0006; if (p[1] > 1.02) { p[1] = -.02; p[0] = Math.random(); } }
        const px = p[0] * w, py = p[1] * h;
        if (th.particles === 'snow') { c.globalAlpha = .82; c.beginPath(); c.arc(px, py, p[2], 0, TAU); c.fill(); c.globalAlpha = 1; }
        else { const tw = .5 + .5 * Math.sin(p[4] * 2); c.save(); c.globalAlpha = .27 + .72 * tw; star(c, px, py, p[2] * 2.2, th.pcolor, 4, .25); c.restore(); }
      });
      c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(this._fx, 0, 0);
      // eventos (capa superior)
      if (!this.paused && !this.grinch) Events.update();
      const f = this.fc; f.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); f.clearRect(0, 0, w, h);
      if (Events.cur) Events.paint(f, w, h, this.S);
    },
  };
  window.Decor = Decor;
  window.DecorEvents = Events;
})();
