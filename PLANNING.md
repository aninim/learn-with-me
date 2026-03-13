# PLANNING.md — Learn With Me / למד איתי
> Live ops doc. Maintained by Clodi (planning) + Codi (build progress).
> Full design spec → `PDD.md` | Codi instructions → `CLAUDE.md`
> ⚠️ SPEC_APP.md is retired — superseded by PDD.md + CLAUDE.md

---

## Current Version
**v1.1** — stable (2026-03-12)
- Memory Match fully redesigned per PDD_MemoryMatch_v1.1.md:
  - Band A (ages 3–4): identical animal pairs, 2×3 grid (6 cards), 8 jungle animals
  - Band B (ages 5–6): associative pairs — letter ↔ emoji+word, 3×4 grid (12 cards), full 22-letter alphabet
  - 3D card flip (300ms rotateY), 250ms mismatch window (passive learning moment)
  - Matched pairs stay visible at 70% opacity + green glow (M-10)
  - Auto-solve after 4 misses on same pair ("הִנֵּה הֵם!")
  - Peek hint 🔍 (Band B only) — reveals 1 card 800ms; pulses after 8s inactivity
  - Star rating on win overlay (⭐/⭐⭐/⭐⭐⭐ based on flip efficiency)
  - Per-pair spaced repetition via Progress.record()
- v1.0 base: Phase 10 Child Profiles + all 6 modules redesigned (age-tiered, emoji-first)

---

## Active Feature
**Engineering → Nature module rename/redesign** (2026-03-12)
- Pending: Engineering → Nature rename (content swap, label update)
- Next major phase: Phase 11 — Spaced Repetition (SM2)

---

## Phase Status

| Phase | Focus | Status |
|-------|-------|--------|
| 1 — Hebrew Core | Letters + Numbers, RTL, TTS, touch | ✅ Done |
| 2 — Fine Motor | Letter tracing — canvas, pixel-mask, 3 modes | ✅ Done |
| 3 — More Modules | Shapes + Colors | ✅ Done |
| BONUS | Math (age-tiered) + Engineering (8 tools) | ✅ Done |
| 4 — Adaptive Engine | localStorage weighting (basic) | ⚠️ Partial |
| 5 — Input Expansion | Gamepad ✅ — MediaPipe Hands/Pose ❌ | 🔨 Partial |
| 6 — AI Layer | Claude API hints — limited modules, no error handling | ⚠️ Partial |
| 7 — English Toggle | Fully wired | ✅ Done |
| 8 — Distribution | PWA shell exists, GitHub Pages not set up | ⚠️ Partial |
| 9 — Memory Match + Voice Game | New modules, home redesign, theme/progress engine | ✅ Done |
| Memory Match v1.1 | Full redesign per PDD — Band A/B, 3D flip, mismatch window, auto-solve, peek hint, stars | ✅ Done (2026-03-12) |
| 13 — Immersive Worlds | Sky gradients, mascot/particle animations, glow/depth | ✅ Done (2026-03-10) |
| **10 — Child Profiles** | Per-profile localStorage, Profile Selector screen, welcome-back tiers | ✅ Done |
| 11 — Spaced Repetition | SM2-style scheduling, replaces 2× weighting | 🔲 Backlog |
| 12 — MediaPipe | Finger counting + gesture control | 🔲 Backlog |
| 14 — Full Offline | Service worker caching + GitHub Pages | 🔲 Backlog |

---

## Known Issues / Watch List
- Claude API not wired to Math + Engineering modules
- Claude API has minimal network error handling
- English toggle regression risk — watch on new builds
- Service worker registered but not caching assets
- Gamepad D-pad navigation incomplete
- input.js stuck-draw fix (v0.8.1) — watch for regression
- CONTENT-01 — Voice Game word lists deprecated; need 40+ words per age group
- AUDIO-02 — TTS Hebrew pronunciation quality varies by device/browser

---

## Backlog (Priority Order)
1. Child Profiles (Phase 10) ← **active**
2. CONTENT-01 — Voice Game: 40+ words per age group
3. Claude API — wire Math + Engineering + add error handling
4. Spaced repetition (SM2) — replace basic 2× weighting
5. MediaPipe Hands — finger counting + gesture control
6. GitHub Pages + full offline caching
7. Parent Dashboard — weekly summary, problem letters
8. Pre-recorded audio fallback (22 letters + numbers 1–10) → AUDIO-02
9. Rhyme Match, Number Bonds, Story Sequencing (activity backlog — PDD §10)

---

## Decisions Log
| Date | Decision | Reason |
|------|----------|--------|
| Mar 2026 | Retired SPEC_APP.md | Fully superseded by PDD + CLAUDE.md |
| Mar 2026 | Tracing in `letters.js`, not separate file | Keeps single-file portability |
| Mar 2026 | profiles.json sidecar (no server) | Offline-first, GDrive folder sync |
| Mar 2026 | Last-write-wins for profile sync | Simplest conflict resolution, no server |

---

## Session Log
| Date | Version | Milestone |
|------|---------|-----------|
| Mar 2026 | v0.1 | English prototype — 4 modules |
| Mar 2026 | v0.2 | Full Hebrew rewrite — RTL, he-IL, 22 letters |
| Mar 2026 | v0.3 | Letter tracing — canvas, pixel-mask, 3 modes |
| Mar 2026 | v0.4 | Shapes + Colors |
| Mar 2026 | v0.5 | Adaptive engine (basic) + localStorage |
| Mar 2026 | v0.6 | Gamepad input |
| Mar 2026 | v0.7 | Math + Engineering bonus modules |
| Mar 2026 | v0.8 | Claude API hints, 7 themes, onboarding, PWA, i18n |
| Mar 2026 | v0.8.1 | English toggle wired, i18n gaps fixed, input.js stuck-draw fixed |
| Mar 2026 | v0.9 | Memory Match + Voice Game. Home redesign, theme/progress engine, tracing improvements |
| 2026-03-10 | v0.9+ | Phase 13 Immersive Worlds. BUG-01, BUG-02, AUDIO-01 fixed. |
| 2026-03-11 | v0.9+ | All JS files recovered + in git. 7–8 age pill removed. Docs updated. App to standalone repo. |
| 2026-03-11 | v1.0 | Child Profiles (Phase 10) — profiles engine, selector screen, welcome-back tiers, data migration |
| 2026-03-12 | v1.0 | All 6 modules redesigned — age-tiered UX, emoji-first, no reading required |
| 2026-03-12 | v1.1 | Memory Match redesigned per PDD v1.1 — Band A/B, 3D flip, mismatch window, auto-solve, peek hint, star rating |
| TBD | v1.2 | Engineering → Nature rename/redesign |
| TBD | v1.3 | Phase 11 Spaced Repetition (SM2) |
| TBD | v1.3 | Full offline caching, GitHub Pages |

---
*Last updated: 2026-03-12*
