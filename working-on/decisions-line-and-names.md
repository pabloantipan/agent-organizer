---
title: The Ruled line never widens the board (no sideways swing), names and the wake count, Needs me's five landings
status: now
repos: [organizer]
branch: decisions-line-and-names
seat: dln-build
updated: 2026-10-06
next: "pablo: X1 trackpad swipe by hand (steps in Notes, via the FSE thread), then sup45 merges; both reviews passed at 1ec2867"
depends_on: [decisions-still]
boundary: ["frontend/src/components/DecisionsView.tsx, frontend/src/styles/global.css (.dec-meta and the Ruled line only), decisions.css", "frontend/src/components/Conversation.tsx and SlackView.tsx (divider name, wake count)", "the roles drawer component (session state word)", "frontend/src/components/Home.tsx, frontend/src/styles/home.css (Needs me's focus and landing; stage and id tracks)", "frontend/src/lib/width.ts, lib/queue.ts (first-five helper only) and lib/ tests", "not: Go, docs/design-system.md"]
spec: "docs/specs/leftovers-12.md (FR-1 to FR-7); Aglaea cb20fcf, 2203d7d"
gate: "docs/specs/leftovers-12.md Acceptance, rows X1 to X5 and X0"
ui_review: true
review: pass
---

## Goal
The Decisions board never swings sideways; the rest of the last two waves' leftovers.

## Gate
- [ ] X1-X5: see `docs/specs/leftovers-12.md`, Acceptance (met in both engines except X1's trackpad row, by hand for Pablo, and X4 row 12 not verified in WKWebView; table in `.wt-notes/dln-build/progress.md`)
- [x] X0: see `docs/specs/leftovers-12.md`, Acceptance

## Done
- 2026-10-06 dln-build: c381bb6 (FR-1), 638a84b (FR-2, FR-6), 87ee2d3 (FR-3), afbc690 (FR-4), f23a58c (FR-5), 1ec2867 (FR-7) on decisions-line-and-names, rebased on main 91fe1e0; X0 green from a clean checkout
- 2026-10-06 sup45: seat dln-build, worktree .wt/decisions-line-and-names from main ce1675d
- 2026-10-06 sup45 launched by the FSE
- 2026-10-05 0087 ruled by pablo ("ok", 821b13d)
- 2026-10-05 cut from leftovers-12 by the FSE

## Next

## Blockers

## Review
- Verdict: pass (code review; X1's trackpad swipe stays Pablo's by hand, the WKWebView visuals dln-ui's).
- Commit reviewed: 1ec28674c5df5c10f333150035af2dfa0e460274 (branch decisions-line-and-names).
- Unmet gate items: none. X0 run here from a clean clone (make test with a fresh XDG_DATA_HOME, npm install/test/build, wails build: all exit 0, 276 vitest). X1 from the code (`.dec-chosen` flex 1000 0 0, min-width 0, max-width max-content, ellipsis, `title` and `lineName` whole; only bounded parts keep flex-shrink 0) and dln-build's measurements in both engines. X4 row 12: the landing path (`pastFirst` → showAll → Shell focuses the verb) is engine-independent, measured in Chromium and, past the five via 0074, in WKWebView.
- Not in the gate: FR-4's word map is a third copy (AgentList, Crew, RoleDrawer `ROW_WORD`); the boundary left no shared place for one function. `.wakes.hot` (global.css:560) is now dead CSS. The wake count's magenta is an inline style, and the chosen/meta join relies on `margin-left: -10px` matching the line's 10 px gap.
- Reviewer: dln-review, 2026-10-06.

## UI review
- Commit run: **1ec2867** (1ec28674c5df), every row; the branch did not move. Detached worktree .wt/dln-ui (removed), fixture from that clean checkout (/private/tmp/organizer-fixture.vrNat6) with the organizer's 92 records copied into init-nopeople for X1. Evidence in `.wt-notes/dln-ui/` (drivers `drive.cjs`, `s-x*.cjs`, `wk-x1.sh`, `wkax`; logs `x*-chromium.log`, `wk-*.log`).
- Verdict: **pass**. No finding is severity 4 or 3. X1–X5 hold in both engines, except what is under Not verified.
- Chromium: headless Chrome for Testing 1234 on `wails dev -devserver localhost:34585`, viewport = content (1512×913 for the 1512×945 window, 1024×609 for 1024×640), overlay = hidden bars, classic = 15 px bars. WKWebView: `Deltagos Review.app` from `make review-build` at 1ec2867 with the fixture's env, `-AppleShowScrollBars WhenScrolling` (overlay) / `Always` (classic), window sized through AX, AXPress or HID clicks refused outside its frame or when it is not frontmost (none refused), hit = `AXUIElementCopyElementAtPosition` at the centre, shots `screencapture -l`. No wheel or swipe was sent; sideways was tried with the keyboard only.

| Row | Chromium | WKWebView |
|---|---|---|
| X1 | **pass** at 1512 and 1024, rail full and strip, overlay and classic (8 configs, measurement + AX query + hit): `.board-wrap`, `.decisions`, `.dec-ruled`, html scrollWidth = clientWidth, no overflowing ancestor; 0082's chosen `text-overflow: ellipsis`, sw 880 > cw (666/651/870/855/178/163/382/367), `title` whole; line's AX button name holds the whole option; number, title (268/268), status, meta (`· by pablo · 4 Oct · after 4 days`) whole; each part's centre hits itself; 10 deltaX wheels and `scrollLeft = 200` leave scrollLeft 0, scrollX 0 (`x1-chromium.log`) | **pass** at the same 8 configs (screenshot + AX frame + hit + keyboard): 0082's line inside the board (1422/1218/730/934 wide overlay, 1408/1204/716/920 classic), centre hits the line, AX name whole; shots show `…` before `· by pablo`; hover shows the whole option (`webkit-1512x945-X1-hover-chosen-strip-overlay.png`); no horizontal bar in classic; 15 × → with the line focused changes no pixel, 3 × ↓ (control) moves the board (`wk-x1-*.log`). Trackpad: not verified (Pablo's) |
| X2 | **pass**, 1512 strip, overlay and classic, click and Enter: mail line → focus `div.tl-divider`, AX group "Thread [for aglaea] does the roles row fold at 1024 the way you meant, open, 1 of 12", targeted, in view, hits itself; drawer shows `idle`, AX "probe-hefesto in init-a: idle, 42% context; open its Agents", landed row "probe-hefesto, idle, 42% context"; rule box select AX combobox "Recipient", hits itself | **pass**, 1512 strip classic (all three) and overlay (divider): AX focus AXGroup with the same name, centre hits its subject; drawer AXButton "… idle, 42% context …", `idle` drawn (`crop-webkit-1512x945-X2-drawer-strip-classic.png`), landed AXGroup "probe-hefesto, idle, 42% context"; rule box AXPopUpButton "Recipient", hits itself (box opened, closed with Escape, never submitted) |
| X3 | **pass**, 1512 strip, overlay and classic (computed style + geometry + hit): one seat rgb(181,175,195) `--fg-muted`; everyone (wakes 3) rgb(217,70,239) `--tone`; never `--blocked` #ff4d63; 8.0 px left of Start (channel form) and of Send (reply), same line, both hit; `PostToCell` stubbed, 0 calls | **pass**, 1512 strip classic (both forms) and overlay (channel), pixels + AX: one seat ink (172,165,186), all ink (213,51,232); text ends 1143, Start/Send at 1150; `wakes` and Start/Send hit themselves; nothing pressed |
| X4 | **pass**, 1512 strip/full and 1024 strip, overlay and classic, plus Enter: 14 rows; Show the other 9 → focus "Rule init-many 0074" (row 6), in view, hit; Show only → 5, focus on the toggle; row 12 `seat:init-a/dev_bruno` via the store's `openNeedsMe` → 14 rows, focus "Agents init-a dev_bruno", in view, hit, toggle "Show only the oldest 5" | **pass** for Show the other 9 (focus "Rule init-many 0074", hit) and back (focus on the toggle), classic and overlay; a landing past five through the UI, init-many Overview's FSE item 0076 (row 10): 14 rows, focus "Rule init-many 0076", in view, hit, toggle "Show only the oldest 5". Row 12 itself: not verified |
| X5 | **pass**, 1512 strip, overlay and classic: `--t-id` 124 (widest 121 + border), `--t-stage` 147 = widest 147 while the goal is cut; init-a's five lozenges at natural width (142.73, 64.50, 44.91, 41.11, 72.17), no maxWidth, inside the cell, each hits itself, no hover title needed | **pass**, 1512 strip, overlay and classic: crops of init-a's row show the five lozenges and `2 · The joins · now` whole, the stage text ends 3 px before the gap; every lozenge's text and the stage hit themselves (`wk-x5-classic.log`, `wk-overlay.log`) |

Findings at 1ec2867, none against the gate:
- **dln-U1 (2)**: On a line whose title is long too, the chosen option vanishes with no ellipsis and nothing to hover, and the line reads `· by pablo · 5 Oct` with a stray leading dot. Where: Decisions › Ruled at 1024×640 rail full: 13 of 89 ruled lines (0092, 0085, 0077, 0075, 0074, 0072, 0069, 0057, 0038, 0026, 0012 at 0 px; 0067 and 0024 at 7–9 px, a quote mark only); at 1024 strip 0074 only; none at 1512 (`crop-webkit-1024x640-X1-0085-full-overlay.png`, `x1z-chromium.log`). Evidence: `.dec-chosen` is `flex: 1000 0 0` with no floor, so it reaches 0 before the title is cut; the line's `title` is "show the record". Severity 2: FR-1's order holds and the accessible name keeps the option, but "with an ellipsis and its whole text in the hover" does not hold on those lines; the ruling is one click away. Proposal: a floor for the chosen option (a few characters, `“acc…`) before the title gives way further, and no separator when nothing precedes it.
- **dln-U2 (1)**: The Needs me rule box's wake count sits after the recipient select, 645 px from Rule (x 457 against 1136 at 1512). FR-3 names Start and Send only; the design system says "beside the commit".

Design questions, for aglaea:
- dln-U1's floor: how much of the chosen option stays before the title gives way (or is the option dropped and named in the line's hover)?
- dln-U2: does "beside the commit" include the rule box's Rule?

Spec gaps, for the FSE:
- G1: X4's row 12 is a seat row (`seat:init-a/dev_bruno`) that no link in the UI lands on (only Overview's gates and the FSE panel call `openNeedsMe`, for decisions and threads), so the row is checkable only through the store. Name a reachable row past five (row 10, 0076, from init-many's FSE panel) or accept the store call.
- G2: X1 gates only 0082's line; no row covers a line whose title is long as well (dln-U1).

Not verified:
- X1's trackpad swipe: Pablo's, by hand; steps in Notes (dln-build, 2026-10-06). No result from him on the card at review time.
- X4's landing on row 12 in WKWebView: no UI path (G1); row 10 was checked instead.
- X2, X3, X5 at 1024×640 and with the rail full in WKWebView (1512 strip only there; X1 and X4 covered 1024).
- Keyboard paths under macOS Keyboard navigation in WKWebView; Start, Send and Rule never pressed in either engine.
- Chromium logs the known `Cannot read properties of null (reading 'nodes')` on load in wails dev (dpc-ui); nothing visible failed.
- Reviewer: dln-ui, 2026-10-06.
- X1 by measurement (Pablo's ruling, FSE thread 01M47SHFRTRVE8P4FXRB4070V5), dln-x1, 2026-10-06, at 1ec2867: **met**. WKWebView (AppleWebKit/605.1.15, macOS 26.1): a review build of 1ec2867 made in the detached worktree `.wt/dln-x1` with `wails build -clean -debug -devtools` then `scripts/review-build.sh` (same code; `-debug` only so Wails leaves WebKit's context menu on), fixture init-nopeople with the organizer's 95 records, Decisions › Ruled › Show the other 85, 0082 scrolled in view (AXScrollToVisible), window sized through AX. Read in the app's own Web Inspector (opened by AX `AXShowMenu` on the web area → Inspect Element, detached to its own window so the page keeps its size): a script pasted into its console, result returned by `copy()` → `pbpaste` (`measure.log`, `m.js`, `measure.sh`). Inner size 1512×913 and 1024×608; no element with `overflow-x` auto/scroll has sw > cw in any config; 0082's `.dec-chosen` is cut with `text-overflow: ellipsis`.
  - 1512×945, rail full (250): overlay `.board-wrap` 1262/1262, document 1512/1512; classic `.board-wrap` 1248/1248 (offsetWidth 1262, 14 px bar), document 1512/1512. **met**.
  - 1024×640, rail strip (46): overlay `.board-wrap` 978/978, document 1024/1024; classic `.board-wrap` 964/964 (offsetWidth 978), document 1024/1024. **met**. scrollLeft 0 and scrollX 0 in all four.
  - Synthetic trackpad scroll (CGEvent scroll-wheel, continuous, scrollPhase began/changed×8/ended then momentum begin/continue×6/end, ±40 px horizontal, HID tap with the pointer over 0082's line, refused unless inside the window, topmost there and frontmost): 1512 full overlay and classic, 1024 strip overlay: horizontal changes no content pixel (overlay: only the vertical overlay scroller flashes at the right edge, `crop-overlay-hswipe-scroller.png`; classic: no pixel); vertical control moves the board (bbox 270,193–1509,945 at 1512; 66,187–1021,640 at 1024) (`swipe.log`, `sw-*.png`). Earlier runs (posted to the pid) diffed Web Inspector shots by mistake and are void. A faster ±150 run was refused: Chrome came over the window mid-run. Evidence `.wt-notes/dln-x1/`; build and worktree removed.

## Notes
- 2026-10-06 dln-build, by hand for Pablo (X1, never passed by the seat): `make review-build` in .wt/decisions-line-and-names; fresh shell there, `eval "$(scripts/fixture-home.sh)"`, copy `working-on/decisions/*.md` into `$FIXTURE_HOME/init-nopeople/working-on/decisions/`; run `build/bin/Deltagos Review.app/Contents/MacOS/organizer`; window 1512×945, then 1024×640; init-nopeople › Decisions › Ruled › "Show the other 82"; 0082 in view; two-finger swipe left and right over the list, slow then fast. Pass: nothing moves or rubber-bands sideways, 0082's chosen ends in "…" and is whole on hover. Optionally the same on the real home's organizer Decisions.
- 2026-10-06 dln-build: X4 row 12 is `seat:init-a/dev_bruno`; no link in the UI calls openNeedsMe for a seat row (only Overview gates and the FSE panel, decisions and threads), so in WKWebView only a landing on row 6 (FSE link 0074) was checked; Chromium called the store.
- 2026-10-06 dln-build: dpc-U1's cut was OneLine's natural width taking scrollWidth (rounded up, 142.73 → 143): five roundings capped a lozenge that fit; fixed in Home.tsx with FR-7. The wake count's red came from `global.css:560` (`.wakes.hot`, outside the boundary); the class is no longer used on it and the rule is left in place.
- 2026-10-06 dln-build, X1 cause (measured before any change, Chromium, fixture init-nopeople with the organizer's 92 records copied in, Ruled open, 0082 in view): `frontend/src/styles/global.css:756` `.dec-meta { flex-shrink: 0; white-space: nowrap }` holds the chosen option in the meta span (`DecisionsView.tsx:310-315`), so 0082's meta is 1043 px and never shrinks; the line, `.dec`, `.dec-ruled` and `.decisions` overflow and `.board-wrap` (`overflow-x: auto`) scrolls: at 1512×913 rail full, overlay, board-wrap sw 1337 / cw 1262; at 1024×609 strip, sw 1337 / cw 978. A deltaX wheel scrolled board-wrap to scrollLeft 75 (1512) and 359 (1024); the document did not move. Logs `.wt-notes/dln-build/x1-before-*.log`.
