# Ranked: sup28's leftovers (header-fold-3, home-widths-4)

- **Asked by:** the FSE, thread 01M41YCPTBFVQDFS9CQW76DQ14, to be batched as
  before.
- **Sources:** `working-on/done/home-widths-4.md` (code review, third
  re-review; UI review recheck U1–U10 and its gaps) and
  `working-on/done/header-fold-3.md` (code review; UI review U1–U3, gaps);
  `runs/2026-10-03-header-fold-3-home-widths-4.md`. Cited as `hw4-` and
  `hf3-`. Both reviews shot WKWebView. I did not re-run them.
- **Design system, amended in the same commit:**
  - **Widths:** the document never scrolls; positioned and hidden text stays
    inside its scroller; gates measure with classic scrollbars too.
  - **Folding:** the order among the foldable signals (live, now, problems,
    then the cell); fold decisions are made against the floor, not the
    natural width.
  - **Scroll edge:** in `--fg-subtle` on each edge with content past it.
  - **Focus and names:** Escape closes the topmost box only; hover never
    takes the selected mark away; a box never covers its opener; the ring
    is for the keyboard.
- **The first row probably fixes two more.** hw4-U8's outer scrollbar takes
  ~15 px from every WebKit width. That is the likely cause of hw4-U3 and
  part of hw4-U2 (145 px + 15 px fits "5 waiting · 1 blocked · +5" whole).
  Re-measure both after row 1, before building anything for them.

## The list, ranked

| # | What the lead cannot do, or does wrong | From | Sev | Kind | Touches markdown-and-labels? | Direction |
|---|---|---|---|---|---|---|
| 1 | In the built app, a wheel past Home's end scrolls the whole document: the top bar leaves, a 330 px blank band appears, and an outer scrollbar eats 15 px at every width | hw4-U8, hw4-gap1 | 2 | DS | **yes**, if fixed in `global.css` (`html, body`) | Widths, as amended: the document never scrolls. Fix the cause (`position: relative` on the row that holds `.p-stage`'s `sr-only` spans) and add the guard (`overflow: hidden` on `html, body`). Then re-measure rows 2 and 5 in WebKit |
| 2 | In WebKit at 1280 with the rail expanded, Home drops the goal column that Chromium keeps | hw4-U3 | 2 | DS | no | Re-measure after row 1. If it holds, the goal floor is measured with the classic scrollbar present (Widths, as amended). G15 names the rail state and the scrollbar kind |
| 3 | Escape on Help or a card drawer also closes the rule box under it | hw4 code review | 2 | DS | **yes** (`RuleDecisionBox.tsx`) | Focus and names, as amended: Escape closes the topmost box only. One stack of open boxes, and the document listener acts on its top |
| 4 | On Decisions at 1024×640, the rule box covers its own Rule, so he loses which Rule is open | hw4-U6, hw4 code review | 1 | DS | **yes** (`rule-box.css`) | Disclosure state, as amended: a box never covers its opener. At compact on Decisions it opens below the stuck head's action row. The head stays visible (decisions-view §8) |
| 5 | In WebKit at 1024 with the rail expanded, waiting and blocked keep one letter ("5 w…", "1 b…"): only colour tells them apart | hw4-U2, hw4-gap3 | 1 | DS | no | Re-measure after row 1; 15 px may give the whole nouns. If it does not, the floor is measured in rendered width as `N` plus the whole noun ("5 waiting"), not in characters, and the cell and the rest fold first (0076). Not an icon per kind: that is a new vocabulary for one width |
| 6 | The cell's state is in "+N" at every size, 1920 included, even where it would fit beside a cut waiting | hw4 code review | 1 | Design | no | Widths, as amended: fold against waiting's floor, not its natural width. The cell shows wherever it fits beside "N waiting" with the names cut |
| 7 | In wide, the opener's selected background disappears while the pointer is in the box | hw4-U4 | 1 | DS | **yes** (`rule-box.css`, or `home.css`) | Disclosure state, as amended: hover never takes the mark away |
| 8 | A stage tile's landing at 1024×640 leaves the stage's detail below the fold | hf3-U3 | 1 | Design | **yes** (`StageRoadmap.tsx`) | Scroll so the expanded detail shows as far as it fits, with the toggle staying at the top (as the decisions-view landing does) |
| 9 | The scroll edge line is barely visible (1.6:1), and with overlay scrollbars it is the only cue | hf3-U1 | 1 | DS | no (`shell.css`) | The edge line is `--fg-subtle`, as amended. G18's wording, the builder's reading, is right: each edge with content hidden past it |
| 10 | The search clear, the reply-to clear and People's hide have no name, only a title | hw4-U7, hw4 code review | 1 | DS | no (`Conversation.tsx`, `SlackView.tsx`) | Names: "Clear search", "Clear reply to <author>", "Hide people" |
| 11 | In a malformed roadmap, both rows of a duplicate stage id list the same cards, as if both were joined | hf3-gap1 | 1 | Design | **yes** (`StageRoadmap.tsx`) | A duplicate row's Cards reads: `Cards can't be joined: two stages are named "joins".` It does not list the cards. The problem already shows in the scan's problems |
| 12 | init-a's next date wraps as "2026- / 11-30" (WebKit, 1512) | hw4-U10 | 1 | DS | no (`home.css`) | Dates on Home show as everywhere else (`30 Nov`, with the year only when it is not this year) and never wrap |
| 13 | Live signals and dots drop out for a sample and come back, so the same row reads "+4" then "+5" | hw4-U9 | 1 | Code | no | Not a UI change. The FSE should trace it: three instances of the app ran on one Mac, and each samples CPU since its own previous sample. Check that before calling it a defect |
| 14 | At 2200 with the rail expanded, a goal shows 68 characters, not 70 | hw4-U5 | — | Spec | no | Accept. The rule is "about 70" (Widths); G20 should say "≥ 65 on its line" |
| 15 | After a pointer landing the stage shows no ring | hf3-U2 | — | none | no | As designed: the ring is for the keyboard (Focus and names, as amended); the accent border shows the stage |

## To look at, not ranked

- Work's wave strip and columns scroll sideways at 1024 (hf3, outside its
  spec). I have not seen it. It needs a measured look before it is a
  finding, and I'll take it if the FSE asks.
- Stages' axis labels overlap at 1024: already leftovers-4 row 10, in
  markdown-and-labels.

## Gates and code (not UI changes)

| # | What | Direction |
|---|---|---|
| S1 | G11, G15, G19 and G23 name no rail state and no scrollbar kind | Widths, as amended: every width row names window or content, the rail state, and overlay or classic scrollbars |
| S2 | Signal gates must wait for the agents feed (40 s) | A row says it measures after the first `agents` event |
| S3 | 2560×1440 cannot be reached on a 3440×1440 screen (the menu bar) | Gate at 2560×1380 |
| S4 | An ignored fixture file (`testdata/fixture-twenty/*/agents/`) passed the builder's gate and failed everyone else's | The FSE's and supervise's: gates over a fixture run from a clean checkout |
| S5 | A design-shaped fail went back to the builder twice before reaching me (G19, "never fold") | The FSE's and supervise's: when a fail is a design question, it comes to Aglaea before the builder. I answer in one line, as on 0076 |
| S6 | StageRoadmap's focus effect has no dependency list; `useScrollEdges` observes children only at mount; `shareRoom` can still return `fits: false` | Code, the FSE's |

## Sequencing

markdown-and-labels holds `rule-box.css`, `RuleDecisionBox.tsx`,
`global.css` and `StageRoadmap.tsx`'s labels. Rows 1 (if fixed in
`global.css`), 3, 4, 7, 8 and 11 touch it, so they go after it or into it.
Rows 3, 4 and 7 are all the rule box's, and fit it naturally. Rows 2, 5, 6,
9, 10 and 12 are free of it.
