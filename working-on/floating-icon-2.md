---
title: Floating icon, second pass - double-click opens the full app at once; the icon grows on big screens
status: now
repos: [organizer]
branch: floating-icon-2
seat: fi2-build
updated: 2026-10-05
next: "pablo: the 15-s F7 click-outside take (fse is asking); then review: floating-icon-2 at 2efe4ba"
depends_on: [floating-icon]
boundary: ["floaticon_darwin.m, floaticon_darwin.h, floaticon_darwin.go, floaticon_other.go (click count, size by display, scaled layers)", "frontend/src/components/FloatList.tsx (grow into the full window on the second click; the last view on double-click)", "frontend/src/stores/board.store.ts (the last view to restore, read only if already kept there)", "scripts/floating-icon-by-hand.sh (the new steps)", "not: other Go packages, wails.json, build/darwin templates, docs/design-system.md"]
spec: "docs/ux/specs/floating-icon.md, Amendment 1 (Aglaea, 2c07195); ruling 0091"
gate: "docs/ux/specs/floating-icon.md Acceptance F10-F12, plus the rows below"
ui_review: true
---

## Goal
Pablo's two asks after using the icon (0091): a double-click opens the full
app straight away, and the icon is big enough on a big screen.

## Gate
- [x] F10-F12: see `docs/ux/specs/floating-icon.md`, Acceptance (Amendment 1); the double-click and the drag across displays performed by Pablo with the by-hand script, recorded. F10, F11 in takes 1-3; F12 by 0092: 56 pt radius 14 read back on the laptop's display (take 3), 88 pt radius 22 on the 3440 (takes 1-2), the screen-change path in code (seat, SIGUSR1); the drag across displays is untested, the two displays were never on together
- [ ] F4, F5, F7, F8 rerun by Pablo in the same take (the click handling changes). F4, F8 by Pablo in takes 1-3; F5 picked by pointer (row clicks) by Pablo, `pay` + Enter by the seat (AX-opened list); F7 Escape twice by the seat only, and F7's click outside the list was NOT done by pointer in any take
- [ ] N3 again: `make install` and a Finder launch, after both reviews pass and with Pablo's Deltagos quit first (ask him through the FSE)
- [x] `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `wails build`

## Done
- 2026-10-05 fi2-build: 0092 recorded; F10-F12 and the tests ticked at 2efe4ba; F7's click outside waits for a 15-s take (sup44), then review (86224b8, 2efe4ba; based on 56c532d, main has moved only by cards and 0092 since). F12 met by 0092 (each size on its real display plus the screen-change path; the drag across displays untested, as N4 was). F7's click outside the list was not done by pointer in any take; Escape twice and `pay` + Enter are the seat's, on an AX-opened list. Clean-clone `make test` and `wails build` green. N3 is the supervisor's after both reviews
- 2026-10-05 fi2-build, after take 3: the keyboard parts of F5 and F7 by the seat at 2efe4ba (list opened by the accessibility press, not a pointer; `float-keys.log`, `keys-sheet.png`): `da` filtered, Escape cleared it, Escape closed the list (`dismiss: returning`, icon stays); `pay` left partner-payouts alone, Enter opened it full here (`full (pick) read back: full window … key=1`). The click outside (F7) remains a pointer row and was not done in any take
- 2026-10-05 Pablo's take 3 at 2efe4ba (`by-hand-20261005-231322.{log,mov}`; recording t = log epoch − 1791252808, ±1 s; frames in `take3/`). A second display did NOT appear: the app started with one display online, the laptop's (`place: … icon 56 pt radius 14 (panel frame read back {{1392, 79}, {136, 136}}) … of display 1552-41057-4251086178 (visible width 1512)`), and the one `screens changed (1 displays)` at +2.2 was that display alone (visible frame 3 pt taller, size stayed 56); every drop was on 1552-…; the 3440 was offline the whole take and back online, with the laptop off, by 23:16. So F12's 56 on the laptop is now read back on the real display (with 88 radius 22 on the 3440 in takes 1-2), but the drag across displays was not possible. On the laptop: list front 2-14 ms after the mouse-up; three double-clicks full (`full (double-click) read back: full window, frame={{35, 95}, {1440, 853}} … key=1`); drags past 4 px (4.2-7.2), drops clamped to the inset (tile y 100 at the Dock edge, top 908 under the menu bar), the list following each; picks were row clicks with the search empty (billing-api t 65.6, partner-payouts t 74.5, Roadmap kept); Compact twice; no Escape, no click outside
- 2026-10-05 Pablo's take 2 at 2efe4ba (`by-hand-20261005-230418.{log,mov}`; recording t = log epoch − 1791252264, ±1 s; frames in `take2/`, `take2/views.png`). F10 met: double-clicks opened full at the view last shown, read back `full (double-click) read back: full window, frame={{709, 362}, {1440, 932}} … key=1`, and on the frames billing-api · Roadmap (t 73, 81), field-app · Roadmap (t 104.5) and ops-dashboard · Decisions (t 115), each the initiative and sub-view he had left; Home with Home last shown in take 1 (t 17.9, 48.5). F11 met: list front 2-15 ms after the mouse-up on 13 clicks; second presses 44-90 ms after the first, full read back 0.3 s later. F4 met (with take 1): drags start past 4 px (4.3-27.4); menu-bar drops read back tile y 1258, Dock drops y 111; the list followed 10 drags; the icon kept its place across desktop switches (space-change at +95.0 to +99.2, next click at the same tile). F8 met: Compact at +45.5, +84.1, +89.2, +125.7, a list from the compacted icon each time. Not reached again: F12 across displays (one display online: the built-in one is off with the lid closed, `system_profiler` at 23:08 shows only the S34CG50; no `screens changed` line), F5 by typing (every pick was a row click: Home t 37.5, auth-gateway, field-app), F7 (no Escape, no click outside; every dismiss was a click on the icon)
- 2026-10-05 Pablo's take 1 at 2efe4ba (`.wt-notes/fi2-build/by-hand-20261005-224954.{log,mov}`; recording t = log epoch − 1791251400, ±1 s; frames in `take1/`, views cropped in `take1/views.png`). Nothing failed; several rows were not done. F11: single clicks put the list front 6-16 ms after the mouse-up (`list front: isVisible=1 … ms after the click`, 7 clicks, e.g. log 1791251487.2 13 ms); 8 double-clicks with the second press 61-107 ms after the first click (interval 500 ms, `clickCount 2`), each read back `full window, frame={{817, 374}, {1440, 932}} … key=1` 0.3 s later; a click that closed the open list then a click 486 ms later also went full (by design). F10: full at the last view on every double-click: Home (rec t 17.9, 48.5) and billing-api · Roadmap after he chose it (t 69.0, 76.0, 103.0; `take1/views.png`); Home chosen after an initiative was not done. F12: 88 pt radius 22 on the 3440, read back (`size (place): icon 88 pt, radius 22 … panel frame read back {{3265, 64}, {214, 214}}`); no second display in the take (no `screens changed`, every drop on 19501-29451-810432322), so 56 on the laptop and the resize across displays are not shown. F4: drags start past 4 px (4.0-11.4 px); drops into the menu bar read back tile y 1258 (top 1346, under the menu bar, the panel's margin kept under it as in floating-icon's take 4); drops on the Dock read back tile y 111 (8 above it); the list followed on every drag with it open (9 drops); the same spot on another desktop was not shown. F5: pick by a click on field-app from the compacted icon (t 113-114, Roadmap kept); `pay` typed not done. F7: not done (no Escape, no click outside; one dismiss by the icon at log +107.5). F8: Compact at log +112.6 (`compact: state=compacted`), list from the compacted icon at +117.4
- 2026-10-05 fi2-build: built on `floating-icon-2` (86224b8 click count, last view, size by display; 2efe4ba by-hand script; rebased on 56c532d). Seat's proof in `.wt-notes/fi2-build/` (progress.md): F12 88 pt radius 22 read back from the panel (`float-screens.log`, panel 214 = 88 + 2×63), 56/72 proportions measured on window shots, the screen-change path via SIGUSR1; F11 list front 12 ms after an AX press (`float-ax.log`; the AX press is a single click, not a double-click); F10's action via SIGUSR2 (not the click count): full at Home and at partner-payouts (`float-double.log`, `dbl-*-crop.png`). Clean-clone `make test`, `wails build`, 0 CGS/SLS green. `board.store.ts` untouched: the list never changes the view. Waiting: Pablo's take (double-click, drag across displays, F4 F5 F7 F8)
- 2026-10-05 sup44 launched by the FSE
- 2026-10-05 cut by the FSE from 0091 and Aglaea's Amendment 1

## Next

## Blockers

## Notes
- 0092 (pablo): F12 accepted with the drag across displays untested; noted like floating-icon's N4.
- fi2-build, take 2: Pablo often clicks once (list), then double-clicks to expand. The double's first click closes the open list (a click on the icon closes it, §3) and its second brings it back and grows it, so the list blinks out for about 100 ms before the growth (log +77.6-78.2, +101.6-102.3, +119.4-120.0). It ends right; a design call for aglaea whether a click on the icon with the list open should wait the double-click interval before closing (it would lag the close by up to 0.5 s).
- fi2-build: the growth to full takes about 0.36 s on the 3440 display (`setFrame:display:animate:`, the call a pick already used), not the spec's 200 ms. 1920 exactly is 56. A screen change with the list open re-places the icon, not the list.
Aglaea's calls: a single click opens the list at once (within 100 ms); a
second click within the double-click interval grows it into the full window
(200 ms, as choosing a row) at the view last shown, and this desktop becomes
Deltagos' own. Size by the display's visible width: 56 pt up to 1920, 72 up
to 2999, 88 from 3000; radius a quarter of it; bars, breathing and shadow
scale by size/56; resizes when dragged across displays.
