---
title: "The critical chip at 4.5:1, plus rv-ui's small findings on the memory button and popover"
status: next
repos: [organizer]
branch: ram-chip-contrast
seat: rc-build
stage: one-window
updated: 2026-10-09
next: "review: ram-chip-contrast, gate met (C1-C6), 6e661b5"
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
- [x] C1 the top bar's critical chip (fixture `--memory critical`, review build): text and ▣ glyph computed colour #1a1523 on #d946ef, contrast >= 4.5:1 (computed from the WKWebView's computed styles, logged) — text, stroke and color #1a1523 on #d946ef, 5.17:1: `.wt-notes/rc-build/c1-c2.txt`
- [x] C2 the floating panel's memory line at critical: the same — #1a1523 on #d946ef, 5.17:1: `.wt-notes/rc-build/c1-c2.txt`
- [x] C4 rv-ui U1: the top bar's normal reading computes `--fg-subtle`, not `--fg-muted` (the selector outranks `button.ghost`) — rgb(149,142,162) = --fg-subtle, was --muted before: `.wt-notes/rc-build/c4-c5.txt`
- [x] C5 rv-ui U3: the crew-seat landing focuses an element with an accessible name (aria-label naming the session) — focused li, AX name "organizer-fixture-probe-bruno (dev_bruno, idle)": `.wt-notes/rc-build/c4-c5.txt`
- [x] C6 `Was critical until HH:MM` shows only at normal after critical, never at high (vitest over the popover's state helper) — `wasCriticalLine` null at high, asserted in memory.test.ts
- [x] C3 `cd frontend && npm test && npm run build`, `wails build` pass — vitest 362/362, build and wails build exit 0 on the C4-C6 tree: `.wt-notes/rc-build/c3-*.log`

## Notes
- 2026-10-09 the FSE: C4-C6 added from rv-ui's findings on ram-view (sup49's done report); same files, so this card, not a new one (0108).

## Done
- 2026-10-09 rc-build: `--fg-on-tone` #1a1523 in tokens.css; chip text, ▣ glyph and the float panel's critical line use it (56e64a0, branch ram-chip-contrast, unmerged, on main). Measured 5.17:1 in the debug review build's Web Inspector; the panel line opened by dispatching `floaticon:list` in the webview.
- 2026-10-09 rc-build: C4-C6 (6e661b5): memory button rules at `.memory button.memory-btn` (also keeps the critical fill on hover, which `button.ghost:hover` took); crew seat rows carry `aria-label` "<session> (<seat>, <state>)"; was-critical null at high. Branch rebased on main b566d55, code 75a93d5 + 6e661b5.
