---
title: "One current mark per screen; the bar keeps one line with firebase at 1024"
status: done
repos: [organizer]
branch: lf18-current-mark
seat: cm-build
stage: one-window
updated: 2026-10-11
review: pass
next: "review: lf18-current-mark, gate met (K1-K3, X0), 5d358df"
depends_on: []
boundary: ["docs/specs/leftovers-18.md Boundary, lf18-current-mark"]
spec: "docs/specs/leftovers-18.md (FR-1 to FR-3; initiatives-view Amendment 3, I22-I24)"
gate: "docs/specs/leftovers-18.md Acceptance, rows K1, K2, K3 and X0"
ui_review: true
---

## Goal
lf17-top-bar's review U1-U4 (Aglaea, 237db96).

## Gate
docs/specs/leftovers-18.md, rows K1, K2, K3 and X0.

- [x] K1: /Users/pabloantipan/organizer/.wt-notes/cm-build/K1-K3-vitest.log; AX /Users/pabloantipan/organizer/.wt-notes/cm-build/ax-home.txt, ax-initiatives.txt, ax-usage.txt, ax-initiative-from-*.txt, ax-settings.txt, ax-help-over-*.txt (the bar's one current per screen; the header sub-tab's moves in lf18-charter-once, spec 46639bf)
- [x] K2: /Users/pabloantipan/organizer/.wt-notes/cm-build/K1-K3-vitest.log; /Users/pabloantipan/organizer/.wt-notes/cm-build/ax-initiative-from-rail.txt, K1-K2-initiative-1024.png
- [x] K3: /Users/pabloantipan/organizer/.wt-notes/cm-build/K1-K3-vitest.log; /Users/pabloantipan/organizer/.wt-notes/cm-build/k3-fresh-widths.json, k3-stale-widths.json, k3-stale-syncing-widths.json (offscreen WebKit, built css, 1024x640)
- [x] X0: /Users/pabloantipan/organizer/.wt-notes/cm-build/X0-make-test.log, X0-npm-build.log, X0-wails-build.log, X0-git-status.txt (empty), clean clone of 5d358df

## Done
- 2026-10-10 cm-build: placeOf (lib/place.ts), one current mark, crumb without slash, Needs me never on, firebase fold at compact plus the fifth fold (Rescan glyph); gate met at 5d358df (428f498, 5d358df).

## Notes
- K1 on an initiative: the AX tree today also shows the header sub-tab `Overview` with aria-current=page (InitiativeHeader.tsx:205, co-build's), a second mark beside the bar's title; it moves to aria-current="true" in lf18-charter-once (46639bf, H5). K1's AX check on an initiative reruns after both merge. Dumps as they stand: .wt-notes/cm-build/ax-initiative-from-*.txt.
- K3 cannot run on the review app with auth: firebase: the keychain service `cl.antipan.organizer` is shared with the real app, so it would read the real refresh token. Widths measured in an offscreen WKWebView with the built css instead (progress.md).
- Folds 1-4 measured 1066 px at 1024 with Needs me's badge and `Sync · stale`; the fifth fold (Rescan glyph) was added and accepted (24d052e). 9.5 px spare remains.
- Stale Sync is a ghost button, not primary: magenta on the accent fill is 1.4:1.
- `.needs-me.on` in shell.css is dead css now (outside this boundary).

## UI review
cm-ui, 2026-10-11. Checked on 5d358df (every row); K1 on an initiative also on a detached merge of 5d358df + 242dc0c (lf18-charter-once), not committed. `Deltagos Review` built from those trees, fixture home, 1024×640, rail open, auth off; AX reads and AXPress on its own pid, `screencapture -o -l`. Evidence: `.wt-notes/cm-ui/` (`ax-K1-*.txt`, `wkwebview-1024x640-K1-*.png`, `merge-K1-*`, `K1-K3-vitest.log`).

**Verdict: pass.** No severity 4 or 3.

| Row | How | Result |
|---|---|---|
| K1 | vitest 24/24; AX on Home, Initiatives, Usage, Settings, Help over Home/Settings/an initiative (5d358df); an initiative from Initiatives, rail and a Home row (merge) | one `aria-current="page"` on every screen; on 5d358df alone the initiative screens show two (the sub-tab), gone in the merge (sub-tab `true`); Initiatives `.parent`, no aria-current; Needs me never `.on` |
| K2 | same vitest; AX on the three initiative doors | crumb `init-*` with no slash, after the places (gap 15–16 px in AX frames); tabs at the same x on every screen; no crumb on Settings or Help |
| K3 | vitest of the signed-in bar (30-char email, 22-char id, compact); cm-build's WebKit widths `k3-*-widths.json` | met as recorded; not seen signed in (below) |

Findings (none fails the card):

- **U1 (2) Settings no longer names itself in words.** Who: a reader on Settings. Where: `wkwebview-1024x640-K1-settings.png`. Evidence: the crumb `Settings` is gone (as I23 asks), but A3 §1 relies on "their page heading names them" and Settings has no heading (first block is "Identity"); only the filled gear, whose name is AX-only, marks the screen. Proposal: a `Settings` page heading in SettingsView (outside this boundary).
- **U2 (2) The rail's hero says `← Home` while the bar says the initiative belongs to Initiatives.** Where: `wkwebview-1024x640-K1-initiative-from-initiatives.png`, rail top. Evidence: opened from Initiatives, the bar marks Initiatives the parent, the rail's back link goes Home. Proposal: the hero's back link follows `placeOf` (rail, outside this boundary).
- **U3 (2) The firebase folds apply across the whole compact class, not only when the bar lacks room.** Evidence: `fold = identity && widthClass === "compact"` (TopBar.tsx); A3 §2 says each fold "comes back when the bar has room". At the top of compact the email, the sync line and Rescan's word fold with hundreds of px free. Recorded in progress.md as a choice. Proposal: accept for now, or fold by measured width later.
- **U4 (1) Stale demotes Sync from primary to ghost.** Evidence: `stale ? "ghost" : "primary"`; reason given (magenta on the accent fill is 1.4:1). The moment Sync matters most it looks quietest. For aglaea.
- **U5 (1) Help lost `aria-pressed`.** Help opens and closes an overlay; it now carries `aria-current="page"` only (as A3's table says), while the design system's Disclosure state rule asks `aria-pressed`/`aria-expanded` on an opener. For aglaea.

Spec gaps (for the FSE): A3 §1 assumes Settings has a page heading (U1); the rail hero's back link is not covered by I22 (U2); A3 §2 "comes back when the bar has room" against the class-based fold (U3); `.needs-me.on` in shell.css is dead css (builder's note).

For aglaea: U4; U5; on an initiative the only accent underline is the sub-tab's (`true`) and the bar's title, the one `page`, has no visual mark beside the parent's grey underline: is the title's weight enough?

Not verified in WKWebView: the signed-in firebase bar (fold, account icon and its menu, `Sync · stale` in magenta, syncing) — the review app shares the keychain service `cl.antipan.organizer` with the real app, so it stays on auth off; judged from the vitest and cm-build's offscreen WebKit widths (stale 9.5 px spare). Help over Settings and over Home on the merge (checked on 5d358df only; the merge touches no top-bar file).

## Review
**Verdict: pass.** Unmet rows: none. Reviewer cm-review, 2026-10-11, commit 5d358df (K1's AX on an initiative also on a detached merge of 5d358df + 242dc0c, lf18-charter-once, not committed; on main as e4757ef). Evidence under `.wt-notes/cm-review/`.

- K1: vitest (`TopBar.test.tsx`, `place.test.ts`) pass in X0's run. AX tree of my own `Deltagos Review` (merge build, fixture, auth off, 1024×640, rail open, AXPress on its pid only) on Home, Initiatives, Usage, Settings, an initiative opened from Initiatives, from a Home row and from the rail, and Help over Home, Initiatives, Usage, Settings and an initiative: exactly one `current=page` on each (`ax-*.txt`). On an initiative it is the crumb `init-a`; Initiatives is `.place-tab.parent` with no aria-current; the sub-tab reads `current=true`. Needs me is `.needs-me` and never `.on` in any dump.
- K2: same vitest; AX on the three initiative doors: the crumb `init-a` follows the places (places right 1307, crumb left 1321), no `/` text in the bar; no crumb on Settings or any Help screen.
- K3: vitest of the signed-in bar (30-char email, 22-char id, compact) pass. The fixture can't sign in, so per I24 I re-rendered the bar's markup myself at 5d358df (fresh, stale, stale+syncing) and measured it in an offscreen WKWebView with the clean clone's built css at 1024×640 (`k3-*-widths.json`): scrollWidth = clientWidth = 1024, one line, Settings right 972, account 28×28 named `Account someone@example.com`, Sync named `Sync. 2 machines, remote 3d ago` (also its hover), `Sync · stale` with `stale` rgb(217,70,239).
- X0: fresh clone at 5d358df: `XDG_DATA_HOME=$(mktemp -d) make test` (497 vitest, Go ok), `npm run build`, `wails build` all pass; `git status --porcelain` empty (`X0b-*`). A first clone that also ran `npm install` was left with an untracked `frontend/package-lock.json` from that npm install (`X0-git-status.txt`). The row doesn't include `npm install`.
