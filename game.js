'use strict';
/* =========================================================
   KAPIVARAGE — motor de luta 2D em Canvas
   ========================================================= */

// ---------------- Constantes ----------------
const W = 1280, H = 720, GROUND = 662;
const LEFT_WALL = 105, RIGHT_WALL = W - 105;
const GRAV = 1.05;
const ROUND_TIME = 120;
const POSES = ['idle','walk1','walk2','punch','kick','block','hit','special','jump','ko','crouch','uppercut','sweep','win'];
const ARROW = { F: '→', B: '←', D: '↓', U: '↑' };
const BTN = { A: 'GOLPE', B: 'FORTE', AB: 'GOLPE ou FORTE' };

// ---------------- Personagens ----------------
const CHARS = [
  { id: 'liukang', name: 'Liu Kapivarang', g: 'ELE', col: '#ff5a3a', speed: 1.06, power: 1.0, def: 1.0, hw: 50,
    bio: 'Monge da Lagoa Sagrada. Defende seu lar com chutes de fogo e muita paciência de capivara.',
    specials: [
      { seq: 'FF', btn: 'AB', name: 'Bola de Fogo', type: 'proj', proj: 'fire' },
      { seq: 'BF', btn: 'AB', name: 'Voadora do Dragão', type: 'dash', pose: 'kick', spd: 17, frames: 26, dmg: 12, lift: 34, hy: [0.3, 0.85], kd: true },
    ],
    fatal: { seq: 'FDF', btn: 'B', name: 'Dragão de Fogo', kind: 'burn', col: '#ff7a1a' } },
  { id: 'kitana', name: 'Kitapivarana', g: 'ELA', col: '#4aa8ff', speed: 1.1, power: 0.95, def: 1.0, hw: 46,
    bio: 'Princesa das Sete Lagoas, com leques de aço afiados como capim seco.',
    specials: [
      { seq: 'FF', btn: 'AB', name: 'Leque Cortante', type: 'proj', proj: 'fan' },
      { seq: 'BF', btn: 'AB', name: 'Leque Levitador', type: 'proj', proj: 'wind' },
    ],
    fatal: { seq: 'DDF', btn: 'B', name: 'Corte Real', kind: 'slice', col: '#7fd0ff' } },
  { id: 'sonia', name: 'Kapivaronya Blade', g: 'ELA', col: '#9fd34a', speed: 1.08, power: 1.0, def: 1.0, hw: 46,
    bio: 'Tenente das Forças Especiais. Caçadora de bandidos e mestre em anéis de energia.',
    specials: [
      { seq: 'FF', btn: 'AB', name: 'Anéis de Energia', type: 'proj', proj: 'ring' },
      { seq: 'BF', btn: 'AB', name: 'Soco Quadrado', type: 'dash', pose: 'punch', spd: 15, frames: 28, dmg: 11, lift: 120, hy: [0.45, 1.0], kd: true },
    ],
    fatal: { seq: 'FFD', btn: 'B', name: 'Beijo Ardente', kind: 'burn', col: '#ff5ad1' } },
  { id: 'milena', name: 'Kapivarelena', g: 'ELA', col: '#ff4fb0', speed: 1.12, power: 0.97, def: 1.0, hw: 46,
    bio: 'Clone selvagem criada no Brejo Sombrio. Sorriso escondido, sais dourados e zero paciência.',
    specials: [
      { seq: 'FF', btn: 'AB', name: 'Sai Voador', type: 'proj', proj: 'sai' },
      { seq: 'BF', btn: 'AB', name: 'Teleporte Chute', type: 'tele', mode: 'above', dmg: 11 },
    ],
    fatal: { seq: 'BBD', btn: 'B', name: 'Explosão Rosa', kind: 'shatter', col: '#ff4fb0' } },
  { id: 'scorpion', name: 'Toco do Pantanal', g: 'ELE', col: '#3eea6a', speed: 1.04, power: 1.02, def: 1.0, hw: 50, hue: 90,
    bio: 'Capivara lanterna do Pantanal. Amarra o adversário no cipó e não larga até o fim da briga.',
    specials: [
      { seq: 'FF', btn: 'AB', name: 'Cipó Enleado', type: 'proj', proj: 'spear' },
      { seq: 'BF', btn: 'AB', name: 'Pulada do Junco', type: 'tele', mode: 'behind', dmg: 10 },
    ],
    fatal: { seq: 'DDB', btn: 'B', name: 'Bafo do Brejo', kind: 'burn', col: '#5dff7a' } },
  { id: 'subzero', name: 'Nuvem da Serra', g: 'ELE', col: '#c89cff', speed: 1.02, power: 1.0, def: 1.02, hw: 50, hue: 80,
    bio: 'Guardião das serras frias. Cobre o chão de neblina e some por baixo do adversário.',
    specials: [
      { seq: 'FF', btn: 'AB', name: 'Nevoeiro', type: 'proj', proj: 'ice' },
      { seq: 'BF', btn: 'AB', name: 'Escorregão da Serra', type: 'dash', pose: 'sweep', spd: 15, frames: 26, dmg: 9, lift: 0, hy: [0, 0.35], kd: true },
    ],
    fatal: { seq: 'FDF', btn: 'B', name: 'Estilhaço de Geada', kind: 'shatter', col: '#e0b0ff' } },
  { id: 'motaro', name: 'Kapivotaro', g: 'ELE', col: '#ff8a3a', speed: 0.86, power: 1.22, def: 0.82, hw: 70, boss: true,
    bio: 'Sub-chefe centauro-capivara de quatro braços. Quatro punhos, uma cauda e nenhum perdão.',
    specials: [
      { seq: 'FF', btn: 'AB', name: 'Fogo da Cauda', type: 'proj', proj: 'hellfire' },
      { seq: 'BF', btn: 'AB', name: 'Pisão Teleporte', type: 'tele', mode: 'stomp', dmg: 15 },
    ],
    fatal: { seq: 'FFF', btn: 'B', name: 'Esmagamento Quádruplo', kind: 'shatter', col: '#ff7a1a' } },
  { id: 'shang', art: 'liukang', name: 'Shang Kapivatsung', g: 'ELE', col: '#70f0b4', speed: 1, power: 1.05, def: 1.04, hw: 50,
    bio: 'Feiticeiro do Brejo Sombrio. Canaliza a névoa da lagoa para fazer suas magias.',
    specials: [
      { seq: 'FF', btn: 'AB', name: 'Orbe do Brejo', type: 'proj', proj: 'mist' },
      { seq: 'BF', btn: 'AB', name: 'Passo Fantasma', type: 'tele', mode: 'behind', dmg: 10 },
    ],
    fatal: { seq: 'BDF', btn: 'B', name: 'Névoa Espectral', kind: 'shatter', col: '#70f0b4' } },
];
const CH = Object.fromEntries(CHARS.map(c => [c.id, c]));
const spritePath = (c, pose) => `assets/${c.art || c.id}_${pose}.webp`;
function hueFilter(c) {
  const h = c.hue != null ? c.hue : (c.art ? 125 : null);
  return h != null ? `hue-rotate(${h}deg) saturate(1.25)` : '';
}
function applyHue(el, c) {
  if (!el) return;
  el.style.filter = hueFilter(c);
}
function seqArrows(seq) {
  if (seq === 'FF') return '→ →';
  if (seq === 'BF') return '← →';
  return seq.split('').map(d => ARROW[d]).join(' ');
}
function magicLine(s) {
  const side = s.seq === 'FF' ? 'Pra frente' : s.seq === 'BF' ? 'Pra trás' : 'Magia';
  return `${side}: ${s.name} — ${seqArrows(s.seq)} + ${BTN[s.btn] || 'GOLPE ou FORTE'}`;
}

const PROJ = {
  fire:     { spd: 11, r: 30, dmg: 9,  col: '#ff8a1f', snd: 'fire' },
  hellfire: { spd: 10, r: 44, dmg: 12, col: '#ff3b10', snd: 'fire' },
  fan:      { spd: 12, r: 30, dmg: 8,  col: '#9fd8ff', snd: 'whoosh' },
  wind:     { spd: 9,  r: 46, dmg: 4,  col: '#bfe8ff', snd: 'whoosh', effect: 'lift', life: 48 },
  ring:     { spd: 10, r: 30, dmg: 8,  col: '#ff6ad8', snd: 'zap' },
  mist:     { spd: 10, r: 38, dmg: 9, col: '#70f0b4', snd: 'zap' },
  sai:      { spd: 16, r: 22, dmg: 7,  col: '#ffd34a', snd: 'whoosh' },
  spear:    { spd: 19, r: 18, dmg: 6,  col: '#d0d0d0', snd: 'spear', effect: 'pull', life: 34 },
  ice:      { spd: 9,  r: 28, dmg: 3,  col: '#8fe0ff', snd: 'ice', effect: 'freeze' },
};

// Golpes normais: start/active em frames, hy = faixa de altura (fração da altura do atacante)
const NORMALS = {
  punch:    { pose: 'punch', start: 4, act: 4, total: 17, dmg: 5,  reach: 128, hy: [0.70, 0.90], hs: 14, push: 5, snd: 'light' },
  kick:     { pose: 'kick', start: 8, act: 5, total: 28, dmg: 10, reach: 165, hy: [0.45, 0.80], hs: 20, push: 11, snd: 'heavy' },
  sweep:    { pose: 'sweep', start: 7, act: 5, total: 32, dmg: 7,  reach: 170, hy: [0, 0.18], hs: 0, push: 6, kd: true, snd: 'heavy' },
  uppercut: { pose: 'uppercut', start: 6, act: 5, total: 34, dmg: 14, reach: 120, hy: [0.35, 1.6], hs: 0, push: 8, kd: true, launch: true, snd: 'heavy' },
  airkick:  { pose: 'kick', start: 3, act: 99, total: 99, dmg: 9, reach: 150, hy: [-0.1, 0.55], hs: 18, push: 8, air: true, snd: 'heavy' },
  airpunch: { pose: 'punch', start: 3, act: 99, total: 99, dmg: 7, reach: 125, hy: [0.1, 0.65], hs: 16, push: 6, air: true, snd: 'light' },
};

const STAGES = ['bg_ponte', 'bg_templo', 'bg_gelo', 'bg_arena'];
const STAGE_NAMES = { bg_ponte: 'A PONTE', bg_templo: 'TEMPLO DA LAGOA', bg_gelo: 'CAVERNA DE GELO', bg_arena: 'COLISEU DO BREJO' };

// ---------------- Utilidades ----------------
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
if (isTouch) document.body.classList.add('touchdev');

// ---------------- Assets ----------------
const IMG = {};
let MANIFEST = null;
function loadImage(key, src) {
  return new Promise(res => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => { IMG[key] = im; res(); };
    im.onerror = () => { res(); };
    im.src = src;
  });
}
async function loadAll() {
  const response = await fetch('assets/manifest.json');
  if (!response.ok) throw new Error('Não foi possível carregar o elenco.');
  MANIFEST = await response.json();
  const list = [];
  for (const c of CHARS.filter(c => !c.art)) for (const p of POSES) list.push([c.id + '_' + p, spritePath(c, p)]);
  for (const c of CHARS.filter(c => !c.art)) list.push([c.id + '_portrait', spritePath(c, 'portrait')]);
  for (const s of STAGES) list.push([s, `assets/${s}.webp`]);
  list.push(['emblem', 'assets/emblem.webp']);
  let done = 0;
  await Promise.all(list.map(([k, s]) => loadImage(k, s).then(() => {
    done++;
    const pct = Math.round(done / list.length * 100);
    $('#load-pct').textContent = pct + '%';
    $('#load-fill').style.width = pct + '%';
  })));
}
function frame(id, pose) {
  const art = CH[id]?.art || id;
  return { img: IMG[art + '_' + pose], m: MANIFEST[art][pose] };
}

// ---------------- Áudio ----------------
const Audio = {
  ctx: null, master: null, music: null, sfx: null, on: true, noise: null, seqTimer: null, step: 0, nextT: 0, playing: false,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.gain.value = this.on ? 0.8 : 0; this.master.connect(this.ctx.destination);
    this.music = this.ctx.createGain(); this.music.gain.value = 0.28; this.music.connect(this.master);
    this.sfx = this.ctx.createGain(); this.sfx.gain.value = 0.9; this.sfx.connect(this.master);
    const len = this.ctx.sampleRate * 1.5, b = this.ctx.createBuffer(1, len, this.ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noise = b;
  },
  setOn(v) { this.on = v; if (this.master) this.master.gain.value = v ? 0.8 : 0; if (!v && window.speechSynthesis) speechSynthesis.cancel(); },
  env(g, t, a, peak, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); },
  osc(type, f0, f1, dur, vol, dest, t0) {
    if (!this.ctx) return; const t = t0 ?? this.ctx.currentTime;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    this.env(g, t, 0.005, vol, dur); o.connect(g); g.connect(dest || this.sfx); o.start(t); o.stop(t + dur + 0.05);
  },
  nz(dur, vol, ftype, f0, f1, dest, t0, q) {
    if (!this.ctx) return; const t = t0 ?? this.ctx.currentTime;
    const s = this.ctx.createBufferSource(); s.buffer = this.noise;
    const f = this.ctx.createBiquadFilter(); f.type = ftype; f.frequency.setValueAtTime(f0, t); if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur); f.Q.value = q || 1;
    const g = this.ctx.createGain(); this.env(g, t, 0.004, vol, dur);
    s.connect(f); f.connect(g); g.connect(dest || this.sfx); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  },
  play(n) {
    if (!this.ctx || !this.on) return;
    switch (n) {
      case 'light': this.nz(0.09, 0.7, 'lowpass', 2200, 500); this.osc('sine', 180, 60, 0.12, 0.6); break;
      case 'heavy': this.nz(0.16, 0.9, 'lowpass', 1600, 260); this.osc('sine', 140, 40, 0.22, 0.9); this.osc('square', 90, 40, 0.08, 0.15); break;
      case 'block': this.osc('square', 1200, 700, 0.06, 0.18); this.nz(0.05, 0.4, 'highpass', 3000); break;
      case 'whiff': this.nz(0.12, 0.25, 'bandpass', 500, 2200, null, null, 2); break;
      case 'whoosh': this.nz(0.3, 0.35, 'bandpass', 300, 2600, null, null, 1.5); break;
      case 'fire': this.nz(0.55, 0.55, 'lowpass', 3000, 200); this.osc('sawtooth', 220, 70, 0.4, 0.12); break;
      case 'ice': this.osc('sine', 1800, 3400, 0.25, 0.2); this.osc('triangle', 2400, 1200, 0.35, 0.12); this.nz(0.3, 0.2, 'highpass', 5000); break;
      case 'zap': this.osc('sawtooth', 600, 1500, 0.25, 0.15); this.osc('sine', 900, 300, 0.3, 0.2); break;
      case 'spear': this.nz(0.2, 0.4, 'bandpass', 1200, 4000, null, null, 3); this.osc('square', 300, 900, 0.15, 0.08); break;
      case 'jump': this.osc('sine', 260, 520, 0.1, 0.12); break;
      case 'land': this.osc('sine', 90, 50, 0.08, 0.3); break;
      case 'tele': this.osc('sine', 200, 1600, 0.3, 0.18); this.nz(0.3, 0.3, 'bandpass', 2000, 300, null, null, 2); break;
      case 'freeze': this.osc('triangle', 3000, 900, 0.5, 0.18); this.nz(0.5, 0.3, 'highpass', 6000); break;
      case 'boom': this.nz(0.9, 1.0, 'lowpass', 900, 60); this.osc('sine', 70, 28, 0.9, 1.0); break;
      case 'shatter': for (let i = 0; i < 6; i++) this.osc('triangle', rnd(1500, 4200), rnd(600, 1400), 0.3, 0.1, null, this.ctx.currentTime + i * 0.03); this.nz(0.5, 0.6, 'highpass', 2500); break;
      case 'select': this.osc('square', 660, 990, 0.06, 0.1); break;
      case 'move': this.osc('square', 440, 0, 0.03, 0.06); break;
      case 'confirm': this.osc('sawtooth', 220, 880, 0.25, 0.15); this.nz(0.4, 0.4, 'lowpass', 2000, 200); break;
      case 'gong': this.osc('sine', 110, 104, 2.2, 0.6); this.osc('sine', 221, 215, 1.8, 0.25); this.osc('sine', 347, 340, 1.4, 0.12); break;
    }
  },
  // Trilha procedural estilo techno de arcade
  startMusic() {
    if (!this.ctx || this.playing) return;
    this.playing = true; this.step = 0; this.nextT = this.ctx.currentTime + 0.1;
    this.seqTimer = setInterval(() => this.schedule(), 25);
  },
  stopMusic() { this.playing = false; clearInterval(this.seqTimer); },
  schedule() {
    const spb = 60 / 138 / 4; // semicolcheias
    const bass = [45,45,57,45,48,45,52,45, 43,43,55,43,47,43,50,43];
    const lead = [69,0,0,72,0,0,74,0, 76,0,74,0,72,0,71,0];
    while (this.nextT < this.ctx.currentTime + 0.12) {
      const s = this.step % 16, bar = Math.floor(this.step / 16) % 8, t = this.nextT, M = this.music;
      if (s % 4 === 0 || s === 14) { this.osc('sine', 150, 42, 0.18, 0.9, M, t); }
      if (s === 4 || s === 12) this.nz(0.14, 0.45, 'bandpass', 1800, 900, M, t, 0.8);
      if (s % 2 === 1) this.nz(0.03, 0.18, 'highpass', 8000, null, M, t);
      const bn = bass[(s + (bar % 4 >= 2 ? 0 : 0)) % 16] + (bar % 4 === 3 ? -2 : 0);
      if (s % 2 === 0) {
        const f = 440 * Math.pow(2, (bn - 69) / 12);
        const o = this.ctx.createOscillator(), g = this.ctx.createGain(), fl = this.ctx.createBiquadFilter();
        o.type = 'sawtooth'; o.frequency.value = f; fl.type = 'lowpass'; fl.frequency.setValueAtTime(1400, t); fl.frequency.exponentialRampToValueAtTime(200, t + 0.12); fl.Q.value = 6;
        this.env(g, t, 0.004, 0.32, 0.14); o.connect(fl); fl.connect(g); g.connect(M); o.start(t); o.stop(t + 0.2);
      }
      if (bar >= 4 && lead[s]) {
        const f = 440 * Math.pow(2, (lead[s] - 69 + (bar === 7 ? -2 : 0)) / 12);
        this.osc('square', f, 0, 0.16, 0.07, M, t);
      }
      this.nextT += spb; this.step++;
    }
  },
};

// Locutor (voz do navegador)
function announce(txt) {
  if (!Audio.on || !window.speechSynthesis) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = 'pt-BR'; u.rate = 0.88; u.pitch = 0.35; u.volume = 1;
    const v = speechSynthesis.getVoices().find(v => /pt(-|_)BR/i.test(v.lang)) || speechSynthesis.getVoices().find(v => /^pt/i.test(v.lang));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) {}
}

// ---------------- Entrada ----------------
const Keys = { down: {}, pressed: {} };
window.addEventListener('keydown', e => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code) && (!UI.screen || !e.target.closest?.('button'))) e.preventDefault();
  if (!Keys.down[e.code]) Keys.pressed[e.code] = true;
  Keys.down[e.code] = true;
  Audio.init();
  UI.onKey(e);
});
window.addEventListener('keyup', e => { Keys.down[e.code] = false; });
window.addEventListener('blur', () => { Keys.down = {}; });

const KEYMAPS = {
  solo: { l: ['ArrowLeft','KeyA'], r: ['ArrowRight','KeyD'], u: ['ArrowUp','KeyW'], d: ['ArrowDown','KeyS'], A: ['KeyJ','KeyZ','KeyF'], B: ['KeyK','KeyX','KeyG'], block: ['KeyL','KeyC','KeyH','Space','ShiftLeft'] },
  p1: { l: ['KeyA'], r: ['KeyD'], u: ['KeyW'], d: ['KeyS'], A: ['KeyF'], B: ['KeyG'], block: ['KeyH'] },
  p2: { l: ['ArrowLeft'], r: ['ArrowRight'], u: ['ArrowUp'], d: ['ArrowDown'], A: ['KeyI','Numpad1','Comma'], B: ['KeyO','Numpad2','Period'], block: ['KeyP','Numpad3','Slash'] },
};
const Touch = { l: false, r: false, u: false, d: false, block: false, A: 0, B: 0, tap: {} };

class HumanCtrl {
  constructor(map, useTouch) { this.map = KEYMAPS[map]; this.touch = useTouch; }
  read() {
    const m = this.map, any = arr => arr.some(k => Keys.down[k]), prs = arr => arr.some(k => Keys.pressed[k]);
    const T = this.touch ? Touch : {};
    const i = {
      l: any(m.l) || !!T.l, r: any(m.r) || !!T.r, u: any(m.u) || !!T.u, d: any(m.d) || !!T.d,
      block: any(m.block) || !!T.block, A: prs(m.A) || T.A > 0, B: prs(m.B) || T.B > 0,
      tl: prs(m.l) || !!(T.tap && T.tap.l), tr: prs(m.r) || !!(T.tap && T.tap.r), tu: prs(m.u) || !!(T.tap && T.tap.u), td: prs(m.d) || !!(T.tap && T.tap.d),
    };
    if (this.touch) { Touch.A = 0; Touch.B = 0; Touch.tap = {}; }
    return i;
  }
}

// ---------------- IA ----------------
class CpuCtrl {
  constructor(level, style) {
    this.lv = level;
    this.style = style || 'easy';
    this.hold = null; this.holdT = 0; this.cool = 0; this.blockT = 0; this.fatT = 0;
    this.flow = 1; this.flowT = 0;
  }
  read(me, game) {
    if (this.style === 'hard') return this.readOriginalEasy(me, game);
    if (this.style === 'normal') return this.readNormal(me, game);
    return this.readEasy(me, game);
  }
  // Cópia exata da IA Fácil original do Mortal Komcapivara (usada no Difícil).
  readOriginalEasy(me, game) {
    const o = me.opp, lv = this.lv;
    const i = { l: false, r: false, u: false, d: false, block: false, A: false, B: false, special: null, fatal: false };
    const dx = o.x - me.x, dist = Math.abs(dx), toward = dx > 0 ? 'r' : 'l', away = dx > 0 ? 'l' : 'r';
    if (game.phase === 'finish') {
      if (game.winner === me) {
        this.fatT++;
        if (this.fatT === 50 && Math.random() < 0.35 + lv * 0.5) { i.fatal = true; return i; }
        if (this.fatT > 70) { if (dist > 140) i[toward] = true; else if (this.fatT % 30 === 0) i.B = true; }
      }
      return i;
    }
    if (game.phase !== 'fight') return i;
    if (this.blockT > 0) { this.blockT--; i.block = true; if (me.state === 'crouch' || me.state === 'crouchblock') i.d = true; return i; }
    // Reagir a ataques
    const threat = (o.att && o.t < o.att.start + o.att.act + 2 && dist < (o.att.reach || 160) + 60) ||
      (o.state === 'dash' && dist < 320) || (o.state === 'tele');
    const proj = game.projs.find(p => p.owner === o && Math.abs(p.x - me.x) < 260 && Math.sign(me.x - p.x) === Math.sign(p.vx));
    if (me.canAct()) {
      if (threat && Math.random() < 0.08 + lv * 0.55) { this.blockT = 10 + (Math.random() * 14 | 0); i.block = true; return i; }
      if (proj && Math.random() < 0.05 + lv * 0.35) {
        const r = Math.random();
        if (r < 0.45) { this.blockT = 16; i.block = true; return i; }
        if (r < 0.75) { i.u = true; i[toward] = true; return i; }
        this.hold = 'd'; this.holdT = 22; i.d = true; return i;
      }
      if (o.y > 60 && dist < 200 && o.vy < 2 && Math.random() < 0.05 + lv * 0.25) { i.d = true; i.B = true; return i; } // anti-aéreo
    }
    if (this.holdT > 0) { this.holdT--; if (this.hold) i[this.hold === 'toward' ? toward : this.hold === 'away' ? away : this.hold] = true; return i; }
    if (this.cool > 0) { this.cool--; return i; }
    if (!me.canAct()) return i;
    const react = Math.max(3, 18 - lv * 14);
    this.cool = (react + Math.random() * react) | 0;
    const r = Math.random();
    const hasProj = game.projs.some(p => p.owner === me);
    if (dist > 420) {
      if (r < 0.25 + lv * 0.2 && !hasProj) { i.special = 0; return i; }
      if (r < 0.5) { this.hold = 'toward'; this.holdT = 20 + (Math.random() * 25 | 0); return i; }
      if (r < 0.62) { i.u = true; i[toward] = true; return i; }
      if (r < 0.72) { i.special = 1; return i; }
      this.hold = 'toward'; this.holdT = 30; return i;
    }
    if (dist > 175) {
      if (r < 0.14 + lv * 0.1 && !hasProj) { i.special = 0; return i; }
      if (r < 0.26) { i.special = 1; return i; }
      if (r < 0.42) { i.u = true; i[toward] = true; me.cpuAirAtk = true; return i; }
      if (r < 0.85) { this.hold = 'toward'; this.holdT = 10 + (Math.random() * 16 | 0); return i; }
      this.hold = 'away'; this.holdT = 12; return i;
    }
    // curta distância
    if (r < 0.32) { i.A = true; return i; }
    if (r < 0.52) { i.B = true; return i; }
    if (r < 0.62) { i.d = true; i.A = true; return i; }
    if (r < 0.70) { i.d = true; i.B = true; return i; }
    if (r < 0.78) { this.blockT = 14; i.block = true; return i; }
    if (r < 0.86) { this.hold = 'away'; this.holdT = 14; return i; }
    if (r < 0.92) { i.special = 1; return i; }
    i.u = true; i[toward] = true; me.cpuAirAtk = true; return i;
  }
  tickFlow() {
    if (this.flowT > 0) { this.flowT--; return; }
    if (Math.random() >= 0.30) this.flow = this.flow ? 0 : 1;
    this.flowT = (150 + Math.random() * 240) | 0;
  }
  readNormal(me, game) {
    this.tickFlow();
    const good = !!this.flow;
    const o = me.opp;
    const i = { l: false, r: false, u: false, d: false, block: false, A: false, B: false, special: null, fatal: false };
    const dx = o.x - me.x, dist = Math.abs(dx), toward = dx > 0 ? 'r' : 'l', away = dx > 0 ? 'l' : 'r';
    if (game.phase === 'finish') {
      if (game.winner === me) {
        this.fatT++;
        if (this.fatT === 50 && Math.random() < (good ? 0.28 : 0.08)) { i.fatal = true; return i; }
        if (this.fatT > 70) { if (dist > 140) i[toward] = true; else if (this.fatT % 30 === 0) i.B = true; }
      }
      return i;
    }
    if (game.phase !== 'fight') return i;
    if (this.blockT > 0) { this.blockT--; i.block = true; if (me.state === 'crouch' || me.state === 'crouchblock') i.d = true; return i; }
    const threat = (o.att && o.t < o.att.start + o.att.act + 2 && dist < (o.att.reach || 160) + 60) ||
      (o.state === 'dash' && dist < 320) || (o.state === 'tele');
    const proj = game.projs.find(p => p.owner === o && Math.abs(p.x - me.x) < 260 && Math.sign(me.x - p.x) === Math.sign(p.vx));
    if (me.canAct()) {
      if (threat && Math.random() < (good ? 0.42 : 0.10)) { this.blockT = 12 + (Math.random() * 14 | 0); i.block = true; return i; }
      if (proj && Math.random() < (good ? 0.38 : 0.10)) {
        const r = Math.random();
        if (r < 0.6) { this.blockT = 16; i.block = true; return i; }
        if (r < 0.85) { i.u = true; i[toward] = true; return i; }
        this.hold = 'd'; this.holdT = 22; i.d = true; return i;
      }
    }
    if (this.holdT > 0) { this.holdT--; if (this.hold) i[this.hold === 'toward' ? toward : this.hold === 'away' ? away : this.hold] = true; return i; }
    if (this.cool > 0) { this.cool--; return i; }
    if (!me.canAct()) return i;
    const react = good ? (12 + Math.random() * 12) : (22 + Math.random() * 18);
    this.cool = react | 0;
    const r = Math.random();
    // Ataca pouco e se defende; na fase boa acerta mais defesas, na ruim erra e anda.
    if (good) {
      if (r < 0.10) { i.A = true; return i; }
      if (r < 0.13) { i.B = true; return i; }
      if (r < 0.16 && dist > 200) { i.special = 0; return i; }
      if (r < 0.40) { this.blockT = 16 + (Math.random() * 14 | 0); i.block = true; return i; }
      if (r < 0.54) { i.u = true; if (Math.random() < 0.6) i[toward] = true; return i; }
      if (r < 0.80) { this.hold = 'toward'; this.holdT = 14 + (Math.random() * 20 | 0); return i; }
      this.hold = 'away'; this.holdT = 12 + (Math.random() * 16 | 0); return i;
    }
    if (r < 0.04) { i.A = true; return i; }
    if (r < 0.05) { i.B = true; return i; }
    if (r < 0.14) { this.blockT = 10 + (Math.random() * 10 | 0); i.block = true; return i; }
    if (r < 0.32) { i.u = true; if (Math.random() < 0.5) i[Math.random() < 0.5 ? toward : away] = true; return i; }
    if (r < 0.70) { this.hold = Math.random() < 0.5 ? 'toward' : 'away'; this.holdT = 16 + (Math.random() * 28 | 0); return i; }
    this.hold = 'away'; this.holdT = 18; return i;
  }
  readEasy(me, game) {
    const o = me.opp, lv = this.lv;
    const i = { l: false, r: false, u: false, d: false, block: false, A: false, B: false, special: null, fatal: false };
    const dx = o.x - me.x, dist = Math.abs(dx), toward = dx > 0 ? 'r' : 'l', away = dx > 0 ? 'l' : 'r';
    if (game.phase === 'finish') {
      if (game.winner === me) {
        this.fatT++;
        if (this.fatT === 50 && Math.random() < 0.12 + lv * 0.25) { i.fatal = true; return i; }
        if (this.fatT > 70) { if (dist > 140) i[toward] = true; else if (this.fatT % 30 === 0) i.B = true; }
      }
      return i;
    }
    if (game.phase !== 'fight') return i;
    if (this.blockT > 0) { this.blockT--; i.block = true; if (me.state === 'crouch' || me.state === 'crouchblock') i.d = true; return i; }
    const threat = (o.att && o.t < o.att.start + o.att.act + 2 && dist < (o.att.reach || 160) + 60) ||
      (o.state === 'dash' && dist < 320) || (o.state === 'tele');
    const proj = game.projs.find(p => p.owner === o && Math.abs(p.x - me.x) < 260 && Math.sign(me.x - p.x) === Math.sign(p.vx));
    if (me.canAct()) {
      if (threat && Math.random() < 0.20 + lv * 0.2) { this.blockT = 14 + (Math.random() * 12 | 0); i.block = true; return i; }
      if (proj && Math.random() < 0.22 + lv * 0.18) {
        const r = Math.random();
        if (r < 0.55) { this.blockT = 16; i.block = true; return i; }
        if (r < 0.85) { i.u = true; i[toward] = true; return i; }
        this.hold = 'd'; this.holdT = 22; i.d = true; return i;
      }
    }
    if (this.holdT > 0) { this.holdT--; if (this.hold) i[this.hold === 'toward' ? toward : this.hold === 'away' ? away : this.hold] = true; return i; }
    if (this.cool > 0) { this.cool--; return i; }
    if (!me.canAct()) return i;
    // Reações lentas. Anda bastante, pula de vez em quando, defende às vezes; ataca pouco e fraco.
    const react = Math.max(14, 36 - lv * 14);
    this.cool = (react + Math.random() * react) | 0;
    const r = Math.random();
    if (r < 0.06 + lv * 0.04) { i.A = true; return i; }
    if (r < 0.08 + lv * 0.05) { i.B = true; return i; }
    if (r < 0.10 + lv * 0.06 && dist > 220) { i.special = 0; return i; }
    if (r < 0.30 + lv * 0.04) { this.blockT = 16 + (Math.random() * 16 | 0); i.block = true; return i; }
    if (r < 0.48) { i.u = true; if (Math.random() < 0.65) i[toward] = true; return i; }
    if (r < 0.74) { this.hold = 'toward'; this.holdT = 18 + (Math.random() * 28 | 0); return i; }
    if (r < 0.94) { this.hold = 'away'; this.holdT = 16 + (Math.random() * 24 | 0); return i; }
    this.hold = Math.random() < 0.5 ? 'toward' : 'away'; this.holdT = 22; return i;
  }
}

// ---------------- Partículas ----------------
class Particles {
  constructor() { this.list = []; }
  add(p) { this.list.push(Object.assign({ life: 30, max: 30, g: 0, size: 6, drag: 0.98, rot: 0, vr: 0 }, p)); }
  burst(x, y, col, n, spd, size, g = 0.3, type = 'spark') {
    for (let k = 0; k < n; k++) {
      const a = rnd(0, Math.PI * 2), s = rnd(spd * 0.3, spd);
      this.add({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, col, size: rnd(size * 0.5, size), life: rnd(16, 34) | 0, max: 34, g, type });
    }
  }
  update() {
    for (const p of this.list) {
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= p.drag; p.vy *= p.drag; p.rot += p.vr; p.life--;
      if (p.type === 'shard' && p.y > GROUND - 4) { p.y = GROUND - 4; p.vy *= -0.35; p.vx *= 0.7; p.vr *= 0.6; }
    }
    this.list = this.list.filter(p => p.life > 0);
  }
  draw(c) {
    for (const p of this.list) {
      const a = p.type === 'shard' ? clamp(p.life / 40, 0, 1) : clamp(p.life / p.max, 0, 1);
      c.globalAlpha = a;
      if (p.type === 'shard' && p.img) {
        c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.drawImage(p.img, p.sx, p.sy, p.sw, p.sh, -p.sw / 2, -p.sh / 2, p.sw, p.sh);
        if (p.tint) { c.globalCompositeOperation = 'source-atop'; }
        c.restore();
      } else if (p.type === 'fire') {
        c.globalCompositeOperation = 'lighter';
        const r = p.size * (0.6 + a);
        const gr = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        gr.addColorStop(0, '#fff6c0'); gr.addColorStop(0.35, p.col); gr.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = gr; c.beginPath(); c.arc(p.x, p.y, r, 0, Math.PI * 2); c.fill();
        c.globalCompositeOperation = 'source-over';
      } else if (p.type === 'smoke') {
        c.globalAlpha = a * 0.5; c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, p.size * (2 - a), 0, Math.PI * 2); c.fill();
      } else if (p.type === 'star') {
        c.fillStyle = p.col; c.save(); c.translate(p.x, p.y); c.rotate(p.rot); star(c, 0, 0, p.size, p.size * 0.45, 5); c.fill(); c.restore();
      } else {
        c.globalCompositeOperation = 'lighter';
        c.fillStyle = p.col; c.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        c.globalCompositeOperation = 'source-over';
      }
    }
    c.globalAlpha = 1;
  }
}
function star(c, x, y, R, r, n) {
  c.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = i * Math.PI / n - Math.PI / 2, rr = i % 2 ? r : R; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  c.closePath();
}

// ---------------- Lutador ----------------
const tintCv = document.createElement('canvas'), tintCx = tintCv.getContext('2d');

class Fighter {
  constructor(ch, side, ctrl) {
    this.ch = ch; this.side = side; this.ctrl = ctrl;
    this.m = MANIFEST[ch.art || ch.id];
    this.hgt = this.m.idle.h;           // altura de referência em pixels
    this.reset();
  }
  reset() {
    this.x = this.side === 0 ? 400 : W - 400; this.y = 0; this.vx = 0; this.vy = 0;
    this.facing = this.side === 0 ? 1 : -1;
    this.maxHp = (this.ctrl instanceof HumanCtrl && UI.diff === 0) ? 140 : 100;
    this.hp = this.maxHp; this.dispHp = this.maxHp;
    this.setState('idle');
    this.buf = []; this.prev = {}; this.combo = 0; this.flash = 0; this.alpha = 1;
    this.toDizzy = false; this.dead = false; this.cpuAirAtk = false; this.lastPose = 'idle'; this.special = null;
    this.ghost = []; this.hitsTaken = 0;
  }
  setState(s, t = 0) { this.state = s; this.t = t; if (s !== 'tele') this.alpha = 1; if (!['punch','kick','sweep','uppercut','jumpatk','dash','tele','special'].includes(s)) this.att = null; }
  get grounded() { return this.y <= 0.01; }
  canAct() { return ['idle','walk','crouch','block','crouchblock'].includes(this.state); }
  invuln() { return ['down','getup','dead','tele_out'].includes(this.state) || (this.state === 'tele' && this.alpha < 0.5) || this.dead; }
  span() { // faixa vertical do corpo [baixo, cima]
    const h = this.hgt;
    if (this.state === 'crouch' || this.state === 'crouchblock' || this.state === 'sweep' || (this.state === 'dash' && this.special && this.special.pose === 'sweep')) return [this.y, this.y + h * 0.56];
    if (this.state === 'jump' || this.state === 'jumpatk') return [this.y + h * 0.1, this.y + h * 0.8];
    return [this.y, this.y + h];
  }
  isBlocking() { return ['block','crouchblock','blockstun'].includes(this.state); }

  // ---- entrada ----
  recordDirs(i) {
    const fwd = this.facing > 0 ? 'r' : 'l', back = this.facing > 0 ? 'l' : 'r';
    const now = Game.frameNo;
    const edge = k => (i[k] && !this.prev[k]) || !!i['t' + k];
    if (edge(fwd)) this.buf.push({ d: 'F', f: now });
    if (edge(back)) this.buf.push({ d: 'B', f: now });
    if (edge('d')) this.buf.push({ d: 'D', f: now });
    if (edge('u')) this.buf.push({ d: 'U', f: now });
    if (this.buf.length > 8) this.buf.shift();
    this.prev = { l: i.l, r: i.r, u: i.u, d: i.d };
  }
  matchSeq(seq, window = 30) {
    const n = seq.length, b = this.buf;
    if (b.length < n) return false;
    const tail = b.slice(-n);
    if (tail.map(e => e.d).join('') !== seq) return false;
    return (Game.frameNo - tail[0].f) <= window;
  }
  findSpecial(btn) {
    const sp = this.ch.specials.map((s, k) => ({ s, k }))
      .filter(o => !o.s.btn || o.s.btn === btn || o.s.btn === 'AB')
      .sort((a, b) => b.s.seq.length - a.s.seq.length);
    for (const o of sp) if (this.matchSeq(o.s.seq)) return o.k;
    return -1;
  }

  update(game) {
    const i = this.ctrl.read(this, game);
    this.recordDirs(i);
    const o = this.opp;
    this.t++;
    if (this.flash > 0) this.flash--;

    // Fatality
    if (game.phase === 'finish' && game.winner === this && this.canAct() && !game.fatality) {
      const f = this.ch.fatal;
      if (i.fatal || (i[f.btn] && this.matchSeq(f.seq, 70))) { game.startFatality(this); return; }
    }

    const fightOn = game.phase === 'fight' || (game.phase === 'finish' && game.winner === this);
    if (!fightOn) {
      if (this.canAct() || this.state === 'walk') { if (this.state !== 'win' && this.state !== 'dizzy') this.setState('idle'); }
    } else if (this.canAct()) this.handleInput(i);

    this.tickState(i, game);
    this.physics(game);
  }

  handleInput(i) {
    const o = this.opp;
    if (this.grounded) this.facing = o.x >= this.x ? 1 : -1;
    const fwdKey = this.facing > 0 ? 'r' : 'l', backKey = this.facing > 0 ? 'l' : 'r';
    // Especiais (CPU escolhe direto)
    if (i.special != null && this.ch.specials[i.special]) { this.doSpecial(i.special); return; }
    if (i.A || i.B) {
      const btn = i.A ? 'A' : 'B';
      const k = this.findSpecial(btn);
      if (k >= 0) { this.buf = []; this.doSpecial(k); return; }
      if (i.d) this.doNormal(btn === 'A' ? 'sweep' : 'uppercut');
      else this.doNormal(btn === 'A' ? 'punch' : 'kick');
      return;
    }
    if (i.block) { this.setState(i.d ? 'crouchblock' : 'block', this.state === 'block' || this.state === 'crouchblock' ? this.t : 0); this.vx = 0; return; }
    if (i.u) {
      this.setState('jump'); this.vy = 21; this.y = 0.1;
      this.vx = i[fwdKey] ? 6.2 * this.facing : i[backKey] ? -5.4 * this.facing : 0;
      this.vx *= this.ch.speed; this.flip = this.vx !== 0; Audio.play('jump'); return;
    }
    if (i.d) { if (this.state !== 'crouch') this.setState('crouch'); this.vx = 0; return; }
    if (i[fwdKey]) { if (this.state !== 'walk') this.setState('walk'); this.vx = 4.4 * this.ch.speed * this.facing; return; }
    if (i[backKey]) { if (this.state !== 'walk') this.setState('walk'); this.vx = -3.6 * this.ch.speed * this.facing; return; }
    if (this.state !== 'idle') this.setState('idle');
    this.vx = 0;
  }

  doNormal(name) {
    const a = NORMALS[name];
    this.setState(name);
    this.att = Object.assign({}, a, { hit: false, from: a.start, to: a.start + a.act });
    this.vx = name === 'sweep' ? 0 : this.vx * 0.2;
    if (name !== 'punch') Audio.play('whiff');
  }
  doSpecial(k) {
    const s = this.ch.specials[k];
    if (s.type === 'proj' && Game.projs.some(p => p.owner === this)) { this.doNormal('punch'); return; }
    this.special = s; this.vx = 0;
    if (s.type === 'proj') { this.setState('special'); this.spawned = false; }
    else if (s.type === 'dash') {
      this.setState('dash');
      this.att = { dmg: s.dmg, reach: 100, hy: s.hy, from: 0, to: s.frames, hit: false, kd: s.kd, push: 10, hs: 16, snd: 'heavy' };
      Audio.play('whoosh');
      Game.text(s.name.toUpperCase(), this.ch.col, 50);
    } else if (s.type === 'tele') {
      this.setState('tele'); this.alpha = 1; Audio.play('tele');
      Game.fx.burst(this.x, GROUND - this.hgt * 0.5, '#555', 14, 5, 22, -0.05, 'smoke');
    }
  }

  tickState(i, game) {
    const s = this.state, t = this.t, o = this.opp;
    const atkTotal = this.att ? (NORMALS[s] ? NORMALS[s].total : 0) : 0;
    switch (s) {
      case 'punch': case 'kick': case 'sweep': case 'uppercut':
        if (s === 'sweep' && t < 10) this.vx = 2 * this.facing; else if (this.grounded) this.vx *= 0.7;
        if (this.att && t >= this.att.from && t <= this.att.to && !this.att.hit) game.tryHit(this, this.att);
        if (t >= atkTotal) this.setState('idle');
        break;
      case 'jump':
        if ((i.A || i.B || this.cpuAirAtk) && this.y > 40 && (game.phase === 'fight' || game.winner === this)) {
          const useK = i.B || this.cpuAirAtk || !i.A;
          if (this.cpuAirAtk && Math.abs(o.x - this.x) > 260 && this.vy > -4) break;
          this.cpuAirAtk = false;
          this.state = 'jumpatk';
          const a = NORMALS[useK ? 'airkick' : 'airpunch'];
          this.att = Object.assign({}, a, { hit: false, from: this.t + a.start, to: 9999 });
          Audio.play('whiff');
        }
        break;
      case 'jumpatk':
        if (this.att && !this.att.hit && t >= this.att.from) game.tryHit(this, this.att);
        break;
      case 'special': {
        const sp = this.special;
        if (t === 10 && !this.spawned) { this.spawned = true; game.spawnProj(this, sp.proj); game.text(sp.name.toUpperCase(), this.ch.col, 50); }
        if (t >= 30) this.setState('idle');
        break;
      }
      case 'dash': {
        const sp = this.special;
        const k = t / sp.frames;
        this.vx = (this.att && this.att.hit ? sp.spd * 0.15 : sp.spd) * this.facing;
        if (sp.lift) this.y = Math.sin(Math.PI * clamp(k, 0, 1)) * sp.lift; 
        if (this.att && !this.att.hit) game.tryHit(this, this.att);
        if (t % 3 === 0) this.ghost.push({ x: this.x, y: this.y, a: 0.5, pose: sp.pose, f: this.facing });
        if (t >= sp.frames) { this.y = 0; this.vx = 0; this.setState('idle'); }
        break;
      }
      case 'tele': {
        const sp = this.special;
        if (t < 14) this.alpha = 1 - t / 14;
        if (t === 14) {
          // reposiciona
          if (sp.mode === 'behind') {
            let nx = o.x - o.facing * 120; if (nx < LEFT_WALL || nx > RIGHT_WALL) nx = o.x + o.facing * 120;
            this.x = clamp(nx, LEFT_WALL, RIGHT_WALL); this.y = 0;
          } else { this.x = clamp(o.x - this.facing * (sp.mode === 'stomp' ? 10 : 60), LEFT_WALL, RIGHT_WALL); this.y = sp.mode === 'stomp' ? 420 : 340; this.vy = 0; }
          this.facing = o.x >= this.x ? 1 : -1;
          game.fx.burst(this.x, GROUND - this.y - this.hgt * 0.5, '#555', 14, 5, 22, -0.05, 'smoke');
          Audio.play('tele');
        }
        if (t > 14 && t <= 20) this.alpha = (t - 14) / 6;
        if (t === 20) {
          this.alpha = 1;
          if (sp.mode === 'behind') {
            this.doNormal('punch'); this.att.dmg = sp.dmg; this.att.kd = true; this.att.reach = 140; this.att.from = 2; this.att.to = 8;
            game.text(sp.name.toUpperCase(), this.ch.col, 50);
          } else {
            this.state = 'jumpatk'; this.vx = 0; this.vy = -6;
            const a = sp.mode === 'stomp' ? Object.assign({}, NORMALS.airkick, { pose: 'crouch', hy: [-0.3, 0.5], reach: 150 }) : NORMALS.airkick;
            this.att = Object.assign({}, a, { dmg: sp.dmg, kd: true, hit: false, from: 0, to: 9999, stomp: sp.mode === 'stomp' });
            game.text(sp.name.toUpperCase(), this.ch.col, 50);
          }
        }
        if (t < 20) { this.vx = 0; this.vy = 0; }
        break;
      }
      case 'hit': case 'blockstun':
        this.vx *= 0.82;
        if (t >= this.stun) this.afterStun();
        break;
      case 'frozen':
        this.vx = 0;
        if (t % 6 === 0) game.fx.add({ x: this.x + rnd(-40, 40), y: GROUND - this.y - rnd(20, this.hgt), vx: rnd(-0.5, 0.5), vy: -0.6, col: '#cff4ff', size: 4, life: 20, max: 20 });
        if (t >= this.stun) this.afterStun();
        break;
      case 'stunned':
        if (this.pullTo != null) { this.x += (this.pullTo - this.x) * 0.22; if (Math.abs(this.pullTo - this.x) < 4) this.pullTo = null; }
        this.vx = 0;
        if (t % 10 === 0) game.fx.add({ x: this.x + rnd(-20, 20), y: GROUND - this.hgt - 10, vx: rnd(-1, 1), vy: -0.5, col: '#ffe14a', size: 12, life: 26, max: 26, type: 'star', vr: 0.2 });
        if (t >= this.stun) this.afterStun();
        break;
      case 'lifted':
        this.vx = 0;
        if (t < 40) this.y += (150 - this.y) * 0.08; else { this.vy -= GRAV; this.y += this.vy; }
        if (t > 40 && this.y <= 0) { this.y = 0; this.vy = 0; this.setState('down'); Audio.play('land'); game.shake = 6; }
        break;
      case 'air':
        if (this.grounded && t > 3) { this.y = 0; this.vx = 0; this.setState(this.hp <= 0 && !this.toDizzy ? 'dead' : 'down'); Audio.play('land'); game.shake = 8; game.fx.burst(this.x, GROUND, '#a88a66', 12, 4, 10, 0.2, 'smoke'); }
        break;
      case 'down':
        this.vx *= 0.8;
        if (t >= 38) this.setState('getup');
        break;
      case 'getup':
        if (t >= 14) this.afterStun();
        break;
      case 'block': case 'crouchblock':
        if (!i.block) this.setState('idle');
        break;
      case 'dizzy':
        this.vx = 0;
        if (t % 12 === 0) game.fx.add({ x: this.x + Math.cos(t / 8) * 40, y: GROUND - this.hgt - 18 + Math.sin(t / 8) * 6, vx: 0, vy: 0, col: '#ffe14a', size: 11, life: 14, max: 14, type: 'star', vr: 0.25 });
        break;
    }
    if (this.ghost.length) { for (const g of this.ghost) g.a -= 0.05; this.ghost = this.ghost.filter(g => g.a > 0); }
  }
  afterStun() {
    if (this.toDizzy) { this.setState('dizzy'); this.y = 0; Game.onDizzy(this); return; }
    this.setState('idle');
  }
  physics(game) {
    const s = this.state;
    if (s === 'jump' || s === 'jumpatk' || s === 'air') {
      this.vy -= GRAV; this.y += this.vy;
      if (this.y <= 0 && s !== 'air') {
        this.y = 0; this.vy = 0; this.vx = 0;
        if (this.att && this.att.stomp) { game.shake = 14; Audio.play('boom'); game.fx.burst(this.x, GROUND, '#a88a66', 24, 7, 14, 0.25, 'smoke'); if (!this.att.hit && Math.abs(this.opp.x - this.x) < 170 && this.opp.grounded) game.tryHit(this, Object.assign(this.att, { hy: [0, 2] })); }
        else Audio.play('land');
        this.setState('idle'); this.cpuAirAtk = false;
      }
    } else if (s === 'tele' || s === 'lifted' || s === 'dash') {
      // controlado pelo estado
    } else if (this.y > 0 && s !== 'stunned') { this.y = Math.max(0, this.y - 12); }
    this.x += this.vx;
    this.x = clamp(this.x, LEFT_WALL, RIGHT_WALL);
  }

  // ---- desenho ----
  pose() {
    const s = this.state, t = this.t;
    switch (s) {
      case 'idle': case 'intro': case 'dizzy': return 'idle';
      case 'walk': { const k = Math.floor(Game.frameNo / 8) % 4; return ['walk1', 'idle', 'walk2', 'idle'][k]; }
      case 'crouch': case 'crouchblock': case 'getup': return 'crouch';
      case 'jump': return 'jump';
      case 'jumpatk': return this.att ? this.att.pose : 'kick';
      case 'punch': return t < 2 ? 'idle' : t > 11 ? 'walk1' : 'punch';
      case 'kick': return t < 4 ? 'walk2' : t > 19 ? 'walk1' : 'kick';
      case 'sweep': return t < 4 || t > 22 ? 'crouch' : 'sweep';
      case 'uppercut': return t < 5 || t > 25 ? 'crouch' : 'uppercut';
      case 'block': case 'blockstun': return 'block';
      case 'hit': case 'stunned': case 'lifted': return 'hit';
      case 'frozen': return this.lastPose;
      case 'air': return t < 6 ? 'hit' : 'ko';
      case 'down': case 'dead': return 'ko';
      case 'special': return t < 4 ? 'idle' : t > 24 ? 'block' : 'special';
      case 'dash': return this.special.pose;
      case 'tele': return 'idle';
      case 'win': return 'win';
      default: return 'idle';
    }
  }
  koAngle() {
    const s = this.state;
    if (s === 'air' && this.t >= 6) { const k = clamp((this.t - 6) / 18, 0, 1); return 0.5 * (1 - k) - 0.2 * k; }
    if (s === 'down' || s === 'dead') return -0.2;
    return 0;
  }
  drawSprite(c, pose, x, y, facing, opts = {}) {
    const f = frame(this.ch.id, pose); if (!f.img) return;
    const m = f.m;
    c.save();
    c.translate(x + facing * (opts.lunge || 0), GROUND - y);
    c.scale(facing, 1);
    let rot = opts.rot || 0;
    if (opts.flipSpin) rot += opts.flipSpin;
    if (rot) {
      if (opts.flipSpin) { c.translate(0, -m.h * 0.5); c.rotate(rot); c.translate(0, m.h * 0.5); }
      else c.rotate(rot);
    }
    if (opts.sway) c.rotate(opts.sway);
    if (opts.squash) c.scale(1 + opts.squash * 0.5, 1 - opts.squash);
    c.globalAlpha = opts.alpha ?? 1;
    const dx = -m.ax, dy = -m.h + (opts.dropY || 0);
    if (opts.tint) {
      tintCv.width = m.w; tintCv.height = m.h;
      tintCx.clearRect(0, 0, m.w, m.h);
      tintCx.globalCompositeOperation = 'source-over'; tintCx.drawImage(f.img, 0, 0, m.w, m.h);
      tintCx.globalCompositeOperation = 'source-atop'; tintCx.fillStyle = opts.tint; tintCx.fillRect(0, 0, m.w, m.h);
      c.drawImage(tintCv, dx, dy);
    } else {
      const hue = this.ch.hue != null ? this.ch.hue : (this.ch.art ? 125 : null);
      if (hue != null) c.filter = `hue-rotate(${hue}deg) saturate(1.25)`;
      c.drawImage(f.img, dx, dy, m.w, m.h);
    }
    c.restore();
  }
  draw(c, game) {
    const pose = this.pose();
    if (this.state !== 'frozen') this.lastPose = pose;
    // sombra
    const sh = clamp(1 - this.y / 500, 0.3, 1);
    c.fillStyle = 'rgba(0,0,0,0.45)'; c.beginPath(); c.ellipse(this.x, GROUND + 2, this.ch.hw * 1.5 * sh, 12 * sh, 0, 0, Math.PI * 2); c.fill();
    for (const g of this.ghost) this.drawSprite(c, g.pose, g.x, g.y, g.f, { alpha: g.a * 0.6, tint: this.ch.col + 'aa' });
    if (this.dead && this.hideBody) return;
    const opts = { alpha: this.alpha };
    const attack = NORMALS[this.state];
    if (attack || this.state === 'special') {
      const peak = attack ? attack.start + attack.act * 0.5 : 11;
      const end = attack ? attack.total : 30;
      const pulse = Math.sin(Math.PI / 2 * clamp(this.t <= peak ? this.t / peak : (end - this.t) / (end - peak), 0, 1));
      opts.lunge = pulse * (this.state === 'kick' ? 15 : 9);
      opts.sway = -pulse * (this.state === 'uppercut' ? 0.1 : 0.055);
      opts.squash = pulse * (this.state === 'sweep' ? 0.07 : -0.04);
    }
    if (this.state === 'idle') opts.squash = Math.sin(Game.frameNo / 9) * 0.012;
    if (this.state === 'dizzy') opts.sway = Math.sin(this.t / 14) * 0.07;
    if (this.state === 'stunned') opts.sway = Math.sin(this.t / 6) * 0.05;
    if (this.state === 'jump' && this.flip && this.vy < 17 && this.y > 30) opts.flipSpin = -((21 - this.vy) / 42) * Math.PI * 2 * Math.sign(this.vx * this.facing || 1);
    const kr = this.koAngle(); if (kr) opts.rot = kr;
    if (pose === 'ko') opts.dropY = 14;
    if (this.state === 'frozen') opts.tint = 'rgba(120,210,255,0.55)';
    else if (this.flash > 0) opts.tint = 'rgba(255,255,255,0.38)';
    else if (this.burn) opts.tint = `rgba(20,8,0,${this.burn})`;
    this.drawSprite(c, pose, this.x, this.y, this.facing, opts);
    if (this.state === 'frozen') {
      c.save(); const m = this.m.idle, bx = this.x - this.ch.hw * 1.6, by = GROUND - this.y - m.h - 6, bw2 = this.ch.hw * 3.2;
      const ig = c.createLinearGradient(bx, by, bx + bw2, by + m.h); ig.addColorStop(0, 'rgba(200,240,255,0.28)'); ig.addColorStop(0.5, 'rgba(140,210,255,0.12)'); ig.addColorStop(1, 'rgba(200,240,255,0.25)');
      c.fillStyle = ig; c.fillRect(bx, by, bw2, m.h + 6); c.strokeStyle = 'rgba(230,250,255,0.45)'; c.lineWidth = 2; c.strokeRect(bx, by, bw2, m.h + 6); c.restore();
    }
  }
}

// ---------------- Jogo ----------------
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');

const Game = {
  phase: 'off', frameNo: 0, p: [], projs: [], fx: new Particles(), texts: [], shake: 0, hitstop: 0,
  round: 1, wins: [0, 0], score: [0, 0], timer: ROUND_TIME, timerAcc: 0, stage: 'bg_ponte', phaseT: 0, winner: null, loser: null,
  big: null, fatality: null, paused: false, mode: 'arcade', onMatchEnd: null, flawless: false, combo: [0, 0], comboT: [0, 0],

  start(c1, c2, ctrl1, ctrl2, stage, onEnd) {
    this.p = [new Fighter(c1, 0, ctrl1), new Fighter(c2, 1, ctrl2)];
    this.p[0].opp = this.p[1]; this.p[1].opp = this.p[0];
    this.stage = stage; this.onMatchEnd = onEnd;
    this.wins = [0, 0]; this.score = [0, 0]; this.round = 1;
    this.startRound();
    document.body.classList.add('fighting');
  },
  startRound() {
    this.p.forEach(f => f.reset());
    this.projs = []; this.fx.list = []; this.texts = [];
    this.timer = ROUND_TIME; this.timerAcc = 0; this.winner = null; this.loser = null; this.fatality = null;
    this.phase = 'intro'; this.phaseT = 0; this.combo = [0, 0]; this.hitstop = 0; this.shake = 0; this.darken = 0; this.spearLine = null;
    this.big = { txt: 'ROUND ' + this.round, sub: null, t: 0 };
    if (this.round === 3 && this.wins[0] === 1 && this.wins[1] === 1) this.big.txt = 'ROUND FINAL';
    const rt = this.big.txt; setTimeout(() => announce(rt === 'ROUND FINAL' ? 'Round final' : 'Round ' + this.round), 150);
  },
  text(txt, col, life = 60, y = 200) { this.texts.push({ txt, col, life, max: life, y }); },

  spawnProj(f, kind) {
    const P = PROJ[kind];
    this.projs.push({ owner: f, kind, x: f.x + f.facing * (f.ch.hw + 50), y: f.hgt * 0.7, vx: P.spd * f.facing, r: P.r, life: P.life || 200, t: 0, startX: f.x });
    Audio.play(P.snd);
  },

  tryHit(att, a) {}, // substituído abaixo

  update() {
    this.frameNo++;
    if (this.paused) return;
    this.fx.update();
    this.texts.forEach(t => t.life--); this.texts = this.texts.filter(t => t.life > 0);
    if (this.big) this.big.t++;
    if (this.shake > 0) this.shake--;
    if (this.phase === 'off') return;
    this.phaseT++;
    if (this.hitstop > 0) { this.hitstop--; return; }

    if (this.phase === 'intro') {
      if (this.phaseT === 90) { this.big = { txt: 'LUTE!', t: 0, red: true }; announce('Lute!'); Audio.play('gong'); }
      if (this.phaseT >= 130) { this.phase = 'fight'; this.big = null; }
    }
    if (this.phase === 'fight') {
      this.timerAcc++;
      if (this.timerAcc >= 60) { this.timerAcc = 0; this.timer--; if (this.timer <= 0) { this.timer = 0; this.timeOver(); } }
    }
    if (this.phase === 'finish') {
      const l = this.loser;
      if (l.state === 'dizzy') { this.finishT = (this.finishT || 0) + 1; if (this.finishT > 360) { l.toDizzy = false; this.knockDead(l); } }
    }
    if (this.phase === 'fatality') this.updateFatality();
    if (this.phase === 'roundEnd') {
      if (this.phaseT === 45 && this.winner && this.winner.state !== 'win' && this.winner.canAct()) this.winner.setState('win');
      if (this.phaseT === 50 && this.winner) {
        const pre = this.fatalityDone ? '' : this.flawless ? 'VITÓRIA PERFEITA' : '';
        this.big = { txt: this.winner.ch.name + ' VENCE', sub: pre, t: 0 };
        announce(this.winner.ch.name + ' vence' + (pre ? '. Vitória perfeita!' : ''));
      }
      if (this.phaseT === 50 && !this.winner) { this.big = { txt: 'EMPATE', t: 0 }; }
      if (this.phaseT >= 230) this.nextRound();
    }

    for (const f of this.p) f.update(this);
    this.inputConsumed = true;
    this.separate();
    this.updateProjs();
    for (let k = 0; k < 2; k++) { if (this.comboT[k] > 0) this.comboT[k]--; else this.combo[k] = 0; }
    for (const f of this.p) f.dispHp += (f.hp - f.dispHp) * 0.06;
  },
  separate() {
    const [a, b] = this.p;
    if (a.invuln() && a.state !== 'tele' || b.invuln() && b.state !== 'tele') { /* permite atravessar caídos */ }
    if (a.state === 'tele' || b.state === 'tele' || a.state === 'down' || b.state === 'down' || a.dead || b.dead) return;
    const minD = (a.ch.hw + b.ch.hw) * 1.35;
    const dx = b.x - a.x;
    if (Math.abs(dx) < minD && Math.abs(a.y - b.y) < 160) {
      const push = (minD - Math.abs(dx)) / 2, s = dx >= 0 ? 1 : -1;
      a.x -= push * s; b.x += push * s;
      if (a.x < LEFT_WALL) { b.x += LEFT_WALL - a.x; a.x = LEFT_WALL; }
      if (b.x < LEFT_WALL) { a.x += LEFT_WALL - b.x; b.x = LEFT_WALL; }
      if (a.x > RIGHT_WALL) { b.x -= a.x - RIGHT_WALL; a.x = RIGHT_WALL; }
      if (b.x > RIGHT_WALL) { a.x -= b.x - RIGHT_WALL; b.x = RIGHT_WALL; }
    }
  },
  updateProjs() {
    for (const p of this.projs) {
      p.x += p.vx; p.t++; p.life--;
      const o = p.owner.opp;
      if (p.kind === 'fire' || p.kind === 'hellfire') { if (p.t % 2 === 0) this.fx.add({ x: p.x - p.vx * 1.5 + rnd(-6, 6), y: GROUND - p.y + rnd(-10, 10), vx: -p.vx * 0.15, vy: rnd(-1, 0), col: PROJ[p.kind].col, size: p.r * 0.7, life: 16, max: 16, type: 'fire' }); }
      if (p.kind === 'ice' && p.t % 2 === 0) this.fx.add({ x: p.x + rnd(-10, 10), y: GROUND - p.y + rnd(-12, 12), vx: -p.vx * 0.1, vy: rnd(-0.5, 0.5), col: '#bff0ff', size: 4, life: 18, max: 18 });
      if (p.x < -80 || p.x > W + 80) p.life = 0;
      // colisão com projétil inimigo
      for (const q of this.projs) if (q !== p && q.owner !== p.owner && q.life > 0 && p.life > 0 && Math.abs(q.x - p.x) < q.r + p.r) {
        p.life = 0; q.life = 0; this.fx.burst((p.x + q.x) / 2, GROUND - p.y, '#fff3b0', 26, 9, 9); Audio.play('boom');
      }
      if (p.life <= 0) continue;
      if (o.invuln() || o.state === 'frozen' && p.kind === 'ice') continue;
      const [lo, hi] = o.span();
      if (Math.abs(p.x - o.x) < o.ch.hw + p.r * 0.7 && p.y + p.r * 0.6 > lo && p.y - p.r * 0.6 < hi) {
        p.life = 0;
        const P = PROJ[p.kind];
        this.applyHit(p.owner, o, { dmg: P.dmg, hs: 18, push: 8, kd: p.kind === 'fire' || p.kind === 'hellfire' ? false : false, effect: P.effect, proj: true, snd: 'heavy' }, p.x, GROUND - p.y);
      }
    }
    this.projs = this.projs.filter(p => p.life > 0);
  },

  applyHit(src, dst, att, hx, hy) {
    if (dst.dead) return;
    if (this.phase !== 'fight' && !(this.phase === 'finish' && src === this.winner)) return;
    // Golpe final no adversário tonto
    if (dst.state === 'dizzy') {
      dst.toDizzy = false;
      Audio.play('heavy'); this.fx.burst(hx, hy, '#ffdf6a', 22, 9, 8);
      this.knockDead(dst, src.facing);
      return;
    }
    if (dst.isBlocking() && !att.unblockable && (dst.state !== 'crouchblock' || true)) {
      const dmg = att.dmg * 0.14 * src.ch.power;
      dst.hp = Math.max(dst.hp - dmg, dst.hp > 1 ? 1 : 0);
      dst.setState('blockstun'); dst.stun = 10; dst.vx = -dst.facing * (att.push * 0.5 + 2);
      Audio.play('block'); this.fx.burst(hx, hy, '#9fd8ff', 10, 6, 6);
      this.hitstop = 2;
      return 'block';
    }
    const k = src.side;
    const inCombo = ['hit', 'air', 'stunned', 'lifted', 'frozen'].includes(dst.state);
    this.combo[k] = inCombo ? this.combo[k] + 1 : 1; this.comboT[k] = 70;
    if (this.combo[k] >= 2) this.text(this.combo[k] + ' GOLPES', src.side === 0 ? '#7fd0ff' : '#ff8a7a', 60, 250);
    let dmg = att.dmg * src.ch.power * dst.ch.def * (inCombo ? 0.85 : 1);
    if (src.ctrl instanceof CpuCtrl && src.ctrl.style === 'easy') dmg *= 0.55;
    if (dst.ctrl instanceof HumanCtrl && UI.diff === 0) dmg *= 0.8;
    this.score[k] += Math.max(1, Math.round(Math.min(dst.hp, dmg) * 10)) + (this.combo[k] > 1 ? 25 : 0);
    dst.hp = Math.max(0, dst.hp - dmg); dst.hitsTaken++;
    dst.flash = 4;
    Audio.play(att.snd || 'heavy');
    const big = dmg >= 9;
    this.fx.burst(hx, hy, '#ffe9a0', big ? 20 : 12, big ? 10 : 7, 7);
    this.fx.burst(hx, hy, '#ff2a14', big ? 14 : 7, 6, 6, 0.4);
    this.hitstop = big ? 6 : 3; this.shake = big ? 8 : 3;
    const away = src.x <= dst.x ? 1 : -1;
    dst.facing = -away;
    let killed = false;
    if (dst.hp <= 0) {
      killed = true;
      const willWin = this.wins[src.side] + 1 >= 2;
      this.onKO(src, dst, willWin);
    }
    if (att.effect === 'freeze' && !killed) { dst.setState('frozen'); dst.stun = 105; dst.vx = 0; Audio.play('freeze'); this.text('CONGELADO!', '#9fe4ff', 50, 300); return; }
    if (att.effect === 'pull' && !killed) { dst.setState('stunned'); dst.stun = 62; dst.pullTo = clamp(src.x + src.facing * (src.ch.hw + dst.ch.hw + 40), LEFT_WALL, RIGHT_WALL); this.text('AQUI Ó!', '#3eea6a', 60, 300); announce('Aqui ó!'); this.spearLine = { from: src, to: dst, t: 18 }; return; }
    if (att.effect === 'lift' && !killed) { dst.setState('lifted'); dst.vy = 0; this.text('LEVITAÇÃO!', '#bfe8ff', 50, 300); return; }
    if (att.kd || att.launch || (killed && !dst.toDizzy)) {
      dst.setState('air'); dst.vy = att.launch ? 18 : 11; dst.y = Math.max(dst.y, 2); dst.vx = away * (att.launch ? 4 : 6);
      if (att.launch) { this.shake = 12; }
      return;
    }
    if (!dst.grounded) { dst.setState('air'); dst.vy = 6; dst.vx = away * 5; return; }
    dst.setState('hit'); dst.stun = att.hs || 14; dst.vx = away * (att.push || 6);
  },
  onKO(src, dst, final) {
    this.winner = src; this.loser = dst;
    this.flawless = src.hitsTaken === 0;
    if (final) {
      dst.toDizzy = true; dst.hp = 0;
      this.phase = 'finish'; this.phaseT = 0; this.finishT = 0;
      this.big = { txt: dst.ch.g === 'ELA' ? 'ACABE COM ELA!' : 'ACABE COM ELE!', t: 0, red: true };
      announce(dst.ch.g === 'ELA' ? 'Acabe com ela!' : 'Acabe com ele!');
      this.projs = [];
    } else {
      this.wins[src.side]++; this.projs = [];
      this.phase = 'roundEnd'; this.phaseT = 0; this.fatalityDone = false;
      Audio.play('boom');
      this.big = { txt: 'K.O.', t: 0, red: true };
    }
  },
  onDizzy(f) { f.vx = 0; },
  knockDead(dst, dir) {
    dst.setState('air'); dst.vy = 12; dst.y = Math.max(dst.y, 2); dst.vx = (dir || -dst.facing) * 6;
    this.wins[this.winner.side]++;
    this.phase = 'roundEnd'; this.phaseT = 0; this.fatalityDone = false; this.big = null;
  },
  timeOver() {
    const [a, b] = this.p;
    this.big = { txt: 'TEMPO ESGOTADO', t: 0 };
    if (Math.abs(a.hp - b.hp) < 0.5) { this.winner = null; this.phase = 'roundEnd'; this.phaseT = 0; this.fatalityDone = false; this.draws = (this.draws || 0) + 1; return; }
    const w = a.hp > b.hp ? a : b, l = w.opp;
    this.winner = w; this.loser = l; this.flawless = w.hitsTaken === 0;
    if (this.wins[w.side] + 1 >= 2) {
      l.toDizzy = true; l.setState('dizzy'); this.phase = 'finish'; this.phaseT = 0; this.finishT = 0;
      this.big = { txt: l.ch.g === 'ELA' ? 'ACABE COM ELA!' : 'ACABE COM ELE!', t: 0, red: true };
      announce(l.ch.g === 'ELA' ? 'Acabe com ela!' : 'Acabe com ele!');
    } else { this.wins[w.side]++; this.phase = 'roundEnd'; this.phaseT = 0; this.fatalityDone = false; l.setState('hit'); l.stun = 60; }
  },
  nextRound() {
    const matchWon = this.wins[0] >= 2 || this.wins[1] >= 2;
    if (matchWon || this.round >= 5) {
      this.phase = 'off';
      const w = this.wins[0] >= 2 ? 0 : this.wins[1] >= 2 ? 1 : (this.wins[0] >= this.wins[1] ? 0 : 1);
      document.body.classList.remove('fighting');
      if (this.onMatchEnd) this.onMatchEnd(w);
      return;
    }
    this.round++;
    this.startRound();
  },

  // ---- Fatality ----
  startFatality(w) {
    const l = this.loser, f = w.ch.fatal;
    this.phase = 'fatality'; this.phaseT = 0; this.fatality = { w, l, kind: f.kind, col: f.col, name: f.name };
    this.big = null; w.setState('special'); w.spawned = true; w.vx = 0;
    w.facing = l.x >= w.x ? 1 : -1;
    Audio.stopMusic();
    this.darken = 0;
    this.text(f.name.toUpperCase(), f.col, 80, 200);
  },
  updateFatality() {
    const F = this.fatality, t = this.phaseT, l = F.l, w = F.w;
    this.darken = Math.min(0.55, t / 40);
    if (t >= 30 && t < 130 && w.state !== 'special') w.setState('special', 8);
    if (w.state === 'special' && t < 130) w.t = Math.min(w.t, 20);
    if (F.kind === 'burn') {
      if (t > 20 && t < 150) {
        for (let k = 0; k < 4; k++) this.fx.add({ x: l.x + rnd(-l.ch.hw, l.ch.hw), y: GROUND - rnd(0, l.hgt), vx: rnd(-0.6, 0.6), vy: rnd(-4, -1.5), col: F.col, size: rnd(18, 34), life: 26, max: 26, type: 'fire' });
        l.burn = clamp((t - 20) / 90, 0, 0.92);
        if (t % 20 === 0) Audio.play('fire');
      }
      if (t === 150) { this.shatter(l, '#2a1a10', 7, 0.15); Audio.play('boom'); this.shake = 14; }
    } else if (F.kind === 'shatter') {
      if (t === 30) { l.setState('frozen'); l.stun = 9999; Audio.play('freeze'); this.fx.burst(l.x, GROUND - l.hgt * 0.5, F.col, 30, 8, 8); }
      if (t === 100) { this.shatter(l, null, 12, 0.35); Audio.play('shatter'); Audio.play('boom'); this.shake = 18; this.fx.burst(l.x, GROUND - l.hgt * 0.5, F.col, 50, 14, 10); }
    } else if (F.kind === 'slice') {
      if (t === 40) { Audio.play('whoosh'); this.fx.burst(l.x, GROUND - l.hgt * 0.62, '#e8fbff', 30, 12, 6); }
      if (t === 50) { this.slice(l); Audio.play('heavy'); this.shake = 10; }
    }
    if (t === 175) { this.big = { txt: 'RAGE!', t: 0, red: true, huge: true }; announce('Rage!'); Audio.play('gong'); }
    if (t === 290) {
      this.wins[w.side]++;
      this.phase = 'roundEnd'; this.phaseT = 40; this.fatalityDone = true;
      w.setState('win'); this.darken = 0.35;
      Audio.startMusic();
    }
  },
  shatter(f, tint, cols, spd) {
    const pose = f.lastPose || 'idle';
    const fr = frame(f.ch.id, pose); if (!fr.img) return;
    const m = fr.m;
    const oc = document.createElement('canvas'); oc.width = m.w; oc.height = m.h;
    const ox = oc.getContext('2d');
    ox.save(); if (f.facing < 0) { ox.translate(m.w, 0); ox.scale(-1, 1); }
    ox.drawImage(fr.img, 0, 0, m.w, m.h); ox.restore();
    if (tint || f.state === 'frozen') { ox.globalCompositeOperation = 'source-atop'; ox.fillStyle = tint ? 'rgba(30,15,5,0.85)' : 'rgba(120,210,255,0.5)'; ox.fillRect(0, 0, m.w, m.h); }
    const left = f.x - (f.facing > 0 ? m.ax : m.w - m.ax), top = GROUND - f.y - m.h;
    const cw = m.w / cols, rows = Math.ceil(m.h / cw);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const cx = left + c * cw + cw / 2, cy = top + r * cw + cw / 2;
      const ang = Math.atan2(cy - (top + m.h / 2), cx - f.x);
      const s = rnd(4, 16) * (1 + spd);
      this.fx.add({ type: 'shard', img: oc, sx: c * cw, sy: r * cw, sw: cw, sh: cw, x: cx, y: cy, vx: Math.cos(ang) * s, vy: Math.sin(ang) * s - rnd(4, 10), g: 0.6, drag: 0.99, vr: rnd(-0.3, 0.3), life: 140, max: 140 });
    }
    f.dead = true; f.hideBody = true;
  },
  slice(f) {
    const pose = f.lastPose || 'hit';
    const fr = frame(f.ch.id, pose); if (!fr.img) return;
    const m = fr.m;
    const oc = document.createElement('canvas'); oc.width = m.w; oc.height = m.h;
    const ox = oc.getContext('2d'); ox.save(); if (f.facing < 0) { ox.translate(m.w, 0); ox.scale(-1, 1); } ox.drawImage(fr.img, 0, 0, m.w, m.h); ox.restore();
    const left = f.x - (f.facing > 0 ? m.ax : m.w - m.ax), top = GROUND - f.y - m.h, cut = m.h * 0.4;
    this.fx.add({ type: 'shard', img: oc, sx: 0, sy: 0, sw: m.w, sh: cut, x: left + m.w / 2, y: top + cut / 2, vx: -f.facing * 3, vy: -9, g: 0.5, vr: -f.facing * 0.06, drag: 0.995, life: 160, max: 160 });
    this.fx.add({ type: 'shard', img: oc, sx: 0, sy: cut, sw: m.w, sh: m.h - cut, x: left + m.w / 2, y: top + cut + (m.h - cut) / 2, vx: 0, vy: 0, g: 0, vr: 0, drag: 1, life: 160, max: 160, settle: true });
    this.fx.burst(f.x, top + cut, '#ffd34a', 40, 10, 6, 0.4);
    f.dead = true; f.hideBody = true;
  },

  // ---- Desenho ----
  render() {
    const c = ctx;
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (this.shake > 0) c.translate(rnd(-1, 1) * this.shake, rnd(-1, 1) * this.shake * 0.6);
    const bg = IMG[this.stage];
    if (bg) c.drawImage(bg, -20, -12, W + 40, H + 24); else { c.fillStyle = '#111'; c.fillRect(0, 0, W, H); }
    if (this.phase === 'off') { c.restore(); return; }
    // vinheta no chão
    const gr = c.createLinearGradient(0, GROUND - 40, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.45)'); c.fillStyle = gr; c.fillRect(0, GROUND - 40, W, H);
    if (this.darken) { c.fillStyle = `rgba(0,0,0,${this.darken})`; c.fillRect(-30, -30, W + 60, H + 60); }

    // ordem: quem ataca na frente
    const order = [...this.p].sort((a, b) => (a.att ? 1 : 0) - (b.att ? 1 : 0));
    for (const f of order) f.draw(c, this);
    // lança do Scorpion
    for (const p of this.projs) this.drawProj(c, p);
    if (this.spearLine && this.spearLine.t > 0) {
      const s = this.spearLine; s.t--;
      c.strokeStyle = '#d9c9a0'; c.lineWidth = 3; c.beginPath(); c.moveTo(s.from.x + s.from.facing * 40, GROUND - s.from.hgt * 0.7); c.lineTo(s.to.x, GROUND - s.to.hgt * 0.7); c.stroke();
    }
    this.fx.draw(c);
    c.restore();
    this.drawHUD(c);
  },
  drawProj(c, p) {
    const x = p.x, y = GROUND - p.y, P = PROJ[p.kind], dir = Math.sign(p.vx);
    c.save(); c.translate(x, y);
    switch (p.kind) {
      case 'fire': case 'hellfire': case 'mist': {
        c.globalCompositeOperation = 'lighter';
        const r = p.r * (1 + Math.sin(p.t * 0.6) * 0.08);
        const g = c.createRadialGradient(0, 0, 2, 0, 0, r * 1.6); g.addColorStop(0, '#fffbe0'); g.addColorStop(0.3, p.kind === 'mist' ? '#c1ffe1' : '#ffd24a'); g.addColorStop(0.6, P.col); g.addColorStop(1, 'transparent');
        c.fillStyle = g; c.beginPath(); c.ellipse(-dir * r * 0.3, 0, r * 1.6, r * 1.05, 0, 0, Math.PI * 2); c.fill();
        break;
      }
      case 'ice': {
        c.globalCompositeOperation = 'lighter';
        const g = c.createRadialGradient(0, 0, 2, 0, 0, p.r * 1.5); g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, '#9fe8ff'); g.addColorStop(1, 'rgba(40,140,255,0)');
        c.fillStyle = g; c.beginPath(); c.arc(0, 0, p.r * 1.5, 0, Math.PI * 2); c.fill();
        c.globalCompositeOperation = 'source-over'; c.rotate(p.t * 0.2); c.strokeStyle = '#e8fbff'; c.lineWidth = 2;
        for (let k = 0; k < 6; k++) { c.rotate(Math.PI / 3); c.beginPath(); c.moveTo(0, 0); c.lineTo(p.r * 0.9, 0); c.stroke(); }
        break;
      }
      case 'fan': {
        c.rotate(p.t * 0.5 * dir);
        c.fillStyle = '#dfe9f5'; c.strokeStyle = '#2a5ea8'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, p.r, -Math.PI * 0.9, -Math.PI * 0.1); c.closePath(); c.fill(); c.stroke();
        for (let k = 1; k < 7; k++) { const a = -Math.PI * 0.9 + k * (Math.PI * 0.8 / 7); c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * p.r, Math.sin(a) * p.r); c.stroke(); }
        c.fillStyle = '#c9a02a'; c.beginPath(); c.arc(0, 0, 4, 0, Math.PI * 2); c.fill();
        break;
      }
      case 'wind': {
        c.scale(dir, 1); c.globalAlpha = 0.6; c.strokeStyle = '#e6f6ff'; c.lineWidth = 4;
        for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(-k * 18, Math.sin(p.t * 0.4 + k) * 4, p.r - k * 10, -1.1, 1.1); c.stroke(); }
        break;
      }
      case 'ring': {
        c.globalCompositeOperation = 'lighter';
        for (let k = 0; k < 3; k++) { c.strokeStyle = k ? 'rgba(255,90,210,0.6)' : '#ffd0f4'; c.lineWidth = 5 - k; c.beginPath(); c.ellipse(-dir * k * 22, 0, p.r * 0.45, p.r, 0, 0, Math.PI * 2); c.stroke(); }
        break;
      }
      case 'sai': {
        c.rotate(p.t * 0.05 * dir); c.scale(dir, 1);
        c.fillStyle = '#ffd34a'; c.strokeStyle = '#7a5208'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(34, 0); c.lineTo(-4, -4); c.lineTo(-4, 4); c.closePath(); c.fill(); c.stroke();
        c.fillRect(-20, -2.5, 16, 5); c.beginPath(); c.moveTo(-4, 0); c.lineTo(4, -14); c.lineTo(8, -12); c.lineTo(0, 0); c.lineTo(8, 12); c.lineTo(4, 14); c.closePath(); c.fill();
        break;
      }
      case 'spear': {
        c.restore(); c.save();
        const o = p.owner;
        c.strokeStyle = '#d9c9a0'; c.lineWidth = 3; c.beginPath(); c.moveTo(o.x + o.facing * 50, GROUND - o.hgt * 0.7); c.lineTo(x, y); c.stroke();
        c.translate(x, y); c.scale(dir, 1); c.fillStyle = '#e8e8e8'; c.strokeStyle = '#555';
        c.beginPath(); c.moveTo(26, 0); c.lineTo(0, -10); c.lineTo(4, 0); c.lineTo(0, 10); c.closePath(); c.fill(); c.stroke();
        break;
      }
    }
    c.restore();
  },
  drawHUD(c) {
    const bw = 520, bh = 34, top = 30;
    for (let k = 0; k < 2; k++) {
      const f = this.p[k]; if (!f) continue;
      const x = k === 0 ? 40 : W - 40 - bw;
      c.fillStyle = '#000'; c.fillRect(x - 3, top - 3, bw + 6, bh + 6);
      c.fillStyle = '#8c0d05'; c.fillRect(x, top, bw, bh);
      const max = f.maxHp || 100, dw = bw * clamp(f.dispHp / max, 0, 1), w = bw * clamp(f.hp / max, 0, 1);
      c.fillStyle = '#e8c23a';
      if (k === 0) c.fillRect(x, top, dw, bh); else c.fillRect(x + bw - dw, top, dw, bh);
      const g = c.createLinearGradient(0, top, 0, top + bh); g.addColorStop(0, '#5ef06a'); g.addColorStop(0.5, '#1fb534'); g.addColorStop(1, '#0d6e1d');
      c.fillStyle = g;
      if (k === 0) c.fillRect(x, top, w, bh); else c.fillRect(x + bw - w, top, w, bh);
      c.strokeStyle = '#d9b26a'; c.lineWidth = 2; c.strokeRect(x, top, bw, bh);
      c.font = '600 30px Teko, Impact, sans-serif'; c.textBaseline = 'middle';
      c.fillStyle = '#000'; c.textAlign = k === 0 ? 'left' : 'right';
      const nx = k === 0 ? x + 12 : x + bw - 12;
      c.fillText(f.ch.name, nx + 2, top + bh / 2 + 4);
      c.fillStyle = '#fff'; c.fillText(f.ch.name, nx, top + bh / 2 + 2);
      c.font = '600 38px Teko, sans-serif';
      c.lineWidth = 5; c.strokeStyle = '#100904';
      const sx = k === 0 ? x : x + bw, sy = top + bh + 67;
      const points = `${this.score[k].toLocaleString('pt-BR')} PTS`;
      c.strokeText(points, sx, sy);
      c.fillStyle = '#ffd88f'; c.fillText(points, sx, sy);
      // vitórias
      for (let n = 0; n < this.wins[k]; n++) {
        const ex = k === 0 ? x + n * 40 : x + bw - 34 - n * 40;
        if (IMG.emblem) c.drawImage(IMG.emblem, ex, top + bh + 8, 34, 34);
      }
    }
    // relógio
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(W / 2 - 58, top - 6, 116, 50);
    c.font = '600 58px Teko, Impact, sans-serif';
    c.fillStyle = '#000'; c.fillText(String(this.timer).padStart(2, '0'), W / 2 + 3, top + 24);
    c.fillStyle = this.timer <= 10 ? '#ff4a2a' : '#ffd36a'; c.fillText(String(this.timer).padStart(2, '0'), W / 2, top + 21);
    // textos flutuantes
    for (const t of this.texts) {
      const a = clamp(t.life / 15, 0, 1), dy = (1 - t.life / t.max) * 20;
      c.globalAlpha = a; c.font = '600 44px Teko, Impact, sans-serif';
      c.fillStyle = '#000'; c.fillText(t.txt, W / 2 + 3, t.y - dy + 3);
      c.fillStyle = t.col; c.fillText(t.txt, W / 2, t.y - dy);
    }
    c.globalAlpha = 1;
    // texto grande
    if (this.big) {
      const b = this.big, sc = Math.min(1, b.t / 8), sz = b.huge ? 170 : 120;
      c.save(); c.translate(W / 2, H * 0.4); c.scale(0.6 + sc * 0.4, 0.6 + sc * 0.4);
      c.font = `700 ${sz}px Teko, Impact, sans-serif`;
      c.lineWidth = 10; c.strokeStyle = '#000'; c.strokeText(b.txt, 0, 0, W - 110);
      const g = c.createLinearGradient(0, -sz / 2, 0, sz / 2);
      if (b.red) { g.addColorStop(0, '#ffb09a'); g.addColorStop(0.45, '#ff2a10'); g.addColorStop(1, '#6a0500'); }
      else { g.addColorStop(0, '#fff6c0'); g.addColorStop(0.45, '#ffc23a'); g.addColorStop(1, '#8a3a00'); }
      c.fillStyle = g; c.fillText(b.txt, 0, 0, W - 110);
      if (b.sub) { c.font = '600 56px Teko, Impact, sans-serif'; c.lineWidth = 6; c.strokeText(b.sub, 0, sz * 0.62); c.fillStyle = '#ffe14a'; c.fillText(b.sub, 0, sz * 0.62); }
      c.restore();
    }
    // dica de fatality para humano
    if (this.phase === 'finish' && this.winner && this.winner.ctrl instanceof HumanCtrl) {
      const f = this.winner.ch.fatal;
      c.font = '500 30px Teko, Impact, sans-serif'; c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(W / 2 - 300, H - 70, 600, 40);
      c.fillStyle = '#ff8a6a'; c.fillText('GOLPE FINAL: ' + f.seq.split('').map(d => ARROW[d]).join(' ') + ' + ' + BTN[f.btn] + '  (perto ou longe)', W / 2, H - 48);
    }
  },
};

// Detecção de acerto corpo-a-corpo
Game.tryHit = function (a, att) {
  const o = a.opp;
  if (o.invuln()) return;
  const dx = (o.x - a.x) * a.facing;
  if (dx < -30 || dx > att.reach + o.ch.hw * 0.6) return;
  const ah = a.hgt, lo = a.y + att.hy[0] * ah, hi = a.y + att.hy[1] * ah;
  const [olo, ohi] = o.span();
  if (hi < olo || lo > ohi) return;
  att.hit = true;
  const hx = a.x + a.facing * Math.min(dx, att.reach * 0.8), hy = GROUND - (clamp((lo + hi) / 2, olo, ohi));
  this.applyHit(a, o, att, hx, hy);
};

// ---------------- Loop ----------------
let last = performance.now(), acc = 0;
function tick() {
  Game.inputConsumed = false; Game.update();
  if (Game.inputConsumed || Game.phase === 'off' || Game.paused) Keys.pressed = {};
}
window.render_game_to_text = () => JSON.stringify({
  screen: UI.screen, phase: Game.phase, paused: Game.paused, round: Game.round, time: Game.timer,
  score: Game.score, wins: Game.wins,
  fighters: Game.p.map(f => ({name: f.ch.name, x: Math.round(f.x), heightAboveGround: Math.round(f.y), hp: Math.round(f.hp * 10) / 10, pose: f.pose(), action: f.state})),
  projectiles: Game.projs.map(p => ({kind: p.kind, x: Math.round(p.x)})),
});
window.advanceTime = ms => {
  for (let i = 0; i < Math.min(600, Math.max(0, Math.round(ms / (1000 / 60)))); i++) tick();
  Game.render();
};
function loop(now) {
  const dt = Math.min(100, now - last); last = now; acc += dt;
  let steps = 0;
  while (acc >= 1000 / 60 && steps < 5) { tick(); acc -= 1000 / 60; steps++; }
  Game.render();
  requestAnimationFrame(loop);
}

// ---------------- Layout responsivo ----------------
function layout() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const portrait = vh > vw;
  document.body.classList.toggle('portrait', portrait);
  const st = $('#stage');
  let s, left, top;
  if (portrait && document.body.classList.contains('fighting')) {
    s = vw / W; left = 0; top = Math.max(65, (vh - H * s - 230) * 0.31);
  } else {
    s = Math.min(vw / W, vh / H); left = (vw - W * s) / 2; top = (vh - H * s) / 2;
  }
  st.style.transform = `translate(${left}px,${top}px) scale(${s})`;
  document.body.style.setProperty('--pause-top', `${portrait ? top - 54 : top + 85 * s}px`);
  document.body.style.setProperty('--arena-bottom', `${top + H * s}px`);
}
window.addEventListener('resize', layout);
window.addEventListener('orientationchange', () => setTimeout(layout, 200));

// ---------------- Controles touch ----------------
function setupTouch() {
  const dpad = $('#dpad');
  const held = new Map();
  const applyDpad = () => {
    const was = { l: Touch.l, r: Touch.r, u: Touch.u, d: Touch.d };
    Touch.l = Touch.r = Touch.u = Touch.d = false;
    for (const v of held.values()) {
      if (v.l) Touch.l = true;
      if (v.r) Touch.r = true;
      if (v.u) Touch.u = true;
      if (v.d) Touch.d = true;
    }
    for (const k of ['l', 'r', 'u', 'd']) {
      if (Touch[k] && !was[k]) Touch.tap[k] = true;
      const el = dpad && dpad.querySelector('.dir[data-dir="' + k + '"]');
      if (el) el.classList.toggle('on', Touch[k]);
    }
  };
  const dirsFromPoint = (x, y) => {
    const r = dpad.getBoundingClientRect();
    const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
    const dead = Math.min(r.width, r.height) * 0.16;
    const dirs = { l: false, r: false, u: false, d: false };
    if (Math.hypot(dx, dy) > dead) {
      const ax = Math.abs(dx), ay = Math.abs(dy);
      const diag = Math.min(ax, ay) > dead * 0.5;
      if (dx < -dead || (diag && dx < 0)) dirs.l = true;
      if (dx > dead || (diag && dx > 0)) dirs.r = true;
      if (dy < -dead || (diag && dy < 0)) dirs.u = true;
      if (dy > dead || (diag && dy > 0)) dirs.d = true;
    }
    return dirs;
  };
  const idOf = ev => ev.pointerId != null ? 'p' + ev.pointerId : 't' + (ev.identifier != null ? ev.identifier : 0);
  const point = ev => ev.clientX != null ? ev : ev.changedTouches ? ev.changedTouches[0] : ev.touches && ev.touches[0];
  if (dpad) {
    const down = ev => {
      ev.preventDefault();
      Audio.init();
      try { ev.pointerId != null && dpad.setPointerCapture && dpad.setPointerCapture(ev.pointerId); } catch (err) {}
      const pt = point(ev); if (!pt) return;
      held.set(idOf(ev.pointerId != null ? ev : pt), dirsFromPoint(pt.clientX, pt.clientY));
      applyDpad();
    };
    const move = ev => {
      const pt = point(ev); if (!pt) return;
      const id = idOf(ev.pointerId != null ? ev : pt);
      if (!held.has(id) && !held.has('t' + (pt.identifier || 0))) return;
      held.set(held.has(id) ? id : 't' + (pt.identifier || 0), dirsFromPoint(pt.clientX, pt.clientY));
      applyDpad();
    };
    const up = ev => {
      const pt = point(ev);
      held.delete(idOf(ev.pointerId != null ? ev : pt || ev));
      if (pt) held.delete('t' + (pt.identifier || 0));
      applyDpad();
    };
    for (const ev of ['pointerdown', 'mousedown', 'touchstart']) dpad.addEventListener(ev, down, { passive: false });
    for (const ev of ['pointermove', 'mousemove', 'touchmove']) dpad.addEventListener(ev, move, { passive: false });
    for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture', 'mouseup', 'touchend', 'touchcancel']) dpad.addEventListener(ev, up);
    dpad.addEventListener('contextmenu', ev => ev.preventDefault());
  }
  for (const b of $$('.tb')) {
    const k = b.dataset.k;
    const down = ev => {
      ev.preventDefault();
      Audio.init();
      try { ev.pointerId != null && b.setPointerCapture && b.setPointerCapture(ev.pointerId); } catch (err) {}
      b.classList.add('on');
      if (k === 'block') Touch.block = true; else Touch[k] = 2;
    };
    const up = ev => { b.classList.remove('on'); if (k === 'block') Touch.block = false; };
    for (const ev of ['pointerdown', 'mousedown', 'touchstart']) b.addEventListener(ev, down, { passive: false });
    for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture', 'mouseup', 'touchend', 'touchcancel']) b.addEventListener(ev, up);
    b.addEventListener('click', ev => { if (ev.detail === 0 && k !== 'block') Touch[k] = 2; });
    b.addEventListener('contextmenu', ev => ev.preventDefault());
  }
  const root = $('#touch');
  if (root) {
    root.addEventListener('contextmenu', ev => ev.preventDefault());
    root.addEventListener('touchstart', ev => ev.preventDefault(), { passive: false });
    root.addEventListener('touchmove', ev => ev.preventDefault(), { passive: false });
  }
  const blockZoom = ev => { if (ev.touches && ev.touches.length > 1) ev.preventDefault(); };
  document.addEventListener('touchstart', blockZoom, { passive: false });
  document.addEventListener('touchmove', ev => { if (document.body.classList.contains('fighting') || (ev.touches && ev.touches.length > 1)) ev.preventDefault(); }, { passive: false });
  document.addEventListener('gesturestart', ev => ev.preventDefault());
  window.addEventListener('blur', () => {
    held.clear(); applyDpad();
    Object.assign(Touch, { block: false, A: 0, B: 0, tap: {} });
    $$('.tb.on').forEach(b => b.classList.remove('on'));
  });
}

// ---------------- Interface / Telas ----------------
const UI = {
  screen: 'loading', diff: 0, diffNames: ['FÁCIL', 'NORMAL', 'DIFÍCIL'],
  sel: null, arcade: null,
  show(id) {
    $$('.screen').forEach(s => s.classList.remove('active'));
    if (id) $('#scr-' + id).classList.add('active');
    this.screen = id;
    const nav = id && $('#scr-' + id + ' [data-nav]');
    if (nav && !isTouch) { const b = nav.querySelector('.mbtn'); b && b.focus(); }
  },
  overlay(id) { $('#scr-' + id).classList.add('active'); this.screen = id; const nav = $('#scr-' + id + ' [data-nav]'); if (nav && !isTouch) { const b = nav.querySelector('.mbtn'); b && b.focus(); } },
  closeOverlay(id) { $('#scr-' + id).classList.remove('active'); },

  init() {
    $('#scr-title').addEventListener('click', () => this.toMenu());
    $$('[data-act]').forEach(b => b.addEventListener('click', () => this.act(b.dataset.act)));
    $('#help-close').addEventListener('click', () => { this.closeOverlay('help'); this.screen = this.helpReturn; if (this.helpReturn === 'pause') this.overlay('pause'); });
    $('#btn-pause').addEventListener('click', () => this.pause());
    $('#sel-back').addEventListener('click', () => this.selBack());
    $('#sel-ok').addEventListener('click', () => this.selConfirm(this.sel.mode === '2p' && this.sel.lock[0] != null ? 1 : this.sel.active));
    this.buildGrid();
    this.paintDiff();
  },
  paintDiff() {
    const names = ['Fácil', 'Normal', 'Difícil'];
    const box = $('#diff-opts');
    if (!box) return;
    box.innerHTML = names.map((n, i) => `<span data-d="${i}" class="${i === this.diff ? 'on' : ''}">${n}</span>`).join('<i>·</i>');
  },
  toMenu() { Audio.init(); Audio.play('confirm'); Audio.startMusic(); this.show('menu'); Game.phase = 'off'; Game.stage = 'bg_arena'; document.body.classList.remove('fighting'); layout(); },
  act(a) {
    Audio.init(); Audio.play('select');
    switch (a) {
      case 'arcade': this.openSelect('arcade'); break;
      case 'versus': this.openSelect('versus'); break;
      case '2p': this.openSelect('2p'); break;
      case 'diff': this.diff = (this.diff + 1) % 3; this.paintDiff(); break;
      case 'sound': Audio.setOn(!Audio.on); $('#sound-lbl').textContent = Audio.on ? 'LIGADO' : 'DESLIGADO'; $$('.sound-lbl2').forEach(e => e.textContent = Audio.on ? 'LIGADO' : 'DESLIGADO'); if (Audio.on) Audio.startMusic(); else Audio.stopMusic(); break;
      case 'help': this.openHelp(null, 'menu'); break;
      case 'resume': this.resume(); break;
      case 'moves': this.closeOverlay('pause'); this.openHelp(Game.p[0] && Game.p[0].ch, 'pause'); break;
      case 'quit': Game.paused = false; document.body.classList.remove('paused'); Game.phase = 'off'; this.closeOverlay('pause'); this.closeOverlay('continue'); this.closeOverlay('ending'); clearInterval(this.contTimer); this.toMenu(); break;
      case 'continue': clearInterval(this.contTimer); this.closeOverlay('continue'); this.startArcadeFight(); break;
    }
  },
  pause() {
    if (Game.phase === 'off' || Game.paused) return;
    Game.paused = true; document.body.classList.add('paused'); Audio.play('select'); this.overlay('pause');
  },
  resume() { Game.paused = false; document.body.classList.remove('paused'); this.closeOverlay('pause'); this.screen = null; $('#btn-pause').blur(); },
  openHelp(ch, ret) {
    this.helpReturn = ret;
    const mv = c => `<div class="blk"><h3>${c.name}</h3>${c.specials.map(s => `<div class="mv"><span>${magicLine(s)}</span></div>`).join('')}<div class="mv fat"><span>Golpe final: ${c.fatal.name}</span><span>${seqArrows(c.fatal.seq)} + ${BTN[c.fatal.btn]}</span></div></div>`;
    const ctrls = `<div class="blk"><h3>TECLADO (1 JOGADOR)</h3>
      <div class="mv"><span>Mover / pular / agachar</span><span><kbd>←↑→↓</kbd> ou <kbd>WASD</kbd></span></div>
      <div class="mv"><span>Golpe</span><span><kbd>J</kbd> ou <kbd>Z</kbd></span></div>
      <div class="mv"><span>Golpe forte</span><span><kbd>K</kbd> ou <kbd>X</kbd></span></div>
      <div class="mv"><span>Defesa (segurar)</span><span><kbd>L</kbd> <kbd>C</kbd> ou <kbd>Espaço</kbd></span></div>
      <div class="mv"><span>Pausa</span><span><kbd>Esc</kbd> ou <kbd>Enter</kbd></span></div></div>
      <div class="blk"><h3>2 JOGADORES / CELULAR</h3>
      <div class="mv"><span>Jogador 1</span><span><kbd>WASD</kbd> <kbd>F</kbd> <kbd>G</kbd> <kbd>H</kbd></span></div>
      <div class="mv"><span>Jogador 2</span><span><kbd>Setas</kbd> <kbd>I</kbd> <kbd>O</kbd> <kbd>P</kbd></span></div>
      <div class="mv"><span>Celular</span><span>Direcional + GOLPE, FORTE, DEFESA</span></div></div>
      <div class="blk"><h3>GOLPES BÁSICOS</h3>
      <div class="mv"><span>Gancho (uppercut)</span><span>↓ + FORTE</span></div>
      <div class="mv"><span>Rasteira</span><span>↓ + GOLPE</span></div>
      <div class="mv"><span>Voadora</span><span>Pular + GOLPE/FORTE</span></div>
      <div class="mv"><span>Magias</span><span>Toque a sequência rápido</span></div>
      <div class="mv"><span>Pontuação</span><span>Acertos + bônus de combo</span></div></div>
      <div class="blk"><h3>DICAS</h3>
      <div>Sequências usam a direção do lutador: → é para frente (em direção ao inimigo). Agachar desvia de socos altos e da maioria das magias. No último round, quando aparecer ACABE COM ELE/ELA, faça a sequência do Golpe Final.</div></div>`;
    $('#help-title').textContent = ch ? 'GOLPES DE ' + ch.name : 'CONTROLES E GOLPES';
    $('#help-body').innerHTML = ch ? mv(ch) + ctrls : ctrls + CHARS.map(mv).join('');
    this.overlay('help');
    $('#help-close').focus();
  },

  // ---- Seleção ----
  buildGrid() {
    const g = $('#sel-grid'); g.innerHTML = '';
    CHARS.forEach((c, k) => {
      const d = document.createElement('button'); d.type = 'button';
      d.className = 'cell' + (c.boss ? ' boss' : ''); d.dataset.k = k;
      d.setAttribute('aria-label', c.name);
      d.innerHTML = `<img src="${spritePath(c, 'portrait')}" alt="" style="${hueFilter(c) ? 'filter:' + hueFilter(c) : ''}"><span class="cn">${c.name}</span>`;
      d.addEventListener('click', () => {
        Audio.init();
        const s = this.sel; if (!s) return;
        const who = s.mode === '2p' ? (s.lock[0] == null ? 0 : 1) : s.active;
        if (s.cur[who] === k && s.lock[who] == null) this.selConfirm(who);
        else { s.cur[who] = k; if (s.mode !== '2p') s.active = who; Audio.play('move'); this.renderSel(); }
      });
      g.appendChild(d);
    });
  },
  openSelect(mode) {
    this.sel = { mode, cur: [0, 5], lock: [null, null], active: 0 };
    this.show('select');
    $('#sel-head').textContent = mode === '2p' ? 'ESCOLHAM SEUS LUTADORES' : 'ESCOLHA SEU LUTADOR';
    $('#sel-hint').textContent = mode === '2p' ? 'J1: WASD + F   |   J2: Setas + I' : isTouch ? 'Toque para escolher, toque de novo para confirmar' : 'Setas para escolher, ENTER para confirmar';
    this.renderSel();
  },
  renderSel() {
    const s = this.sel;
    $$('.cell').forEach((d, k) => {
      d.classList.toggle('p1', s.cur[0] === k);
      d.classList.toggle('p2', (s.mode !== 'arcade' && (s.active === 1 || s.lock[1] != null || s.mode === '2p')) && s.cur[1] === k);
      d.innerHTML = d.innerHTML.replace(/<span class="tag[^<]*<\/span>/g, '');
      if (s.cur[0] === k) d.insertAdjacentHTML('beforeend', '<span class="tag t1">1P</span>');
      if (d.classList.contains('p2')) d.insertAdjacentHTML('beforeend', `<span class="tag t2">${s.mode === '2p' ? '2P' : 'CPU'}</span>`);
    });
    const c1 = CHARS[s.cur[0]];
    $('#sel-p1-img').src = spritePath(c1, s.lock[0] != null ? 'win' : 'idle');
    applyHue($('#sel-p1-img'), c1);
    $('#sel-p1-img').classList.toggle('spectral', !!c1.art);
    $('#sel-p1-name').textContent = c1.name;
    $('#sel-p1-moves').innerHTML = c1.specials.map(m => magicLine(m)).join('<br>');
    const showP2 = s.mode !== 'arcade' && (s.active === 1 || s.mode === '2p');
    $('#sel-p2-img').style.visibility = showP2 ? 'visible' : 'hidden';
    $('#sel-p2-name').textContent = showP2 ? CHARS[s.cur[1]].name : (s.mode === 'arcade' ? '' : '');
    if (s.mode === 'arcade') { $('#sel-p2-moves').innerHTML = `<b>${c1.bio}</b>`; $('#sel-p2-moves').style.maxWidth = '300px'; }
    else if (showP2) { const c2 = CHARS[s.cur[1]]; $('#sel-p2-img').src = spritePath(c2, s.lock[1] != null ? 'win' : 'idle'); applyHue($('#sel-p2-img'), c2); $('#sel-p2-moves').innerHTML = c2.specials.map(m => magicLine(m)).join('<br>'); }
    else $('#sel-p2-moves').innerHTML = '';
    if (s.mode === 'versus') $('#sel-head').textContent = s.active === 0 ? 'ESCOLHA SEU LUTADOR' : 'ESCOLHA O ADVERSÁRIO';
  },
  selMove(who, dx, dy) {
    const s = this.sel; if (s.lock[who] != null) return;
    let k = s.cur[who];
    const row = k < 4 ? 0 : 1, col = row === 0 ? k : k - 4;
    if (dx) k = row * 4 + (col + dx + 4) % 4;
    if (dy) { if (row === 0 && dy > 0) k = 4 + col; else if (row === 1 && dy < 0) k = col; }
    s.cur[who] = k; Audio.play('move'); this.renderSel();
  },
  selConfirm(who) {
    const s = this.sel; if (s.lock[who] != null || this.selTimer) return;
    s.lock[who] = s.cur[who]; Audio.play('confirm');
    announce(CHARS[s.cur[who]].name);
    this.renderSel();
    const start = fn => { this.selTimer = setTimeout(() => { this.selTimer = null; if (this.screen === 'select' && this.sel === s) fn(); }, 550); };
    if (s.mode === 'arcade') { start(() => this.beginArcade(CHARS[s.lock[0]])); return; }
    if (s.mode === 'versus') {
      if (who === 0) { s.active = 1; s.cur[1] = (s.cur[0] + 1) % CHARS.length; this.renderSel(); return; }
      start(() => this.beginVersus()); return;
    }
    if (s.mode === '2p' && s.lock[0] != null && s.lock[1] != null) start(() => this.beginVersus());
  },
  selBack() {
    const s = this.sel;
    clearTimeout(this.selTimer); this.selTimer = null;
    if (s.mode === 'versus' && s.active === 1) { s.active = 0; s.lock = [null, null]; this.renderSel(); return; }
    if (s.mode === '2p' && (s.lock[0] != null || s.lock[1] != null)) { s.lock = [null, null]; this.renderSel(); return; }
    this.show('menu');
  },

  // ---- Modos ----
  beginArcade(ch) {
    const others = CHARS.filter(c => c !== ch && !c.boss).sort(() => Math.random() - 0.5);
    const boss = ch.boss ? null : CH.motaro;
    const ladder = boss ? [...others, boss] : others;
    this.arcade = { ch, ladder, idx: 0 };
    this.showLadder();
  },
  showLadder() {
    const A = this.arcade, L = $('#ladder');
    L.innerHTML = A.ladder.map((c, k) => `<div class="lad-step ${k < A.idx ? 'done' : k === A.idx ? 'cur' : ''}"><img src="${spritePath(c, 'portrait')}" style="${hueFilter(c) ? 'filter:' + hueFilter(c) : ''}" alt="">${k + 1}. ${c.name}${c.boss ? ' (CHEFE)' : ''}</div>`).join('');
    const op = A.ladder[A.idx];
    $('#lad-vs').textContent = `${A.ch.name}  VS  ${op.name}`;
    this.show('ladder');
    Audio.play('gong');
    clearTimeout(this.ladT);
    this.ladT = setTimeout(() => this.startArcadeFight(), 2600);
  },
  startArcadeFight() {
    const A = this.arcade, op = A.ladder[A.idx];
    const style = ['easy', 'normal', 'hard'][this.diff];
    const lv = style === 'hard' ? 0.18 + A.idx * 0.045 + (op.boss ? 0.08 : 0)
      : style === 'normal' ? 0.14 + A.idx * 0.02
      : 0.06;
    const stage = op.boss ? 'bg_arena' : op.id === 'subzero' ? 'bg_gelo' : op.id === 'liukang' ? 'bg_templo' : STAGES[A.idx % 3];
    this.show(null);
    Game.paused = false;
    Game.start(A.ch, op, new HumanCtrl('solo', true), new CpuCtrl(Math.min(0.95, lv), style), stage, w => this.arcadeResult(w));
    layout();
  },
  arcadeResult(w) {
    const A = this.arcade;
    if (w === 0) {
      A.idx++;
      if (A.idx >= A.ladder.length) return this.ending();
      this.showLadder();
    } else {
      this.overlay('continue');
      let n = 9; $('#cont-num').textContent = n;
      clearInterval(this.contTimer);
      this.contTimer = setInterval(() => { n--; $('#cont-num').textContent = n; Audio.play('move'); if (n <= 0) { clearInterval(this.contTimer); this.act('quit'); } }, 1000);
    }
  },
  ending() {
    const c = this.arcade.ch;
    $('#end-img').src = spritePath(c, 'win');
    applyHue($('#end-img'), c);
    $('#end-h').textContent = (c.g === 'ELA' ? 'CAMPEÃ' : 'CAMPEÃO') + ' DO KAPIVARAGE';
    $('#end-txt').textContent = `${c.name} derrotou todos os guerreiros${c.boss ? '' : ` e o terrível ${CH.motaro.name} de quatro braços`}. ${c.bio} Agora a lagoa sagrada está em paz… até o próximo desafio.`;
    this.overlay('ending');
    announce(c.name + (c.g === 'ELA' ? ', campeã' : ', campeão') + ' do KapivaRage!');
  },
  beginVersus() {
    const s = this.sel, c1 = CHARS[s.lock[0]], c2 = CHARS[s.lock[1]];
    const two = s.mode === '2p';
    const stage = STAGES[(Math.random() * STAGES.length) | 0];
    this.show(null);
    Game.paused = false;
    Game.start(c1, c2, new HumanCtrl(two ? 'p1' : 'solo', true), two ? new HumanCtrl('p2', false) : new CpuCtrl(({ easy: 0.06, normal: 0.14, hard: 0.2 })[ ['easy', 'normal', 'hard'][this.diff] ], ['easy', 'normal', 'hard'][this.diff]), stage, w => {
      Game.big = null;
      this.vsEnd = w;
      this.openSelect(s.mode);
    });
    layout();
  },

  onKey(e) {
    const sc = this.screen, k = e.code;
    if (sc === 'title' && (k === 'Enter' || k === 'Space')) { e.preventDefault(); this.toMenu(); return; }
    if (sc === 'select') {
      if ((k === 'Enter' || k === 'Space') && e.target.closest?.('#scr-select button')) return;
      const s = this.sel;
      if (s.mode === '2p') {
        if (k === 'KeyA') this.selMove(0, -1, 0); if (k === 'KeyD') this.selMove(0, 1, 0); if (k === 'KeyW') this.selMove(0, 0, -1); if (k === 'KeyS') this.selMove(0, 0, 1);
        if (k === 'KeyF' || k === 'Enter') this.selConfirm(0);
        if (k === 'ArrowLeft') this.selMove(1, -1, 0); if (k === 'ArrowRight') this.selMove(1, 1, 0); if (k === 'ArrowUp') this.selMove(1, 0, -1); if (k === 'ArrowDown') this.selMove(1, 0, 1);
        if (k === 'KeyI' || k === 'Numpad1' || k === 'NumpadEnter') this.selConfirm(1);
      } else {
        const who = s.active;
        if (k === 'ArrowLeft' || k === 'KeyA') this.selMove(who, -1, 0);
        if (k === 'ArrowRight' || k === 'KeyD') this.selMove(who, 1, 0);
        if (k === 'ArrowUp' || k === 'KeyW') this.selMove(who, 0, -1);
        if (k === 'ArrowDown' || k === 'KeyS') this.selMove(who, 0, 1);
        if (k === 'Enter' || k === 'KeyJ' || k === 'Space') this.selConfirm(who);
      }
      if (k === 'Escape' || k === 'Backspace') this.selBack();
      return;
    }
    if (sc === 'ladder' && (k === 'Enter' || k === 'Space')) { e.preventDefault(); clearTimeout(this.ladT); this.startArcadeFight(); return; }
    if (sc === 'help' && (k === 'Escape')) { $('#help-close').click(); return; }
    if (!sc && Game.phase !== 'off' && (k === 'Escape' || k === 'Enter' || k === 'KeyP' && !(Game.p[1] && Game.p[1].ctrl instanceof HumanCtrl))) { this.pause(); return; }
    if (sc === 'pause' && k === 'Escape') { this.resume(); return; }
    // navegação por setas em menus
    const nav = sc && $('#scr-' + sc + ' [data-nav]');
    if (nav && (k === 'ArrowDown' || k === 'ArrowUp' || k === 'KeyS' || k === 'KeyW')) {
      const bs = Array.from(nav.querySelectorAll('.mbtn')).filter(b => b.offsetParent !== null);
      let i = bs.indexOf(document.activeElement);
      i = (i + ((k === 'ArrowDown' || k === 'KeyS') ? 1 : -1) + bs.length) % bs.length;
      bs[i].focus(); Audio.play('move'); e.preventDefault();
    }
  },
};

// ---------------- Início ----------------
(async function boot() {
  layout();
  setupTouch();
  requestAnimationFrame(loop);
  if (window.speechSynthesis) { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices(); }
  try { await loadAll(); }
  catch (err) {
    console.error(err);
    $('.load-txt').textContent = 'Não foi possível carregar. Recarregue a página.';
    return;
  }
  UI.init();
  Game.stage = 'bg_ponte';
  UI.show('title');
})();
