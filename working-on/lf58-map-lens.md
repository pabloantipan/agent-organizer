---
title: "Roadmap gains Map: levels, status, drift and each node's grounding"
status: now
repos: [organizer]
branch: lf58-map-lens
seat: l58-lens
stage:
updated: 2026-11-02
next: "PR with talos-lab (code review pass l58-lens-rev2, UI review pass l58-lens-ui2 offscreen, 8974fd6; window pass owed at next unlock, the FSE checks the installed app after merge)"
review: pass
reviewer: l58-lens-rev2
cause: gate
depends_on: [lf58-map-read, lf58-map-render]
boundary: ["frontend/src/components/RoadmapView.tsx", "frontend/src/components/MapView.tsx", "frontend/src/components/MapPanel.tsx", "frontend/src/components/MapView.test.tsx", "frontend/src/styles/map.css", "internal/service/spec.go", "internal/service/spec_test.go", "testdata/fixture-map/"]
spec: "docs/specs/leftovers-58.md (FR-6 to FR-9)"
gate: "docs/specs/leftovers-58.md#Acceptance → gate"
ui_review: true
autonomy: unattended
---

## Goal
Pablo sees where the system is, what is planned and what has drifted, in the Roadmap he already reads.

## Gate
docs/specs/leftovers-58.md, rows M1-M7 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Fixture: `testdata/fixture-map/` from the contract's harbor files (specs 54cf10d or later), plus the three variants the spec names; lf58-map-read creates it, the others read it.
- Short-sample fallback: a state the fixture lacks is added as a variant beside it; never the real home, never skipped.
- Data shape across states: c4-map/1 as `contracts/c4-map/map.schema.json` gives it; Deltagos stores nothing but the diagram cache it already keeps.
- Tests: Go in `internal/service/map_test.go`; vitest beside the new lib and components (`cd frontend && npm test`).
- Design questions: Aglaea's map-and-roadmap Amendments 1 and 2 answer them; anything else to the FSE, which asks the judge-design subagent while Pablo is away.
- Evidence: test output and review-build shots under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- Map on Roadmap's switch (Stages, Map, Cards, Calendar): L2 first, trail Context › Containers › container, L3 from the panel, `No module map for this container.`; lens classes ruled/retiring/ungrounded with words under nodes; MapPanel as the map's text, Grounding lines each an action or its reason; empty and refused states (ca224b5, 77b1505, 1123beb, rebased on origin/main 1bc2d44).
- X0 pass at 1123beb from `.wt-notes/l58-lens/clean`; vitest 1611 passed.
- M1-M7 pass at 1440x900 and 1024x640 in WebKit (wails dev of the branch + offscreen harness), fail on base e968fc1 (no Map); shots `.wt-notes/l58-lens/shots/{1440x900,1024x640}-m{1..7}-*.png`, `1440x900-base-roadmap.png`; recipe and numbers in `.wt-notes/l58-lens/progress.md`.

- Round 2 (8974fd6, rebased on origin/main e4098ed): FR-10 ReadSpec reads exactly the map's level and curated pages, R3 `TestR3ReadSpecMapPages` (0360749); harbor fixture holds harbor-api (deploy/k8s.yaml, src/booking, src/pricing), harbor-web, harbor-ledger, home.sh git-inits them (a53cade); curated acts without `specs:`; U1 accent actions, U4 no idle scrollbar, U5 panel list in reading order (8974fd6).
- Round 2 X0 pass at 8974fd6 from `.wt-notes/l58-lens/x0-round2/clean` (vitest 1615 passed, porcelain empty).
- Round 2 M1-M7 pass at 1440x900 and 1024x640 in WebKit (wails dev of 8974fd6 + offscreen harness) on the committed fixture with only config's editor stub: every Grounding kind acts (`editor2-<size>.log`), U1/U4/U5 measured (`h2-<size>.txt`, `shots-r2/`). The review-build window pass was not run: the screen locked again before the build was up (`.wt-notes/l58-lens/progress.md`, Round 2, 4b).

## Notes
- The screen was locked all session (CGSSessionScreenIsLocked): AX of the review build's window and `screencapture -l` return nothing, so M1-M7 ran in WebKit via wails dev + the offscreen harness (earlier seats' method). The review-build window pass is written as a recipe in progress.md, not run.
- repo/deploy not on this machine: a line with no press and its reason (`not on this machine: <repo> is not in this initiative's repos` / `has no checkout here`).
- curated: pages open only when `docs/architecture` is under `specs:` (ReadSpec's allow-list); otherwise the line says why. A Go card could let ReadSpec read the map's pages.
- c4-map/1 has no members field, so merged nodes list none.

## Declared changes
- modified `frontend/src/components/RoadmapView.tsx`: the switch gains Map and mounts MapView
- added `frontend/src/components/MapView.tsx`: reads App.Map, levels, trail, lens classes, the words under nodes, the states
- added `frontend/src/components/MapPanel.tsx`: the map as text, node facts, Grounding lines and their actions (OpenInEditor, record in the drawer, spec reader)
- added `frontend/src/components/MapView.test.tsx`: headless states, levels, classes, lines, actions against mocked bindings
- added `frontend/src/styles/map.css`: status looks, panel, legend, the node ring (tier-2 tokens)
Risky:
- `MapTags`: a portal into MapFigure's frame, keyed on its class hooks (`.map-figure-frame`, `button.map-node` styles)
- `openRecord`: sets useSpecReader directly; focus return by its own subscription
- modified `internal/service/spec.go`: ReadSpec also reads the map's level and curated pages under docs/architecture/ (FR-10, `mapPages`)
- modified `internal/service/spec_test.go`: `TestR3ReadSpecMapPages`
- modified `testdata/fixture-map/home.sh`: git-inits each listed repo dir in the temp copy
- modified `testdata/fixture-map/harbor/working-on/initiative.yaml`: `repos: [harbor-api, harbor-web, harbor-ledger]`
- added `testdata/fixture-map/harbor/harbor-api/`, `harbor-web/`, `harbor-ledger/`: the dirs and deploy file harbor's grounding names
- modified `testdata/fixture-map/README.md`: the repos and home.sh's checkouts
- modified `frontend/src/components/MapPanel.tsx`: curated acts without the specs: gate (`GroundCtx.readable` removed)
- modified `frontend/src/components/MapView.tsx`: `inReadingOrder`, MapTags reports the buttons' order (U5)
- modified `frontend/src/styles/map.css`: `button.linkish.<class>` accent (U1), svg block and scroller padding (U4)
- modified `frontend/src/components/MapView.test.tsx`: fixture proof, curated FR-10, U1/U4/U5
Not changed, on purpose:
- `MapFigure.tsx`, `lib/mapSvg.ts`, `SpecReader.tsx`: outside the boundary; U5 reads the figure's button order from the DOM instead

## Review
Pass. Unmet: none. Reviewer l58-lens-rev2, 2026-11-02. X0 on 8974fd6 (base e4098ed), from a clean clone: `make test` **fresh** (test-lease printed no run id and did not reuse a run): Go ok, vitest 96 files / 1615 tests passed, exit 0. `pnpm run build`, `wails build` and `make review-build` were run fresh and each exited 0. `git status --porcelain` was empty, and `frontend/wailsjs/runtime` did not change. This review covers the code only: M1-M7 on screen are l58-lens-ui2's. The card's `cause: gate` is left from round 1.
Round 1 (l58-lens-rev, 1123beb): fail on M3 only, cause gate. The fix was FR-10 plus the fixture (Amendment 2).

change-check (`change-check organizer lf58-map-lens`, clean clone at 8974fd6; base read as origin/main 52cee5f):
```
16 files, 27 flags: outside boundary 0, outside footprint 0, undeclared 13, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 14, could not read 0, boundary unreadable 0
undeclared: internal/service/spec.go (Service.ReadSpec, mapDirRel, mapPages), spec_test.go, testdata/fixture-map/{README.md, harbor/harbor-api/README.md, harbor-api/deploy/k8s.yaml, harbor-api/src/booking/README.md, harbor-api/src/pricing/README.md, harbor-ledger/README.md, harbor-web/README.md, harbor/working-on/initiative.yaml, home.sh}
untested?: MapPanel.tsx inRepo, isRepoName, openRecord, errText, GroundRow, nodesLabel; MapView.tsx placeKey, samePlace, sourceAt, labelOf, sameIds, MapTags; spec.go mapDirRel, mapPages
```
- The 13 `undeclared` lines are all declared, but under `Risky:` instead of the change list. Each one is there as a `modified`/`added` bullet (spec.go, spec_test.go, home.sh, initiative.yaml, the three harbor repo dirs, README.md). change-check reads only the list above `Risky:` as declarations. Every one is inside Amendment 2's boundary (`internal/service/spec.go`, its test, `testdata/fixture-map/`), and outside boundary is 0. So these are explained, not findings.
- `untested?`: the private helpers run through exported functions the tests call. `mapPages`/`mapDirRel` run through `ReadSpec` (TestR3ReadSpecMapPages). `inRepo`/`isRepoName` run through `groundLine`. `openRecord` runs through `runGround` (the test "record opens the record in the drawer"). `GroundRow`/`nodesLabel` render inside `MapPanel`, and `placeKey`/`samePlace`/`sourceAt`/`labelOf` inside `MapBody`. `sameIds` and `MapTags` need layout, so only the UI review proves them (as in round 1).

Fails on main: the branch's new tests were run against e4098ed's code. `TestR3ReadSpecMapPages`: FAIL, 5 × `ReadSpec(fix, "docs/architecture/containers.md") … not a spec of this initiative fix; … want the page`. `MapView.test.tsx`: `Error: Cannot find module '/src/components/MapView'`, Test Files 1 failed.

R3 / FR-10 (my own inputs, a throwaway test in a second clone; output in `.wt-notes/l58-lens-rev2/r3-probe.txt`):
- These read: a level page, a curated page named `./ok.md`, a curated page named `sub/../ok2.md` (it resolves to `docs/architecture/ok2.md`), and `docs/architecture//c.md`.
- These are refused, and none is read: `working-on/initiative.yaml`; `docs/architecture/other.md` (a `repo` entry names it, no curated entry does); another initiative's page asked of this one, and this one's page asked of another (`b` → `c.md`); `../b/docs/architecture/bpage.md`; `docs/architecture/../../b/…`; `/etc/hosts`; `C.md` (the name differs only in case). Curated refs `/etc/hosts` and `../../working-on/initiative.yaml` add nothing. An unknown initiative is an error, not a read.
- So the allow rule opens nothing outside the map's named pages. The branch's own R3 test also covers a c4-map/2 map, `map.json` itself, a deploy-named file and a `#section`.

The committed fixture with no overlay (`eval "$(testdata/fixture-map/home.sh)"`, then a service scan with git; `.wt-notes/l58-lens-rev2/fixture-probe.txt`):
- harbor-api, harbor-web and harbor-ledger are all `missing=false`. `deploy/k8s.yaml`, `src/booking` and `src/pricing` exist.
- `ReadSpec(harbor, docs/architecture/{context,containers,modules}.md)` reads 845, 1651 and 613 bytes. The variants' `context.md` reads too.
- Vitest "the committed harbor fixture holds every repo dir and deploy file its grounding names" walks every harbor entry against the committed dirs: every editor path exists, and the kinds that act are exactly curated, deploy, record and repo. The one line with no action is `deploy fakedeploy qa harbor-ledger`, which reads "not a file: the deploy adapter's own reference". That is the contract's adapter reference, not a path, so FR-8's "opens the file" does not apply to it. M3 can now run every kind against the stub.

Met by the diff (FR-6 to FR-9, the vitest half of M1-M7, and U1, U4, U5):
- FR-6: the switch reads `stages, map, cards, calendar` (RoadmapView.tsx). L2 comes first. L3 opens from the panel, with the trail back. A container without modules says `No module map for this container.`
- FR-7: statuses are lens classes only, and no node moves (vitest). `ruled 0002` is a button that opens the record. `not grounded` is in the node's name and in the panel.
- FR-8: the panel ends with Grounding. repo opens the editor at the repo, deploy opens the file, record opens the drawer with focus returned to the line, curated opens the spec reader through ReadSpec (mocked bindings). A line that cannot act shows its reason and has no button.
- FR-9: the two empty-state lines are exact. A refusal is shown as given.
- U1: `button.linkish.<class>` (0-2-1) beats global.css:612 `button.linkish { color: inherit }`. No other `button.linkish` rule (shell.css, spec-reader.css) reaches `.map-panel`.
- U4: the svg is `display: block`, and the scroller is padded for the words under the bottom row.
- U5: `inReadingOrder` takes the order MapTags reports from the figure's buttons. Nodes that are not drawn come after, in map.json order.
- map.css: every `var(--…)` is a token in tokens.css (tier 2 or the scales). No oklch, color-mix, nesting, @layer or raw colour.

Merge check (Note, no failure): in the clone, `git merge --no-edit 8b5c8f9` merged with no conflict (6268d67). `make test` on it exited 0 (vitest 97 files / 1630 passed). `npx tsc --noEmit -p .` exited 0. The `openSpec(el, initiative, ref, exact, …)` signature that lf64 changed still fits the lens's call.

Notes (not failing; each says where it went):
- Note: ReadSpec follows symlinks. A map-named page that symlinks out of `docs/architecture/`, or that sits under a symlinked directory, is read (`link.md` → `SECRET`). This predates the card: on e4098ed a `specs:` file that symlinks out reads the same way (proved with the same probe). It is ReadSpec-wide, not a lens regression, and R3 does not name symlinks. → to the FSE via sup103 (a ReadSpec card: refuse a path whose EvalSymlinks leaves the root, or leaves its allowed directory).
- Note: if a curated entry names `map.json`, ReadSpec will read the index, since FR-10 allows "the pages its curated entries name". This is harmless: the file is inside `docs/architecture/`. → to the FSE via sup103, with the note above.
- Note: a `curated:` line always presses now. When its page cannot be read, the spec reader shows the reason instead of the line saying it. FR-8 is met; the UI reviewer can check the wording. → l58-lens-ui2.
- The card's Notes and the builder's "Found, not asked":
  - ReadSpec allow-list: resolved in this card (FR-10, 0360749).
  - Merged nodes / members: c4-map/1 has no such field. → to the FSE via sup103 (a contract field first).
  - A dotted stadium's rounded ends draw solid. This is MapFigure's side. → to the FSE via sup103 (lf58-map-render follow-up).
  - The locked screen, and the review-build window pass not run: → l58-lens-ui2's UI review.
  - repo/deploy not on this machine show their reason: behaviour as FR-8 wants; no action.
- Round 1's notes: the Go error prefix is kept as is, no action. MapTags having no vitest goes to l58-lens-ui2. Round-1 UI findings: U1, U4 and U5 are fixed here. U2, U3 and U6 → to the FSE via sup103 (for aglaea).
- Gate gap: R3 should name a symlink out of `docs/architecture/` as a refusal. As written it does not, and neither the code nor the test refuses one. → to the FSE via sup103.

## UI review
Pass (UI), round 2. Commit 8974fd6. Reviewer l58-lens-ui2, 2026-11-02. Round 1 (l58-lens-ui, 1123beb) passed; M3 was met only with an overlay, and it reported U1-U6.

**How it ran: offscreen, and why.** The screen was locked: `CGSSessionScreenIsLocked` was true at 03:06. So, as the FSE ruled for tonight, M1-M7 ran in offscreen WebKit and not in the review build's window. `make review-build` exited 0 in my detached worktree (`review-build.log`), but its window cannot be read by AX or `screencapture -l` while the screen is locked. Instead I ran `wails dev` of a clone at 8974fd6 (`dev/`, the real Go backend and bindings, port 34591) over the committed fixture, with no overlay and no `specs:` edit. The one addition was `editor:` in the config, a stub that appends its arguments to `$FIXTURE_TMP/editor.log` (`OpenInEditor` runs the editor with the path last, service.go:846; my `fixture.sh`). I drove it with the builder's offscreen harness, copied and rebuilt as `harness.swift`, and wrote my own steps (`steps.txt`, `js/probe.js`, `js/helpers.js`). The harness's window is never ordered in. Clicks are `element.click()` in its own page, keys are NSEvents sent to its own window, and the resize is its own `setContentSize`. Nothing was posted to the system, and auth was off. Output is in `h-<size>.txt` and `editor-<size>.log`, shots in `shots/`, all under `.wt-notes/l58-lens-ui2/`. **The window pass in the real review build is still owed at the next unlock** (the FSE checks it in the installed app after the merge).
Shared test run: **reused**, test-lease run `a3dacd1e-29908` of 8974fd6, from l58-lens-rev2 (`make test` exit 0, vitest 96 files, 1615 passed; `x0-make-test.log`).

| Row | 1440x900 | 1024x640 | Met |
|---|---|---|---|
| M1 | harbor, Roadmap → Map. The switch reads `Stages, Map, Cards, Calendar`. The figure is named `harbor base map, containers`. There are 6 `<button>`s named `<label>, <kind>, <status>`, each box equal to its node's shape (delta 0). Backgrounds: body rgb(26,21,35), stage and panel rgb(32,27,43), so no light panel. The svg has aria-hidden, 0 focusable elements, 0 script, 0 foreignObject and 0 on* attributes. `1440x900-m1-harbor-l2.png` | same; delta ≤ 0.1 px. `1024x640-m1-harbor-l2.png` | met |
| M2 | harbor-ruled. harbor-ledger: `map-ruled`, dash `6px, 4px`, rgb(185,163,255), with `ruled 0002` under it. The panel status `ruled 0002` is a button that opens `0002-ledger-is-its-own-container.md` in the drawer, and Esc returns focus to it. harbor-web: `map-retiring`, label `--fg-muted`, the word `retiring` under it and in the panel. `1440x900-m2-ruled-retiring.png`, `-m2-ledger-panel.png`, `-m2-record-0002-drawer.png`, `-m2-web-retiring-panel.png` | same, the same four shots | met |
| M3 | Every panel ends with Grounding. Each line acts, logged by the stub (9 lines at each size): `repo harbor-api@def7c12` → harbor-api; `deploy harbor-api/deploy/k8s.yaml` and the `key API_DB_HOST`, `CARD_GATEWAY_URL` and `MAIL_RELAY_URL` lines → the file; `repo harbor-ledger@0989d68` → harbor-ledger; `repo harbor-web@6c88101` → harbor-web; L3 `repo harbor-api/src/booking`, `…/pricing` → the dirs. `record 0001` opens the drawer (`1440x900-m3-record-drawer.png`). Clerk's `curated: context.md` opens `docs/architecture/context.md` read in the spec reader, with no `specs:` (`-m3-curated-drawer.png`). Esc returns focus to the line each time, and no `Not opened:` appeared. The one line that cannot act says why on screen: `deploy fakedeploy qa harbor-ledger`, "not a file: the deploy adapter's own reference". harbor-ruled's web says "not on this machine: harbor-web is not in this initiative's repos", because the variants list no repos. `-m3-harbor-api-panel.png`, `-m3-harbor-db-panel.png` | same: `editor-1024x640.log` has the same 9 lines, same shots | met, on the committed fixture |
| M4 | harbor-ungrounded. Mail relay: `map-ungrounded`, dotted amber, `not grounded` under it. Its name is `Mail relay, kind unknown, status unknown, not grounded`. The panel title reads `Mail relay, not grounded`, and Grounding reads `not grounded: no evidence names this node.` `1440x900-m4-ungrounded.png`, `-m4-ungrounded-panel.png` | same | met |
| M5 | harbor-v2: `Map not drawn: map.json is c4-map/2; this Deltagos reads c4-map/1`. harbor-nomap: `No base map yet.` / `Daedalus makes one with c4-map gen; the FSE cuts the card.` The only buttons are the switch's 4, so there is no action. `1440x900-m5-v2-refused.png`, `-m5-nomap-empty.png` | same | met |
| M6 | L2 → harbor-api's modules (L3, trail `Context › Containers › harbor-api`) → `Containers`: the 6 button boxes are identical. harbor-ledger shows `No module map for this container.` Resize 1440x900 → 1024x640 in place: the svg goes 688.5 → 662 px, the buttons follow (web 128.1x49 → 123.1x47.1, delta ≤ 0.1), and there is no overflow. Back to 1440x900: boxes identical to before. `1440x900-m6-l3-modules.png`, `-m6-resized-1024x640.png` | 1024 → 1440 → 1024, the same. `1024x640-m6-resized-1440x900.png` | met |
| M7 | Tab from the Map tab: Cards → Calendar → `Context` (trail) → `harbor-web, container, exists`, one stop into the set (tabindex 0 on one button, -1 on the rest). Right ×5 steps web → api → ledger → harbor_db → Card gateway → Mail relay and stops at the end. Then Left, Down and Up step through the same order. Tab leaves the set, and Shift+Tab returns to the last node. Ring `solid 2px rgb(192,171,254)` offset 2px, `:focus-visible` true, and the ring shows in the shot. `1440x900-m7-ring-first.png`, `-m7-ring-moved.png` | same sequence. `1024x640-m7-ring-first.png`, `-ring-moved.png` | met (keys sent to the harness's own window, not AX: see above) |

Round 1's U1, U4 and U5 are fixed:
- U1: `.map-ground-act`, `.map-ruled-link` and `.map-panel-node` compute to rgb(192,171,254) (`--accent-fg`) at both sizes.
- U4: `.map-scroll` overflow y/x is 0/0 at L2, at L3, at Context, on harbor-ruled with the words under the nodes, and after each resize.
- U5: the panel list equals the roving set at every level and in every variant (`web, harbor_api, ledger, harbor_db, card_gateway, mail_relay`).
U2, U3 and U6 are Aglaea's Amendment 3 (M8-M11), for a later card. I did not reopen them; the trail at Context is still empty.

Contrast on `--surface` #201b2b: the words under nodes (`--fg-muted`) 7.9:1, the ring and actions (violet-11) 8.4:1, the ruled stroke 7.8:1, the ungrounded amber 9.2:1. Status is never shown by colour alone: there is a word under the node, in its name, in the panel and in the legend. map.css uses tier-2 tokens.

Findings (none severity 4 or 3):
- **N1 (2) the map forgets where Pablo was when he switches mode.** What he cannot do: go Map → Cards → Map and land where he was. Where: Roadmap's switch. Evidence: on harbor at L3 with booking picked, Cards, then Map returns `Context › Containers` with nothing picked (`h-<size>.txt`, "place after Cards and back"). MapView unmounts with the mode. The drawer, by contrast, keeps place and focus. Severity 2: he has to walk back through the levels. Proposal: keep level and picked node in the store per initiative, as the base note's "Selection survives every switch" (`map-and-roadmap.md`, Moving between) asks. Neither FR-6 to FR-9 nor M1-M7 asks for this, so it is not a fail.
- **N2 (1) panel facts repeat their label when the value is unknown.** What he cannot do: read the fact at a glance; it says the label twice. Where: harbor-ungrounded's Mail relay panel (`1440x900-m4-ungrounded-panel.png`). Evidence: the facts read `kind  kind unknown` and `status  status unknown`. Proposal: the value reads `unknown`; the button name keeps `kind unknown`.
- **N3 (1) the picked outline and the focus ring look alike.** What he cannot do: tell, at a glance, the node he picked from the node focus is on. Where: `1440x900-m3-harbor-api-panel.png` (harbor-api is picked, Card gateway has focus). Evidence: both draw violet-11 at 2 px, the one difference being the ring's 2 px offset. Proposal: for aglaea (a fill or inset for picked, or the ring only).

Not verified:
- The review build's own window: the screen is locked (above).
- A curated page that cannot be read, which l58-lens-rev2 sent here to check the wording. The fixture has no such page, so the spec reader's reason was not reached.
- AXFocused and AXPress on my pid: the window cannot be read by AX while locked. Focus was moved by keys inside the offscreen harness instead.

**Incident, my process (for sup103 and the FSE).** In my first harness run (about 03:08-03:14), the env file I generated carried `ORGANIZER_CONFIG` but not `XDG_DATA_HOME` or `CLAUDE_CONFIG_DIR`. So my `wails dev` used the real `~/.local/share/organizer/`. What it did there:
- It read the real cache, so Pablo's initiatives showed in its rail.
- It wrote 3 diagram cache files of the harbor maps into `diagrams/`. I checked they were mine (harbor content, created 03:09-03:10) and removed them; `diagrams/` holds 0 files again.
- It appended wails dev lines (`Serving assets from frontend DevServer`, `runtime:ready`) to `organizer.log`. I left those.
- `state.json` afterwards: `local.machine` lodestar, `scanned_at` 02:35, no harbor, and the installed Deltagos last wrote it at 03:14:43. I found nothing of mine left in it, but I cannot prove that my process never wrote it in between.
I stopped it, regenerated the env file from the fixture's own exports, and guarded `start-dev.sh` and `run.sh` to refuse an `XDG_DATA_HOME` outside `$FIXTURE_TMP`. All the evidence above comes from the second, guarded run, after which the real `diagrams/` and `organizer.log` were unchanged. The bad env is kept as `env-round-a-broken.txt`. At the end I killed only my own `wails dev` tree by its saved pid (14651, with its children and grandchildren; `killed.txt`), removed `$FIXTURE_TMP`, and removed the worktree.

Spec gaps (for the FSE): whether a mode switch keeps the map's level and picked node (N1; the base note says yes, the M rows do not ask).
For aglaea: N1, N3.
