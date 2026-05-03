# CLAUDE.md — Learn With Me

> Instructions for Codi (Claude Code).
> Global rules in `~/.claude/CLAUDE.md` still apply.

## Project

**Name:** Learn With Me
**Stack:** Vanilla HTML5/CSS3/JS (no framework) · Hebrew-first · Offline-capable PWA
**Claude API model (in-app):** `claude-sonnet-4-20250514` — Codi may wire it directly; key via `.env`, never committed
**Phase status + backlog:** see PLANNING.md

---

## AI Roles

| Role                        | Who                                    |
|-----------------------------|----------------------------------------|
| Building the app            | Codi (Claude Code)                     |
| Intelligence inside the app | Claude API (`claude-sonnet-4-20250514`) |

---

## Testing Standards

- Test every completed phase before moving on
- Report: what passed, what failed, what was fixed — plain language
- Before handing off, read every source file and check for:
  - Hardcoded strings that should use `Lang.t()` — breaks English toggle
  - Missing `data-i18n` attributes on HTML elements
  - Module state not resetting on `init()` — leftover data from previous session
  - Timer/async leaks — `setTimeout` refs not cleared on cleanup
  - i18n keys missing or mismatched between `he.js` / `en.js`
  - Input edge cases — mouseup/touchcancel outside element, stuck state

---

## Conventions

- Vanilla JS only — no frameworks, no build step
- No `console.log` in production
- All Hebrew UI strings in `i18n/he.js` — never hardcoded in HTML/JS
- RTL always — `dir="rtl"` on `<html>`, never override
- Touch targets: 96×96px minimum
- Tracing logic lives in `modules/letters.js` — not a separate file

---

## Locked Decisions

1. **No framework.** Vanilla JS — portability as single HTML file.
2. **Hebrew first.** English is a toggle, never default.
3. **Offline first.** Every core feature works without internet. Claude API is enhancement only.
4. **No user accounts.** localStorage only.
5. **No timers on exercises.**
6. **Claude API on retry/stuck only.** Never on every question.
7. **Tracing in `letters.js`** — not a separate module.
8. **No negative feedback text.** Always gentle redirect — "wrong" does not exist in the UI.
9. **All sensor data on-device.** No camera/mic data leaves the browser.
10. **Socratic AI rule.** AI never gives the direct answer — system reveals after 2 fails, not the AI voice.

---

## Out of Scope

- User accounts / cloud sync
- Multiplayer / network features
- In-app purchases, ads, analytics, telemetry
- Server-side processing of any kind
- Microsoft ecosystem tools

---

*See PLANNING.md for phase status, backlog, known issues, and session log.*
*Last updated: 2026-05-03*
