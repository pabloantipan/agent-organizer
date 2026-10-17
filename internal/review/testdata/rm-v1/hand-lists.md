# rm-v1 hand lists (rt-build, 2026-10-17), written before the tool ran

Made from `git diff -U0 35671ed^1 35671ed -- 'frontend/src/*.ts' 'frontend/src/*.tsx'`
and `git grep -nw <name> 35671ed -- 'frontend/src/*.ts' 'frontend/src/*.tsx'`
on the root checkout, mapping each hunk to the top-level definition whose
lines (with its leading JSDoc) hold it, found by grepping the top-level
declarations of both sides. A hunk on an import line, a blank line, or a
file comment that belongs to no declaration touches no definition.
`frontend/wailsjs/**` (models.ts, App.d.ts) is excluded by FR-7 and yields
no node.

## T1: every TS definition a hunk of 35671ed touches

| file | definition | kind | change | hunks (head lines unless noted) |
|---|---|---|---|---|
| frontend/src/components/Crew.tsx | CrewResult | type | added | +21-22 (doc + decl) |
| frontend/src/components/Crew.tsx | useAnnouncer | function | modified | 168 (base 166) |
| frontend/src/components/Crew.tsx | runningOf | const | added | +218-222 (doc, decl; 222 blank) |
| frontend/src/components/Crew.tsx | startCrew | function | modified | doc 226-229, 231, 233, 238-240 |
| frontend/src/components/Crew.tsx | Crew | function (component) | modified | 425-428, 430, 467-471, 473, 483-485, 489-494, 513, 515-517, 587 |
| frontend/src/components/Crew.tsx | SeatRow | function (component) | modified | 595-601 (new doc + decl, base 576-578), 603-604, 609-610 |
| frontend/src/lib/liveRegion.ts | SAY_GAP_MS | const | added | +3-7 |
| frontend/src/lib/liveRegion.ts | speaker | function | modified | doc 10-19, 21, 23, 25, 27-33, 35 |
| frontend/src/lib/liveRegion.ts | Say | type | added | +39-41 |
| frontend/src/lib/liveRegion.ts | useLiveRegion | function | modified | doc 44-47 (base 25-28), 53 |
| frontend/src/hooks/useWails.ts | api | const | modified | 60 |
| frontend/src/components/Crew.button.test.tsx | describe "B3: Start finds every seat running (FR-3, L18)" | test | modified | 70, 95 |
| frontend/src/components/Crew.newest.test.tsx | describe "P2 in markup: a seat the press found running (leftovers-33 FR-2, L23)" | test | added | +101-134 |
| frontend/src/lib/liveRegion.test.ts | describe "N2: a repeated message is said again" | test | modified | 17, 21, 43 |
| frontend/src/lib/liveRegion.test.ts | describe "P4: a repeat waits 100 ms (leftovers-33 FR-4, L25)" | test | added | +51-91 |

Touching no definition: Crew.tsx 1, 13, 16 (imports); Crew.newest.test.tsx 3
(import); liveRegion.test.ts 2 (import), 6 (file comment above `afterEach`).
Non-test changed: 11 (4 added, 7 modified); changed tests: 4.

## T2: three changed TS definitions and their callers by grep

Callers are non-test definitions of head (frontend/src, not wailsjs) whose
body names the definition; test files are evidence, not callers.

| changed | caller (enclosing definition) | grep line | caller's change |
|---|---|---|---|
| startCrew | Crew (Crew.tsx) | Crew.tsx:510 | modified |
| speaker | useLiveRegion (liveRegion.ts) | liveRegion.ts:50 | modified |
| useLiveRegion | useAnnouncer (Crew.tsx) | Crew.tsx:170 | modified |
| useLiveRegion | NewAgent (AgentsView.tsx) | AgentsView.tsx:214 | affected |
| useLiveRegion | InitiativesView (InitiativesView.tsx) | InitiativesView.tsx:80 | affected |
| runningOf (a fourth) | startCrew (Crew.tsx) | Crew.tsx:240 | modified |

No other non-test line in frontend/src names startCrew, speaker,
useLiveRegion or runningOf at 35671ed. A trap for a name-only source:
useWails.ts:60 names `main.CrewResult` (the wailsjs class), not Crew.tsx's
`CrewResult`, so `api` must not get an edge to `CrewResult`.

## T3: tests (by grep of the test files at 35671ed)

- named by a vitest: `speaker` is called in liveRegion.test.ts inside
  describe "N2: a repeated message is said again" (lines 14, 30, 40) and
  "P4: a repeat waits 100 ms (leftovers-33 FR-4, L25)" (58, 79).
  `startCrew`: Crew.button.test.tsx "B3: …" (74, 95), Crew.newest.test.tsx
  "P2 in markup: …" (124). `runningOf`, `SeatRow`: "P2 in markup: …".
- named by none: `useAnnouncer`, `useLiveRegion`, `Say`, `CrewResult` and
  `api` are referenced by no `*.test.ts(x)` -> `untested`. (`git grep -nw`
  over the test files hits only `api:` as an object key inside
  `vi.mock("../hooks/useWails", () => ({ api: … }))` in Places.test.tsx:27
  and TopBar.test.tsx:18: a property name, not a reference to the binding;
  a second trap for a name-only source.) `Crew` is rendered by the Crew.*.test.tsx files
  (`<Crew` / `Crew(`), so it is tested.
