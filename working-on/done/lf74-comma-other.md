---
title: "One space after every comma, and the app's own group label as Other"
status: done
repos: [organizer]
branch: lf74-comma-other
seat: l74-build
reviewer: l74-rev
review: "pass (V1-V4, X0 by l74-rev; AR39, AR40 by l74-ui), 2026-11-08, 74a2c421"
stage:
updated: 2026-11-08
next: ""
depends_on: [lf73-inline-names]
boundary: ["frontend/src/styles/runreport.css", "frontend/src/components/Rail.tsx", "frontend/src/components/FloatList.tsx", "frontend/src/lib/", "frontend/src/components/RunTracks.test.tsx", "frontend/src/components/RunTracks.lf73.test.tsx", "frontend/src/components/FloatList.test.tsx", "frontend/src/components/"]
spec: "docs/specs/leftovers-74.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-74.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
prs:
  - {repo: organizer, pr: 66, target: main, state: merged, merge: c2eeb8f1}
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

## UI review
- Reviewer l74-ui, 2026-11-08, commit 74a2c421 (on origin/main 127b35c). Verdict: **pass**. Rows unmet: none. Sev 4/3: none.
- How: review build (`make review-build` in a detached worktree), started by `testdata/fixture-report/launch.sh … rr --wide-slug --resize 1024x640@2`, pid 76345 saved; `ORGANIZER_CONFIG` and `XDG_DATA_HOME` under `/private/tmp/organizer-fixture.KP8Pcu`; screen unlocked (no `CGSSessionScreenIsLocked`), so nothing ran offscreen. AX of that pid only (AXPress, AXFocused, AXValue; never the floating icon); shots `screencapture -o -l` of its window (1024x640). Notes, AX dumps and shots in `.wt-notes/l74-ui/`.
- Test run X0: **reused**, test-lease run 5dd0606a-37552 of 74a2c4212a65 (l74-rev's), exit 0, vitest 1727 passed (`x0-make-test.log`).
- **AR39 met.** `left` reads `d, e, wide-slug, f (not cut)` (`--wide-slug`: link, link, wide link, plain). AX points: `d` @1351 16w, `,` @1362 4w, `e` @1364 16w (glyph 1368), `,` @1375 4w, `wide-slug` @1376 74w (glyph 1380), `,` @1445 4w, `f` @1451. Comma start to next glyph: 6, 5, 6 (comma end to glyph 2, 1, 2): equal within 1 px, before a link and before plain text. On main (127b35c, l73-ui's `ar35-left-ax.txt`): `e` @1368, glyph 1372, so 10 before a link vs 5 before plain. First item unchanged (`d` @1351 on both), the comma's pull into the link before it unchanged (`,` @1362 on both). Shots: `.wt-notes/l74-ui/shots/1024x640-ar39-left.png`, `1024x640-ar39-left-zoom.png`. The inset ring: `.rr-card.rr-inline:focus-visible { outline-offset: -2px }` unchanged in the diff; on screen not verified (AXFocused on `wide-slug` paints no ring while the window is not key, `1024x640-ar39-ring-focused.png`); by geometry the ring (1378) may touch the comma (1375-1379), never the name (1380), as AR35 allows.
- **AR40 met.** Group by client (AXPress `Group by client`): heads `acme`, `personal`, `Other`, `ccint`; stored `['acme','personal','Other','ccint']` (`1024x640-ar40-rail-seeded.png`). Rename through the app's own field (Actions for Other → Rename, field opens `v="Other"`, AXValue `misc`, commit on blur by AXFocused elsewhere): head `misc`, stored `misc` (`1024x640-ar40-rail-renamed-misc.png`). The old seed's value: renamed to `other` → reads `Other`, stored `other` (`1024x640-ar40-rail-stored-other.png`). A person's `OTHER` → reads `OTHER`, stored `OTHER`. Float list: **not verified on screen**: it opens only on the floating icon's `floaticon:list` event (no AXPress on the icon), and the collapsed strip shows no group names; covered by V3's render test in the shared run.
- Design system: the app's label in sentence case (`Other`, beside `Asleep`, `Archived`), the person's names as written (`misc`, `acme`, `OTHER`); the new rule uses `var(--space-1)`, no raw value.
- Finding 1 (sev 1). What: a screen-reader user renaming the stored `other` group hears `Rename other` and the field reads `other`, while the head they chose reads `Other`. Where: rail, group actions → Rename (`ar40-stored-other-ax.txt`; field `t="Rename other"`). Evidence: AX label and value from the stored name; the builder keeps the value stored on purpose ("Found, not asked" (2)). Severity 1. Proposal: label the field with the shown name (`Rename Other`), value as stored; or leave it, it only occurs for the accepted-cost case.
- Spec gaps (for the FSE): AR39's "link, not-cut item, link" cannot occur (the contract orders `left` as open cards then `to_cut`); measured on link, link, link, plain instead, which holds both cases. FR-2 does not say what the rename field shows for a stored `other` (finding 1).
- For aglaea: none.
