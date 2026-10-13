# GLOVE theme — original tropical-house track (~125s, 100 BPM, A minor)
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt
SR = 44100; BPM = 100; BEAT = 60 / BPM; BAR = BEAT * 4; NB = 52
N = int(SR * BAR * NB) + SR * 4
rng = np.random.default_rng(7)
def m2f(m): return 440 * 2 ** ((m - 69) / 12)
def t_(d): return np.arange(int(d * SR)) / SR
def place(buf, x, t, gain=1.0, pan=0.0):
    i = int(t * SR); x = x * gain
    if i >= len(buf) or i < 0: return
    n = min(len(x), len(buf) - i)
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    buf[i:i+n, 0] += x[:n] * l * 1.414; buf[i:i+n, 1] += x[:n] * r * 1.414
def lp(x, fc, o=2): return sosfilt(butter(o, fc / (SR / 2), 'low', output='sos'), x)
def hp(x, fc, o=2): return sosfilt(butter(o, fc / (SR / 2), 'high', output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo / (SR / 2), hi / (SR / 2)], 'band', output='sos'), x)
def adsr(n, a, d, s, r, total):
    e = np.ones(n) * s; A, Dd, R = int(a * SR), int(d * SR), int(r * SR)
    e[:A] = np.linspace(0, 1, A, endpoint=False) if A else e[:A]
    e[A:A+Dd] = np.linspace(1, s, len(e[A:A+Dd]))
    rs = max(0, int(total * SR) - R); e[rs:] *= np.linspace(1, 0, len(e[rs:])) if len(e[rs:]) else 1
    return e
tracks = {k: np.zeros((N, 2)) for k in ["kick", "clap", "hat", "shaker", "bass", "pluck", "pad", "lead", "waves", "fx"]}
# --- harmony: Am7 | Fmaj7 | Cadd9 | G6 ---
CH = [([57, 60, 64, 67], 45), ([53, 57, 60, 64], 41), ([60, 62, 64, 67], 48), ([55, 59, 62, 64], 43)]
def chord(bar): return CH[bar % 4]
# --- instruments ---
def kick():
    t = t_(.32); f = 48 + 75 * np.exp(-t * 32); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 9) + .25 * np.exp(-t * 300) * rng.standard_normal(len(t)) * .3
def clap():
    t = t_(.35); n = rng.standard_normal(len(t)); env = np.exp(-t * 18)
    for off in (0, .011, .022): env[int(off*SR):] += np.exp(-(t[:len(t)-int(off*SR)]) * 90) * .6
    return bp(n, 900, 5200) * env * .7 + np.sin(2*np.pi*190*t) * np.exp(-t*40) * .2
def hat(open_=False):
    t = t_(.22 if open_ else .06); return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t * (14 if open_ else 70))
def shaker():
    t = t_(.09); e = np.minimum(1, t / .015) * np.exp(-t * 45); return hp(rng.standard_normal(len(t)), 5200) * e
def marimba(m, d=.5):
    t = t_(d + .6); f = m2f(m); mod = np.sin(2*np.pi*f*4*t) * 2.2 * np.exp(-t*14)
    x = np.sin(2*np.pi*f*t + mod) * np.exp(-t * 6.5) + .25*np.sin(2*np.pi*f*2*t) * np.exp(-t*11)
    return x * np.minimum(1, t / .003)
def bass(m, d):
    t = t_(d); f = m2f(m); x = np.sin(2*np.pi*f*t) + .35*np.sin(2*np.pi*2*f*t) + .12*np.sign(np.sin(2*np.pi*f*t))
    return lp(x, 420) * adsr(len(t), .006, .12, .75, .06, d)
def pad(ms, d):
    t = t_(d); x = np.zeros(len(t))
    for m in ms:
        for det in (-.11, 0, .12):
            f = m2f(m + det); ph = rng.random() * 6.28
            x += 2 * ((f * t + ph) % 1) - 1
    return lp(x / (len(ms) * 3), 1500, 1) * adsr(len(t), .9, .4, .85, 1.0, d)
def flute(m, d, vib=True):
    t = t_(d + .25); f = m2f(m)
    v = 1 + (.006 * np.sin(2*np.pi*5.3*t) * np.minimum(1, np.maximum(0, (t - .18) / .25)) if vib else 0)
    ph = 2*np.pi*np.cumsum(f * v) / SR
    tone = np.sin(ph) + .18*np.sin(2*ph) + .06*np.sin(3*ph)
    breath = bp(rng.standard_normal(len(t)), f * .8, min(f * 3.5, 15000)) * .22
    env = adsr(len(t), .045, .1, .82, .16, d + .12); chiff = np.exp(-t * 60) * .35
    return (tone + breath * (1 + 2 * chiff)) * env
def riser(d):
    t = t_(d); n = rng.standard_normal(len(t)); x = np.zeros(len(t)); seg = int(.02*SR)
    for i in range(0, len(t), seg):
        fc = 400 + 9000 * (i / len(t)) ** 2; x[i:i+seg] = bp(n[max(0,i-2000):i+seg], fc*.7, min(fc*1.3, 20000))[-len(x[i:i+seg]):]
    return x * (t / d) ** 2 * .6
def waves(d):
    n = rng.standard_normal(int(d * SR)); b = np.cumsum(n); b -= lp(b, 2); b = lp(b, 900) / 60
    t = np.arange(len(n)) / SR; swell = .35 + .65 * (.5 + .5 * np.sin(2*np.pi*t/7.5 - 1.6)) ** 2
    hiss = hp(rng.standard_normal(len(n)), 2500) * .05 * swell ** 3
    return (b + hiss) * swell
# --- melody (beats from bar start, midi, duration in beats) ---
A = [[(0,76,.5),(.5,79,.5),(1,81,1.5),(2.5,79,.5),(3,76,1)],
     [(0,72,.5),(.5,74,.5),(1,76,1),(2,74,.5),(2.5,72,1.5)],
     [(0,76,.5),(.5,79,.5),(1,84,1),(2,83,.5),(2.5,81,.5),(3,79,1)],
     [(0,74,1),(1,76,.5),(1.5,74,.5),(2,71,2)]]
B = [[(0,81,.75),(.75,79,.75),(1.5,76,.5),(2,79,1),(3,81,1)],
     [(0,84,1),(1,81,.5),(1.5,79,.5),(2,76,2)],
     [(0,79,.5),(.5,76,.5),(1,74,.5),(1.5,76,1),(2.5,72,.5),(3,74,1)],
     [(0,76,1.5),(1.5,74,.5),(2,72,.5),(2.5,71,.5),(3,69,1)]]
def lead_phrase(bar0, P, gain=1.0, oct_=0):
    for b, notes in enumerate(P):
        for (st, m, du) in notes:
            place(tracks["lead"], flute(m + oct_, du * BEAT * .95), (bar0 + b) * BAR + st * BEAT + .004, gain, -.1)
# --- arrangement ---
SEC = {}
for b in range(NB):
    SEC[b] = "intro" if b < 4 else "verse" if b < 12 else "drop" if b < 28 else "break" if b < 36 else "drop2" if b < 48 else "outro"
place(tracks["waves"], waves(16), 0, 1.0); place(tracks["waves"], waves(12), (NB - 5) * BAR, 1.0)
place(tracks["waves"], waves(NB * BAR) * .25, 0, 1.0)
for b in range(NB):
    s = SEC[b]; t0 = b * BAR; ms, root = chord(b)
    # pad
    if s in ("intro", "break", "outro", "verse", "drop", "drop2"):
        place(tracks["pad"], pad(ms, BAR + .4), t0, {"intro": .9, "break": 1.0, "outro": .7}.get(s, .55))
    # pluck (offbeat tropical pattern)
    if s != "intro" or b >= 2:
        pat = [.5, 1.5, 2, 2.75, 3.5]; g = {"intro": .35, "verse": .7, "break": .55, "outro": .5}.get(s, .8)
        for k, st in enumerate(pat):
            for j, m in enumerate(ms[1:] if k % 2 else ms[:3]):
                place(tracks["pluck"], marimba(m + 12, .35), t0 + st * BEAT + j * .006, g * .45, (j - 1) * .35)
    # bass
    if s in ("verse", "drop", "drop2", "break") and not (s == "break" and b < 32):
        for st, du in ((0, .7), (1.5, .45), (2.5, .45), (3.25, .6)):
            place(tracks["bass"], bass(root - 12 + (12 if st == 2.5 else 0), du * BEAT), t0 + st * BEAT, .9)
    # drums
    if s in ("drop", "drop2"):
        for q in range(4): place(tracks["kick"], kick(), t0 + q * BEAT, 1.0)
        for q in (1, 3): place(tracks["clap"], clap(), t0 + q * BEAT, .55)
        for q in range(4): place(tracks["hat"], hat(True), t0 + (q + .5) * BEAT, .22, .3)
    if s == "verse":
        for q in (0, 2): place(tracks["kick"], kick(), t0 + q * BEAT, .7)
        if b >= 8:
            for q in (1, 3): place(tracks["clap"], clap(), t0 + q * BEAT, .35)
    if s in ("verse", "drop", "drop2", "break"):
        for q in range(16): place(tracks["shaker"], shaker(), t0 + q * BEAT / 4, (.5 if q % 2 else .25) * (.6 if s == "break" else 1), -.4)
    if s == "outro":
        for q in range(16): place(tracks["shaker"], shaker(), t0 + q * BEAT / 4, (.3 if q % 2 else .15) * (1 - (b - 48) / 4), -.4)
# risers + impacts
for (b0, bars) in ((2, 2), (10, 2), (34, 2)):
    place(tracks["fx"], riser(bars * BAR), b0 * BAR, .6)
for b in (4, 12, 36):
    t = t_(2.5); boom = np.sin(2*np.pi*np.cumsum(40 + 60*np.exp(-t*6))/SR) * np.exp(-t * 2.2)
    place(tracks["fx"], boom + lp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 4) * .3, b * BAR, .8)
# melody
lead_phrase(8, A, .55); lead_phrase(12, A, .9); lead_phrase(16, B, .9); lead_phrase(20, A, .9); lead_phrase(24, B, .9)
lead_phrase(28, B, .6, -12); lead_phrase(32, A, .55)
lead_phrase(36, A, 1.0); lead_phrase(40, B, 1.0); lead_phrase(44, A, .9)
# --- sidechain pump on drops ---
side = np.ones(N)
for b in range(NB):
    if SEC[b] in ("drop", "drop2"):
        for q in range(4):
            i = int((b * BAR + q * BEAT) * SR); L = int(BEAT * SR); tt = np.arange(L) / L
            side[i:i+L] = np.minimum(side[i:i+L], .35 + .65 * np.minimum(1, tt / .55) ** 1.6)
for k in ("bass", "pad", "pluck", "lead"):
    tracks[k] *= side[:, None] if k != "lead" else (.75 + .25 * side)[:, None]
# --- reverb ---
def ir(sec, damp):
    t = t_(sec); n = rng.standard_normal((len(t), 2)) * np.exp(-t * damp)[:, None]
    n[:, 0] = lp(n[:, 0], 6000); n[:, 1] = lp(n[:, 1], 6000); return n / np.sqrt((n ** 2).sum(0))
IR = ir(2.6, 2.4)
def verb(x, wet):
    y = np.stack([fftconvolve(x[:, c], IR[:, c])[:len(x)] for c in (0, 1)], 1); return x + y * wet
mix = (tracks["kick"] * 1.0 + tracks["clap"] * .8 + tracks["hat"] * .5 + tracks["shaker"] * .35 + tracks["bass"] * .62
       + verb(tracks["pluck"], 1.6) * .55 + verb(tracks["pad"], 1.2) * .32 + verb(tracks["lead"], 2.2) * .42
       + tracks["waves"] * .55 + verb(tracks["fx"], 1.0) * .4)
mix = hp(mix.T, 28).T
L = int(NB * BAR * SR + 2.5 * SR); mix = mix[:L]
fi, fo = int(1.5 * SR), int(5 * SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None]; mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
mix /= np.percentile(np.abs(mix), 99.95); mix = np.tanh(mix * 1.15) / np.tanh(1.15) * .9; mix = np.clip(mix, -.98, .98)
for k,v in tracks.items():
    seg=v[int(14*BAR*SR):int(18*BAR*SR)]; print(k, round(float(np.sqrt((seg**2).mean())),4))
from scipy.io import wavfile
wavfile.write("/home/claude/music/glove_theme.wav", SR, (mix * 32767).astype(np.int16))
print("seconds", len(mix) / SR, "peak", np.abs(mix).max(), "rms", np.sqrt((mix ** 2).mean()))
