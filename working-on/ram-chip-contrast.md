---
title: "The critical chip at 4.5:1, plus rv-ui's small findings on the memory button and popover"
status: next
repos: [organizer]
branch: ram-chip-contrast
seat: rc-build
stage: one-window
updated: 2026-10-09
next: "sup49 runs it after ram-view merges (same task, 0103)"
depends_on: [ram-view]
boundary: ["frontend/src/styles/tokens.css (one token, --fg-on-tone #1a1523)", "the memory chip's and the float list's memory-line css, the memory button's selector", "the memory popover component (the was-critical line, aria-labels)", "the Agents landing's focus target (aria-label only)", "not: Go, native code, any other use of --tone"]
spec: "docs/ux/specs/ram-indicator.md Amendment 1 (229506e); docs/design-system.md contrast row"
gate: "this card's Gate section, rows C1 to C3"
ui_review: false
---

## Goal
rv-review found the critical chip's white text on `--tone` at 3.5:1 (c4eafe3).
Aglaea's ruling on her own design (229506e): text and glyph on the tone fill
take `--fg-on-tone` #1a1523, 5.2:1 on #d946ef; white never sits on the tone.

## Gate
- [ ] C1 the top bar's critical chip (fixture `--memory critical`, review build): text and ▣ glyph computed colour #1a1523 on #d946ef, contrast >= 4.5:1 (computed from the WKWebView's computed styles, logged)
- [ ] C2 the floating panel's memory line at critical: the same
- [ ] C4 rv-ui U1: the top bar's normal reading computes `--fg-subtle`, not `--fg-muted` (the selector outranks `button.ghost`)
- [ ] C5 rv-ui U3: the crew-seat landing focuses an element with an accessible name (aria-label naming the session)
- [ ] C6 `Was critical until HH:MM` shows only at normal after critical, never at high (vitest over the popover's state helper)
- [ ] C3 `cd frontend && npm test && npm run build`, `wails build` pass

## Notes
- 2026-10-09 the FSE: C4-C6 added from rv-ui's findings on ram-view (sup49's done report); same files, so this card, not a new one (0108).
