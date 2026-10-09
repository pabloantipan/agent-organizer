---
title: "The memory indicator: top-bar button and popover, the floating icon's ring and panel line, the notification at critical"
status: now
repos: [organizer]
branch: ram-view
seat: rv-build
stage: one-window
updated: 2026-10-09
next: "N1: the notification's title, body and click from another desktop, unverified (macOS refused the ad-hoc review bundle); Pablo checks it in /Applications/Deltagos.app (steps in Notes), and the FSE says whether that may follow the merge, since the row wants it before"
review: fail
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
N1 — pablo, after merge and make install: quit Deltagos; in a terminal run `ORGANIZER_MEMORY_FAKE=critical /Applications/Deltagos.app/Contents/MacOS/organizer &` (forces critical; the first sample warns); answer Allow to the "Deltagos" notifications prompt (once; if no banner came, quit it and run the line again); look for the banner `Memory critical on lodestar`, body `<free> GB free. Biggest: <three sessions with GB>.`, and the top bar's magenta `Memory critical · 1.2 GB free` chip; switch to another desktop (ctrl →), click the banner or its entry in Notification Center: Deltagos comes full onto that desktop with the memory popover open; quit it and open Deltagos as usual. Review build refused: `requestAuthorization` → `UNErrorDomain 1: Notifications are not allowed for this application`, authorizationStatus denied.
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
- Design question for aglaea: §1 places memory "after Usage and before Rescan", but the bar as built has Rescan before Usage; per sup49 it sits right after Usage, before ?, and Rescan did not move (reordering the bar is not this card).
- Reviewer, the unassigned landing: in the fixture (`eval "$(scripts/fixture-home.sh --memory high)"`), open the memory popover, `… 3 more`, then `Agents ›` on `probe-hefesto-odd` (no initiative): crumbs `Home / Agents`, every initiative's Agents, the row focused under "outside every initiative" (`.wt-notes/rv-build/wkwebview-1440x932-M3-unassigned-landing.png`).

## Review
- Verdict: **fail**, on N1 alone (rv-review, code and checks; the WKWebView rows are rv-ui's).
- Commit reviewed: `4a96d66df2b78463ed2b5fd0e81b3732aece63ed` (branch ram-view).
- Unmet: N1. It was never seen: `requestAuthorization` was refused for the review bundle (`UNErrorDomain 1`, status denied, in the fixture's organizer.log). The row's fallback (Pablo, installed app) is a check after the merge, but the gate wants it before. The FSE decides which.
- X0 met: clean clone at 4a96d66 under `test-lease`: `XDG_DATA_HOME=$(mktemp -d) make test` (go all ok, vitest 362/362), `npm install && npm test && npm run build`, `wails build` all exit 0. `scripts/fixture-home.sh --memory` documented; a bad level exits 2.
- Code checks met: the warning is posted Go-side from `Service.OnMemoryWarn` (`app.go` `memoryWarn`) through `UNUserNotificationCenter`, with no osascript. The fake is read only in `memfake.go`/`app.go` and goes through `SetMemoryReader`, so the service's warn rule runs. A scratch test over the fake (critical, high, critical, normal, then critical at 5, 20 and 45 min) warned exactly twice. Nothing stops, kills or signals a session (M6). The button has no count. High and critical use `--tone`/magenta-9, never red. Tier-2 tokens only, with no oklch, color-mix, nesting or @layer. The ring is a layer under the tile, 2 pt outside it. `floaticon_darwin.m` changes no activation path: `FloatIconBringFull` calls the existing `bringList`/`doubleClicked`, and the other edits are additions plus `applyRing` in the reduce-motion observer. Every changed path is inside the boundary and its widenings (the root `memfake.go` and its test included).
- Findings, outside the gate:
  - White on `--tone` (the critical chip, 13 px) measures about 3.5:1, under 4.5. This is as designed, but `docs/design-system.md` has no row for it. For aglaea.
  - `ORGANIZER_MEMORY_FAKE` works in every build, the installed app included. The spec says "fixture build path". The N1 steps rely on it, so the spec should say so.
  - `agentTarget` finds a non-crew row by its index in a list filtered the way `AgentsView` filters it. If that list changes, focus lands on the wrong row with no error, and no test checks the DOM side.
  - `NotifyState` reads the settings asynchronously, so the popover's "Notifications are off" line can be one open behind a change in System Settings.
  - The `memory warning posted` lines in the builder's fixture log come from the earlier PATH-stand-in build, not 4a96d66. I re-checked M5's logic myself (above).
  - The placement question to aglaea stays open: Rescan comes before Usage in the bar as built.
- Reviewer: rv-review, 2026-10-09.
