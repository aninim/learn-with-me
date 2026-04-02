# Physics & Nature — Animation Spec
**For:** Codi (Claude Code)  
**Priority: HIGH.** These animations are the pedagogy. They must feel physically real.  
**All animations: CSS keyframes + canvas only. No libraries.**

---

## Design principle

A 4-year-old learns gravity not by being told "things fall down" but by seeing an apple fall and bounce in a way that matches what they've seen in real life. The animation must carry the cognitive load. Every timing value below was chosen to match real physical intuition.

**Golden rule:** Never let an animation snap or jump. Every transition must ease.

---

## 1. Gravity Drop (Band A — core animation)

Used in: gravity concept (apple drop), heavy/light (balance), states of matter (ice melting drip)

### Apple drop sequence

```
State 0: Apple rests on tree branch. Slight idle sway (±3deg, 2s loop).

On tap:
  Phase 1 — Release (0–80ms):
    Apple detaches. Scale 1.0 → 1.05 (tiny "pop" from branch).
    ease-out cubic-bezier(0.2, 0, 1, 0.8)

  Phase 2 — Fall (80ms–600ms):
    translateY: 0 → +280px
    Timing: cubic-bezier(0.4, 0, 1, 1)  ← accelerating, mimics gravity
    Slight rotation during fall: 0deg → +12deg (natural tumble)
    Scale stays 1.05

  Phase 3 — Impact (600ms–680ms):
    translateY snaps to ground position
    Scale: 1.05 → 1.2 (x-axis) × 0.85 (y-axis) — squash on impact
    Duration: 80ms, ease-out

  Phase 4 — Bounce 1 (680ms–820ms):
    translateY: ground → -40px → ground
    Scale returns to 1.0
    ease: cubic-bezier(0.33, 0, 0.66, 1)

  Phase 5 — Bounce 2 (820ms–920ms):
    translateY: ground → -16px → ground
    Smaller, faster. Feels like energy dissipating.

  Phase 6 — Settle (920ms–1000ms):
    Apple wobbles ±2px horizontally, comes to rest.

  Phase 7 — TTS fires at 700ms (during bounce 1):
    "הוא נפל למטה! כבידה מושכת הכל כלפי מטה."
    This timing makes the narration feel like a reaction, not a lecture.
```

### CSS keyframes

```css
@keyframes physicsGravityFall {
  0%   { transform: translateY(0) rotate(0deg) scaleX(1) scaleY(1); }
  5%   { transform: translateY(0) rotate(0deg) scaleX(1.05) scaleY(1.05); }
  55%  { transform: translateY(240px) rotate(10deg) scaleX(1.05) scaleY(1.05); }
  65%  { transform: translateY(280px) rotate(12deg) scaleX(1.2) scaleY(0.85); } /* squash */
  75%  { transform: translateY(240px) rotate(8deg) scaleX(1.0) scaleY(1.0); }  /* bounce 1 */
  85%  { transform: translateY(280px) rotate(6deg) scaleX(1.05) scaleY(0.95); }
  92%  { transform: translateY(264px) rotate(4deg) scaleX(1.0) scaleY(1.0); }  /* bounce 2 */
  97%  { transform: translateY(280px) rotate(2deg); }
  100% { transform: translateY(280px) rotate(0deg) scaleX(1) scaleY(1); }
}

/* Apply with: */
.physics-falling {
  animation: physicsGravityFall 1.0s cubic-bezier(0.4, 0, 0.6, 1) forwards;
}
```

### Ground impact particle burst (canvas)

On impact (600ms), draw 6–8 small dust particles from impact point:
```javascript
function drawImpactDust(ctx, x, y) {
  const particles = Array.from({length: 7}, (_, i) => ({
    x, y,
    vx: (Math.random() - 0.5) * 4,
    vy: -(Math.random() * 3 + 1),
    alpha: 1,
    r: Math.random() * 4 + 2,
    color: '#C8A97E'  // warm dust color
  }));

  let frame = 0;
  function tick() {
    if (frame > 20) return;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // gravity on dust
      p.alpha -= 0.05;
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    frame++;
    requestAnimationFrame(tick);
  }
  tick();
}
```

---

## 2. Water & Floating (Band A — Sort & Classify)

Used in: float/sink drag activity

### Water surface animation (always running)

```css
@keyframes waterSurface {
  0%, 100% { transform: scaleX(1.02) translateX(-1%); }
  50%       { transform: scaleX(0.98) translateX(1%); }
}

.physics-water-surface {
  animation: waterSurface 3s ease-in-out infinite;
}
```

### Object drop into water

On release over water zone:

**If floats:**
```
Phase 1 (0–200ms): Object falls to surface. Same gravity fall animation but stops at water surface.
Phase 2 (200ms–400ms): Splash — 4 small water droplets arc outward from impact point (canvas).
Phase 3 (400ms–600ms): Object bobs down slightly (translateY +20px), ease-in.
Phase 4 (600ms–800ms): Object bobs back up (translateY -10px).
Phase 5 (800ms→): Gentle idle bob: ±8px, 2s loop, ease-in-out. Object is floating.
Ripple rings: 2 expanding rings from impact point, fade over 800ms.
```

**If sinks:**
```
Phase 1 (0–200ms): Object falls to surface. Same fall animation.
Phase 2 (200ms–350ms): Enters water — scale 0.95 (refraction illusion), opacity edges blur slightly.
Phase 3 (350ms–700ms): Continues falling to bottom. Speed slows (water resistance feel):
  translateY eases to bottom with cubic-bezier(0.1, 0, 0.3, 1) — slower than air fall.
Phase 4 (700ms–800ms): Small settle on bottom. Tiny dust puff.
Phase 5 (800ms→): Object rests at bottom, no animation.
Small bubbles rise from object for 1.5s (canvas — 3–4 circles, float upward, fade).
```

### Splash particles (canvas)

```javascript
function drawSplash(ctx, x, waterY) {
  const drops = Array.from({length: 5}, (_, i) => {
    const angle = (Math.PI * 0.3) + (i * Math.PI * 0.1); // arc upward
    const speed = Math.random() * 3 + 2;
    return {
      x, y: waterY,
      vx: Math.cos(angle) * speed * (i % 2 === 0 ? 1 : -1),
      vy: -Math.sin(angle) * speed,
      alpha: 1, r: Math.random() * 3 + 2
    };
  });

  let frame = 0;
  function tick() {
    if (frame > 18) return;
    drops.forEach(d => {
      d.x += d.vx; d.y += d.vy; d.vy += 0.3;
      d.alpha -= 0.055;
      ctx.globalAlpha = Math.max(0, d.alpha);
      ctx.fillStyle = '#7EC8E3';
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    frame++; requestAnimationFrame(tick);
  }
  tick();
}
```

### Rising bubbles (canvas, sinking objects only)

```javascript
function drawBubbles(ctx, x, bottomY) {
  const bubbles = Array.from({length: 4}, () => ({
    x: x + (Math.random() - 0.5) * 20,
    y: bottomY,
    vy: -(Math.random() * 1.5 + 0.8),
    alpha: 0.7,
    r: Math.random() * 4 + 2
  }));

  let frame = 0;
  function tick() {
    if (frame > 40) return;
    bubbles.forEach(b => {
      b.y += b.vy;
      b.x += Math.sin(frame * 0.2) * 0.5; // slight drift
      b.alpha -= 0.017;
      ctx.globalAlpha = Math.max(0, b.alpha);
      ctx.strokeStyle = '#7EC8E3';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    frame++; requestAnimationFrame(tick);
  }
  tick();
}
```

---

## 3. Magnetism (Band B — Predict & Reveal)

Used in: magnetism prediction, reveal animation

### Particle field (idle, always on)

While question is displayed, show a subtle field of iron-filing-like dots around the magnet:

```javascript
function drawMagnetField(ctx, magnetX, magnetY) {
  // 20 small dots in oval pattern around magnet
  // Slowly orbit, alpha 0.15
  // This communicates "there is an invisible force here"
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2 + (Date.now() * 0.0005);
    const rx = 70, ry = 40; // elliptical orbit
    const x = magnetX + Math.cos(angle) * rx;
    const y = magnetY + Math.sin(angle) * ry;
    ctx.globalAlpha = 0.12 + Math.sin(angle * 3) * 0.06;
    ctx.fillStyle = '#555';
    ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(() => drawMagnetField(ctx, magnetX, magnetY));
}
```

### Reveal — metal objects attract

On correct reveal (metal objects):

```
For each metal object (coin, bolt):
  Phase 1 (0–50ms stagger per object):
    Object shakes/vibrates: ±4px translateX, 4 cycles, 50ms
    Communicates "the magnet is pulling me"
  Phase 2 (50ms–400ms):
    Object flies toward magnet along arc path (not straight line — curves slightly).
    Use CSS offset-path or JS lerp with slight curve.
    Speed: cubic-bezier(0.4, 0, 1, 1) — accelerates as it gets closer (magnet force increases with proximity)
  Phase 3 (400ms–450ms):
    Object snaps to magnet. Small clink visual (brief white flash, scale 1→1.15→1).
  Phase 4: Object attached. Magnet icon glows slightly (box-shadow pulse).
```

### Reveal — non-metal objects stay

```
Wood/fabric objects:
  Lean slightly toward magnet (rotate 5deg) then snap back.
  Duration: 300ms ease-in-out.
  Communicates "I tried, nothing happened."
  Small ✗ fades in above object (opacity 0→0.4→0, 600ms).
```

### JS arc path helper

```javascript
// Move element along curved path to target
function flyToMagnet(el, targetX, targetY, duration = 380) {
  const startRect = el.getBoundingClientRect();
  const startX = startRect.left + startRect.width / 2;
  const startY = startRect.top + startRect.height / 2;

  // Control point: arc slightly upward
  const cpX = (startX + targetX) / 2;
  const cpY = Math.min(startY, targetY) - 40;

  let startTime = null;
  function step(ts) {
    if (!startTime) startTime = ts;
    const t = Math.min((ts - startTime) / duration, 1);
    const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t; // ease-in-out quad

    // Quadratic bezier
    const x = (1-ease)*(1-ease)*startX + 2*(1-ease)*ease*cpX + ease*ease*targetX;
    const y = (1-ease)*(1-ease)*startY + 2*(1-ease)*ease*cpY + ease*ease*targetY;

    el.style.position = 'fixed';
    el.style.left = x + 'px';
    el.style.top = y + 'px';

    if (t < 1) requestAnimationFrame(step);
    else onComplete();
  }
  requestAnimationFrame(step);
}
```

---

## 4. Light & Shadow (Band B — Interactive)

Used in: drag-the-sun, shadow moves live

### Shadow follows sun in real time

```javascript
// Child drags sun emoji around the screen
// Shadow of object updates continuously

function updateShadow(sunX, sunY, objectX, objectY, objectEl, shadowEl) {
  // Direction vector from sun to object
  const dx = objectX - sunX;
  const dy = objectY - sunY;
  const dist = Math.sqrt(dx*dx + dy*dy);

  // Shadow length: inversely proportional to sun height
  // Higher sun (lower sunY) = shorter shadow
  const shadowLength = Math.max(20, (sunY / window.innerHeight) * 120);

  // Shadow position: opposite side of object from sun
  const shadowX = objectX + (dx / dist) * shadowLength;
  const shadowY = objectY + 30; // always on ground

  // Shadow squish: longer shadow = more squished
  const squish = Math.max(0.2, 1 - shadowLength / 200);

  shadowEl.style.transform = `
    translate(${shadowX - objectX}px, 20px)
    scaleX(${0.6 + squish * 0.4})
    scaleY(${squish * 0.4})
  `;
  shadowEl.style.opacity = Math.max(0.1, 0.7 - (shadowLength / 200));
}

// RTL: in Hebrew mode, default sun starts top-right (not top-left)
```

---

## 5. Rainbow reveal (Band A)

Used in: rainbow concept

```css
/* 7 arc segments, revealed one by one */
@keyframes arcReveal {
  from { clip-path: inset(0 100% 0 0); } /* LTR */
  to   { clip-path: inset(0 0% 0 0); }
}

/* RTL version */
@keyframes arcRevealRTL {
  from { clip-path: inset(0 0 0 100%); } /* RTL — sweeps right to left */
  to   { clip-path: inset(0 0 0 0%); }
}

.rainbow-arc-r { background: #FF0000; animation: arcReveal 0.3s ease-out forwards; }
.rainbow-arc-o { background: #FF7F00; animation: arcReveal 0.3s 0.3s ease-out forwards; }
.rainbow-arc-y { background: #FFFF00; animation: arcReveal 0.3s 0.6s ease-out forwards; }
/* ... g, b, i, v with 0.3s stagger each */

/* Apply .rtl-sweep class when Lang.isHe() — switches to arcRevealRTL */
```

TTS fires as each color reveals: "אָדֹם... כָּתֹם... צָהֹב..." (with 300ms gaps).

---

## 6. Water flow / Dissolving (Band B)

### Dissolving animation

```javascript
// Sugar dissolving in water:
// Object enters water, gradually breaks into particles, fades out over 1.5s
// Stone/sand: enters, sinks, no dissolve (see sink animation)

function dissolveObject(el, ctx, x, y) {
  let opacity = 1;
  let scale = 1;
  let particles = [];

  // After 400ms in water, start spawning break-off particles
  setTimeout(() => {
    const interval = setInterval(() => {
      particles.push({
        x: x + (Math.random()-0.5)*30,
        y: y + (Math.random()-0.5)*20,
        vx: (Math.random()-0.5)*0.8,
        vy: -(Math.random()*0.5),
        alpha: 0.6, r: Math.random()*3+1,
        color: '#FFE066' // sugar color
      });
      opacity -= 0.07;
      scale -= 0.05;
      el.style.opacity = Math.max(0, opacity);
      el.style.transform = `scale(${Math.max(0.3, scale)})`;
      if (opacity <= 0) { clearInterval(interval); el.remove(); }
    }, 100);
  }, 400);
}
```

---

## Global animation rules

1. **Never use `transition: all`** — specify exact properties
2. **Always use `will-change: transform`** on animated elements — prevents jank
3. **Cap canvas draw loops at 60fps** — use `requestAnimationFrame`, not `setInterval`
4. **Cleanup:** Cancel all animation frames and intervals when module unmounts
5. **Respect `prefers-reduced-motion`:**
   ```javascript
   const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   // If true: skip phases 3–5 of gravity, skip particle effects, keep core animation only
   ```
6. **Performance floor:** Test on 4-year-old device baseline (dual-core, 4GB RAM). If drop animation causes frame drops, remove dust particles first, then simplify bezier to linear.

---

## Sound design notes

No audio files needed — use TTS + Web Audio API tones.

```javascript
// Impact sound — brief thud via Web Audio
function playThud() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(80, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.start(); osc.stop(ctx.currentTime + 0.2);
}

// Splash — high brief tone
function playSplash() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.connect(gain); gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.25);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.start(); osc.stop(ctx.currentTime + 0.3);
}

// Magnet snap — brief magnetic "click"
function playMagnetSnap() {
  const ctx = new AudioContext();
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i/data.length);
  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  src.buffer = buf; src.connect(gain); gain.connect(ctx.destination);
  gain.gain.value = 0.2;
  src.start();
}
```
