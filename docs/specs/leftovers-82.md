# Leftovers 82: the last rename polish: no "….", a level head, graphemes: the build spec

status: accepted (0195, ruled 2026-11-08)
by: the FSE, 2026-11-08, on main at 6aa41021
sources: sup123's closing on lf81-rename-edges (#80); Aglaea's
`docs/ux/specs/run-report.md` Amendment 16 (6aa41021; AR53 amended, AR54,
AR55): drop the period after a cut name, the ellipsis stands for it;
chevron, name and `⋯` each in the same 24 px line box, aligned to the top,
so at rest their centres meet; the cut is 24 graphemes. Aglaea and the FSE
agreed this is the last card of rename polish.

## Premises (read 2026-11-08 at 6aa41021)

| Premise | Shown by |
|---|---|
| the cut counts code points (`[...name]`), so a combining mark or a ZWJ emoji at the 24th place is cut mid-grapheme | `frontend/src/lib/railGroup.ts:79-82` (`cutName`) |
| the visible line puts the sentence's period after a cut name, so it reads `….` | `frontend/src/lib/railGroup.ts:69-70` (`takenLine`), `:88-91` (`takenLines`) |
| since lf81 the head's items align to the top, so at rest the chevron and name sit 2-4 px above the `⋯` centre | `frontend/src/styles/global.css:174-176` (`.rail-group-head`, `.rail-group-tools`); sup123 |
| `Intl.Segmenter` is available at the WKWebView floor (Safari 15.0; Segmenter since 14.1) | CLAUDE.md, Visual direction (Safari 15.0 floor) |

## Requirements

Card `lf82-rename-last` (frontend, ui_review):
- **FR-1 (AR53 amended)** The cut counts graphemes (`Intl.Segmenter`,
  granularity grapheme): a name longer than 24 graphemes shows its first 24
  and `…`; a grapheme at the edge is never split.
- **FR-2 (AR54)** In the visible line, a cut name is not followed by the
  sentence's period: the ellipsis stands for it. The announcement is
  unchanged (whole names, periods kept).
- **FR-3 (AR55)** The head's chevron, name and `⋯` each sit in a 24 px
  line box aligned to the top: at rest their centres are within 1 px; with
  a taller field they stay by its first line.

## Acceptance → gate

UI rows run as leftovers-67 says (review build in the worktree, launched by
its own path after the fixture launcher's exports in the same shell, pid
saved; AX of that pid, or the offscreen harness, saying which); stand-ins
stopped with `scripts/fixture-home.sh stop "$FIXTURE_DIR"` before the dir
goes. No row drives Pablo's desktops, focus or input, and no row sends
AXPress to the floating icon.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| V1 | 1 | vitest of the cut: 23 letters then a family ZWJ emoji then more; 23 letters then `é` written as `e` plus a combining acute | the emoji and the `é` kept whole at the 24th place (main: split) |
| V2 | 2 | vitest of the visible line with a cut current name at the sentence's end | ends `…` with no period (main: `….`); the announcement still ends with the whole name and a period |
| V3 | 3 | vitest reading `global.css`: the head's chevron, name and tools rules | each with a 24 px line box (height or line-height) under a top-aligned head |
| AR53, AR54, AR55 | 1-3 | review build at 1024x640: a refusal quoting a 60-grapheme name with an emoji at 24; a closed group head's AX frames | as Aglaea's rows; centres within 1 px |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=<specs checkout>/contracts make test`, `wails build`, `make review-build` in the worktree, `git status --porcelain` | pass, empty |

## Boundary

`frontend/src/lib/railGroup.ts` (`cutName`, `takenLine`, `takenLines`) and
its test; `frontend/src/styles/global.css` (the group head's rules only);
`frontend/src/components/Rail.tsx` (the head's markup only, if a line box
needs a wrapper); tests asserting the old line (those asserts only).

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf82-rename-last` | V1-V3, AR53-AR55, X0 | lf81-rename-edges (merged #80) | true |

## Amendment 1 (FSE, 2026-11-08, on l82-ui's spec gap)

FR-3's "with a taller field they stay by its first line" applies to the
chevron and the name only: the `⋯` tools are not rendered while the field
is open (`Rail.tsx`, `!isEditing`, unchanged by this card), so they are not
checked then. AR55 at rest is unchanged: chevron, name and `⋯` centres
within 1 px. V3 also checks the chevron's computed box, not only its CSS
text: a rule's `min-height` must not lift it above 24 px.
