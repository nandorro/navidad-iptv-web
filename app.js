/* Navidad IPTV (móvil): lista M3U, favoritos, reproducción HLS, canales web y temas. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const NATIVE = window.NativeApi || null;
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* lleno o bloqueado */ } },
  };

  // ------------------------------------------------------------------ temas
  const THEMES = {
    grinch: { label: '💚 El Grinch', title: '🎁 El Grinch TV 🎁', tagline: 'Odio la Navidad… pero adoro tus canales.', top: '#07300a', bottom: '#2a8a1f', panel: 'rgba(2,28,4,.62)', text: '#eaffd0', accent: '#e8161b', accent2: '#b6ff3a', sel: '#ffffff', bulbs: ['#e8161b', '#b6ff3a', '#ffe14a'], particles: 'snow', pcolor: '#d8ffd0', scene: 'grinch', q: ['grinch christmas', 'green christmas lights'] },
    belen: { label: '🌟 Portal de Belén', title: '🌟 Portal de Belén TV 🌟', tagline: 'Una estrella guía tu mando a distancia.', top: '#050824', bottom: '#27337f', panel: 'rgba(8,10,40,.62)', text: '#fff3d6', accent: '#ffd34d', accent2: '#e9b872', sel: '#1a1030', bulbs: ['#ffd34d', '#ffb347', '#fff3c4'], particles: 'sparkle', pcolor: '#ffe9a0', scene: 'belen', q: ['nativity scene', 'bethlehem star christmas'] },
    santa: { label: '🎅 Santa Claus', title: '🎅 Santa Claus TV 🎅', tagline: '¡Jo, jo, jo! Hoy hay maratón de canales.', top: '#7a0a0a', bottom: '#d92222', panel: 'rgba(70,0,0,.62)', text: '#ffffff', accent: '#ffd24a', accent2: '#ffffff', sel: '#5a0000', bulbs: ['#ffffff', '#ffd24a', '#38c15a'], particles: 'snow', pcolor: '#ffffff', scene: 'santa', q: ['santa claus', 'red christmas'] },
    disney: { label: '🏰 Disney Navideño', title: '✨ Magia Navideña TV ✨', tagline: 'Donde los deseos de Navidad se hacen realidad.', top: '#0c1a5a', bottom: '#6a45d8', panel: 'rgba(12,16,70,.62)', text: '#ffffff', accent: '#ffd84a', accent2: '#8fd8ff', sel: '#10205a', bulbs: ['#ffd84a', '#8fd8ff', '#ff8fd0'], particles: 'sparkle', pcolor: '#ffffff', scene: 'disney', q: ['disneyland christmas', 'christmas castle snow'] },
    solo: { label: '🏠 Solo en casa', title: '🏠 Solo en Casa TV 🏠', tagline: 'Defiende tu salón… y tu mando a distancia.', top: '#140a07', bottom: '#6b3216', panel: 'rgba(30,14,8,.62)', text: '#ffe9c2', accent: '#ff9f1c', accent2: '#ffd98a', sel: '#2a1005', bulbs: ['#ff9f1c', '#ff3b3b', '#ffe14a', '#58c46a'], particles: 'snow', pcolor: '#fff6e0', scene: 'solo', q: ['snowy house christmas night', 'christmas house lights'] },
    gremlins: { label: '👹 Gremlins', title: '👹 Gremlins TV 👹', tagline: 'Nunca los mojes, no les des de comer… y disfruta la tele.', top: '#07101f', bottom: '#1e3a4a', panel: 'rgba(6,16,26,.62)', text: '#eaffea', accent: '#8ee05a', accent2: '#ffd34d', sel: '#07260a', bulbs: ['#e8161b', '#8ee05a', '#ffd34d', '#6cb6ff'], particles: 'snow', pcolor: '#ffffff', scene: 'gremlins', q: ['snowy small town christmas night', 'christmas village snow'] },
    halloween: { label: '🎃 Halloween', title: '🎃 Halloween TV 🎃', tagline: '¡Truco o trato! Hoy la tele da miedo.', top: '#0b0614', bottom: '#3a1a05', panel: 'rgba(16,6,24,.62)', text: '#ffe9d0', accent: '#ff7a1a', accent2: '#b36bff', sel: '#1a0a00', bulbs: ['#ff7a1a', '#b36bff', '#7dff4a', '#ff7a1a'], particles: 'sparkle', pcolor: '#ffb347', scene: 'halloween', q: ['halloween pumpkins night', 'haunted house night'] },
    futbol: { label: '⚽ Fútbol', title: '⚽ Portal de Fútbol ⚽', tagline: 'Aquí irán los partidos: lista M3U pendiente.', top: '#06310f', bottom: '#1c8a2f', panel: 'rgba(3,32,10,.62)', text: '#f2fff0', accent: '#ffd400', accent2: '#ffffff', sel: '#1a1a00', bulbs: ['#ffd400', '#ffffff', '#ff4040', '#40a0ff'], particles: 'sparkle', pcolor: '#ffffff', scene: 'futbol', q: ['football stadium night', 'soccer pitch'] },
    spain: { label: '🇪🇸 España', title: '🇪🇸 España TV 🇪🇸', tagline: 'Paella, fabada y la Guardia Civil vigilando tu tele.', top: '#3d0710', bottom: '#c98a10', panel: 'rgba(52,6,12,.62)', text: '#fff6e0', accent: '#ffc400', accent2: '#ffffff', sel: '#2a0a00', bulbs: ['#c60b1e', '#ffc400', '#c60b1e', '#ffffff'], particles: 'sparkle', pcolor: '#ffd34d', scene: 'spain', q: ['Plaza Mayor Madrid', 'spain flag'] },
    personal: { label: '🖼️ Personal', title: '🖼️ Mi Navidad TV 🖼️', tagline: 'Tu tema, tu imagen: escribe algo y búscalo.', top: '#101828', bottom: '#1d2b45', panel: 'rgba(8,12,24,.6)', text: '#ffffff', accent: '#ff5c5c', accent2: '#7dffb0', sel: '#ffffff', bulbs: ['#ff5c5c', '#7dffb0', '#ffe14a', '#6cb6ff'], particles: 'snow', pcolor: '#ffffff', scene: 'personal', q: [] },
  };

  // ------------------------------------------------------------------ lista de canales
  const PUBLIC_ES = 'https://iptv-org.github.io/iptv/countries/es.m3u';
  const DEFAULT_FAVS = ['la1', 'la2', 'antena3', 'telemadrid', 'laotra', 'cuatro', 'telecinco', 'lasexta', '24horas', 'trece', 'fdf'];
  const DEAD_URL = ['stmify.com', 'c21livecloud.com', '185.47.212.25', '38.252.238.18', 'digisat.ddns.net', '91.228.35.249'];
  const BC = 'https://players.brightcove.net/6416060453001/2rfYSrHC79_default/index.html?videoId=';
  const WEB = [
    ['Antena 3', 'https://www.atresplayer.com/directos/antena3/'], ['Cuatro', 'https://www.mediasetinfinity.es/directo/cuatro/'],
    ['Telecinco', 'https://www.mediasetinfinity.es/directo/telecinco/'], ['laSexta', 'https://www.atresplayer.com/directos/lasexta/'],
  ];
  const NATIONAL = [
    ['La 1', 'https://rtvelivestream.rtve.es/rtvesec/la1/la1_main_dvr.m3u8'], ['La 2', 'https://rtvelivestream.rtve.es/rtvesec/la2/la2_main.m3u8'],
    ['Antena 3', 'web:' + WEB[0][1]], ['Cuatro', 'web:' + WEB[1][1]], ['Telecinco', 'web:' + WEB[2][1]], ['laSexta', 'web:' + WEB[3][1]],
    ['24 Horas', 'https://ztnr.rtve.es/ztnr/1694255.m3u8'], ['Teledeporte', 'https://rtvelivestream.rtve.es/rtvesec/tdp/tdp_main_dvr.m3u8'],
    ['Clan', 'https://lge-lgla2.otteravision.com/lge/lgcla/lgcla.m3u8'], ['Trece', 'https://play.cdn.enetres.net/091DB7AFBD77442B9BA2F141DCC182F5021/live.smil/playlist.m3u8'],
    ['FDF', 'web:https://www.mediasetinfinity.es/directo/fdf/'],
    ['Telemadrid', 'web:' + BC + '6389770581112'], ['La Otra', 'web:' + BC + '6389770474112'], ['Telemadrid Internacional', 'web:' + BC + '6389768804112'],
    ['Neox', 'web:https://www.atresplayer.com/directos/neox/'], ['Nova', 'web:https://www.atresplayer.com/directos/nova/'],
    ['Mega', 'web:https://www.atresplayer.com/directos/mega/'], ['Atreseries', 'web:https://www.atresplayer.com/directos/atreseries/'],
    ['Energy', 'web:https://www.mediasetinfinity.es/directo/energy/'], ['Divinity', 'web:https://www.mediasetinfinity.es/directo/divinity/'],
    ['Be Mad', 'web:https://www.mediasetinfinity.es/directo/bemad/'], ['Boing', 'web:https://www.mediasetinfinity.es/directo/boing/'],
    ['TVE Star', 'https://rtvelivestream-rtveplayplus.rtve.es/rtvesec/int/star_main_576.m3u8'],
  ].map(([name, url]) => ({ name, group: 'TV Nacional', url, logo: '', tvgId: '', referrer: '', ua: '' }));

  function favKey(name) {
    let n = name.toLowerCase().replace(/[\[(].*?[\])]/g, ' ').replace(/[^a-z0-9áéíóúñü]+/g, '');
    return n.replace(/(uhd|fhd|hd|4k|sd)$/, '');
  }

  function parseM3U(text) {
    const out = []; let cur = null;
    for (let line of text.split(/\r\n|\r|\n/)) {
      line = line.trim(); if (!line) continue;
      if (line.startsWith('#EXTINF')) {
        const body = line.slice(8); let q = false, comma = -1;
        for (let i = 0; i < body.length; i++) { const ch = body[i]; if (ch === '"') q = !q; else if (ch === ',' && !q) { comma = i; break; } }
        const head = comma >= 0 ? body.slice(0, comma) : body, attrs = {};
        head.replace(/([\w-]+)="([^"]*)"/g, (_, k, v) => { attrs[k] = v; return ''; });
        const name = (comma >= 0 ? body.slice(comma + 1).trim() : '') || attrs['tvg-name'] || 'Sin nombre';
        cur = { name, group: (attrs['group-title'] || '').trim() || 'Sin grupo', logo: attrs['tvg-logo'] || '', tvgId: attrs['tvg-id'] || '', referrer: attrs['http-referrer'] || '', ua: attrs['http-user-agent'] || '', url: '' };
      } else if (line.startsWith('#EXTGRP:') && cur) { if (cur.group === 'Sin grupo') cur.group = line.slice(8).trim() || 'Sin grupo'; }
      else if (line.startsWith('#EXTVLCOPT:') && cur) {
        const i = line.indexOf('='), k = line.slice(11, i).trim().toLowerCase(), v = line.slice(i + 1).trim();
        if (k === 'http-referrer') cur.referrer = v; else if (k === 'http-user-agent') cur.ua = v;
      } else if (line.startsWith('#')) continue;
      else if (cur) { cur.url = line; out.push(cur); cur = null; }
    }
    return out;
  }

  const MOVIE_RE = /pel[ií]cula|movie|film|cine|vod|estreno/i;
  const JUNK_RE = /\b(HD|FHD|UHD|4K|8K|SD|HDR|1080p|720p|480p|2160p|BluRay|BRRip|BDRip|DVDRip|WEB-?DL|WEB-?Rip|HDTV|x264|x265|h\.?264|h\.?265|HEVC|AC3|Latino|Castellano|Subtitulado|VOSE|DUAL|MULTI)\b/gi;
  function cleanMovie(name) {
    let n = name.split('@')[0];
    n = n.replace(/[\[\(\{<][^\]\)\}>]*[\]\)\}>]/g, ' ').replace(/https?:\/\/\S+|www\.\S+/g, ' ').replace(JUNK_RE, ' ').replace(/['’`]/g, '');
    const words = n.match(/[\p{L}\p{N}]+/gu) || [];
    const out = words.map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join('_');
    return out || name;
  }

  let channels = [], current = -1, hls = null, webOpen = false, portalOn = false;
  const state = {
    theme: LS.get('nv_theme', 'grinch'), portal: LS.get('nv_portal', 'tv'), favs: null, paused: LS.get('nv_paused', false),
    grinch: LS.get('nv_grinch', false), clean: LS.get('nv_clean', false), group: LS.get('nv_portal', 'tv') === 'tv' ? '__fav__' : '__all__',
  };
  function favStore() { return state.portal === 'tv' ? 'nv_favs' : state.portal === 'spain' ? 'nv_favs_spain' : 'nv_favs_futbol'; }
  function pk(name) { return state.portal === 'tv' ? name : name + '_fut'; }
  state.favs = LS.get(favStore(), null);
  if (!state.favs) { state.favs = state.portal === 'tv' ? DEFAULT_FAVS.slice() : []; LS.set(favStore(), state.favs); }
  if (state.portal === 'tv' && !LS.get('nv_favs_laotra', false)) {   // La Otra, tras Telemadrid
    if (!state.favs.includes('laotra')) { const i = state.favs.indexOf('telemadrid'); state.favs.splice(i >= 0 ? i + 1 : state.favs.length, 0, 'laotra'); LS.set(favStore(), state.favs); }
    LS.set('nv_favs_laotra', true);
  }

  // ---- listas propias (archivos o direcciones): se SUMAN a los canales del portal ----
  const memTxt = {};
  function sources() { return LS.get(pk('nv_sources'), []); }
  function saveSources(l) { LS.set(pk('nv_sources'), l); }
  function srcText(id) { return memTxt[id] !== undefined ? memTxt[id] : LS.get('nv_srctxt_' + id, ''); }
  function saveSrcText(id, text) {
    memTxt[id] = text;
    try { localStorage.setItem('nv_srctxt_' + id, JSON.stringify(text)); return true; }
    catch (e) { try { localStorage.removeItem('nv_srctxt_' + id); } catch (e2) { } return false; }
  }
  function dropSrcText(id) { delete memTxt[id]; try { localStorage.removeItem('nv_srctxt_' + id); } catch (e) { } }
  function newId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function pubCache() { return state.portal === 'tv' ? LS.get('nv_m3u_cache', '') : ''; }
  function migrateSources() {            // antes solo existía una lista propia (nv_custom_url)
    if (LS.get(pk('nv_sources_migrated'), false)) return;
    LS.set(pk('nv_sources_migrated'), true);
    const old = LS.get(pk('nv_custom_url'), '');
    if (!old) return;
    const id = newId();
    if (old.startsWith('file:')) { const t = LS.get(pk('nv_m3u_cache'), ''); if (!t) return; saveSrcText(id, t); saveSources([{ id, kind: 'file', name: old.slice(5) }]); }
    else saveSources([{ id, kind: 'url', name: old, url: old }]);
  }

  let futText = '';   // contenido de futbol.m3u (empaquetado en la app; lo usan Fútbol y Spain)
  function buildChannels(pubText) {
    let list = [];
    if (state.portal === 'tv') {
      const mine = new Set(NATIONAL.map(c => favKey(c.name)));
      const extra = pubText ? parseM3U(pubText).filter(c => !DEAD_URL.some(d => c.url.includes(d)) && !mine.has(favKey(c.name))) : [];
      list = NATIONAL.map(c => ({ ...c })).concat(extra.map(c => ({ ...c })));
    }
    if (state.portal !== 'tv' && futText) parseM3U(futText).forEach(c => list.push({ ...c, mine: true, src: 'futbol.m3u' }));
    sources().forEach(src => parseM3U(srcText(src.id)).forEach(c => list.push({ ...c, mine: true, src: src.name })));
    if (state.clean) list.forEach(c => { if (MOVIE_RE.test(c.group)) c.name = cleanMovie(c.name); });
    return list;
  }

  function refreshChannels() { channels = buildChannels(pubCache()); renderGroups(); renderList(); }

  async function loadChannels(force) {
    migrateSources();
    const tv = state.portal === 'tv', srcs = sources();
    let pub = pubCache();
    if (!tv) { try { const r = await fetch('futbol.m3u', { cache: 'no-store' }); futText = r.ok ? await r.text() : ''; } catch (e) { futText = ''; } }
    refreshChannels();
    if (!tv && !srcs.length && !parseM3U(futText).length) { status((state.portal === 'spain' ? '🇪🇸 Portal Spain' : '⚽ Portal de fútbol') + ': aún sin canales. Carga tu lista M3U en ⚙ Ajustes (o rellena futbol.m3u).'); return; }
    if (!force && channels.length) status('⏳ ' + channels.length + ' canales (guardados). Actualizando…');
    const problems = [];
    if (tv) {
      try {
        const r = await fetch(PUBLIC_ES, { cache: 'no-store' }); if (!r.ok) throw new Error('HTTP ' + r.status);
        pub = await r.text(); LS.set('nv_m3u_cache', pub.length < 4e6 ? pub : '');
      } catch (e) { problems.push(pub ? 'lista pública (se usa la guardada)' : 'lista pública'); }
    }
    for (const src of srcs.filter(x => x.kind === 'url')) {
      try {
        const r = await fetch(src.url, { cache: 'no-store' }); if (!r.ok) throw new Error('HTTP ' + r.status);
        const t = await r.text(); if (!parseM3U(t).length) throw new Error('sin canales'); saveSrcText(src.id, t);
      } catch (e) { problems.push('«' + src.name + '»: ' + e.message); }
    }
    channels = buildChannels(pub); renderGroups(); renderList();
    const mineN = channels.filter(c => c.mine).length;
    status('✅ ' + channels.length + ' canales' + (mineN ? ' (' + mineN + ' de tus listas, en «📥 Mis listas»)' : '') + (problems.length ? ' · ⚠ no se pudo actualizar: ' + problems.join('; ') : '.'));
  }

  // ------------------------------------------------------------------ favoritos y lista
  function favPos(c) { const k = favKey(c.name); let best = -1; state.favs.forEach((f, i) => { if ((f === k || f === c.url) && best < 0) best = i; }); return best; }
  function isFav(c) { return favPos(c) >= 0; }
  function toggleFav(c) {
    const k = favKey(c.name);
    if (isFav(c)) state.favs = state.favs.filter(f => f !== k && f !== c.url); else state.favs.push(k);
    LS.set(favStore(), state.favs);
  }

  function renderGroups() {
    const sel = $('groupSel'), prev = state.group;
    const groups = [...new Set(channels.map(c => c.group))].sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
    const hasMine = channels.some(c => c.mine);
    sel.innerHTML = '<option value="__fav__">★ Favoritos</option><option value="__all__">📺 Todos</option>' + (hasMine ? '<option value="__mine__">📥 Mis listas</option>' : '') + groups.map(g => `<option value="${g.replace(/"/g, '&quot;')}">${g.replace(/</g, '&lt;')}</option>`).join('');
    sel.value = [...sel.options].some(o => o.value === prev) ? prev : (state.portal === 'tv' ? '__fav__' : '__all__'); state.group = sel.value;
  }

  let visible = [];
  function renderList() {
    const g = state.group, q = $('search').value.trim().toLowerCase();
    let rows = [], seen = new Set();
    channels.forEach((c, i) => {
      const pos = favPos(c);
      if (g === '__fav__') { if (pos < 0) return; const k = favKey(c.name); if (seen.has(k)) return; seen.add(k); }
      else if (g === '__mine__') { if (!c.mine) return; }
      else if (g !== '__all__' && c.group !== g) return;
      if (q && !c.name.toLowerCase().includes(q)) return;
      rows.push({ i, pos, c });
    });
    if (g === '__fav__') rows.sort((a, b) => a.pos - b.pos || a.i - b.i);
    visible = rows.map(r => r.i);
    const list = $('list'); list.innerHTML = '';
    const frag = document.createDocumentFragment();
    rows.slice(0, 600).forEach(({ i, pos, c }) => {
      const d = document.createElement('div'); d.className = 'ch' + (i === current ? ' cur' : ''); d.dataset.i = i;
      d.innerHTML = '<div class="name" role="button" tabindex="0"></div><div class="fav" role="button" tabindex="0" aria-label="Favorito"></div><div class="max" role="button" tabindex="0" aria-label="Ver en pantalla completa">⛶</div><div class="mute" role="button" tabindex="0" aria-label="Silenciar este canal">' + (muted && i === current ? '🔇' : '🔊') + '</div>';
      d.children[0].textContent = c.name + (c.url.startsWith('web:') ? '  🌐' : '');
      const f = d.children[1]; f.textContent = '★'; if (pos >= 0) f.classList.add('on');
      frag.appendChild(d);
    });
    list.appendChild(frag);
    $('count').textContent = rows.length + ' de ' + channels.length + ' canales' + (rows.length > 600 ? ' (se muestran 600; usa el buscador)' : '');
  }

  $('list').addEventListener('click', (e) => {
    const row = e.target.closest('.ch'); if (!row) return;
    const i = +row.dataset.i;
    if (e.target.classList.contains('fav')) {
      toggleFav(channels[i]); renderList();
      const again = document.querySelector('#list .ch[data-i="' + i + '"] .fav'); if (again) again.focus();   // el mando no pierde la posición
      return;
    }
    if (e.target.classList.contains('mute')) {
      if (i !== current) play(i);
      muted = i === current && !muted ? true : !muted; applyMute();
      const again = document.querySelector('#list .ch[data-i="' + i + '"] .mute'); if (again) again.focus();
      return;
    }
    if (e.target.classList.contains('max')) { play(i); if (!document.body.classList.contains('full')) setFull(true); return; }
    play(i);
  });
  $('groupSel').addEventListener('change', (e) => { state.group = e.target.value; renderList(); });
  $('search').addEventListener('input', renderList);

  // ------------------------------------------------------------------ reproducción
  function status(t) { $('status').textContent = t; }
  function vmsg(t) { $('vmsg').textContent = t || ''; }

  function stopAll() {
    if (hls) { try { hls.destroy(); } catch (e) { } hls = null; }
    const v = $('video'); try { v.pause(); v.removeAttribute('src'); v.load(); } catch (e) { }
    if (webOpen && NATIVE) { try { NATIVE.closeWeb(); } catch (e) { } }
    webOpen = false; $('video').style.visibility = 'visible';
    setTimeout(perf, 0);
  }

  function rect() {
    const r = $('videoBox').getBoundingClientRect(), d = window.devicePixelRatio || 1;
    return [Math.round(r.left * d), Math.round(r.top * d), Math.round(r.width * d), Math.round(r.height * d)];
  }
  function syncWeb() { if (webOpen && NATIVE) { const r = portalOn ? [0, 0, 1, 1] : rect(); try { NATIVE.moveWeb(r[0], r[1], r[2], r[3]); } catch (e) { } } }

  function play(i) {
    showNativity(false);
    if (i == null || i < 0 || !channels[i]) return;
    const c = channels[i];
    if (i === current && Date.now() - (play.t || 0) < 1200) return;
    play.t = Date.now(); current = i;
    $('chname').textContent = c.name; $('fname').textContent = c.name; showUi(); setTimeout(perf, 0);
    document.querySelectorAll('.ch.cur').forEach(n => n.classList.remove('cur'));
    const row = document.querySelector(`.ch[data-i="${i}"]`); if (row) row.classList.add('cur');
    stopAll(); vmsg('');
    if (c.url.startsWith('web:')) { openWeb(c); return; }
    if (NATIVE) { try { NATIVE.setHeaders(c.referrer || '', c.ua || ''); } catch (e) { } }
    const v = $('video'); v.volume = sysVol ? 1 : $('vol').value / 100; v.muted = muted;
    if (!/\.m3u8?(\?|$)/i.test(c.url) && !/m3u8/i.test(c.url)) { vmsg('⚠ Formato no compatible con el móvil'); status('⚠ «' + c.name + '»: formato no compatible.'); return; }
    status('⏳ Conectando con «' + c.name + '»…'); vmsg('⏳');
    if (window.Hls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, maxBufferLength: 24, manifestLoadingMaxRetry: 2, levelLoadingMaxRetry: 2, fragLoadingMaxRetry: 3 });
      hls.on(Hls.Events.MANIFEST_PARSED, () => { v.play().catch(() => { }); });
      hls.on(Hls.Events.FRAG_LOADED, () => { vmsg(''); status('▶ ' + c.name); });
      hls.on(Hls.Events.ERROR, (ev, d) => {
        if (!d.fatal) return;
        if (d.type === Hls.ErrorTypes.NETWORK_ERROR && d.details !== 'manifestLoadError') { try { hls.startLoad(); return; } catch (e) { } }
        if (d.type === Hls.ErrorTypes.MEDIA_ERROR) { try { hls.recoverMediaError(); return; } catch (e) { } }
        vmsg('⚠ No se pudo reproducir'); status('⚠ «' + c.name + '»: ' + d.details + '. Puede estar caído o bloqueado; prueba otro canal.');
      });
      hls.loadSource(c.url); hls.attachMedia(v);
    } else if (v.canPlayType('application/vnd.apple.mpegurl')) { v.src = c.url; v.play().catch(() => { }); }
    else { vmsg('⚠ Este móvil no admite HLS'); }
  }

  function openWeb(c) {
    const url = c.url.slice(4);
    $('video').style.visibility = 'hidden';
    if (NATIVE) {
      const r = rect(); try { if (NATIVE.setWebMuted) NATIVE.setWebMuted(muted); NATIVE.openWeb(url, r[0], r[1], r[2], r[3]); webOpen = true; } catch (e) { webOpen = false; }
      status('🌐 «' + c.name + '» se muestra desde su web oficial. Si pide cookies o sesión, acéptalo una vez.');
      vmsg('⏳');
    } else { window.open(url, '_blank'); status('🌐 «' + c.name + '» abierto en el navegador.'); vmsg(''); }
  }

  function zap(d) {
    if (!visible.length) return;
    let p = visible.indexOf(current); p = p < 0 ? 0 : (p + d + visible.length) % visible.length; play(visible[p]);
  }

  let muted = false;
  $('bPrev').onclick = () => zap(-1);
  $('bNext').onclick = () => zap(1);
  $('bPlay').onclick = () => {
    if (webOpen) { if (NATIVE && NATIVE.webPlayPause) { try { NATIVE.webPlayPause(); } catch (e) { } } return; }   // canal web: play/pausa dentro de su página
    const v = $('video'); if (v.paused) v.play().catch(() => { }); else v.pause();
  };
  // silencio: vale para canales locales (vídeo) y web (la app nativa silencia los <video> de la página)
  function applyMute() {
    $('video').muted = muted; $('bMute').textContent = muted ? '🔇' : '🔊';
    if (NATIVE && NATIVE.setWebMuted) { try { NATIVE.setWebMuted(muted); } catch (e) { } }
    document.querySelectorAll('#list .ch').forEach(r => { const b = r.querySelector('.mute'); if (b) b.textContent = (muted && +r.dataset.i === current) ? '🔇' : '🔊'; });
  }
  $('bMute').onclick = () => { muted = !muted; applyMute(); };
  // volumen: en la APK se usa el volumen del sistema (vale para canales locales y web); si el equipo lo tiene fijo, el del vídeo/web
  let sysVol = false;
  function setVol(n) {
    n = Math.max(0, Math.min(100, Math.round(n)));
    $('vol').value = n; LS.set('nv_vol', n);
    let ok = false;
    if (NATIVE && NATIVE.setVolume) { try { ok = !!NATIVE.setVolume(n); } catch (e) { ok = false; } }
    sysVol = ok;
    $('video').volume = ok ? 1 : n / 100;
    if (!ok && NATIVE && NATIVE.setWebVolume) { try { NATIVE.setWebVolume(n); } catch (e) { } }
  }
  $('vol').oninput = (e) => setVol(+e.target.value);
  $('vol').value = LS.get('nv_vol', 80);
  if (NATIVE && NATIVE.getVolume) {
    try { const g = NATIVE.getVolume(); if (g >= 0) { $('vol').value = g; sysVol = true; } } catch (e) { }
    setInterval(() => { try { if (!sysVol || document.activeElement === $('vol')) return; const g = NATIVE.getVolume(); if (g >= 0 && Math.abs(g - +$('vol').value) > 1) $('vol').value = g; } catch (e) { } }, 1500);   // botones del mando/móvil
  }
  $('video').addEventListener('playing', () => { vmsg(''); });
  $('video').addEventListener('waiting', () => { if (current >= 0 && !webOpen) vmsg('⏳'); });

  // Pantalla completa en emisiones locales: controles que se ocultan solos, toque = mostrar/ocultar, deslizar = cambiar de canal
  let uiTimer = 0, vTimer = 0;
  function showUi() {
    document.body.classList.remove('hide-ui');
    clearTimeout(uiTimer);
    if (document.body.classList.contains('full') && !webOpen) uiTimer = setTimeout(() => document.body.classList.add('hide-ui'), 3000);
  }
  (function () {
    const box = $('videoBox'); let x0 = 0, y0 = 0, t0 = 0, moved = false;
    box.addEventListener('touchstart', (e) => { const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; t0 = Date.now(); moved = false; }, { passive: true });
    let v0 = 0, vert = false;
    box.addEventListener('touchstart', () => { v0 = +$('vol').value; vert = false; }, { passive: true });
    box.addEventListener('touchmove', (e) => {
      if (webOpen) return;
      const t = e.touches[0], dx = t.clientX - x0, dy = t.clientY - y0;
      if (!vert && Math.abs(dy) > 18 && Math.abs(dy) > Math.abs(dx) * 1.3) vert = true;
      if (!vert) return;
      e.preventDefault();
      const nv = Math.max(0, Math.min(100, Math.round(v0 - dy / (window.innerHeight * 0.7) * 100)));
      setVol(nv);
      if (nv > 0 && muted) { muted = false; applyMute(); }
      vmsg('🔊 ' + nv + '%'); clearTimeout(vTimer); vTimer = setTimeout(() => vmsg(''), 900);
    }, { passive: false });
    box.addEventListener('touchend', (e) => {
      if (webOpen) return;
      if (vert) { vert = false; return; }
      const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - t0 < 700) { zap(dx < 0 ? 1 : -1); showUi(); return; }
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12 && document.body.classList.contains('full')) {
        if (document.body.classList.contains('hide-ui')) showUi();
        else { document.body.classList.add('hide-ui'); clearTimeout(uiTimer); }
      }
    }, { passive: true });
    $('ctl').addEventListener('touchstart', showUi, { passive: true });
    $('ctl').addEventListener('input', showUi);
    $('ctl').addEventListener('click', showUi);
  })();

  function perf() {
    const pip = document.body.classList.contains('pip');
    Decor.setPerf(current >= 0 ? 100 : 33, pip || (document.body.classList.contains('full') && !webOpen && current >= 0));
    if (NATIVE && NATIVE.setPipOk) { try { NATIVE.setPipOk(current >= 0); } catch (e) { } }   // solo se minimiza a ventana pequeña si hay un canal en marcha
  }
  // ventana pequeña (imagen en imagen): solo el vídeo
  window.nvPip = (on) => {
    document.body.classList.toggle('pip', !!on); perf();
    requestAnimationFrame(() => requestAnimationFrame(syncWeb)); setTimeout(syncWeb, 300); setTimeout(syncWeb, 800);
  };
  // gestos recibidos desde la web nativa del canal (arriba/abajo = volumen, lados = canal)
  window.nvSwipe = (kind, v) => {
    if (kind === 'vol') { const nv = Math.max(0, Math.min(100, +$('vol').value + v)); setVol(nv); if (NATIVE && NATIVE.toast) { try { NATIVE.toast('🔊 ' + nv + '%'); } catch (e) { } } }
    else if (kind === 'zap') zap(v);
  };
  function setFull(on) {
    document.body.classList.toggle('full', on);
    perf();
    showUi();
    if (NATIVE && NATIVE.fullscreen) { try { NATIVE.fullscreen(on); } catch (e) { } }   // horizontal + barras ocultas
    requestAnimationFrame(() => requestAnimationFrame(syncWeb)); setTimeout(syncWeb, 350);
  }
  window.nvExitFull = () => setFull(false);   // lo llama el botón nativo «Salir» sobre las webs
  $('bFull').onclick = () => setFull(!document.body.classList.contains('full'));
  $('btnExitFull').onclick = () => setFull(false);
  window.addEventListener('resize', () => setTimeout(syncWeb, 120));
  window.addEventListener('orientationchange', () => setTimeout(syncWeb, 400));
  if (window.ResizeObserver) new ResizeObserver(syncWeb).observe($('videoBox'));

  // ------------------------------------------------------------------ temas y botones
  // Portal de Belén: en ese tema la pantalla del vídeo muestra el nacimiento hasta que se toca o se elige un canal
  function showNativity(on) {
    on = !!on && state.theme === 'belen' && !document.body.classList.contains('full');
    portalOn = on; window.Portal && window.Portal.show(on);
    $('btnNat').classList.toggle('on', on);
    requestAnimationFrame(syncWeb);
  }
  function applyTheme(key) {
    if (!THEMES[key]) key = 'grinch';
    state.theme = key; LS.set('nv_theme', key);
    $('btnNat').hidden = key !== 'belen'; showNativity(key === 'belen');
    const t = THEMES[key], r = document.documentElement.style;
    r.setProperty('--top', t.top); r.setProperty('--bottom', t.bottom); r.setProperty('--panel', t.panel); r.setProperty('--text', t.text);
    r.setProperty('--accent', t.accent); r.setProperty('--accent2', t.accent2); r.setProperty('--sel', t.sel);
    document.querySelector('meta[name=theme-color]').setAttribute('content', t.top);
    $('title').textContent = t.title; $('tagline').textContent = t.tagline; $('themeSel').value = key;
    $('bgq').value = LS.get('nv_bgq_' + key, t.q[0] || '');
    Decor.setTheme(key, t); Decor.setBgImage(null);
    const saved = LS.get('nv_bgurl_' + key, '');
    if (saved) loadImg(saved).then(im => { if (state.theme === key) Decor.setBgImage(im); }).catch(() => findBg(key, t.q, true));
    else if (t.q.length) findBg(key, t.q, true);
  }

  function loadImg(url) {
    return new Promise((ok, ko) => {
      const im = new Image(); const to = setTimeout(() => ko(new Error('timeout')), 15000);
      im.onload = () => { clearTimeout(to); ok(im); }; im.onerror = () => { clearTimeout(to); ko(new Error('img')); }; im.src = url;
    });
  }
  async function getJson(url) {
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 12000);
    try { const r = await fetch(url, { signal: ctl.signal }); if (!r.ok) throw new Error(r.status); return await r.json(); } finally { clearTimeout(to); }
  }
  // candidatas por orden de relevancia: Wikimedia Commons (fiable, con CORS) y Openverse como alternativa
  async function bgCandidates(q) {
    const out = [];
    try {
      const j = await getJson('https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrlimit=12&gsrsearch=' + encodeURIComponent(q + ' filetype:bitmap') +
        '&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1600&format=json&origin=*');
      const pages = Object.values((j.query || {}).pages || {}).sort((a, b) => a.index - b.index);
      const infos = pages.map(p => (p.imageinfo || [])[0]).filter(i => i && /^image\/(jpeg|png|webp)/.test(i.mime || '') && i.thumburl);
      const land = infos.filter(i => i.width >= i.height * 1.2 && i.width >= 800), rest = infos.filter(i => !land.includes(i));
      land.concat(rest).forEach(i => out.push(i.thumburl));
    } catch (e) { /* siguiente fuente */ }
    try {
      const j = await getJson('https://api.openverse.org/v1/images/?page_size=12&q=' + encodeURIComponent(q));
      (j.results || []).forEach(it => { if (it.thumbnail) out.push(it.thumbnail); if (it.url) out.push(it.url); });
    } catch (e) { /* sin red */ }
    return out;
  }
  async function findBg(key, queries, auto) {
    for (const q of queries) {
      const cands = await bgCandidates(q);
      for (const u of cands.slice(0, 12)) {
        try { const im = await loadImg(u); LS.set('nv_bgurl_' + key, u); if (state.theme === key) Decor.setBgImage(im); if (!auto) status('✅ Imagen de fondo aplicada.'); return; } catch (e) { /* siguiente */ }
      }
    }
    if (!auto) status('⚠ No encontré imágenes para «' + queries[0] + '». Revisa la conexión o prueba otra búsqueda.');
  }

  $('themeSel').innerHTML = Object.entries(THEMES).map(([k, t]) => `<option value="${k}">${t.label}</option>`).join('');
  $('themeSel').onchange = (e) => applyTheme(e.target.value);

  function setAnim(on, quiet) {
    state.paused = on; LS.set('nv_paused', on); Decor.setPaused(on);
    const b = $('btnAnim'); b.textContent = on ? '▶ Reanudar animación' : '⏸ Parar animación'; b.classList.toggle('on', on);
  }
  function setGrinch(on, quiet) {
    state.grinch = on; LS.set('nv_grinch', on); Decor.setGrinch(on);
    const b = $('btnGrinch'); b.textContent = on ? '🎄 Devolver la decoración' : '💚 Grinch: quitar decoración'; b.classList.toggle('on', on);
    if (!quiet) status(on ? '💚 ¡El Grinch se ha llevado la decoración!' : '🎄 La decoración ha vuelto.');
  }
  const PORTAL_THEME = { futbol: 'futbol', spain: 'spain' };
  function portalBtns() {
    $('btnFut').textContent = state.portal === 'futbol' ? '📺 TV' : '⚽ Fútbol';
    $('btnSpa').textContent = state.portal === 'spain' ? '📺 TV' : '🇪🇸 Spain';
  }
  function setPortal(p) {
    stopAll(); current = -1; $('chname').textContent = 'Elige un canal'; vmsg('');
    if (document.body.classList.contains('full')) setFull(false);
    state.portal = p; LS.set('nv_portal', p); state.group = p === 'tv' ? '__fav__' : '__all__';
    state.favs = LS.get(favStore(), null);
    if (!state.favs) { state.favs = p === 'tv' ? DEFAULT_FAVS.slice() : []; LS.set(favStore(), state.favs); }
    portalBtns();
    const isPT = Object.values(PORTAL_THEME).includes(state.theme);
    if (PORTAL_THEME[p]) { if (!isPT) LS.set('nv_theme_before_fut', state.theme); applyTheme(PORTAL_THEME[p]); }
    else if (isPT) { let back = LS.get('nv_theme_before_fut', 'grinch'); if (Object.values(PORTAL_THEME).includes(back) || !THEMES[back]) back = 'grinch'; applyTheme(back); }
    $('search').value = ''; loadChannels(false);
  }
  $('btnFut').onclick = () => setPortal(state.portal === 'futbol' ? 'tv' : 'futbol');
  function setBgMode(on) {
    document.body.classList.toggle('bgmode', on); LS.set('nv_bgmode', on); $('btnBg').classList.toggle('on', on);
    $('btnBg').textContent = on ? '📋 Lista' : '🖼 Fondo';
    requestAnimationFrame(() => requestAnimationFrame(syncWeb)); setTimeout(syncWeb, 350);
  }
  $('btnBg').onclick = () => setBgMode(!document.body.classList.contains('bgmode'));
  if (window.Portal) { window.Portal.mount($('portal')); showNativity(state.theme === 'belen'); }
  $('portal').onclick = () => showNativity(false);                                   // tocar el portal -> aparece el canal
  $('btnNat').onclick = () => showNativity(!portalOn);
  $('video').addEventListener('click', () => { if (state.theme === 'belen' && !document.body.classList.contains('full') && !portalOn) showNativity(true); });   // tocar el canal -> vuelve el portal
  // apps de streaming: se abren si están instaladas; si no, ficha de Play Store
  const APPS = {
    appNetflix: ['Netflix', 'com.netflix.mediaclient,com.netflix.ninja', 'com.netflix.mediaclient', 'com.netflix.ninja', 'https://www.netflix.com'],
    appDisney: ['Disney+', 'com.disney.disneyplus', 'com.disney.disneyplus', 'com.disney.disneyplus', 'https://www.disneyplus.com'],
    appHbo: ['HBO Max', 'com.wbd.stream,com.hbo.hbonow', 'com.wbd.stream', 'com.wbd.stream', 'https://www.max.com'],
    appPrime: ['Prime Video', 'com.amazon.avod.thirdpartyclient,com.amazon.amazonvideo.livingroom', 'com.amazon.avod.thirdpartyclient', 'com.amazon.amazonvideo.livingroom', 'https://www.primevideo.com'],
    appSkype: ['Skype', 'com.skype.raider', 'com.skype.raider', 'com.skype.raider', 'https://web.skype.com'],
    appPlex: ['Plex', 'com.plexapp.android', 'com.plexapp.android', 'com.plexapp.android', 'https://app.plex.tv'],
  };
  Object.keys(APPS).forEach(id => {
    $(id).onclick = () => {
      const [name, pk, sp, st, web] = APPS[id]; let ok = false;
      if (!NATIVE) { window.open(web, '_blank'); status('🌐 Abriendo ' + name + '…'); return; }   // iPhone / navegador: su web (o su app si el móvil la enlaza)
      try { ok = !!(NATIVE && NATIVE.openApps && NATIVE.openApps(pk, sp, st)); } catch (e) { ok = false; }
      status(ok ? '▶ Abriendo ' + name + '…' : (NATIVE ? '⬇ ' + name + ' no está instalada: te llevo a Google Play para instalarla.' : '⚠ ' + name + ': solo disponible en la app de Android.'));
    };
  });
  if (LS.get('nv_bgmode', false)) setBgMode(true);
  $('btnSpa').onclick = () => setPortal(state.portal === 'spain' ? 'tv' : 'spain');
  $('btnYt').onclick = () => {
    let ok = false;
    try { ok = !!(NATIVE && NATIVE.openApp && NATIVE.openApp('com.jlflashcon.app')); } catch (e) { ok = false; }
    status(ok ? '▶ Abriendo jlflashcon (YouTube sin anuncios)…' : '⚠ jlflashcon no está instalada en este móvil: instala su APK (jlflashcon_v3.apk).');
  };
  portalBtns();
  $('btnAnim').onclick = () => setAnim(!state.paused);
  $('btnGrinch').onclick = () => setGrinch(!state.grinch);

  // ------------------------------------------------------------------ ajustes
  const sheet = $('sheet');
  function openSheet(on) { sheet.hidden = !on; if (webOpen && NATIVE) { try { on ? NATIVE.moveWeb(0, 0, 1, 1) : syncWeb(); } catch (e) { } } }
  $('btnCfg').onclick = () => { srcListUI(); openSheet(true); };
  $('cfgClose').onclick = () => openSheet(false);
  sheet.addEventListener('click', (e) => { if (e.target === sheet) openSheet(false); });
  $('bgGo').onclick = () => { const q = $('bgq').value.trim(); if (q) { LS.set('nv_bgq_' + state.theme, q); status('⏳ Buscando imagen de «' + q + '»…'); findBg(state.theme, [q], false); openSheet(false); } };
  $('cfgReload').onclick = () => { openSheet(false); loadChannels(true); };
  // ---- ajustes: añadir archivos o direcciones M3U (se suman; se pueden quitar) ----
  function srcListUI() {
    const box = $('srcList'); box.innerHTML = '';
    const l = sources();
    if (!l.length) { box.textContent = state.portal === 'tv' ? 'Aún no has añadido listas propias (se usan los canales de España).' : 'Aún no has añadido listas: este portal está vacío (rellena futbol.m3u o carga una lista).'; return; }
    l.forEach(src => {
      const n = parseM3U(srcText(src.id)).length;
      const row = document.createElement('div'); row.className = 'srcRow';
      const sp = document.createElement('span'); sp.textContent = (src.kind === 'file' ? '📁 ' : '🔗 ') + src.name + ' · ' + n + ' canales';
      const bt = document.createElement('button'); bt.textContent = '✕'; bt.setAttribute('aria-label', 'Quitar lista');
      bt.onclick = () => { saveSources(sources().filter(x => x.id !== src.id)); dropSrcText(src.id); refreshChannels(); srcListUI(); status('Lista «' + src.name + '» quitada.'); };
      row.appendChild(sp); row.appendChild(bt); box.appendChild(row);
    });
  }
  function showMine() { state.group = '__mine__'; refreshChannels(); $('groupSel').value = state.group; }

  $('cfgFile').onclick = () => { $('m3uFile').value = ''; $('m3uFile').click(); };
  $('m3uFile').onchange = (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onerror = () => status('⚠ No se pudo leer el archivo «' + f.name + '».');
    rd.onload = () => {
      const text = String(rd.result || '').replace(/^\uFEFF/, ''), n = parseM3U(text).length;
      if (!n) { status('⚠ «' + f.name + '» no tiene canales: no es una lista M3U con entradas #EXTINF y direcciones.'); return; }
      const keep = sources().filter(x => { const same = x.kind === 'file' && x.name === f.name; if (same) dropSrcText(x.id); return !same; });
      const id = newId(), saved = saveSrcText(id, text);
      keep.push({ id, kind: 'file', name: f.name }); saveSources(keep);
      openSheet(false); showMine();
      status('✅ ' + n + ' canales añadidos del archivo «' + f.name + '» (grupo «📥 Mis listas»)' + (saved ? '.' : ' · no caben en la memoria de la app: solo hasta que la cierres.'));
    };
    rd.readAsText(f);
  };
  $('m3uGo').onclick = () => {
    const url = $('m3uUrl').value.trim();
    if (!/^https?:\/\//i.test(url)) { status('⚠ Escribe una dirección que empiece por http:// o https://'); return; }
    const l = sources();
    if (!l.some(x => x.kind === 'url' && x.url === url)) { l.push({ id: newId(), kind: 'url', name: url, url }); saveSources(l); }
    $('m3uUrl').value = ''; openSheet(false); state.group = '__mine__'; status('⏳ Descargando la lista…'); loadChannels(true);
  };
  $('cfgClean').checked = state.clean;
  $('cfgClean').onchange = (e) => { state.clean = e.target.checked; LS.set('nv_clean', state.clean); refreshChannels(); status(state.clean ? '🧹 Nombres de películas limpiados.' : 'Nombres originales restaurados.'); };
  $('cfgFavs').onclick = () => { state.favs = state.portal === 'tv' ? DEFAULT_FAVS.slice() : []; LS.set(favStore(), state.favs); renderList(); openSheet(false); status(state.portal === 'tv' ? '★ Favoritos iniciales restaurados.' : '★ Favoritos de este portal vaciados.'); };

  // botón «atrás» de Android
  try {
    const App = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
    if (App) App.addListener('backButton', () => {
      if (!sheet.hidden) return openSheet(false);
      if (document.body.classList.contains('full')) return setFull(false);
      if (webOpen) { stopAll(); current = -1; $('chname').textContent = 'Elige un canal'; renderList(); return; }
      App.minimizeApp && App.minimizeApp();
    });
  } catch (e) { /* ejecutándose fuera de Capacitor */ }

  // ------------------------------------------------------------------ arranque
  Decor.init($('bg'), $('fx'));
  applyTheme(state.theme);
  setAnim(state.paused); setGrinch(state.grinch, true);
  loadChannels(false);
  // parámetros de depuración: ?theme=gremlins&ev=kiss&at=4
  const qs = new URLSearchParams(location.search);
  if (qs.get('theme')) applyTheme(qs.get('theme'));
  if (qs.get('ev')) { const E = window.DecorEvents; E.cur = qs.get('ev'); E.last = E.cur; E.dir = qs.get('dir') === '-1' ? -1 : 1; E.param = .4; E.t0 = performance.now() / 1000 - (+qs.get('at') || 1) + 2.5; }
  // ------------------------------------------------------------------ mando de Android TV (cruceta + OK)
  (function () {
    const SEL = 'button,select,input:not([type=hidden]):not([hidden]),[tabindex="0"]';
    function cands() {
      const sheetOpen = !$('sheet').hidden, root = sheetOpen ? $('sheet') : document;
      return Array.from(root.querySelectorAll(SEL)).filter(el => {
        if (el.disabled || el.closest('[hidden]')) return false;
        const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
        const cs = getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0';
      });
    }
    function move(dir) {
      const list = cands(); if (!list.length) return false;
      let cur = document.activeElement; if (!cur || !list.includes(cur)) { list[0].focus(); return true; }
      const a = cur.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2;
      let best = null, bs = 1e12;
      for (const el of list) {
        if (el === cur) continue;
        const b = el.getBoundingClientRect(), bx = b.left + b.width / 2, by = b.top + b.height / 2;
        let p, s;
        if (dir === 'ArrowDown') { if (b.top + 2 < a.bottom - a.height * .5 && by <= ay) continue; p = by - ay; s = Math.abs(bx - ax); if (p <= 1) continue; }
        else if (dir === 'ArrowUp') { p = ay - by; s = Math.abs(bx - ax); if (p <= 1) continue; }
        else if (dir === 'ArrowRight') { p = bx - ax; s = Math.abs(by - ay); if (p <= 1) continue; }
        else { p = ax - bx; s = Math.abs(by - ay); if (p <= 1) continue; }
        const vertical = dir === 'ArrowDown' || dir === 'ArrowUp';
        // en la misma fila/columna manda la cercanía; el desvío lateral pesa más
        const score = p + s * (vertical ? 2.5 : 4) + (s > (vertical ? b.width : b.height) ? 400 : 0);
        if (score < bs) { bs = score; best = el; }
      }
      if (best) { best.focus(); return true; }
      return false;
    }
    document.addEventListener('keydown', (e) => {
      const k = e.key, full = document.body.classList.contains('full') && !webOpen;
      const arrows = k === 'ArrowUp' || k === 'ArrowDown' || k === 'ArrowLeft' || k === 'ArrowRight';
      if (full && ($('sheet').hidden)) {
        if (arrows || k === 'Enter') {
          const hidden = document.body.classList.contains('hide-ui');
          if (k === 'Enter' && hidden) { showUi(); e.preventDefault(); return; }
          if (k === 'ArrowLeft' || k === 'ArrowRight') { zap(k === 'ArrowRight' ? 1 : -1); showUi(); e.preventDefault(); return; }
          if (k === 'ArrowUp' || k === 'ArrowDown') {
            const nv = Math.max(0, Math.min(100, +$('vol').value + (k === 'ArrowUp' ? 8 : -8)));
            setVol(nv); vmsg('🔊 ' + nv + '%'); clearTimeout(vTimer); vTimer = setTimeout(() => vmsg(''), 900); showUi(); e.preventDefault(); return;
          }
        }
        showUi();
      }
      const el = document.activeElement, tag = el && el.tagName;
      if (arrows) {
        if (tag === 'INPUT' && (el.type === 'text' || el.type === 'search' || el.type === 'url') && (k === 'ArrowLeft' || k === 'ArrowRight')) return;   // cursor del texto
        if (tag === 'INPUT' && el.type === 'range' && (k === 'ArrowLeft' || k === 'ArrowRight')) return;                                            // barra de volumen
        if (move(k)) e.preventDefault();
      } else if ((k === 'Enter' || k === ' ') && el && el.getAttribute && el.getAttribute('role') === 'button') { el.click(); e.preventDefault(); }
    }, true);
    // al abrir la app el foco empieza en el primer botón para que el mando funcione enseguida
    // la pantalla del vídeo es enfocable: OK = maximizar (emisión local) o pasar el mando a la web del canal
    $('videoBox').addEventListener('focus', () => { if (webOpen) status('🌐 Pulsa OK para manejar la web con el mando (Atrás devuelve el control a la app).'); else status('⛶ Pulsa OK para maximizar.'); });
    $('videoBox').addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault(); e.stopPropagation();
      if (portalOn) { showNativity(false); return; }
      if (webOpen && NATIVE && NATIVE.focusWeb) { try { NATIVE.focusWeb(); } catch (x) { } }
      else if (!webOpen) setFull(!document.body.classList.contains('full'));
    });
    // el foco empieza directamente en el primer canal (para buscar hay que subir al cuadro de búsqueda y pulsar OK)
    let tries = 0;
    (function focusFirst() {
      const a = document.activeElement;
      if (a && a !== document.body && a.closest && a.closest('#list')) return;
      if (tries > 0 && a && a !== document.body && !a.closest('#list')) return;   // el usuario ya se ha movido
      const f = document.querySelector('#list .ch .name');
      if (f) f.focus(); else if (tries++ < 24) setTimeout(focusFirst, 500);
    })();
  })();

  window.__nv = { showNativity, play, channels: () => channels, state, Decor };   // para depurar
})();

if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !window.NativeApi && !window.Capacitor) { try { navigator.serviceWorker.register('sw.js').catch(() => { }); } catch (e) { } }
