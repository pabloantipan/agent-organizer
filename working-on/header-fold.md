---
title: The initiative header folds to one bar, and its chip, strip and tiles lead somewhere
status: now
repos: [organizer]
branch: main
updated: 2026-09-30
next: "G8: a reader who never saw the app could not say what the waiting chip leads to (\"a guess\", .wt-notes/hdr-fold-reader/answers.md); the chip says \"3 waiting\" and never what waits; pablo: FR-2 fixes those words, so change the chip or the gate"
review: fail
depends_on: ["responsive-home"]
boundary: ["frontend/src/components/InitiativeHeader.tsx", "frontend/src/components/RoadmapView.tsx and Roadmap.tsx (the expanded stage row only)", "frontend/src/components/SlackView.tsx and Conversation.tsx (the title row, the timeline height, Answer focus)", "frontend/src/components/AgentsView.tsx and DecisionsView.tsx (the title row only)", "frontend/src/stores/board.store.ts (fold state; landings fold; stageFocus)", "frontend/src/styles/shell.css and header CSS", "frontend/src/lib/ and its tests", "amendment 1 (FR-9 only): internal/scan/git.go, the initiative assembly in internal/scan (one call), internal/model/model.go (Initiative.charter_modified), frontend/wailsjs (generated), a scan test"]
spec: "docs/specs/initiative-header.md (FR-1 to FR-6, FR-8, FR-9); the design: docs/ux/specs/initiative-header.md (Aglaea, 6c93a49)"
gate: "docs/specs/initiative-header.md Acceptance, rows G1, G2, G3, G4, G5, G6, G7, G8, G10, G11; the Gate section below"
stage: twenty-at-a-glance
seat: hdr-fold3
ui_review: true
---

## Goal
FR-1 to FR-6, FR-8, FR-9 of `docs/specs/initiative-header.md`, from Aglaea's header design and Pablo's header-review-2.

## Gate
- [x] G1: see `docs/specs/initiative-header.md`, Acceptance
- [x] G2: see `docs/specs/initiative-header.md`, Acceptance
- [x] G3: see `docs/specs/initiative-header.md`, Acceptance
- [x] G4: see `docs/specs/initiative-header.md`, Acceptance
- [x] G5: see `docs/specs/initiative-header.md`, Acceptance
- [x] G6: see `docs/specs/initiative-header.md`, Acceptance
- [x] G7: see `docs/specs/initiative-header.md`, Acceptance
- [ ] G8: see `docs/specs/initiative-header.md`, Acceptance
- [x] G10: see `docs/specs/initiative-header.md`, Acceptance
- [x] G11: see `docs/specs/initiative-header.md`, Acceptance

## Done
- 2026-09-29 cut from initiative-header by the FSE
- 2026-09-30 hdr-fold built on branch header-fold (5ad068c 0791802 3e3dc85 82c8291 6808257 ee1cbc3 704090f b0e64cc 0037a01 a510609), rebased on main d48735f. Evidence in .wt-notes/hdr-fold/ (driver hdr.cjs, a private headless Chromium on the fixture unless said)
  - G1: .wt-notes/hdr-fold/g1-answer-1024x640.png, g1.log: activeElement div.tl-divider "w-queued: which repo does the queued card start in … asks you · fse" inView=true; asked message 274–377 inside the timeline 222–497; composer 497–622 on screen; timeline 275 of 519 px (0.53)
  - G2: .wt-notes/hdr-fold/g2-<1024|1512|3440>-<sub>.png (18 shots), g2.log: barPlusTabs 76 px on all 18, h1InSubview [] on all, idCut false
  - G3: .wt-notes/hdr-fold/g3-1…3 and g3.log: Details open on init-a, open after switching to init-b, open after reload; goal and measure "more", out of scope "more" when long (g3-10-scope-clamped.png); g3-6…8, g3-open.log: Open card on init-a's needs-me worklist with Details open → headerFolded true, row 557→291 px, focus on the row's Open card after the card back closes
  - G4: .wt-notes/hdr-fold/g4-2-from-work.png, g4-3-from-decisions.png, g4-5-again-on-decisions.png, g4.log: Decisions, expanded init-a/0002, focus button.dec-line "0002 …", "Waiting on a ruling" on screen, each time (again after collapsing it on Decisions); g4-4-no-waiting.png: init-c chipInBar false
  - G5: .wt-notes/hdr-fold/g5-organizer-real-home.png (real home, read only; pressed only the Home row, tabs and Details), g5.log: label "Roadmap · building · stage 5 of 6", building counted 1, 6 tiles, 0 phase chips; g5-init-a-fixture.png: runs discovery:1 building:3, 1 divider, each word once, 0 chips
  - G6: .wt-notes/hdr-fold/g6-2-click.png, g6-3-enter.png, g6.log: Roadmap, Stages, headerFolded true, expanded "Stage 2: The joins, now", focus button.srm-toggle "Stage 2: The joins, now. Hide its detail", detail with outcome, exits, gates 0001 ruled / 0002 waiting / 0099 no record, 5 cards, appetite; the same by click and by Enter
  - G7: .wt-notes/hdr-fold/g7-details-open-3440.png, g7.log: columns 571px 571px; clamped lines 88, 95, 88, 40 characters (canvas-measured); folded goal line 96
  - G8 (not proved here, for a reader): .wt-notes/hdr-fold/g8-folded-1512.png, .wt-notes/hdr-fold/g8-strip-1512.png
  - G10 (open): .wt-notes/hdr-fold/g10-clean.png, g10.log: source "from working-on/initiative.yaml Open in editor"; g10-modified.png: with the file " M" in the temp copy, no "edited, not committed" mark, since amendment 1's Go fact is not built (Notes)
  - G11: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0 (13 Go packages ok, vitest 51 passed; g11-make-test.log); `cd frontend && npm run build` exit 0 (g11-npm-build.log); G18 grep over main...header-fold: 0 lines (g11-g18.log); rerun after the rebase
- 2026-09-30 hdr-fold2 built FR-9's mark on branch header-fold (247d660 feat(scan) charter_modified with TestCharterModified: clean, modified, not a repo; 3b5d418 generated models.ts; 7440ee1 the mark in Details), from hdr-fold's patch unchanged; rebased on main 761427d (the earlier commits are now 2e991c1 … 029f2f7)
  - G10: .wt-notes/hdr-fold/g10b-clean.png, g10b-modified.png, g10b.log (fixture, 1512x900, init-a, Details): clean, git status empty, source "from working-on/initiative.yaml Open in editor", no mark; after appending a comment line to the temp copy's initiative.yaml (git " M") and Rescan, source "from working-on/initiative.yaml edited, not committed Open in editor"
  - G11 after the rebase: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0 (13 Go packages ok, vitest 51 passed; g11-make-test.log); `cd frontend && npm run build` exit 0 (g11-npm-build.log); G18 grep over main...header-fold: 0 lines (g11-g18.log); `wails build` exit 0

## Next
1. review the branch; G8 by a reader who never saw the app

## Blockers
none

## Notes
- 2026-09-29 FSE: spec amendment 1 answers the spec gap behind the decide: above: the boundary widens by one Go fact, charter_modified, for FR-9 only (the 0064 ruling chose the mark); FR-9 and G10 unchanged
- 2026-09-29 sup23 runs this card with its sibling, spawned by the FSE after responsive-home landed (d8591aa)
- The frontend uses pnpm; add no dependency. Go only as amendment 1 allows (FR-9's charter_modified).
- 2026-09-29 hdr-fold: FR-9's modified mark has no data source in the board (no per-file git status); raised as decide: to sup23; sup23: no Go here, sent to fse for Pablo, build the rest
- 2026-09-30 hdr-fold: amendment 1's Go change (charter_modified) was written, then refused at `go test` by this session's permission check, because the task prompt said no Go and the widening came through the mailbox. It is saved unapplied as .wt-notes/hdr-fold/fr9-charter-modified.patch (scan charterModified, the model field, a scan test for clean, modified and not a repo); `wails generate module` and the header's mark are still to do
- 2026-09-30 hdr-fold: from Home, Open on a card row opens the card back over Home, so the fold is never seen there; H4 is proved on Conversations' needs-me worklist. The card back takes no focus when it opens. The fixture roadmap's duplicate stage id opens the first stage with it. More in .wt-notes/hdr-fold/progress.md
- 2026-09-30 hdr-fold2: the mark shows only for a local initiative, like Open in editor: another machine's snapshot would speak of that machine's working copy

## Review
- Verdict: fail, 2026-09-30, reviewer hdr-fold-review (branch header-fold at 7440ee1, on main 761427d)
- Unmet: G8
- G1 met: g1-answer-1024x640.png and g1.log: focus on div.tl-divider of the asking thread, asked message 274–377 inside the timeline, composer 497–622 on screen, timeline 0.53 of the sub-view; store `openSlack*` fold the header.
- G2 met: g2.log, 18 shots: bar plus tabs 76 px at 1024, 1512, 3440 on every sub-view, no h1 in the sub-view, id not cut; diff drops the id rows in SlackView, AgentsView, DecisionsView.
- G3 met: g3.log (open on init-a, still open on init-b, still open after reload; goal and measure "more"; g3-10 scope "more"); g3-open.log: Open card on Conversations' needs-me row folds (headerFolded true), row on screen with focus on its Open after the back closes. Store: only `setHeaderOpen` writes `initiative.header.open`; `openInitiative` reapplies it.
- G4 met: g4.log: chip from Work and from Decisions (and again after collapsing) lands on Decisions with 0002 expanded and focused, "Waiting on a ruling" on screen; init-c has no chip. Code: `openDecision(i.id, firstWaiting)` plus `decisionSeq`.
- G5 met: g5-organizer-real-home.png (the real rail: ccint-camp-monorepo, organizer, agent-slack): "Roadmap · building · stage 5 of 6", building once, no tile chips; g5-init-a-fixture.png / g5.log: DISCOVERY and BUILDING once each, one divider, 0 chips.
- G6 met: g6.log and g6-2-click.png: click and Enter on stage 2 open Roadmap → Stages, header folded, stage 2 expanded with outcome, exits, gates, cards, appetite, focus on its toggle. Exits carry no dates in the fixture ("open"), so "exits with dates" shows the open state only.
- G7 met: g7.log and g7-details-open-3440.png: two 571 px columns, clamped lines 88/95/88/40 characters, folded goal line 96.
- G8 unmet. Tiles: right ("the initiative's roadmap stages", sure). Chip: "A guess … most likely decisions waiting on a ruling … the screen never says what the three are waiting for", graded by the reader themself as a guess that "cannot be read off these screenshots", and disclosed as possibly coloured by the repo's CLAUDE.md. That is cannot tell with an inference attached, not reading it off the bar. Box left unticked.
- G10 met: g10b.log, g10b-clean.png / g10b-modified.png: source line and Open in editor when clean; "edited, not committed" after the file goes " M" and Rescan. Go: `charterModified` reuses `git()` with the scan timeout, not-a-repo false; `go test -count=1 -run TestCharterModified ./internal/scan/` passes (clean, other file dirty, modified, not a repo).
- G11 met, rerun by me: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0 (vitest 51 passed), `npm run build` exit 0, G18 grep over main...header-fold 0 lines (.wt-notes/hdr-fold-review/).
- Boundary: diff --stat stays inside it except `StageRoadmap.tsx` and `styles/roadmap.css`; the card and spec boundary say `Roadmap.tsx`, but FR-4 and the technical notes name `StageRoadmap` as where the expanded row goes, so this reads as the boundary's slip, not a breach.
- Not covered by the gate: (1) the gate may be unmeetable as designed: FR-2 fixes the chip's words to "N waiting" / "N waiting on you", with nothing naming decisions, and the reader pointed at exactly that; Pablo's to settle (chip wording or G8). (2) From Home, Open on a Needs me card row folds the header in memory under a card back over Home, where no header shows, and the next hand navigation restores Details: H4 holds only on Conversations' worklist. (3) The card back takes no focus when it opens (focus stays on Open behind it). (4) `make test` served Go packages from cache; the charter test was rerun uncached.

## UI review
- Ran: branch header-fold at 7440ee1 (detached in .wt/hdr-fold-ui), `scripts/fixture-home.sh`, `wails dev -devserver localhost:34213`, a private headless Chromium (driver .wt-notes/hdr-fold-ui/drive.cjs, logs .wt-notes/hdr-fold-ui/folded.log and the s-*.cjs scenarios) at 1024×640, 1280×800, 1512×945, 1920×1080, 3440×1380; init-a (3 waiting) and init-c (none). Heuristic review plus one `simulated` blind reader; no real user.
- Verdict: **pass**. No severity 4 or 3 finding against what the spec covers. Every H-row I could reach held: H1 (Answer at 1024×640: focus on the thread divider, asked message 274–377 and composer 497–622 on screen, .wt-notes/hdr-fold-ui/1024x640-answer-landing.png), H2/H10 (bar plus tabs 76 px on all six sub-views at all five widths, id never cut, no h1 under the tabs), H3 (Details open survives init-c, init-b, Home and a reload; goal and measure "more"), H4 (Conversations' worklist, .wt-notes/hdr-fold-ui/1512x945-h4-*.png), H5 (from Work, again on Decisions after collapsing and scrolling, and by Enter from Overview: 0002 expanded and focused, "Waiting on a ruling" in view; init-c no chip), H6 (init-c made single-phase in the temp copy: "Roadmap · building · stage 1 of 2", "building" once), H7, H8 (click, Enter, and the folded bar's stage button), H9 (two 571 px columns, longest header line 86 characters), FR-9 (source line, Open in editor, "edited, not committed" after " M" and Rescan, .wt-notes/hdr-fold-ui/1512x945-g10-source-*.png).
- U1. **At compact the lead loses the target date from the folded bar while the cut goal keeps its place.** Where: 1024×640, any sub-view, folded (.wt-notes/hdr-fold-ui/1024x640-folded-init-a-Work.png); `.ihead.compact .ihead-target { display: none }` in shell.css. Evidence: heuristic, the design's §1 order of giving way ("the goal … gives way first") and its widths table ("the goal gives way first, then the target"); the goal line is 472 px wide there, room the date needs 122 of. Severity 2. Proposal: at compact shorten the goal first and keep "target 2026-10-01"; drop the target only when the goal is already gone.
- U2. **After a landing, the first tab the lead presses springs the whole header back open.** Where: 1024×640, Details stored open, Answer from Home, then Work (.wt-notes/hdr-fold-ui/1024x640-answer-then-work-tab.png): 466 of 640 px is header again. Evidence: heuristic (user control, consistency); the build follows the spec's technical note (a landing folds in memory only, the next hand navigation reapplies the stored choice), while the design's §1 says "the lead's choice becomes folded until he opens it again". Severity 2. Proposal: the FSE picks one; the design's version (a landing writes folded) costs one line in the store.
- U3. **A first-time reader cannot tell what the chip is, or that it and the folded stage are buttons.** Where: 1512×945 folded and open (.wt-notes/hdr-fold-ui/1512x945-folded-init-a-Work.png, .wt-notes/hdr-fold-ui/1512x945-details-open-init-a.png). Evidence: simulated, one fresh agent shown only those two shots: tiles read right ("the project's stages … grouped into discovery and building"); chip "a count of things waiting for a decision or for me … could also just be a status label"; "Stage 2 of 4 · The joins" "doesn't look clickable"; tiles "give no sign of being clickable". The chip's accessible name is "3 waiting" (what waits only in its title). Same finding as Review's G8; 0068 is proposed on the words. Severity 2 (the lead knows the app; it matters for the stage-6 readers). Proposal: 0068's first option for the words; give the chip and the stage button the hover and cursor of a button, and name the chip "3 decisions waiting, open Decisions".
- U4. **With Details open at compact the sub-view gets about 129 px, less than before this card (217).** Where: 1024×640, Details open (.wt-notes/hdr-fold-ui/1024x640-details-open-init-a.png): header 466 px (378 on the baseline). Evidence: heuristic (minimal design); the lead chose it, and landings fold it, so no task is blocked. Severity 2. Proposal: at compact, open Details as one column of the two clamps plus the strip, or let the open header scroll inside a max height.
- U5. **In Agents the initiative's id and client still sit under the tabs, on the crew group's head.** Where: every width, Agents (.wt-notes/hdr-fold-ui/3440x1380-folded-init-a-Agents.png): "init-a acme · 20 agents · 20 live …" under "sampled just now". Evidence: heuristic, H10 / §6; the h1 went, the group head (shared with the all-initiatives view) stayed. Severity 2: it carries the counts and New agent, so nothing is lost but a repeated id. Proposal: when one initiative is selected, drop the id and client from the group head and keep its counts and New agent on the toolbar line.
- U6. **A keyboard user hardly sees focus arrive on the current stage tile.** Where: 1512×945, Details open, Tab onto tile 2 (.wt-notes/hdr-fold-ui/1512-ring-current-tile.png). Evidence: heuristic, WCAG 2.4.7 in spirit: the 2 px accent ring sits outside a tile already bordered in accent. Severity 1. Proposal: the design system's focus ring with more offset, or `--fg` on the selected surface.
- U7. **Small names and words:** the "more" buttons are all named "more" (no field); Open in editor does not name the file; the chip is 18 px tall (2.5.8 passes by spacing); the Roadmap row says "2 · current" where the tile says "2 · now"; at compact the one-tile discovery run takes half the strip (.wt-notes/hdr-fold-ui/1024x640-details-open-init-a.png). Evidence: heuristic. Severity 1. Proposal: "Goal, more", "Open initiative.yaml in editor", one word for the current stage.
- **Spec gaps** (for the FSE): (1) fold after a landing: the spec's technical note and the design's §1 disagree (U2). (2) the chip's words: FR-2 fixes "N waiting", which 0068 now asks about (U3). (3) the open header at compact has no height budget (U4). (4) whether Agents' group head counts as a "title row" (U5). (5) out of this card's boundary: after Answer, the next Tab stops on the divider's icon buttons with no accessible name (`button.rail-icon`, name ""); the card back takes no focus when it opens, so focus stays on Open behind the modal (.wt-notes/hdr-fold-ui/1512x945-h4-open-card-landed.png); Decisions' `dec-line` has no `aria-expanded`.
- **Not verified**: H11 with a real reader (G8 is the gate's, not this review's; U3 is simulated); exit items with met dates in the expanded row (stage 2 has only open exits; the code prints "met <date>"); Open in editor was checked by name and focus only, never pressed; H4 from Home (Home is a Non-goal; the card back opens over Home, as the builder and the reviewer noted); 400 px width (below the app's minimum window); 200% zoom; a real screen reader (names read from the DOM).
