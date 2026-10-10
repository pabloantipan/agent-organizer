---
title: "The top bar reads by kind and stays one line at 1024"
status: done
repos: [organizer]
branch: lf17-top-bar
seat: tb-build
stage: one-window
updated: 2026-10-10
next: "review: lf17-top-bar, gate met (T1, T2, X0), 26025ca"
depends_on: []
boundary: ["TopBar.tsx", "MemoryButton.tsx (short form only)", "the top bar rules in styles/shell.css", "their tests"]
spec: "docs/specs/leftovers-17.md (FR-3 to FR-5; docs/ux/specs/initiatives-view.md Amendment 2, I19-I21)"
gate: "docs/specs/leftovers-17.md Acceptance, rows T1, T2 and X0"
ui_review: true
review: pass
---

## Goal
Pablo, 2026-10-10: "We need to review [the top bar] button disposition".

## Gate
docs/specs/leftovers-17.md, rows T1, T2 and X0.

- [x] T1: vitest of TopBar over each screen and both auth modes; AX tree of the review process — `.wt-notes/tb-build/T1-vitest.log`, `ax-1440.txt`, `ax-1024.txt`
- [x] T2: review build on the fixture at 1024×640 with the rail open: window shot and the bar's AX frame — `.wt-notes/tb-build/T2-1024x640-rail-open.png`, `ax-1024.txt` (1024x45 vs 1440x45)
- [x] X0: `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && npm run build`, `wails build` — `.wt-notes/tb-build/x0-clean-make-test.log`, `x0-npm-build.log`, `x0-wails-build.log`

## Done
- 2026-10-10 tb-build: top bar by kind (Places nav, crumb, Mac, work, app), sync line firebase-only, version in the brand's hover, crumb id clamped; c73a9a4, 26025ca on lf17-top-bar; choices in `.wt-notes/tb-build/progress.md`

## Notes
- WebKit's AX exposes neither `aria-current` nor a span's `title`; both halves are proven in vitest.
- `styles/usage.css` `.usage-btn` is now unused (outside this card's boundary).

## Review
**Verdict: pass.** tb-review, 2026-10-10, on 26025ca (the pinned commit; the branch did not move). Evidence under `.wt-notes/tb-review/`.

- T1: vitest `TopBar.test.tsx` rerun at 26025ca, 13 pass: order by kind (firebase, on an initiative), one place `aria-current` per screen, crumb only inside a place, `/ Help`, Compact·Help·Settings, no rule, no sync line, Sync or `auth off` note with auth off on every screen. AX tree of my own review build (fixture, auth off, own pid): `ax-start.txt` (Home, 1440), `ax-1024.txt` (init-a), `ax-1024-settings.txt`. In each: Deltagos · group `Places` (Home `.on`, Initiatives, Usage) · `/ init-a` or `/ Settings` (none on Home) · memory · Needs me, Rescan · Compact, Help, Settings. No sync line.
- T2: own build at 1024×640 with the rail open (250 wide) on init-a. `.topbar` is 1024×45, the same as 1440×45. Every control sits on y 165-170 and Settings ends at x 2008, inside the 2024 edge. Memory is short (`7.4 GB`, 85 against 112 px). Window shot `T2-1024x640-rail-open.png` (`screencapture -o -l`): one line, no version inline. The version in the brand's hover is read from the diff (`title` is `Deltagos <version>` at every width, no `brand-version` span). WebKit's AX does not expose it, and the vitest does not prove it either: effects do not run, so `version` is empty there.
- X0: fresh clone at 26025ca. `XDG_DATA_HOME=$(mktemp -d) make test` passes (go 16 ok, vitest 34 files / 473). `npm install && npm run build` and `wails build` each exit 0. Logs `x0-*.log`. The clone was removed afterwards.

Unmet rows: none.

## UI review
tb-ui, 2026-10-10, on 26025ca (the pinned commit; the branch did not move). Review build `Deltagos Review.app` on the fixture (auth off), WKWebView, own pid; shots and AX under `.wt-notes/tb-ui/`.

**Verdict: pass.** No severity 4 or 3 against FR-3 to FR-5.

- T1 (FR-3, FR-4): AX tree at 1440 and 1024 on Home, an initiative, Initiatives, Usage, Settings, Settings with Help: brand · `Places` (Home, Initiatives, Usage; the current one `.on` and underlined) · crumb (`/ init-a`, `/ Settings`, `/ Settings / Help`; none on the three places) · memory · Needs me, Rescan · Compact, Help, Settings. No sync line with auth off. vitest `TopBar.test.tsx` rerun: 13 pass (`T1-vitest.log`). Shots `wk-1440x900-T1-home.png`, `wk-1024x640-T1-*.png`.
- T2 (FR-5): at 1024×640 with the rail open, `.topbar` is 1024×45, the same height as 1440×45, on Home and on init-a. The memory button is short (`7.2 GB`, 85 px against 112 px). Free space before memory: 232 px on Home and ~165 px with `/ init-a`. A 22ch id is about 172 px wide, so the clamp fits. Shots `wk-1024x640-T2-home-rail-open.png`, `wk-1024x640-T2-initiative-rail-open.png`.

Findings (none fails the card):
- **U1 (2), for aglaea.** *Cannot*: tell at a glance which place a crumb belongs to. *Where*: `wk-1024x640-T1-Settings.png`, `wk-1024x640-T2-initiative-rail-open.png`. *Evidence*: the crumb comes right after `Usage`, so the bar reads `Usage / Settings` and `Usage / init-a`. Only Home's underline says the crumb is under Home. *Severity*: 2. *Proposal*: put the crumb under its place tab, or name the place in the crumb (`Home / init-a`).
- **U2 (2), for aglaea, spec gap.** *Cannot*: a screen reader on Settings hears `Home, current page`. *Where*: `ax-1024-Settings.txt`. *Evidence*: Settings and an initiative map to place Home (`placeOf`), so Home has `aria-current="page"`, and on Settings the gear is `.on` too. *Severity*: 2. *Proposal*: decide which place, if any, owns Settings and an initiative. Settings could mark no tab.
- **U3 (2), for aglaea.** *Cannot*: see one "you are here" mark on Home. *Where*: `wk-1440x900-T1-home.png`. *Evidence*: the Home tab is underlined and Needs me is filled `.on` (as before this card). That makes two current marks side by side. *Severity*: 2. *Proposal*: Needs me drops `.on`, since the tab now says where you are.
- **U4 (2), spec gap, estimated, not reached.** *Cannot*: with `auth: firebase` signed in at 1024, the bar would likely not fit on one line. *Where*: the 1024 AX frames. *Evidence*: Sync (~75 px) plus the account email (~200 px) plus gaps is about 290 px. That is more than the 232 px free on Home. `.tb-work` and `.tb-app` do not shrink, so Help and Settings would be pushed past the right edge. Pablo runs auth off (no `auth` in his config). *Severity*: 2. *Proposal*: FR-5 should name the auth mode it covers; with firebase, fold the email into an icon.

Not this card: at 1024 the initiative header's pills and the FSE column on Overview, and Help's body, run past the right edge (`wk-1024x640-T2-initiative-rail-open.png`, `wk-1024x640-T1-settings-help.png`).

Not verified in WKWebView:
- The version in the brand's hover and `aria-current`: WebKit's AX exposes neither. Both are covered by vitest only.
- The focus ring on the place tabs: no keyboard input is allowed (0108).
- Every firebase state (sync line, Sync, account, the compact fold): the review app would read the real keychain.
- An id over 22ch clamping: the fixture has none (judged from the CSS).
- `scanning…` in place of Rescan.
