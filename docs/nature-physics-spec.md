# Physics & Nature Module — Implementation Spec
**For:** Codi (Claude Code)  
**Read before writing a single line of code.**  
**Companion files:** `physics-animations.md`, `physics-data.js`

---

## What you are building

A new module: `modules/physics.js`  
It replaces `modules/engineering.js` entirely — remove engineering from the nav and module registry.

The module teaches children aged 3–6 why physical phenomena happen, through two distinct interaction modes:
- **Band A (age 3–4):** Tap → watch → hear. Observe and label only. No prediction.
- **Band B (age 5–6):** Predict → confirm → watch → reveal. Cause and effect.

The defining quality of this module is **animation smoothness**. The physics animations (gravity drop, water flow, magnet pull) must feel physically real and satisfying. A child who drops an apple and sees it bounce naturally will internalize gravity without being told anything. The animation IS the lesson.

---

## File structure

```
modules/physics.js          ← main module (you build this)
modules/physics-data.js     ← all concept data (provided separately)
i18n/he.js                  ← add physics.* keys (spec below)
i18n/en.js                  ← add physics.* keys (spec below)
```

No new engine files. Hook into existing:
- `engine/adaptive.js` — accuracy tracking
- `engine/speech.js` — TTS
- `engine/claude.js` — Socratic hints
- `engine/progress.js` — stars + sessions

---

## Module registration

In `index.html`, where modules are registered:

```javascript
// Remove:
{ id: 'engineering', label: ..., module: Engineering }

// Add:
{ id: 'physics', labelHe: 'פיזיקה וטבע', labelEn: 'Physics & Nature', icon: '🔬', module: Physics }
```

---

## Band determination

```javascript
// Read from existing ylmd_age in localStorage
// 0 → Band A (ages 3–4)
// 1 → Band B (ages 5–6)
// 2 → Band B (ages 7–8 map to Band B — this module has no Band C)
const band = Math.min(Progress.getAge(), 1);
```

---

## Module entry screen (Hub)

Show before the first concept. Child picks their pathway.

```
┌─────────────────────────┐
│  [back]   פיזיקה וטבע   │
│        🔬               │
│   [age badge]           │
│                         │
│  בחר נושא:              │
│  ┌────────────────────┐ │
│  │ 🍎  כבידה     ████░│ │  ← progress bar per concept
│  │ 🧲  מגנטיות   ██░░░│ │
│  │ 🌊  ציפה ושקיעה░░░░│ │
│  │ ☀️  אור וצל   🔒   │ │  ← locked until prior >60%
│  └────────────────────┘ │
└─────────────────────────┘
```

- Each row is a concept group (not individual questions)
- Progress bar = accuracy across all questions in that concept
- Locked concepts unlock when the previous concept reaches 60% accuracy
- Child taps a row → enters that concept's question flow
- No "start" button — tap the row = start
- TTS reads "בחר נושא — על מה רוצה ללמוד היום?" on hub load

---

## Screen flow per concept

### Band A flow

```
Hub → [concept selected] → TTS question plays → Scene shown →
Child taps/drags → Animation plays → TTS narrates result →
[correct] → star + gentle celebration → next question
[wrong]   → "מעניין..." + soft sound → same question again (attempt 2)
[wrong x2] → reveal correct → auto-advance
```

### Band B flow

```
Hub → [concept selected] → TTS question plays → 4 choices shown →
Child taps a choice → "בדוק!" button activates →
Child taps "בדוק!" → Animation plays →
[correct] → star + fact card + parent prompt → next question
[wrong]   → "מעניין... בוא ננסה שוב" → same question (attempt 2)
[wrong x2] → Claude API Socratic hint → attempt 3
[wrong x3] → reveal correct answer visually → auto-advance after 2s
```

**Critical:** The "בדוק!" button must only activate after a choice is tapped. Never auto-submit.

---

## Hesitation time tracking

```javascript
// Start timer when question is displayed
let hesitationStart = Date.now();

// On any tap/drag interaction:
const hesitationMs = Date.now() - hesitationStart;
if (hesitationMs > 8000 && attempts === 0) {
  // Play soft audio re-prompt — do NOT count as wrong attempt
  Speech.speak(currentQuestion.promptRepeat, { rate: 0.8 });
  hesitationStart = Date.now(); // reset
}

// Log to adaptive engine with hesitation data
Adaptive.logAttempt('physics', conceptId, isCorrect, { hesitationMs });
```

---

## Nikud logic (Band B only)

```javascript
// In physics-data.js, each concept has two label versions:
// labelHe: 'מגנט'           ← no nikud
// labelHeNikud: 'מַגְנֵט'   ← with nikud

function getConceptLabel(conceptId) {
  const accuracy = Adaptive.getAccuracy('physics', conceptId);
  const useNikud = accuracy < 0.8; // show nikud until 80% accuracy
  return useNikud ? concept.labelHeNikud : concept.labelHe;
}
```

---

## Adaptive engine integration

```javascript
// localStorage key: ylmd_progress.physics
// Structure mirrors existing modules:
{
  "physics": {
    "gravity_a": { attempts: 6, correct: 5, lastSeen: 1709500000, hesitationAvgMs: 3200 },
    "float_sink_a": { attempts: 4, correct: 2, lastSeen: 1709490000, hesitationAvgMs: 7100 },
    "magnetism_b": { attempts: 8, correct: 7, lastSeen: 1709500000, hesitationAvgMs: 1800 }
  }
}

// Question pool weighting — hook into existing Adaptive.getWeightedPool():
// accuracy < 0.7 → weight 2× (existing rule, apply identically)
// hesitationAvgMs > 6000 → weight 1.5× (new rule, physics only)
```

---

## Claude API hint integration

Trigger after 2nd wrong attempt. Use existing `engine/claude.js`.

```javascript
async function requestSocraticHint(conceptId, childAge) {
  const hintPrompts = {
    'gravity_a':    `ילד בן ${childAge} לא מבין שדברים נופלים. שאל שאלה סוקרטית אחת על כוח המשיכה, בלי לתת תשובה.`,
    'float_sink_a': `ילד בן ${childAge} חושב שאבן תצוף. שאל שאלה אחת על משקל, בלי תשובה.`,
    'magnetism_b':  `ילד בן ${childAge} חושב שמגנט ימשוך עץ. שאל שאלה על חומר, בלי תשובה.`,
    'shadow_b':     `ילד לא מבין לאן הצל נופל. שאל שאלה אחת על כיוון האור, בלי תשובה.`,
    'dissolve_b':   `ילד חושב שאבן תתמוסס. שאל שאלה על מה הוא ראה כשהכניסו סוכר למים, בלי תשובה.`,
    'default':      `ילד בן ${childAge} מתקשה בנושא פיזיקה. שאל שאלה סוקרטית אחת פשוטה מאוד, בלי לתת תשובה.`
  };

  const prompt = hintPrompts[conceptId] || hintPrompts['default'];
  
  // System prompt for all physics hints:
  const system = `אתה מדריך מדע חם ועדין לילד בגיל ${childAge}. שאל שאלה פתוחה אחת בלבד. אל תיתן את התשובה. משפט אחד. מילים פשוטות מאוד.`;

  return await Claude.hint(prompt, system); // uses existing Claude.hint() wrapper
}
```

Show hint in a bubble UI (see wireframe S6). Avatar: 🌟. Never show "wrong" — show the hint bubble with curious framing.

---

## Parent Prompt (Reveal screen only)

Show after every correct reveal in Band B. One question per concept group (not per question).

```javascript
const parentPrompts = {
  'gravity':   { he: 'שאל את הילד: "אם נשחרר נוצה וצעצוע — מה יגיע ראשון?"', en: 'Ask: "If we drop a feather and a toy, which lands first?"' },
  'magnetism': { he: 'שאל: "בבית שלנו, מה לדעתך ימשוך מגנט?"', en: 'Ask: "In our house, what do you think a magnet would pull?"' },
  'float':     { he: 'שאל: "מה תמצא בים שצף? מה שוקע?"', en: 'Ask: "What floats in the sea? What sinks?"' },
  'shadow':    { he: 'שאל: "מתי הצל שלך הכי ארוך — בוקר, צהריים, או ערב?"', en: 'Ask: "When is your shadow longest — morning, noon, or evening?"' },
  'dissolve':  { he: 'שאל: "מה תנסה להמיס במים בבית?"', en: 'Ask: "What would you try to dissolve in water at home?"' },
  'sound':     { he: 'שאל: "איפה הכי שקט בבית שלנו? למה לדעתך?"', en: 'Ask: "Where is it quietest at home? Why do you think?"' },
  'matter':    { he: 'שאל: "מה עוד יכול להפוך מוצק לנוזל?"', en: 'Ask: "What else can turn from solid to liquid?"' }
};
```

UI: small card at bottom of reveal screen (see S5 wireframe). 👨‍👩‍👧 icon. Tap anywhere on it to dismiss. Never blocks next-question button.

---

## i18n keys to add

### i18n/he.js — add under `physics`:
```javascript
physics: {
  moduleTitle: 'פיזיקה וטבע',
  chooseTitle: 'בחר נושא',
  choosePrompt: 'על מה רוצה ללמוד היום?',
  check: 'בדוק!',
  tryAgain: 'מעניין... בוא ננסה שוב! 🔄',
  correct: 'צדקת!',
  nextQ: 'השאלה הבאה',
  hintLabel: 'רמז מהעוזר',
  parentLabel: 'להורים',
  attempt: 'ניסיון',
  locked: 'נעול',
  concepts: {
    gravity:   { he: 'כבידה',       heNikud: 'כְּבִידָה',       en: 'Gravity' },
    magnetism: { he: 'מגנטיות',     heNikud: 'מַגְנֵטִיּוּת',   en: 'Magnetism' },
    float:     { he: 'ציפה ושקיעה', heNikud: 'צִיפָה וּשְׁקִיעָה', en: 'Float & Sink' },
    shadow:    { he: 'אור וצל',     heNikud: 'אוֹר וָצֵל',      en: 'Light & Shadow' },
    dissolve:  { he: 'התמסות',      heNikud: 'הִתְמַסְּרוּת',   en: 'Dissolving' },
    sound:     { he: 'קול נוסע',    heNikud: 'קוֹל נוֹסֵעַ',    en: 'Sound Travels' },
    matter:    { he: 'מצבי חומר',   heNikud: 'מַצְּבֵי חֹמֶר',  en: 'States of Matter' },
    rainbow:   { he: 'קשת',         heNikud: 'קֶשֶׁת',           en: 'Rainbow' },
    heavy:     { he: 'כבד וקל',     heNikud: 'כָּבֵד וְקַל',    en: 'Heavy & Light' },
    daynight:  { he: 'יום ולילה',   heNikud: 'יוֹם וָלַיְלָה',  en: 'Day & Night' },
  }
}
```

---

## RTL notes

- All progress fills: Right-to-Left in Hebrew mode (`direction: rtl` already on `<html>`)
- Rainbow reveal animation: sweep direction must flip. Use `Lang.isHe()` to set CSS class `.rtl-sweep` vs `.ltr-sweep`
- Shadow activity: light source anchor flips to top-right in Hebrew, top-left in English
- Hub concept list: icon | label | progress | arrow — arrow points ← in RTL, → in LTR

---

## Out of scope for Codi in this session

- CV / Physical-Digital Drop (Type 4) — Phase 11
- Treasure Hunt mode (Type 5) — Phase 11 stretch
- Band C concepts — not in this module
- New engine files — use existing engines only
