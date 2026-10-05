---
title: A new thread's draft belongs to its chat (no wrong seat woken), draft marks, any column gives slack, names, IME, dates
status: next
repos: [organizer]
branch: drafts-per-chat
updated: 2026-10-04
next: "review: drafts-per-chat, gate met (T1-T5, T0; both engines, classic and overlay; branch drafts-per-chat 8d50701..5e99cca)"
depends_on: [roles-ui]
boundary: ["frontend/src/lib/drafts.ts, lib/width.ts, lib/dates.ts and their tests", "frontend/src/components/Conversation.tsx and SlackView.tsx (drafts, names, times)", "frontend/src/components/DecisionsView.tsx (the To rule line's draft mark), Home.tsx (shareRoom's columns), Overview.tsx (the ruled date)", "frontend/src/components/RuleDecisionBox.tsx and CardDrawer.tsx (the IME guard only)", "not: Go, docs/design-system.md"]
spec: "docs/specs/leftovers-10.md (FR-1 to FR-6); Aglaea's calls feeb8d6"
gate: "docs/specs/leftovers-10.md Acceptance, rows T1 to T5 and T0"
ui_review: true
seat: dpc-build
---

## Goal
No draft wakes the wrong seat; the rest of drafts-and-slack's leftovers.

## Gate
- [x] T1-T5: see `docs/specs/leftovers-10.md`, Acceptance
- [x] T0: see `docs/specs/leftovers-10.md`, Acceptance

## Done
- 2026-10-04 dpc-build: FR-1 to FR-6 on drafts-per-chat (8d50701, b823f7f, bf6d355, 0a0445e, f0bb066, 29b8a50, 5e99cca), rebased on main; T1-T5 hit-tested at 1512×945, rail strip, classic and overlay, in headless Chromium and in Deltagos Review.app (T2 in WKWebView classic only); T0 green from a clean clone. Evidence and choices: .wt-notes/dpc-build/progress.md
- 2026-10-04 0084 ruled by pablo ("Ok"); sup39 launched by the FSE
- 2026-10-04 cut from leftovers-10 by the FSE

## Next

## Blockers

## Notes
- FR-3: home.css gives stage and id no width variable, so their slack reaches the signals only in proportion (fr); at 1512 strip the stage still keeps ~40 px and the id ~45 px while the goal is cut. A `--t-stage`/`--t-id` (styles, outside this card) would close it.
- FR-5: WKWebView sends the IME Escape after compositionend, keyCode 27 with key `´` (measured); the guard handles that and Chromium's isComposing order.
- The channel's new-thread form defaults its addressee to the first seat, not everyone (pre-existing).
