---
title: "The memory indicator: top-bar button and popover, the floating icon's ring and panel line, the notification at critical"
status: now
repos: [organizer]
branch: ram-view
seat: rv-build
stage: one-window
updated: 2026-10-09
next: "review: ram-view, gate met but N1 (macOS refuses the ad-hoc review bundle; Pablo checks it in /Applications/Deltagos.app after merge, steps in Notes), 4a96d66"
depends_on: [ram-sample]
boundary: ["new top-bar memory component, popover and css (tier-2 tokens)", "the store (popover state, Agents › focus), AgentsView.tsx (focus a row by agent id only)", "floaticon_darwin.m/.h/.go (ring, panel line), new notify_darwin.m/.go and notify_other.go, app.go (post on warn, the click)", "scripts/fixture-home.sh (the fake reading)", "not: Go under internal/, the Deltagos mark (0102)"]
spec: "docs/specs/ram-indicator.md (FR-5 to FR-7; docs/ux/specs/ram-indicator.md (6d84a12))"
gate: "docs/specs/ram-indicator.md Acceptance (ram-view), rows M1 to M8, N1 and X0"
ui_review: true
---

## Goal
0101: the reading `ram-sample` puts on the feed, drawn as Aglaea designed it,
on the top bar and on the floating icon, with one warning at critical.

## Gate
docs/specs/ram-indicator.md, M1 to M8, N1 and X0. Evidence under `.wt-notes/rv-build/` (progress.md says how to drive each state).
- [x] M1 `wkwebview-1440x932-M1-normal-bar.png`, real home `wkwebview-real-M1-normal-bar.png`
- [x] M2 `wkwebview-1440x932-M2-high-bar.png`, `…-M2-critical-bar.png`, names in `ax-critical-open.txt`
- [x] M3 `…-M3-*-popover.png`, `…-M3-agents-landing.png`, `…-M3-unassigned-landing.png`, `wkwebview-real-M3-normal-popover.png`
- [x] M4 `wkwebview-icon-M4-high-ring.png`, `…-critical-ring-a/b.png` (breathing), `…-critical-reduce-motion-a/b.png` (steady), `wkwebview-360x480-M4-high-panel.png`, `…-M4-panel-pick-agents-row.png`; icon named `Deltagos, memory high|critical`
- [x] M5 one `memory warning posted` per run across three entries into critical (fixture organizer.log); the post itself shows only where notifications are allowed (N1)
- [x] M6 the popover's controls are Agents › and … N more; panel rows are picks; the notification has no action
- [x] M7 `wkwebview-1024x640-M7-*`
- [x] M8 `m8-keyboard.txt` (Keyboard navigation off, Option-Tab)
- [ ] N1 refused for the review bundle (`UNErrorDomain 1: Notifications are not allowed for this application`, status denied) → Pablo, installed app (Notes)
- [x] X0 `x0-*.txt`, clean clone at 76bf9d6 (rebased to 4a96d66, main moved by cards and specs only)

## Done
- 2026-10-09, rv-build: branch ram-view at 4a96d66 on main 2f1f0cc: top-bar button and popover, Agents › landing (unassigned group included), the icon's ring and name, the panel's memory line, the warning posted Go-side on warn (click → full here + popover), the fake reading through SetMemoryReader and fixture `--memory`. Gate met but N1.

## Notes
- 2026-10-09 sup49: boundary widened by `FloatList.tsx` (the floating panel is this component, not native): placing the memory line and its pick through FloatPick only; no activation change.
- 2026-10-09 sup49: boundary widened by `App.tsx`'s screen switch only, to mount AgentsView with no initiative selected so an unassigned session's `Agents ›` lands on the unassigned group, as the design says.
- 2026-10-09 sup49: boundary widened by one setter, `Service.SetMemoryReader` in `internal/service/memory.go` and its test, so the fake reading reaches the service from `app.go` (ram-sample was asked for an injectable reader and left it unexported).
- 2026-10-09: supervisor sup49 (window 7535), spawned by the FSE.
- N1 for Pablo, after merge and his own install: quit Deltagos, run `ORGANIZER_MEMORY_FAKE=critical /Applications/Deltagos.app/Contents/MacOS/organizer &` in a terminal, answer Allow to the notifications prompt (once; if the banner did not show, quit and run it again: the first sample warns). The banner reads `Memory critical on lodestar` and `1.2 GB free. Biggest: …` with three sessions. Go to another desktop, click it (or its entry in Notification Center): Deltagos full on that desktop with the memory popover open. Quit it and open Deltagos as usual.
- rv-build: seat-pointer refused every point this session (a Notification Center prompt, then an invisible Dock layer-20 window over the whole screen); the review app was driven through the Accessibility API on its own pid (`.wt-notes/rv-build/ax.swift`).
- rv-build: once, by mistake, the review bundle ran ~3 s against the real home (`open -a` after a kill): two lines in the real organizer.log, perhaps one state.json save.
- rv-build, open for the designer: the bar as built has Rescan before Usage, so memory sits after Usage, not before Rescan (asked sup49, unanswered).
