---
title: "One space after every comma, and the app's own group label as Other"
status: next
repos: [organizer]
branch: lf74-comma-other
seat: l74-build
reviewer: l74-rev
review: "pass (V1-V4, X0), l74-rev, 2026-11-08, 74a2c421; AR39, AR40 to l74-ui"
stage:
updated: 2026-11-08
next: "review: lf74-comma-other, gate met (V1-V4, AR39, AR40, X0), 74a2c421"
depends_on: [lf73-inline-names]
boundary: ["frontend/src/styles/runreport.css", "frontend/src/components/Rail.tsx", "frontend/src/components/FloatList.tsx", "frontend/src/lib/", "frontend/src/components/RunTracks.test.tsx", "frontend/src/components/RunTracks.lf73.test.tsx", "frontend/src/components/FloatList.test.tsx", "frontend/src/components/"]
spec: "docs/specs/leftovers-74.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-74.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
A comma list reads with one space after each comma, and the app's own group label reads Other.

## Gate
docs/specs/leftovers-74.md, rows V1-V4, AR39, AR40 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #64).
- Merge target: `main` through talos-lab's PR.
- A stored group named exactly `other` reads `Other`; the stored value is never rewritten (FR-2, accepted cost).
- Tests: vitest beside each file (`cd frontend && npm test`); a test outside the named files may change only where it asserts the old text or rules (the boundary's last entry, for that only).
- Design: Aglaea's 43ab477; anything else to the FSE.
- Short-sample fallback: the existing fixtures; a group named other, one named misc, and a left list of link, not-cut item, link are added to the fixture if missing; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots and measurements under `.wt-notes/<seat>/`.
- Retention: n/a.
- No AXPress on the floating icon in the UI review: it activates the app over Pablo's work.

## Done
- l74-build, 2026-11-08: FR-1 b1b37dfc, FR-2 + FR-3 74a2c421 on lf74-comma-other (on origin/main 127b35c, not pushed); V1-V4 fail on 127b35c and pass; AR39 (comma to next glyph 6 vs 5 pt, main 10 vs 5) and AR40 (`Other`, renamed `misc`, stored `other` reads `Other`) by AX of the review build's own pid at 1024x640; X0 passes from a clean clone. Evidence and the reviewer's steps: `.wt-notes/l74-build/progress.md`.

## Notes
- No fixture change: the factory-report contract orders `left` as open cards then `to_cut`, so "link, not-cut item, link" never occurs; `d, e, f (not cut)` holds both cases AR39 compares (comma before a link, comma before plain text).

## Declared changes
- modified `frontend/src/styles/runreport.css`: adds `.rt-comma + .rr-card { margin-inline-start: calc(-1 * var(--space-1)) }` (FR-1, AR39); `.rr-card + .rt-comma` kept
- added `frontend/src/lib/groupName.ts`: `groupName` (stored `other` reads `Other`), `NO_CLIENT`, `clientGroups` (the Group by client seed, no-client into `Other`) (FR-2)
- added `frontend/src/lib/groupName.test.ts`: V2
- modified `frontend/src/components/Rail.tsx:Rail`: `groupByClient` seeds through `clientGroups`; the group head shows `groupName(s.name)` in its name, chevron label and actions name; the rename field keeps the stored name; doc comment reads `Asleep · n`, `Archived · n` (FR-2, FR-3)
- modified `frontend/src/components/FloatList.tsx`: added `FloatSections` (the sections' map, moved out so it renders statically), group label and aria-label through `groupName`; `FloatFolds` doc comment reads `Asleep · n`, `Archived · n` (FR-2, FR-3)
- modified `frontend/src/components/RunTracks.test.tsx`: V1
- added `frontend/src/components/Rail.lf74.test.tsx`: V3 (rail), V4
- modified `frontend/src/components/FloatList.test.tsx`: V3 (float list); the fold test's title reads `Asleep · n` (FR-3)
Risky:
- `.rt-comma + .rr-card`: the link's box now starts 4 px earlier, 2 px over the comma's frame (AX: comma @1362 4w, `e` @1364); the inset ring (AR35, 2 px in) may touch the comma, never a name, as it already may on the link's end side
- `groupName`: a person who typed exactly `other` reads `Other` (FR-2's accepted cost)
Not changed, on purpose:
- the stored group names: never rewritten; the rename field opens on the stored value
- `frontend/src/lib/floatList.ts`: sections keep the stored name; only the display maps it
- `testdata/fixture-report/launch.sh`: no state was missing (see Notes)

## Review
- Verdict: pass, code gate (V1, V2, V3, V4, X0). Unmet rows: none. AR39 and AR40 are l74-ui's.
- Reviewer l74-rev, 2026-11-08, commit 74a2c421 (on origin/main 127b35c), clean clone of the GitHub remote; notes and logs in `.wt-notes/l74-rev/`.
- change-check `organizer lf74-comma-other --base origin/main`: 8 files, 0 flags (outside boundary 0, undeclared 0, declared not changed 0, new env/dependency/host 0, untested? 0). Nothing to explain.
- V1-V4: the four test files at 74a2c421 pass (27 tests; `v-branch.log`); copied onto 127b35c they fail 5 tests plus `groupName.test.ts` cannot import its helper (`v-main.log`: V1 rule missing, V3 rail reads `other`, V3 float list has no `FloatSections`, V4 finds 4 lines). `git grep -E '(Asleep|Archived) \(n\)' -- frontend/src`: nothing on the branch, Rail.tsx:28-29, FloatList.tsx:216-217 and the test title on main.
- FR-1 read: `.rt-comma + .rr-card` is the only new rule and the only rule over that pair; the `{" "}` between comma and link is a text node, which `+` skips, so it reaches the link after a comma; the first item has no comma before it and `.rt-tocut` is not `.rr-card`, so neither is pulled; no later rule in runreport.css or any other stylesheet sets a margin on `.rr-card` (`:hover`, `.rr-inline`, `.rt-waitline` set only background, min-width, outline-offset); `.rr-card.rr-inline:focus-visible { outline-offset: -2px }` is unchanged. `.rr-card + .rt-comma` kept.
- FR-2 read: one helper, `lib/groupName.ts:groupName`, used by Rail.tsx and FloatList.tsx for display only; maps exactly `other`, leaves `OTHER`, `Other`, `others`, ` other`, `misc`, `Acme`, `` as stored (V2's own list, checked); the only writer that changed is the seed, `clientGroups`, writing `Other`; `rename` persists the trimmed typed text and the field opens on the stored name; no write path calls `groupName`.
- FR-3 read: V4's vitest walks every `.ts`/`.tsx` under `frontend/src`, test files included, so it catches comments and test titles.
- X0: `pnpm install --frozen-lockfile`; `make test` (go test ok, vitest 1727 passed) fresh run, test-lease saved run 5dd0606a3e6479d1be0a4b75d8d66c7c, exit 0; `wails build` 0; `make review-build` 0 (built, not launched); `git status --porcelain` empty, wailsjs/runtime unchanged.
- Note (FSE, low, no site today): `clientGroups` keys by the written client, so a client written `other` and the no-client initiatives seed two groups both reading `Other` (`[{other,[a]},{Other,[b]}]` from `client: "other"` and `client: ""`), and a client written `Other` now joins the no-client group (before: two groups). Inside FR-2's accepted cost; goes to the FSE's leftovers list.
- Note (FSE, low): `lib/groupName.ts:groupName` shares its name with `lib/review.ts:groupName` (a Worklist group); no collision today, a reader may confuse them. Goes to the FSE's leftovers list.
