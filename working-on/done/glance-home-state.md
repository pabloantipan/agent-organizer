---
title: Home says each initiative's phase and state, for twenty
status: done
repos: [organizer]
branch: glance-home-state
seat: wave1-home
updated: 2026-09-27
next: "review: glance-home-state, gate G7, G8, G10 met, G9 material in .wt-notes/wave1-home, 550b67b 662ff32 f0256f2"
depends_on: ["glance-scope-phase"]
boundary: ["frontend/src/components/Home.tsx", "frontend/src/lib/initiativeState.ts (new)", "frontend/src/lib/queue.ts (read only, unless the lead's name moves there)", "scripts/fixture-home.sh", "testdata/fixture-twenty/ (new)", "frontend/src/styles/ (Home's CSS only)"]
spec: "docs/specs/twenty-at-a-glance.md (FR-6, FR-7); values: docs/design-system.md"
gate: "docs/specs/twenty-at-a-glance.md Acceptance, rows G7, G8, G9, G10; the Gate section below"
stage: twenty-at-a-glance
review: pass
---

## Goal
Roadmap stage twenty-at-a-glance (0032): FR-6, FR-7 of `docs/specs/twenty-at-a-glance.md`.

## Gate
- [x] G7: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [x] G8: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [x] G9: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [x] G10: see `docs/specs/twenty-at-a-glance.md`, Acceptance

## Done
- 2026-09-27 cut from the spec by the FSE
- 2026-09-27 wave1-home: Home rows show phase and one state (550b67b `lib/initiativeState.ts`, 662ff32 `Home.tsx` + `styles/home.css`), `fixture-home.sh --twenty` (f0256f2, `testdata/fixture-twenty/`), rebased on main at 63a47d5, unmerged. G7: `.wt-notes/wave1-home/G7-home-twenty.png` and `-2.png` (wails dev on --twenty, every row one state word and its phase, all 20 rows in -2). G8: `G8-status.txt`, `go run . status` lists 20 initiatives, no problems; states executing 4 (auth-gateway, billing-api, field-app, ops-dashboard), waits on you 3, waits on business 2, quiet 11; phases discovery 5, building 10, no roadmap 5. G9 material: `G9-home-1440x900.png` (built app, 1440×900 window capture, all 20 rows) and `G9-key.md`. G10: `npm run build` → `✓ built in 1.08s`; the G18 grep over `git diff main...glance-home-state` printed nothing (exit 1).

## Next
1. review: glance-home-state — a reviewer who did not build it answers G9 from the screenshot, timed, then opens the key

## Blockers
none

## Notes
- 2026-09-27 sup5 runs this card (organizer-probe-sup5), spawned by the FSE after 0033
- 2026-09-27 sup5: seat wave1-home, branch glance-home-state in .wt/glance-home-state; evidence under .wt-notes/wave1-home/
- 2026-09-27 sup5: G9 is the reviewer's row, not the builder's: the builder leaves the screenshot (G9-home-1440x900.png) and the key (which initiative is in which state) in a separate file the reviewer opens only after answering; the reviewer times itself and flips G9
- 2026-09-27 sup5: new rules go in styles/home.css (new), not shell.css, which the header card also draws from
- 2026-09-27 wave1-home: executing cannot come from files alone — the scan reads agents from the process table. `--twenty` starts four stand-in processes (a sleep named after the config's `agent_binary`) in the cards' `.wt/<slug>`, and the real scan joins them; `kill $FIXTURE_AGENT_PIDS` ends them. Details in `testdata/fixture-twenty/README.md` and `.wt-notes/wave1-home/progress.md`.
- 2026-09-27 wave1-home: FR-6 read literally leaves "waits on business" unreachable, since `needsMeRows` lists every proposed record whoever owns it and "waits on you" is tried first. `initiativeState.ts` counts a decision row as the lead's only when its owner is empty or the lead; queue.ts is untouched.
- 2026-09-27 wave1-home: decide: should Needs me (and its badge) keep listing proposed records owned by business or the FSE? Today it does (6 rows in the --twenty fixture for 3 initiatives that wait on you); dropping them is a change to `needsMeRows` in queue.ts.
- 2026-09-27 wave1-home: the queue reads `pablo:` cards only in initiatives with a cell (`queueOf` skips groups without one), so such a card elsewhere never reaches Needs me.

## Review
- Verdict: pass. Reviewer wave1-review-home, 2026-09-27, on f0256f2.
- Unmet gate items: none.
- G9: `G9-home-1440x900.png` is 1440x900 (sips), native window of the built app, columns and icons match 662ff32. Answered from it alone (`.wt-notes/wave1-review-home/G9-answers.md`), 1790528900 to 1790528905, 5 s. Executing: auth-gateway, billing-api, field-app, ops-dashboard (key: right). Discovery: field-app, onboarding-flow, pricing-model, risk-scoring, search-index (right). Waits on business: data-lake, pricing-model (right). Waits on you: claims-portal, onboarding-flow, vendor-audit (right).
- G7: `initiativeState.ts` applies FR-6's order over `needsMeRows` (not a copy); executing reads waves and live agents joined to a card, so mobile-sync's two unmanned `now` cards read quiet (A3); business excludes the lead and `fse` (email-digest is quiet). Each state is a word with its own icon, each phase a word with an icon or "no roadmap". One deviation from FR-6 read literally: a Needs me row that is a record owned by someone else does not count as "waits on you", because FR-6 step 1 read literally makes step 3 unreachable. The spec contradicts itself here and the builder's reading is the only one that meets FR-7; the spec needs an amendment.
- G8: `--twenty` then `go run . status` gives 20 initiatives with no problems; `go run . agents` joins four running stand-ins, `decisions` shows proposed owners pablo x2, carla, rodrigo, fse. The mix is 4 executing, 5 discovery, 2 business, 3 you, 11 quiet. Without `--twenty`, `status` is byte-identical to main's script (temp paths normalised).
- G10: `npm run build` finished (`built in 1.09s`), the G18 grep printed nothing (exit 1), and every token home.css uses exists in tokens.css.
- Boundary: diff touches only Home.tsx, lib/initiativeState.ts, styles/home.css, scripts/fixture-home.sh, testdata/fixture-twenty/; shell.css and the store untouched.
- Outside the gate: (1) Needs me says 6 while three rows say "waits on you". The decide: in Notes about this still needs an answer, and this card is now done. (2) The documented `kill $FIXTURE_AGENT_PIDS` fails in zsh (one word). Use `kill ${=FIXTURE_AGENT_PIDS}`. (3) Stand-ins are `running`, never `working`, so "executing" here counts any live agent on a card. (4) A G9 timed by a model says little about a human reader.
