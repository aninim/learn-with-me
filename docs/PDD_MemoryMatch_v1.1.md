# 🧠 Product Design Document — Memory Match Module
**Learn With Me | למד איתי**
**Module:** S12 — Memory Match (זיכרון)
**Version:** 1.1 (revised — Ages 3–6 scope)
**Status:** Phases 0–5 Complete → Ready for Build
**Author:** Oren Elimelech + Clodi
**Date:** March 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Research Foundation](#2-research-foundation)
3. [User Personas & Age Bands](#3-user-personas--age-bands)
4. [Design Philosophy](#4-design-philosophy)
5. [Theme System — 5 Worlds](#5-theme-system--5-worlds)
6. [Game Mechanics](#6-game-mechanics)
7. [Content Library](#7-content-library)
8. [AI Layer](#8-ai-layer)
9. [Audio & Voice Design](#9-audio--voice-design)
10. [Visual Design System](#10-visual-design-system)
11. [Screen Specs](#11-screen-specs)
12. [Technical Spec](#12-technical-spec)
13. [Locked Decisions](#13-locked-decisions)
14. [Open Issues & Backlog](#14-open-issues--backlog)

---

## 1. Executive Summary

### What It Is

Memory Match (זיכרון) is a card-flip matching game for children aged **3–6**. It is both a standalone module and the app's **canonical "Small Win"** — the module any other screen can auto-trigger when a child needs a confidence reset.

Unlike commercial memory games (identical image pairs), this module pairs **conceptually related but visually different cards**: a letter paired with its word, an animal paired with its Hebrew name, a number paired with a dot cluster. Every match is a vocabulary act embedded in play.

### Scope (v1.1 Change)

**Band C (ages 7–8) is out of scope.** Math composition pairs, 4×6 grids, and challenge mode are backlog items for v1.5. This document covers ages 3–6 only (Band A + Band B).

### Core Innovation

> Commercial memory game: Card A = 🦁, Card B = 🦁. Child matches by visual memory alone.
>
> This module: Card A = **א** (letter), Card B = **🦁 אֲרִי** (word + picture). Child must connect letter → sound → word → image. Every flip activates language, not just vision.

### Success Looks Like

- A 3-year-old playing alone with 4 card pairs, hearing "אַרְיֵה!" each time they flip a lion
- A 5-year-old matching Hebrew letters to their emoji-words, earning 3 stars
- Any child in any other module triggering Memory Match as a "small win" reset, succeeding in under 60 seconds, and returning to the original module with confidence restored

---

## 2. Research Foundation

### 2.1 Working Memory Predicts Academic Readiness

Working memory (WM) — the ability to hold and manipulate information briefly — is among the strongest predictors of reading, math, and executive function outcomes through primary school (Alloway, 2012).

**Key study (PubMed, 2019):** A randomized controlled trial of 148 kindergarteners (University of Maryland) showed that children who played tablet-based WM games continued improving WM scores **at least one month after play stopped** — demonstrating durable neurological change.

**Design application:** This module is not entertainment with a side effect of learning. It is a WM training instrument with the wrapper of a card game.

### 2.2 The Ebbinghaus Spacing Effect

Memory decays rapidly after first exposure. The evidence-based fix is **spaced repetition**: revisiting content at increasing intervals before the memory fully decays. Five spaced encounters outperform ten massed encounters on the same day (Ebbinghaus, 1885; ResearchGate meta-analysis, 2014).

**Design application:** Cards missed in round 1 receive higher weight in round 2. This extends across sessions via localStorage. It is the same algorithm behind Anki and Duolingo — adapted for a 4-year-old card game.

### 2.3 Associative Memory > Rote Memory

Matching א to 🦁 (Ari) creates a **dual-coded memory trace**: letter + sound + image, simultaneously. This is why traditional Hebrew alphabet charts have always paired letters with words. The aleph-bet poster is 3,000 years of associative memory design. This module digitizes and gamifies it.

**Research backing:** "Memory and matching games improve visual perception, spatial awareness, and vocabulary simultaneously when pictures are paired with labels" (eeBoo Research, 2025).

### 2.4 Stress Blocks Memory Formation

Negative feedback (wrong buzzer, red X, "try again" text) triggers cortisol responses in young children. Cortisol inhibits hippocampal function — the brain region central to memory encoding (Lupien et al., 2009).

**Design constraint derived:** All feedback must be positive-coded. Wrong answers get a gentle audio cue, a 250ms face-up window, and a quiet card flip-back. No punitive signal of any kind.

### 2.5 Subitizing & Gestalt Number Sense

Children recognize dot patterns **without counting** up to quantities of 5 (subitizing). Dice patterns, triangle clusters, and 2×3 arrays are recognized at the perceptual level — bypassing serial counting and building number sense directly.

**Design application:** Number pairing cards use deliberate Gestalt dot groupings (dice patterns, triangles, squares) — not random scatter. This forces subitizing, not counting.

### 2.6 The 250ms Mismatch Window — Novel Design Element

When two non-matching cards are revealed, they remain face-up for **250ms before flipping back**. This is long enough to register both images passively, short enough to feel snappy and not punishing. A "loss" becomes a learning moment. This is a novel design element — not standard in commercial memory games.

---

## 3. User Personas & Age Bands

### Band A — Ages 3–4: The Explorer 🐣

**Developmental profile:**
- Pre-reader
- Attention span: 3–5 minutes
- Motor accuracy: low (requires large touch targets ≥150×150px)
- Learning mode: sound-first, image-driven
- Motivation: delight and novelty, not achievement

**Memory capacity:** 2–3 card pairs (4–6 cards total)

**Grid:** 2×2 or 2×3

**Game mode:** Identical image pairs — both cards show the same animal. Audio speaks the Hebrew name on every flip. No mismatch pressure. Unlimited tries. No explicit fail state.

**Win condition:** Any completion = full celebration

**Default theme:** 🦁 Jungle World

**Animals in play:** 🦁 אַרְיֵה · 🐘 פִּיל · 🦒 זְרָפָה · 🐒 קוֹף · 🦓 זֵבְרָה · 🦜 תּוּכִּי · 🦛 קַרְנַפִּית · 🐊 תַּנִּין

---

### Band B — Ages 5–6: The Builder ⭐

**Developmental profile:**
- Beginning reader
- Recognizes some Hebrew letters
- Attention span: 8–12 minutes
- Motor accuracy: improving (touch targets ≥110×110px)
- Motivation: star collection, improvement, achievement

**Memory capacity:** 6–8 card pairs (12–16 cards total)

**Grid:** 3×4 or 4×4

**Game mode:** Associative pairs — letter card ↔ word/picture card. Number ↔ dot pattern. Animal ↔ Hebrew name. Every match is a vocabulary event.

**Win condition:** Stars based on flip efficiency. Weak pairs re-appear next session (spaced repetition).

**Hint:** 🔍 Peek button appears after 8 seconds of inactivity (ages 5+ only)

**Themes:** 🍭 Candy Land / 🚂 Toy Town / 🌊 Ocean / 🔭 Space (selectable)

---

### ~~Band C — Ages 7–8~~ (Out of Scope — v1.5)

Math composition pairs, 4×6 grids, challenge mode, and number decomposition are removed from this document. Backlog.

---

## 4. Design Philosophy

### 4.1 Pairs Are Conceptual, Not Identical (Ages 5+)

The core innovation. Cards share **meaning**, not appearance:

| Card A | Card B | Concept Reinforced |
|--------|--------|-------------------|
| Letter: א | 🦁 + אֲרִי | Aleph = the sound in "Ari (lion)" |
| Numeral: 5 | Dice-5 dot pattern | Five = subitizable cluster |
| Color word: כָּחֹל | Blue swatch 🟦 | Hebrew color name = visual color |
| Animal pic: 🐢 | Hebrew: צַב | Turtle picture = word "tzav" |
| Shape: △ | מְשׁוּלָשׁ | Triangle = Hebrew name |

For Band A (ages 3–4): identical pairs only. Associative matching is developmentally premature.

### 4.2 The 250ms Flip-Back Window

When two non-matching cards are revealed, both remain face-up for **250ms before flipping back**. This is enough time to register both images — a passive learning moment without friction. The "loss" is reframed as an exposure event.

### 4.3 No Dead Ends (Auto-Solve Rule)

If a child misses the same pair **4 times**, both cards pulse gently → correct pair highlighted → match completed automatically with voice cue: *"הנה הם! [card names]"*. Round continues. No fail state.

### 4.4 Matched Pairs Stay Visible (Default)

**Locked decision M-10:** Matched pairs remain on screen at 70% opacity with green glow. They do not disappear. This reduces cognitive load — the child doesn't need to track which pairs are "done" from memory. (Future: selectable per child preference.)

### 4.5 The Small Win Auto-Trigger

Memory Match is the app's **canonical confidence-reset mechanism**. Any module can call:

```javascript
window.launchSmallWin(returnModule)
```

This launches Memory Match at Band A difficulty (2 pairs, 4 cards — guaranteed success in under 60 seconds) before returning to the original module. The system-level "if struggling → win something → resume" loop.

---

## 5. Theme System — 5 Worlds

Each theme has: unique card backs, board background, sound palette, card reveal animation, celebration style, and Hebrew content focus.

### 🦁 Jungle World (Default, Ages 3–5)

| Property | Value |
|----------|-------|
| Card back | Dark green with leaf pattern, animal footprint |
| Board | Warm amber, dappled light texture |
| Reveal animation | Cards "grow" from small (animal peeking out) |
| Correct match sound | That animal's sound (lion roar, elephant trumpet…) |
| Celebration | Drum roll + animal chorus |
| Board ambiance | Soft jungle birds (loop) |
| Content focus | Animal names (חיות) |
| Animals | 🦁🐘🦒🐒🦓🦜🦛🐊 |

### 🍭 Candy Land (Ages 4–6)

| Property | Value |
|----------|-------|
| Card back | Pastel pink/mint, polka dot pattern |
| Board | White with candy stripe borders |
| Reveal animation | Cards "unwrap" with a twist |
| Correct match sound | Sparkle pop + "yum!" |
| Celebration | Glockenspiel fanfare |
| Board ambiance | Whimsical music box loop |
| Content focus | Colors, shapes, adjectives |
| Items | 🍭🧁🍦🐻🍫🍪🍩🍬 |

### 🚂 Toy Town (Ages 4–6)

| Property | Value |
|----------|-------|
| Card back | Wooden texture, toy chest latch |
| Board | Playroom floor texture |
| Reveal animation | Cards slide out from toy box |
| Correct match sound | Engine + squeaky toy |
| Celebration | Wind-up toy melody |
| Board ambiance | Playroom background hum |
| Content focus | Nouns, action verbs |
| Items | 🚂🚗🤖🚀⚽🥁🪁🚢 |

### 🌊 Ocean Deep (Ages 5–6)

| Property | Value |
|----------|-------|
| Card back | Teal blue with wave/fish scale pattern |
| Board | Underwater scene, bubble particles in corners |
| Reveal animation | Cards "surface" from below with ripple |
| Correct match sound | Water drop + sonar ping |
| Celebration | Whale song |
| Board ambiance | Underwater gurgles loop |
| Content focus | Letters, words, mixed review |
| Items | 🐠🐳🐙🦭🪼🦀🐢🪸 |

### 🔭 Space Explorer (Ages 5–6)

| Property | Value |
|----------|-------|
| Card back | Deep navy with star field |
| Board | Dark space, constellation borders |
| Reveal animation | Cards beam in with laser scan |
| Correct match sound | Synth "power up" |
| Celebration | Rocket launch + echo |
| Board ambiance | Space ambiance low drone |
| Content focus | Numbers, dot patterns, mixed |
| Items | 🚀🪐⭐👨‍🚀🛸🌙☄️🕳️ |

**All sounds:** Generated via Web Audio API — no external files, 100% offline.

---

## 6. Game Mechanics

### 6.1 Session Flow

```
1. Theme world shown → "בוא נשחק זיכרון!" (audio, he-IL)
2. Board assembled — age band + content category → weighted pair selection
3. Shuffle animation (500ms) → cards dealt face-down
4. Audio: "מצא את הזוגות! הפוך קלף!"
5. Child taps card → flip animation (300ms 3D) + Hebrew content spoken
6. Child taps second card:
   a. MATCH  → celebration burst, pair grayed+glowed, +1 counter
   b. NO MATCH → 250ms face-up window → quiet flip-back (no punishment)
7. If same pair missed 4× → auto-solve with voice cue
8. All pairs matched → WIN SCREEN
9. Win screen: stars + confetti + AI praise + [עוד פעם / הביתה]
```

### 6.2 Grid Configurations

| Band | Use Case | Pairs | Grid | Total Cards |
|------|----------|-------|------|-------------|
| A | Auto Small Win | 2 | 2×2 | 4 |
| A | Standard session | 3 | 2×3 | 6 |
| B | Standard session | 6 | 3×4 | 12 |
| B | Advanced (unlocked by accuracy) | 8 | 4×4 | 16 |

### 6.3 Star Rating

| Stars | Condition | Celebration |
|-------|-----------|-------------|
| ⭐⭐⭐ | Flips ≤ pairs × 2.2 | Fanfare + confetti + AI special phrase |
| ⭐⭐ | Flips ≤ pairs × 3.5 | Confetti + warm praise |
| ⭐ | Round completed (any flips) | Full celebration — never less than joyful |

**Rule:** 1-star completion is always a full celebration. Stars are rewards, never punishment.

### 6.4 Peek Hint (Band B Only)

A 🔍 button appears after **8 seconds of inactivity** (ages 5–6 only). Tapping it briefly reveals one unmatched card for 800ms before flipping back. Unlimited uses — the goal is never frustration.

Absent in Band A — grid is small enough to be unnecessary.

### 6.5 Spaced Repetition Algorithm

```javascript
// Per-pair accuracy (localStorage)
{
  pairId: "letter-aleph-ari",
  attempts: 6,
  correct: 4,
  lastSeen: timestamp
}

// Pair weight in next round:
accuracy < 60%  → weight × 3.0  (weak — appears this + next session)
accuracy 60–80% → weight × 1.5  (learning — normal frequency)
accuracy > 80%  → weight × 0.5  (mastered — rest it)
new pair        → weight × 1.5  (introduce gently)
```

---

## 7. Content Library

### 7.1 Animal Pairs — Band A (Jungle World, Identical)

Both cards show same animal. Audio says Hebrew name on each flip.

| Emoji | Hebrew Name | Nikud |
|-------|-------------|-------|
| 🦁 | אַרְיֵה | Lion |
| 🐘 | פִּיל | Elephant |
| 🦒 | זְרָפָה | Giraffe |
| 🐒 | קוֹף | Monkey |
| 🦓 | זֵבְרָה | Zebra |
| 🦜 | תּוּכִּי | Parrot |
| 🦛 | קַרְנַפִּית | Hippo |
| 🐊 | תַּנִּין | Crocodile |

### 7.2 Hebrew Alphabet Pairs — Band B (22 pairs)

Letter card ↔ Picture-word card. Audio: letter name + word on flip.

| Letter | Name | Word | Emoji | Notes |
|--------|------|------|-------|-------|
| א | אָלֶף | אֲרִי | 🦁 | |
| ב | בֵּית | בַּיִת | 🏠 | |
| ג | גִּימֶל | גַּמָל | 🐪 | |
| ד | דָּלֶת | דָּג | 🐟 | |
| ה | הֵא | הַר | ⛰️ | |
| ו | וָו | וֶרֶד | 🌹 | |
| ז | זַיִן | זֵבְרָה | 🦓 | |
| ח | חֵית | חָתוּל | 🐱 | |
| ט | טֵית | טִיּוּל | 🎒 | |
| י | יוֹד | יֶלֶד | 👦 | |
| כ | כָּף | כֶּלֶב | 🐕 | |
| ל | לָמֶד | לֵב | ❤️ | |
| מ | מֵם | מָיִם | 💧 | |
| נ | נוּן | נָחָשׁ | 🐍 | |
| ס | סָמֶךְ | סוּס | 🐴 | |
| ע | עַיִן | עֵץ | 🌳 | |
| פ | פֵּא | פֶּרַח | 🌸 | |
| צ | צָדִי | צַב | 🐢 | |
| ק | קוֹף | קוֹף | 🐒 | |
| ר | רֵישׁ | רַכֶּבֶת | 🚂 | |
| ש | שִׁין | שֶׁמֶשׁ | ☀️ | |
| ת | תָּו | תַּפּוּחַ | 🍎 | |

### 7.3 Number + Dot Pairs — Band B (1–10)

Numeral card ↔ Gestalt dot pattern card. Designed for subitizing, not counting.

| Numeral | Hebrew | Dot Style | Pattern |
|---------|--------|-----------|---------|
| 1 | אֶחָד | Single center | ● |
| 2 | שְׁתַּיִם | Side-by-side | ●● |
| 3 | שָׁלוֹשׁ | Triangle (dice 3) | ∴ |
| 4 | אַרְבַּע | Square corners (dice 4) | ⠶ |
| 5 | חָמֵשׁ | Dice 5 | ⠿ |
| 6 | שֵׁשׁ | Dice 6 | ⠿⠿ |
| 7 | שֶׁבַע | 3+4 clusters | ∴ + ⠶ |
| 8 | שְׁמוֹנֶה | 4+4 clusters | ⠶ + ⠶ |
| 9 | תֵּשַׁע | 3+3+3 | ∴ + ∴ + ∴ |
| 10 | עֶשֶׂר | Two rows of 5 | ⠿ + ⠿ |

### 7.4 Color Pairs — Band B (Candy Land)

Hebrew word (with nikud) ↔ Pure color swatch card.

| Hebrew | Nikud | Color | Hex |
|--------|-------|-------|-----|
| אָדֹם | Red | | #E63946 |
| כָּחֹל | Blue | | #457B9D |
| צָהֹב | Yellow | | #FFD166 |
| יָרֹק | Green | | #06D6A0 |
| כָּתֹם | Orange | | #FF6B35 |
| סָגֹל | Purple | | #9B5DE5 |
| וָרֹד | Pink | | #FF85A1 |

### 7.5 Shape Pairs — Band B

Shape image ↔ Hebrew name with nikud.

| Shape | Hebrew | Nikud |
|-------|--------|-------|
| ○ | עִגּוּל | Circle |
| □ | רִיבּוּעַ | Square |
| △ | מְשׁוּלָשׁ | Triangle |
| ♥ | לֵב | Heart |
| ⭐ | כּוֹכָב | Star |
| ⬟ | מְעֻיָּן | Diamond |

---

## 8. AI Layer

### 8.1 Activation Trigger

Following global Locked Decision #6: **Claude API activates only after 2 misses on the same pair** within a session, or after a full round with accuracy below 50%.

Not on every miss. Not on every round. Minimal, purposeful, cost-conscious.

### 8.2 Hint Prompt

```javascript
const hintPrompt = `
A ${age}-year-old Hebrew-learning child keeps missing this pair:
Card A: "${cardA.hebrewText}" (${cardA.emoji})
Card B: "${cardB.hebrewText}" (${cardB.emoji})

Generate ONE warm, encouraging hint in simple Hebrew (2 sentences max).
Use nikud. Help them make the connection. NEVER reveal the answer directly.
Use age-appropriate language for a ${age}-year-old.
`;

// API call
fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 80,
    system: "You are a warm Hebrew-speaking tutor for children aged 3–6. Never give the answer directly. 2 sentences max. Use nikud.",
    messages: [{ role: "user", content: hintPrompt }]
  })
})
```

**Example output (pair: א ↔ 🦁 אֲרִי):**
> "הַאֵם אַתָּה מַכִּיר אֲרִי? הוּא חַי בַּגׇּן וְיֵשׁ לוֹ רַעְמָה גְּדוֹלָה!"

### 8.3 Celebration Phrase Variation

After a successful round, AI generates a fresh Hebrew praise phrase — never repeating "כל הכבוד" every session:

```javascript
const celebPrompt = `
Generate ONE short (5–8 words) enthusiastic Hebrew celebration phrase
for a ${age}-year-old who just matched all their memory cards.
Use nikud. Be warm and specific. Not "כל הכבוד" — something fresh.
`;
```

### 8.4 Caching

All AI responses cached in localStorage by `pairId` (hints) or `sessionId` (celebrations). Cache expires 7 days. Offline fallback: pre-written warm Hebrew prompts (no API call needed).

---

## 9. Audio & Voice Design

### 9.1 Event Audio Table

| Event | Sound Effect | Voice Output |
|-------|-------------|--------------|
| Card flipped | Soft card flip SFX | Hebrew content spoken aloud |
| Match found | Musical chime + sparkle | "מצאת! יפה!" |
| No match | Soft "whomp" (non-punishing) | Silence |
| Round complete | Fanfare (2 sec) | AI-generated praise phrase |
| Hint revealed | Gentle ping | AI hint narrated |
| Auto-solve (4th miss) | Rising warm chime | "הנה הם! [card names]" |

### 9.2 Voice Spec

```javascript
speak(text, {
  lang: 'he-IL',
  rate: 0.80,      // Slightly slower for young children
  pitch: 1.15,     // Warmer tone
  volume: 0.9
})
```

### 9.3 Theme Sound Palettes (All Web Audio API)

| Theme | Correct Match | Celebration | Ambiance |
|-------|--------------|-------------|---------|
| 🦁 Jungle | That animal's sound | Drum roll + animal chorus | Jungle birds (loop) |
| 🍭 Candy | Sparkle pop + "yum!" | Glockenspiel fanfare | Music box (loop) |
| 🚂 Toy | Engine + squeak | Wind-up melody | Playroom hum |
| 🌊 Ocean | Water drop + sonar | Whale song | Bubbles (loop) |
| 🔭 Space | Synth "power up" | Rocket launch | Space drone |

---

## 10. Visual Design System

### 10.1 Card Dimensions

| Band | Card Size | Min Touch Target | Emoji Size | Text Size |
|------|-----------|-----------------|-----------|-----------|
| A (2×2, 2×3) | 150×150px | 150×150px | 90px | 36px |
| B (3×4) | 110×110px | 110×110px | 70px | 28px |
| B advanced (4×4) | 96×96px | 96×96px | 55px | 22px |

**Rule: Never below 96×96px touch target — global lock.**

### 10.2 Card States & CSS

| State | Visual | Animation | Duration |
|-------|--------|-----------|---------|
| Face Down (idle) | Theme card-back + shimmer | Glow pulse every 3s | Loop |
| Face Up (active) | Content visible, scale 1.05 | `rotateY(180deg)` | 300ms ease |
| Matched | Green glow, opacity 0.7, stays visible | Pulse burst | 600ms |
| Mismatch (250ms) | Red border pulse, then flip-back | Border fade → flip | 250ms + 300ms |

```css
/* Card flip */
.card { transform-style: preserve-3d; transition: transform 300ms ease; }
.card.flipped { transform: rotateY(180deg); }

/* Match glow */
.card.matched {
  box-shadow: 0 0 20px #06D6A0;
  opacity: 0.7;
  animation: matchPulse 600ms ease;
}

/* Idle shimmer */
.card:not(.flipped):not(.matched) {
  animation: shimmer 3s ease-in-out infinite;
}
```

### 10.3 Board Layout

```
┌─────────────────────────────────────┐
│  🦁 Jungle World     ⭐⭐  Pairs: 3/6 │  ← Header
├─────────────────────────────────────┤
│                                     │
│  [🂠][🂠][🂠][🂠]                      │
│  [🂠][🂠][🂠][🂠]                      │
│  [🂠][🂠][🂠][🂠]                      │
│                                     │
├─────────────────────────────────────┤
│  [🔍 עזרה — Band B only]  [🏠 Home] │  ← Footer
└─────────────────────────────────────┘
```

### 10.4 RTL Compliance

Grid layout: direction-neutral (no change needed).
Text labels: `dir="rtl"` for all Hebrew strings.

| Element | Hebrew (RTL) | English (LTR) |
|---------|-------------|---------------|
| Pair counter | Top-left | Top-right |
| Hint button | Bottom-right | Bottom-left |
| Home button | Bottom-left | Bottom-right |

---

## 11. Screen Specs

### S12-A: World Select

Shown before first Memory Match session per day (not globally).

- 2-column grid of theme cards: Jungle / Candy / Toy / Ocean / Space
- Each: preview thumbnail + Hebrew name + age range
- Audio: "בחר עולם!" on load
- Default: last-used theme

### S12-B: Difficulty Select (Band B Only)

Simple 3-button screen. Band A skips this.

| Option | Hebrew | Grid | Icon |
|--------|--------|------|------|
| Easy | קַל | 2×3 (6 cards) | 🐣 |
| Medium | בֵּינוֹנִי | 3×4 (12 cards) | ⭐ |
| Hard | קָשֶׁה | 4×4 (16 cards) | 🚀 |

### S12-C: Game Board (Main)

See §10.3 layout. States: Idle → One Flipped → Two Flipped → Match/Mismatch → Round Complete.

### S12-D: Win Screen

Full-screen overlay, theme-colored.

- Stars bounce in (1→2→3 sequentially)
- Confetti burst (theme-color particles)
- AI praise phrase (large nikud text, animated entrance)
- Two buttons: עוֹד פַּעַם / הַבַּיְתָה
- Auto-dismisses after 4s with no interaction

---

## 12. Technical Spec

### 12.1 Data Structures

```javascript
// Card definition
{
  id: "letter-aleph",
  type: "letter",         // letter|number|animal|color|shape
  displayType: "emoji+text",  // emoji|text|color-swatch|dot-pattern
  content: {
    emoji: "🦁",
    hebrewText: "אֲרִי",
    englishText: "Lion"
  },
  pairId: "letter-aleph-ari",  // shared with paired card
  pairRole: "A" | "B",
  ageBands: ["B"],
  theme: "all" | "jungle" | "candy" | ...
}

// Session state
{
  theme: "jungle",
  ageBand: "A" | "B",
  grid: { cols: 3, rows: 2 },
  cards: [...],          // shuffled
  flipped: [],           // currently face-up indices
  matched: [],           // matched pairIds
  flipsThisRound: 0,
  missCountPerPair: {},  // { pairId: missCount }
  startTime: timestamp
}

// Progress (localStorage: 'ylmd_memory_progress')
{
  pairs: {
    "letter-aleph-ari": {
      attempts: 8,
      correct: 6,
      lastSeen: timestamp
    }
  },
  sessions: 7,
  totalStars: 19,
  bestRound: { pairCount: 6, flips: 11, stars: 3 }
}
```

### 12.2 Core Functions

```javascript
// Weighted pair selection (spaced repetition)
function selectPairs(ageBand, category, count) {
  const pool = CARD_LIBRARY.filter(p =>
    p.ageBands.includes(ageBand) &&
    (category === 'mixed' || p.category === category)
  );

  return weightedSample(pool, count, pair => {
    const prog = getProgress(pair.id);
    if (!prog) return 1.5;                                 // new
    const acc = prog.correct / prog.attempts;
    if (acc < 0.6) return 3.0;                            // weak
    if (acc > 0.8) return 0.5;                            // mastered
    return 1.0;
  });
}

// Card flip handler
async function onCardTap(i) {
  if (locked || flipped.includes(i)) return;
  const card = cards[i];
  if (matched.includes(card.pairId)) return;

  flipCard(i, 'up');
  speak(card.content.hebrewText);
  flipped.push(i);

  if (flipped.length === 2) {
    locked = true;
    await wait(100);

    const [a, b] = flipped;
    if (cards[a].pairId === cards[b].pairId) {
      handleMatch(a, b);
    } else {
      // 250ms face-up window
      await wait(250);
      handleMismatch(a, b);
      incrementMissCount(cards[a].pairId);
      if (getMissCount(cards[a].pairId) >= 4) triggerAutoSolve(cards[a].pairId);
      if (getMissCount(cards[a].pairId) >= 2) triggerAIHint(cards[a]);
    }
  }
}

// Small Win entry point (global)
window.launchSmallWin = function(returnModule) {
  startMemoryMatch({
    ageBand: 'A',
    pairCount: 2,
    theme: getCurrentTheme(),
    onComplete: () => returnToModule(returnModule)
  });
};
```

### 12.3 AI Call

```javascript
async function triggerAIHint(card) {
  const cacheKey = `hint_${card.pairId}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) { speak(cached); return; }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 80,
      system: "Warm Hebrew tutor for ages 3–6. 2 sentences max. Use nikud. Never give direct answer.",
      messages: [{ role: "user", content: buildHintPrompt(card) }]
    })
  });
  const data = await res.json();
  const hint = data.content[0].text;
  localStorage.setItem(cacheKey, JSON.stringify({ hint, ts: Date.now() }));
  speak(hint);
}
```

---

## 13. Locked Decisions

| ID | Decision | Rationale |
|----|----------|-----------|
| M-01 | Conceptual pairs for ages 5+; identical for ages 3–4 | Associative matching is developmentally premature at age 3 |
| M-02 | No timers, any mode | Time pressure blocks hippocampal memory encoding |
| M-03 | 250ms face-up window on mismatch | Transforms miss into passive learning moment |
| M-04 | Auto-solve after 4 misses on same pair | No dead ends; frustration is the enemy of memory formation |
| M-05 | Stars = celebration only, never punishment | 1-star = full celebration; star loss never shown |
| M-06 | Band C (ages 7–8) out of scope this version | Scope locked to ages 3–6 for v1.0–1.4 |
| M-07 | AI only on 2+ misses on same pair | Global API cost rule + pedagogically correct |
| M-08 | Spaced repetition across sessions | Durable learning vs. in-session entertainment |
| M-09 | Memory Match = canonical Small Win module | Lowest fail rate, highest dopamine, resets confidence app-wide |
| M-10 | Matched pairs stay visible (grayed, default) | Reduces cognitive tracking load for young children |

---

## 14. Open Issues & Backlog

### Active Design Questions

| ID | Question | Status |
|----|----------|--------|
| GAP-M02 | Hint button: icon only 🔍 vs icon+text "עזרה"? | Leaning icon-only |
| GAP-M05 | Should World Select screen appear every session or only first time per day? | Open — Oren to decide |
| GAP-M06 | Band B difficulty select: auto-select based on accuracy, or always show picker? | Open |

### Content Gaps (Must Fill Before Build)

- [ ] Dot pattern illustrations for 7–10 — must be hand-designed for subitizing clarity (not emoji)
- [ ] Audio cues for all 8 Jungle World animals (correct-match sounds)
- [ ] English/Hebrew bilingual pairs (Phase 7 toggle, not this version)

### Future Backlog (v1.5+)

- Band C (ages 7–8): math composition pairs, 4×6 grid, challenge mode
- Matched-pairs visibility toggle: child-selectable preference
- Two-player mode: two children, same device, alternating turns
- Parent dashboard: weakest pairs, recommended daily sessions
- Camera mode: child holds physical card to camera (Phase 11 CV integration)
- Custom theme builder: parent uploads photos for personalized cards

---

*PDD v1.1 — authored by Clodi (Claude Web) + Oren Elimelech | March 2026*
*Ready for Codi (Claude Code) — see CLAUDE.md for build conventions*
*Visual deck: `memory-match-visual-deck.html`*
