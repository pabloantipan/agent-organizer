# Leftovers 67: the map lens and the run report polished from their UI reviews: the build spec

status: accepted (0180, ruled 2026-11-02)
by: the FSE, 2026-11-02, on main at 513e265
sources: Aglaea's `docs/ux/specs/map-and-roadmap.md` Amendments 3 and 4
(dc466fb, 3b30a41; M8-M14); `docs/ux/specs/run-report.md` Amendment 4 and
`docs/design-system.md` (ab5faff; AR27-AR30); `docs/ux/specs/usage.md`
Amendment 1 and `docs/ux/specs/review-view.md` Amendment 21 (993f615; U9,
R53 amended); the stale comment above `runSignalFor` (bitácora, held since
569375c).

## Premises (read 2026-11-02 at 513e265)

| Premise | Shown by |
|---|---|
| the map figure scales down without a floor; the trail is drawn only below Context; panel actions inherit `button.linkish`; MapView forgets level and pick on unmount; picked is drawn with the focus ring | lf58-map-lens's UI reviews (`working-on/done/lf58-map-lens.md`, U1-U6, N1-N3); `frontend/src/components/MapView.tsx`, `MapPanel.tsx`, `frontend/src/styles/map.css` |
| a wave footer with no run record has the name `sup2/1: no run record` but the look of a link | `frontend/src/lib/runReport.ts:509`; `RunReport.lf64.test.tsx:175` |
| `Rounds as recorded` is a native `<details>`; a reader heading landed on shows the ring on `:focus-visible` | `frontend/src/lib/specReader.ts`; `frontend/src/styles/spec-reader.css:60` |
| the rejected list's title and line say "the record" and "not resent until they change" | `frontend/src/components/UsageTable.tsx` |
| at 1024 the gap above the sub-tabs is 4 px, 8 px at 1440 | lf62-ui UI note 3; `frontend/src/styles/shell.css:329` |
| the comment above `runSignalFor` says the stopped time is a sum of spans, wrong since 569375c | `frontend/src/components/Home.tsx:808-812` |

## Requirements

Card `lf67-map-polish` (frontend, ui_review):
- **FR-1 (M8)** The figure scales down to fit only while its smallest SVG
  text draws at 11 px or more; past that it stays at the floor and its
  frame scrolls in its own region, the buttons over their nodes while it
  scrolls; scrolling edges carry 1 px `--fg-subtle` lines; no scrollbar
  when it fits.
- **FR-2 (M9)** The trail is always drawn; at Context it reads `Context`,
  and `Context › <system> containers` (the second a button back) when
  Containers was open before.
- **FR-3 (M10)** Panel actions (Grounding, list entries, `record NNNN`)
  draw in `--accent-fg`; the node button's name carries `ruled NNNN`.
- **FR-4 (M11)** The panel's list follows the roving set's reading order.
- **FR-5 (M12)** The map's place (level, container, picked node) is kept
  per initiative in the store for the session and restored when Map shows
  again; a node the map no longer has drops the pick, keeping the level.
- **FR-6 (M13)** Picked draws `--selected` fill with a 2 px accent
  outline on the button layer; focus stays the violet-11 ring at 2 px
  offset.
- **FR-7 (M14)** An unknown fact reads `unknown` beside its label.

Card `lf67-ui-polish` (frontend, ui_review):
- **FR-8 (AR27)** A pressable wave footer draws the wave in `--accent-fg`;
  one with no run record draws it in `--fg-muted` with `· no run record`
  in `--fg-subtle` on the line.
- **FR-9 (AR28)** `.rr-card` has `min-width: 24px`, text centred.
- **FR-10 (AR29)** `Rounds as recorded` is drawn as `.rr-more` (muted ▸
  turning, 24 px, native marker hidden, `<details>` kept).
- **FR-11 (AR30)** A reader heading focus lands on draws no ring; Tab
  then rings the next control.
- **FR-12 (U9)** The rejected list's title is `Not accepted by
  discuss-record · N` and the line under it `Sent again when its usage
  changes. Nothing for you to do; the reason is for the FSE.`
- **FR-13 (R53)** The gap from the header's last row to the sub-tabs is
  8 px at 1440x900 and at 1024x640, whatever the number of rows.
- **FR-14** The comment above `runSignalFor` says what the code does.

## Acceptance → gate

UI rows run in the review build (`make review-build` in the card's
worktree, never auth: firebase), launched by its own path in the same shell
after evaluating the fixture launcher's exports (since lf65 the build
refuses otherwise), pid saved, AX of that pid, `screencapture -l`, or
offscreen if the screen is locked, saying which. No row drives Pablo's
desktops, focus or input; a window resize is by the app's own API
(`ORGANIZER_REVIEW_RESIZE`).

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| V1 | 1 | vitest of the scale floor over the fixture's L2 SVG at 1024 width | scale = max(fit, 11 ÷ smallest font); the frame scrolls past it |
| V2 | 2, 4, 7 | vitest of the trail, the panel order and the unknown fact | `Context › harbor containers` after Containers → Context; panel order = roving order; `kind  unknown` |
| V3 | 5 | vitest of the store: place set, Map unmounted and remounted; the map reloaded without the picked node | place restored; pick dropped, level kept |
| M8-M14 | 1-7 | review build, harbor fixture, Aglaea's rows M8-M14 as written | each as its row says |
| V4 | 8-11 | vitest of the footer's class and text, `.rr-card`'s computed min-width, the fold's class, the heading's focus style | as FR-8 to FR-11 |
| V5 | 12 | vitest of the rejected list over two rows | the title and the line as FR-12 |
| AR27-AR30, U9, R53 | 8-13 | review build, Aglaea's rows as written; R53 at 1440x900 and after `ORGANIZER_REVIEW_RESIZE=1024x640@3` | each as its row says; the gap 8 px both |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=<specs checkout>/contracts make test`, `wails build`, `make review-build` in the worktree, `git status --porcelain` | pass, empty |

## Boundary

- `lf67-map-polish`: `frontend/src/components/MapView.tsx`, `MapPanel.tsx`,
  `MapFigure.tsx`, `frontend/src/lib/mapSvg.ts`,
  `frontend/src/styles/map.css`, `frontend/src/stores/board.store.ts` (the
  map place only), and their tests.
- `lf67-ui-polish`: `frontend/src/components/RunReport.tsx`,
  `RunTracks.tsx`, `SpecReader.tsx`, `UsageTable.tsx`, `Home.tsx` (the
  comment only), `frontend/src/lib/runReport.ts`, `specReader.ts`,
  `frontend/src/styles/runreport.css`, `spec-reader.css`, `shell.css`,
  `usage.css`, and their tests.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf67-map-polish` | V1-V3, M8-M14, X0 | — | true |
| `lf67-ui-polish` | V4, V5, AR27-AR30, U9, R53, X0 | — | true |

## Amendment 1 (FSE, 2026-11-02, on sup111's closing report)

V2's "fails on main" does not hold for FR-4: the panel's list already
followed the roving order on main since 8974fd6 (lf58-map-lens round 2).
FR-4 stands as a regression row; the premise table's first row overstated
it.
