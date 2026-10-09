---
title: "The memory indicator: top-bar button and popover, the floating icon's ring and panel line, the notification at critical"
status: now
repos: [organizer]
branch: ram-view
seat: rv-build
stage: one-window
updated: 2026-10-09
next: "pablo: N1 after the merge: run make install (it replaces the app you are using), then the N1 steps in Notes; a fail there is a fix card (spec Amendment 5)"
review: pass
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
- sup49, 2026-10-09, per spec Amendment 5 (f268ced, the FSE under 0108): review re-marked **pass** with N1 pending Pablo in the installed app after the merge; rv-review's only unmet row was N1, rv-ui passed M1-M8 at 4a96d66.
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

## UI review
- Commit run: `4a96d66df2b78463ed2b5fd0e81b3732aece63ed`, `make review-build` (`Deltagos Review.app`, WKWebView) from a detached worktree. Fixture `--memory normal|high|critical|fail` walked live through `$FIXTURE_MEMORY_FILE`, and the real home at normal (kernel level 1, temporary `XDG_DATA_HOME`). Evidence is in `.wt-notes/rv-ui/`.
- Verdict: **pass**. No severity 4 or 3 is a departure from the specs. U2 is severity 3, but it is the design as written (for aglaea). N1 could not be checked: macOS refused the review bundle, so the row goes to Pablo in `/Applications/Deltagos.app`, as the spec says.
- Input: `seat-pointer` refused every point (exit 7, an invisible `Dock` layer-20 window over the whole screen, retried over ~15 min). Presses and keys went through `AXPress` and key events to the review app's own pid (guarded `ax`). Shots used `seat-pointer shot` and `screencapture -l`. Nothing here is a real pointer hit test.

| Row | How checked | Result |
|---|---|---|
| M1 | shot, pixel sample against the version line and Usage, AX name | met, except the colour (U1): `▣ 12 GB free`, no badge, named `Memory: normal, 12 GB free of 32 GB`. The text is `--fg-muted`, not `--fg-subtle`. Real home: `4 GB free of 24 GB` |
| M2 | shots, pixel sample, AX names | met: high is `3.1 GB free · high` in #d946ef. Critical is the filled chip `Memory critical · 1.2 GB free` with white text (U2) |
| M3 | AX dump of the popover, AXPress on `Agents ›`, AX focused element, shots | met: five sessions, `… 3 more` focuses the first row it reveals. Landings: init-a Agents with po_ana's row focused and selected; `probe-hefesto-odd` under "outside every initiative", focused. Real home: five sessions, 0.9–0.6 GB, biggest first; `pid 1636` lands on its unassigned row (U3, U4, U5). On the fixture every session reads `< 0.1 GB`, so the order was seen on the real home only |
| M4 | `screencapture -l` of the icon window, pixel rows; AX names; panel from another desktop (`seat-pointer space right`) | met: high ring 2 px, 2 px gap from the tile. Critical ring 3 px, alpha 255↔149 over eight frames at 0.2 s. Steady at 255 under `FLOAT_REDUCE_MOTION=1`; the code reads `accessibilityDisplayShouldReduceMotion` otherwise. Names `Deltagos, memory high/critical`, plain `Deltagos` at normal. Panel line and three sessions at high and critical, none at normal. A pick on the other desktop brought Deltagos full there (float.log `onActive=1`) with the row focused |
| M5 | fixture organizer.log | met: critical → normal → critical → high → critical within ~2 min gave one `memory warning posted` and one `notification posted` (`m5-log.txt`). Title `Memory critical on fixture`, body as §3 |
| M6 | AX list of the popover's and panel's buttons, code grep | met: only `Agents ›`, `… N more` and the panel's picks. The notification registers no actions |
| M7 | 1024×640 window, shots, AX right edge of every element | met: `3.1 GB` in magenta, `12 GB`, chip `critical · 1.2 GB`, word kept in the name. The popover fits inside the window. The only element past the window's right edge is Home's ellipsized goal text, at every level and popover state. `scrollWidth` was not read (no Web Inspector in the review build) |
| M8 | key events to the pid, AX focused element (`m8-keyboard.txt`) | met with Keyboard navigation off (the macOS default), so Option-Tab: Usage → memory button. Enter puts focus on the popover dialog, Option-Tab reaches the first `Agents ›`, Escape returns focus to the button. Plain Tab reaches no button (Q1) |
| N1 | fixture log | not checked: `authorization refused (UNErrorDomain 1: Notifications are not allowed for this application)`, `status 1 … off for Deltagos`. No banner was shown, so the click could not be tried → Pablo, installed app (Notes). The popover shows `Notifications are off for Deltagos in System Settings.` |

- States checked: failed (`▣ —`, name `memory unknown`, `Memory could not be read on this Mac.`). Normal. High (`high, for 1 min`). Critical (`critical, for 1 min`). Back to normal (the ring went within the same sample, the bar quiet, `Was critical until 15:57`; the line also shows at high within the 30 min). No agent sessions (`No agent sessions running. Other apps hold the memory.`). Reduce motion. 1024.

### Findings
- **U1 (2)**: (1) Normal does not read "as quiet as the version line": it reads like the bar's controls. (2) Top bar, normal (`wkwebview-1440x932-M1-normal-full.png`). (3) The brightest text pixel is (172,165,186), the same as Usage and Rescan; the version line is (138,130,150). `button.ghost { color: var(--muted) }` (0,1,1) outranks `.memory-btn { color: var(--fg-subtle) }` (0,1,0). (4) Severity 2. (5) Raise the selector, e.g. `button.memory-btn`.
- **U2 (3, for aglaea, as designed)**: (1) The critical chip's words fall under AA contrast. (2) Top-bar chip and panel line (`…-M2-critical-bar.png`, `wkwebview-360x480-M4-critical-panel.png`). (3) White on #d946ef is 3.46:1 at ~13 px; 4.5:1 is needed. (4) Severity 3, against the design (§1 "magenta fill, white text"), not the build. (5) Dark text #1a1523 on the magenta measures 5.17:1, or another fill. Aglaea's call.
- **U3 (2)**: (1) Landing on a crew seat puts focus on an element with no name, so a screen reader says nothing. (2) `Agents ›` on `organizer-fixture-probe-ana` and the panel pick (`…-M3-agents-landing.png`). (3) The focused element is `AXGroup` with no description; `.crew-seats > li[data-seat]` has no label. Non-crew rows are named (`probe-hefesto-odd, idle, 61% context`). (4) Severity 2 (Focus and names: the landing names what it lands on). (5) Give the seat row an `aria-label` (seat, state).
- **U4 (1)**: (1) The popover and the landing name one session two ways. (2) Real home, `pid 1636` → the row named `pabloantipan, working`. (3) AX names of the popover row and the focused row. (4) Severity 1; the row is selected, so it can be found. (5) Use one label, the Agents row's, in both places.
- **U5 (2, spec gap)**: (1) The biggest session on the real home reads `1030fdd4-7141-4c98-8d0e-7d808a27a052`, a resume id the lead cannot recognise. (2) `wkwebview-real-M3-normal-popover.png`. (3) §1 says "session name (else pid)"; the scan takes `--resume <uuid>` as the name. (4) Severity 2. (5) The FSE or aglaea decides what to show when the "name" is a resume UUID (the cwd's initiative and the pid, say).

### Spec gaps (for the FSE)
- What a session is called when its name is a resume UUID (U5).
- `Was critical until` also shows at high within the 30 min. The States table names only "back to normal". This looks right; say so.
- "No reading yet" cannot be reached: the first sample lands before the button is in the AX tree. Either drop the row or say it is checked by test.

### For aglaea
- U2: contrast of white on the magenta chip.
- Placement: the built bar has Rescan before Usage, so memory sits after Usage and before ? (rv-build's open question).

### Not verified
- N1 (macOS refusal, above) and the popover opening from a notification click.
- "No reading yet" in the app (unreachable; the builder's vitest covers it).
- A real pointer hit test of any control (`seat-pointer` refused throughout); the system Reduce motion setting itself (the env override and the code path were checked); `scrollWidth === clientWidth` read from the DOM.

### Found, not asked
- `seat-pointer`'s exit-7 hint (`open -a "Deltagos Review"`) launched another seat's review bundle (`.wt-notes/dst-build/instr/…`, pid 31230) with no fixture env, against the real home, for ~30 s, until I killed it. It wrote REC lines to the real `~/.local/share/organizer/organizer.log` and may have saved `state.json` (mtime 15:53). With several review bundles on disk, `open -a` by name is unsafe; raise by pid (`System Events … unix id`). For Hephaistos (seat-pointer).
- Reviewer: rv-ui, 2026-10-09.
