/* オープニング：書類が浮かび、7つの専門家が糸でつながり、「窓口」の印が押される。約17秒。音はすべてその場で合成 */
(function(){
const op = document.getElementById('op');
if (!op) return;
const cv = document.getElementById('opC'), cx = cv.getContext('2d');
const startBox = document.getElementById('opStart'), skipBtn = document.getElementById('opSkip'), goBtn = document.getElementById('opGo');
const KEY = 'kigyo-op-seen';
const store = {get(){try{return localStorage.getItem(KEY)}catch(e){return null}}, set(){try{localStorage.setItem(KEY,'1')}catch(e){}}};
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const NODES = ['行政書士','税理士','社会保険労務士','司法書士','弁護士','弁理士','中小企業診断士'];
const SHORT = ['行政書士','税理士','社労士','司法書士','弁護士','弁理士','診断士'];
let W = 0, H = 0, DPR = 1, t0 = 0, raf = 0, running = false, ac = null, master = null;
const dust = Array.from({length: 80}, () => ({x: Math.random(), y: Math.random(), z: .2 + Math.random() * .8, s: Math.random() * 6.28}));
/* 性能の低い端末では、最初から軽い描き方にする。途中で遅いと分かったときも切り替える */
let low = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4 || !!(navigator.connection && navigator.connection.saveData);
let bgC = null, vigC = null, gridP = null, glowS = null, dotS = null, docC = null, labels = [], lastNow = 0, slow = 0, frames = 0;
const mk = (w, h) => {const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c};
const sparks = [];

function size(){
  DPR = low ? .6 : Math.min(1.5, devicePixelRatio || 1);
  op.classList.toggle('op-low', low);
  W = cv.clientWidth; H = cv.clientHeight;
  cv.width = W * DPR; cv.height = H * DPR; cx.setTransform(DPR, 0, 0, DPR, 0, 0);
  prerender();
}
/* 毎回描くと重いものを、先に一度だけ描いておく */
function prerender(){
  const S = Math.min(W, H), cxm = W / 2, cym = H * .47;
  // 背景（濃い藍の光と、映写機の光）
  bgC = mk(W, H); let c = bgC.getContext('2d');
  const g = c.createRadialGradient(cxm, cym, 0, cxm, cym, Math.max(W, H) * .75);
  g.addColorStop(0, '#13264A'); g.addColorStop(.6, '#0A1530'); g.addColorStop(1, '#03070F');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  const beam = c.createLinearGradient(0, 0, W, H); beam.addColorStop(0, 'rgba(232,180,106,.10)'); beam.addColorStop(.5, 'rgba(232,180,106,.02)'); beam.addColorStop(1, 'rgba(232,180,106,0)');
  c.fillStyle = beam; c.beginPath(); c.moveTo(W * .05, 0); c.lineTo(W * .32, 0); c.lineTo(W * .9, H); c.lineTo(W * .45, H); c.fill();
  // 周辺減光
  vigC = mk(W, H); c = vigC.getContext('2d');
  const v = c.createRadialGradient(cxm, H / 2, S * .35, cxm, H / 2, Math.max(W, H) * .8); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.65)');
  c.fillStyle = v; c.fillRect(0, 0, W, H);
  // 罫線の模様（1本分を繰り返す）
  const gt = mk(8, 34); c = gt.getContext('2d'); c.fillStyle = 'rgba(157,182,227,1)'; c.fillRect(0, 33, 8, 1);
  gridP = cx.createPattern(gt, 'repeat');
  // 専門家の丸のまわりの光と、糸を走る光
  const r = S * .062, gr = Math.ceil(r * 2.2);
  glowS = mk(gr * 2, gr * 2); c = glowS.getContext('2d');
  let gg = c.createRadialGradient(gr, gr, r * .6, gr, gr, gr); gg.addColorStop(0, 'rgba(157,182,227,.35)'); gg.addColorStop(1, 'rgba(157,182,227,0)');
  c.fillStyle = gg; c.fillRect(0, 0, gr * 2, gr * 2);
  dotS = mk(28, 28); c = dotS.getContext('2d');
  gg = c.createRadialGradient(14, 14, 0, 14, 14, 14); gg.addColorStop(0, 'rgba(255,220,160,.95)'); gg.addColorStop(1, 'rgba(255,220,160,0)');
  c.fillStyle = gg; c.fillRect(0, 0, 28, 28);
  // 書類の紙と影
  const dw = S * .28, dh = dw * 1.3, pad = 60;
  docC = mk(dw + pad * 2, dh + pad * 2); c = docC.getContext('2d');
  c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = low ? 18 : 36; c.shadowOffsetY = 16;
  c.fillStyle = '#F8F6F1'; c.beginPath(); c.roundRect ? c.roundRect(pad, pad, dw, dh, 10) : c.rect(pad, pad, dw, dh); c.fill();
  // 専門家の名前の文字の大きさ
  cx.textAlign = 'center'; cx.textBaseline = 'middle';
  labels = NODES.map((n, i) => {const label = W < 560 ? SHORT[i] : n; let fs = Math.max(10, S * .021); cx.font = `700 ${fs}px "BIZ UDPGothic","Hiragino Kaku Gothic ProN",sans-serif`; while (cx.measureText(label).width > r * 1.75 && fs > 8){fs -= .5; cx.font = `700 ${fs}px "BIZ UDPGothic","Hiragino Kaku Gothic ProN",sans-serif`} return {label, font: cx.font}});
}
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = v => 1 - Math.pow(1 - clamp(v), 3);
const easeIO = v => {v = clamp(v); return v < .5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2};
const seg = (t, a, b) => clamp((t - a) / (b - a));

/* ---------- 音 ---------- */
function audioStart(){
  try{
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.gain.value = .8;
    const comp = ac.createDynamicsCompressor(); master.connect(comp); comp.connect(ac.destination);
    const T = ac.currentTime + .05;
    const noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const env = (g, at, peak, a, d) => {g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(peak, at + a); g.gain.exponentialRampToValueAtTime(.0001, at + a + d)};
    const tone = (f, at, peak, a, d, type = 'sine', dest = master) => {const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; env(g, at, peak, a, d); o.connect(g); g.connect(dest); o.start(at); o.stop(at + a + d + .1); return o};
    const noise = (at, dur, peak, f0, f1, q = 1.2) => {const s = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noiseBuf; s.loop = true; bp.type = 'bandpass'; bp.Q.value = q; bp.frequency.setValueAtTime(f0, at); bp.frequency.exponentialRampToValueAtTime(f1, at + dur); g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(peak, at + dur * .6); g.gain.exponentialRampToValueAtTime(.0001, at + dur); s.connect(bp); bp.connect(g); g.connect(master); s.start(at); s.stop(at + dur + .1)};
    // 低い持続音（映画館の静けさ）
    [55, 82.4, 110.3].forEach((f, i) => {const o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = i * 4; lp.type = 'lowpass'; lp.frequency.value = 260; g.gain.setValueAtTime(0, T); g.gain.linearRampToValueAtTime(.05, T + 3); g.gain.setValueAtTime(.05, T + 6.2); g.gain.linearRampToValueAtTime(.075, T + 6.9); g.gain.linearRampToValueAtTime(0, T + 18); o.connect(lp); lp.connect(g); g.connect(master); o.start(T); o.stop(T + 18.5)});
    // 書類が浮かぶ風切り音
    noise(T + 1.2, 1.6, .18, 300, 2400, .8);
    // 罫線を書く音
    for (let i = 0; i < 5; i++) noise(T + 2.4 + i * .18, .14, .05, 3000, 5000, 4);
    // 専門家が灯るたびの鈴（五音音階）
    const scale = [659.3, 784, 880, 1046.5, 1174.7, 1318.5, 1568];
    scale.forEach((f, i) => {const at = T + 3.3 + i * .36; tone(f, at, .07, .005, 1.6); tone(f * 2.01, at, .02, .005, .8)});
    // 印を振り上げる音と、押した瞬間の重い音
    noise(T + 6.0, .55, .16, 600, 4000, 1);
    const hit = T + 6.6;
    {const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(140, hit); o.frequency.exponentialRampToValueAtTime(38, hit + .5); env(g, hit, .9, .004, .9); o.connect(g); g.connect(master); o.start(hit); o.stop(hit + 1.1)}
    noise(hit, .35, .35, 1800, 200, .6);
    tone(2093, hit + .02, .04, .002, 1.4, 'triangle');
    // 文字が出るときの和音（Fmaj9 → Cmaj9）
    [[174.6, 261.6, 329.6, 392, 440], [130.8, 196, 246.9, 329.6, 392, 587.3]].forEach((ch, k) => {
      const at = T + (k ? 14.2 : 7.4);
      ch.forEach((f, i) => tone(f, at + i * .04, .045, 1.2, k ? 4.2 : 2.6, 'triangle'));
    });
    tone(1568, T + 14.3, .03, .01, 3, 'sine'); tone(2349, T + 14.6, .02, .01, 2.6, 'sine');
  }catch(e){ac = null}
}
function audioStop(){ if (!ac) return; try{master.gain.setTargetAtTime(0, ac.currentTime, .25); const a = ac; setTimeout(() => a.close(), 1200)}catch(e){} ac = null }

/* ---------- 絵 ---------- */
function draw(now){
  const t = (now - t0) / 1000;
  const cxm = W / 2, cym = H * .47, S = Math.min(W, H);
  // 遅い端末の見分け：最初の約1秒のコマの間隔が長ければ軽い描き方へ
  if (lastNow){const dt = now - lastNow; frames++; if (dt > 34) slow++; if (!low && frames === 30 && slow > 9){low = true; size()}}
  lastNow = now;
  // 窓口名が出たあとは背景が隠れるので、絵を止める
  if (t > 15.4){
    op.classList.toggle('t1', true); op.classList.toggle('t2', true); op.classList.toggle('t3', true); op.classList.toggle('t4', t > 15.6);
    if (t < 16.5 && running) raf = requestAnimationFrame(draw);
    return;
  }
  cx.drawImage(bgC, 0, 0, W, H);
  const fadeIn = ease(seg(t, 0, 1.6));
  // 罫線の地紋
  cx.save(); cx.globalAlpha = .08 * fadeIn; cx.fillStyle = gridP; cx.translate(0, (t * 8) % 34); cx.fillRect(0, -34, W, H + 34); cx.restore();
  // 塵
  cx.save(); cx.fillStyle = '#FFECC8';
  const nd = low ? 36 : dust.length;
  for (let i = 0; i < nd; i++){const d = dust[i]; const x = ((d.x + t * .006 * d.z) % 1) * W, y = ((d.y + Math.sin(t * .4 + d.s) * .01 - t * .004 * d.z + 1) % 1) * H; cx.globalAlpha = .35 * d.z * fadeIn; const q = d.z * 2.4; cx.fillRect(x, y, q, q)}
  cx.restore();

  // カメラ：印のあとに少し引く。印の瞬間に揺れ
  const pull = 1 - .2 * easeIO(seg(t, 7.2, 10.5));
  const hitT = t - 6.6, shake = hitT > 0 && hitT < .5 ? (1 - hitT / .5) * S * .012 : 0;
  cx.save();
  const wide = W / H > 1.25, mv = easeIO(seg(t, 7.2, 10.5));
  cx.translate(cxm - (wide ? W * .2 * mv : 0) + (Math.random() - .5) * shake, cym - (wide ? 0 : S * .05 * mv) + (Math.random() - .5) * shake);
  cx.scale(pull, pull);

  // 書類
  const dr = ease(seg(t, 1.2, 2.8)), dw = S * .28, dh = dw * 1.3;
  const R = S * .36;
  // 糸と専門家
  NODES.forEach((n, i) => {
    const a = -Math.PI / 2 + i * (Math.PI * 2 / 7);
    const nx = Math.cos(a) * R, ny = Math.sin(a) * R * .86;
    const ap = ease(seg(t, 3.3 + i * .36, 3.9 + i * .36));
    if (ap <= 0) return;
    // 糸
    const lp = ease(seg(t, 3.5 + i * .36, 4.4 + i * .36));
    cx.save(); cx.setLineDash([5, 7]); cx.lineDashOffset = -t * 30; cx.strokeStyle = `rgba(232,180,106,${.75 * ap})`; cx.lineWidth = 1.6;
    cx.beginPath(); cx.moveTo(nx, ny); cx.lineTo(nx * (1 - lp), ny * (1 - lp)); cx.stroke(); cx.restore();
    // 糸を走る光
    if (lp > 0 && lp < 1){const px = nx * (1 - lp), py = ny * (1 - lp); cx.drawImage(dotS, px - 14, py - 14)}
    // 丸
    const r = S * .062 * (0.6 + .4 * ap);
    cx.save(); cx.globalAlpha = ap;
    if (!low){const gw = glowS.width * (r / (S * .062)); cx.drawImage(glowS, nx - gw / 2, ny - gw / 2, gw, gw)}
    cx.fillStyle = '#132A52'; cx.strokeStyle = 'rgba(255,255,255,.7)'; cx.lineWidth = 1.4; cx.beginPath(); cx.arc(nx, ny, r, 0, 6.28); cx.fill(); cx.stroke();
    cx.fillStyle = '#fff'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.font = labels[i].font; cx.fillText(labels[i].label, nx, ny); cx.restore();
  });

  if (dr > 0){
    cx.save();
    const lift = (1 - dr) * S * .25, sc = .7 + .3 * dr;
    cx.translate(0, lift); cx.scale(sc, sc); cx.rotate((1 - dr) * -.12);
    cx.globalAlpha = dr;
    cx.drawImage(docC, -dw / 2 - 60, -dh / 2 - 60);
    // 上辺の見出し帯
    cx.fillStyle = '#1E3460'; cx.fillRect(-dw / 2 + dw * .1, -dh / 2 + dh * .1, dw * .4 * ease(seg(t, 2.3, 2.6)), dh * .035);
    // 罫線が書かれていく
    cx.strokeStyle = '#9AA6BB'; cx.lineWidth = 2; cx.lineCap = 'round';
    for (let k = 0; k < 6; k++){
      const p = ease(seg(t, 2.45 + k * .16, 2.75 + k * .16)), y = -dh / 2 + dh * (.25 + k * .1), len = dw * (k === 5 ? .45 : .8);
      if (p > 0){cx.beginPath(); cx.moveTo(-dw / 2 + dw * .1, y); cx.lineTo(-dw / 2 + dw * .1 + len * p, y); cx.stroke()}
    }
    // 印
    const sx = dw * .22, sy = dh * .3, sr = dw * .15;
    if (t > 6.0){
      const fall = ease(seg(t, 6.0, 6.6)), ssc = 1 + (1 - fall) * 2.4;
      cx.save(); cx.translate(sx, sy); cx.scale(ssc, ssc); cx.rotate(-.12 + (1 - fall) * .3);
      cx.globalAlpha = Math.min(1, fall * 1.4) * (t < 6.6 ? .55 : 1);
      cx.strokeStyle = '#C0392B'; cx.lineWidth = sr * .12; cx.beginPath(); cx.arc(0, 0, sr, 0, 6.28); cx.stroke();
      cx.lineWidth = sr * .04; cx.beginPath(); cx.arc(0, 0, sr * .8, 0, 6.28); cx.stroke();
      cx.fillStyle = '#C0392B'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.font = `800 ${sr * .62}px "Shippori Mincho B1","Yu Mincho",serif`; cx.fillText('窓口', 0, sr * .04);
      cx.restore();
    }
    cx.restore();
  }
  // 印の衝撃波と火花
  if (hitT > 0 && hitT < 1.4){
    const p = hitT / 1.4, sx = dw * .22 * pull, sy = dh * .3;
    cx.save(); cx.globalCompositeOperation = 'lighter';
    [0, .12].forEach(d => {const q = clamp((hitT - d) / 1.1); if (q <= 0) return; cx.strokeStyle = `rgba(232,180,106,${(1 - q) * .8})`; cx.lineWidth = 3 * (1 - q) + .5; cx.beginPath(); cx.arc(sx, sy, S * (.05 + q * .5), 0, 6.28); cx.stroke()});
    if (sparks.length === 0) for (let i = 0; i < (low ? 20 : 40); i++){const a = Math.random() * 6.28, v = S * (.15 + Math.random() * .5); sparks.push({a, v, l: .5 + Math.random() * .8})}
    sparks.forEach(sp => {const q = hitT / sp.l; if (q > 1) return; const d = sp.v * ease(q); cx.strokeStyle = `rgba(255,214,150,${1 - q})`; cx.lineWidth = 2 * (1 - q) + .4; cx.beginPath(); cx.moveTo(sx + Math.cos(sp.a) * d * .7, sy + Math.sin(sp.a) * d * .7); cx.lineTo(sx + Math.cos(sp.a) * d, sy + Math.sin(sp.a) * d); cx.stroke()});
    // 一瞬の閃光
    cx.globalAlpha = Math.max(0, .35 - p * 1.2); cx.fillStyle = '#FFE9C7'; cx.fillRect(-W, -H, W * 2, H * 2);
    cx.restore();
  }
  cx.restore();

  // 周辺減光
  if (!low) cx.drawImage(vigC, 0, 0, W, H);

  // 文字（DOM）とボタン
  op.classList.toggle('t1', t > 7.4); op.classList.toggle('t2', t > 9.0); op.classList.toggle('t3', t > 14.2); op.classList.toggle('t4', t > 15.6);
  if (t < 30 && running) raf = requestAnimationFrame(draw);
}
function roundRect(x, y, w, h, r){cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath()}

/* ---------- 進行 ---------- */
function play(sound){
  startBox.hidden = true; op.classList.add('playing');
  size(); sparks.length = 0; lastNow = 0; slow = 0; frames = 0; t0 = performance.now(); running = true;
  if (sound) audioStart();
  raf = requestAnimationFrame(draw);
  setTimeout(() => {if (running) goBtn.focus({preventScroll: true})}, 15800);
}
function close(){
  if (!running && op.hidden) return;
  running = false; cancelAnimationFrame(raf); audioStop(); store.set();
  op.classList.add('out');
  setTimeout(() => {op.hidden = true; op.classList.remove('out', 'playing', 't1', 't2', 't3', 't4'); document.documentElement.classList.remove('op-lock')}, 1300);
}
function open(){
  op.hidden = false; startBox.hidden = false; document.documentElement.classList.add('op-lock');
  op.classList.remove('out', 'playing', 't1', 't2', 't3', 't4');
  size(); t0 = performance.now(); running = false; draw(t0); // 最初の一枚だけ描く
  setTimeout(() => document.getElementById('opSound').focus({preventScroll: true}), 50);
}
document.getElementById('opSound').addEventListener('click', () => play(true));
document.getElementById('opMute').addEventListener('click', () => play(false));
document.getElementById('opSkip0').addEventListener('click', () => {running = true; close()});
skipBtn.addEventListener('click', close); goBtn.addEventListener('click', close);
addEventListener('keydown', e => {if (e.key === 'Escape' && !op.hidden){running = true; close()}});
addEventListener('resize', () => {if (!op.hidden) size()});
document.querySelectorAll('[data-replay]').forEach(b => b.addEventListener('click', e => {e.preventDefault(); const nav = document.getElementById('gnav'); if (nav) nav.classList.remove('open'); location.hash = 'top'; open()}));

const atTop = !location.hash || location.hash === '#top';
if (!reduce && atTop && !store.get()) open();
})();
