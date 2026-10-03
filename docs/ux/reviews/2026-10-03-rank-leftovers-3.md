# Ranked: sup25's leftovers (header-fold-2, widths-and-focus)

- **Asked by:** the FSE, thread 01M41B2BRFY6W55KSBC307ZWY5. Pablo accepted
  batching them as 0069 was.
- **Sources:** `working-on/done/header-fold-2.md` (UI review U1–U3, spec
  gaps; code review) and `working-on/done/widths-and-focus.md` (UI review
  W1–W5, spec gaps; code review); `runs/2026-10-03-header-fold-2-widths-and-focus.md`.
  Both were reviewed in headless Chromium, not in WKWebView. I did not re-run
  them: these rows rest on those reviews' shots and logs.
- **Design system, amended in the same commit** (Widths): wide's start is
  measured on the row with 2200 as the floor; an all-empty column gives way
  first; signals fold from the least urgent; a region that scrolls inside a
  view shows it does. With these, rows 1, 3, 4 and 5 are conformance.
- **None needs Pablo's word.** Row 2 settles what 0069's note meant (the
  head stays). It goes in the batch's accept record.
- **decisions-view (0072) absorbs rows 2 and 9**, both in `DecisionsView.tsx`'s
  record line. The sticky record head has to stack under decisions-view's
  sticky section headings, so designing and building them apart would mean
  doing it twice. My amendment: `docs/ux/specs/decisions-view.md`,
  "Amendment 1". Everything else goes to the leftovers-3 batch, after
  decisions-view.

Kinds: **DS** is conformance to `docs/design-system.md` (spec it as
written); **Design** is my call, proposed here; **Spec** fixes a gate;
**Fixture** is not a UI change.

## The list, ranked

| # | What the lead cannot do, or does wrong | From | Sev | Kind | Goes to | Direction |
|---|---|---|---|---|---|---|
| 1 | At 1440, a blocked card on an initiative hides under "+4" while the next-date column, "—" on every row, keeps 96 px | W2, wf-gap2 | 2 | DS | responsive-home | Widths, as amended. Signals fold from the least urgent: waits on you, blocked and waiting never fold; problems, now, live fold first. A column empty on every row gives way before any with content |
| 2 | Reading a record taller than the view, one scroll puts Rule out of view (−362 px) | U2, hf-gap2 | 2 | Design | **decisions-view** | The head stays: 0069's note meant it, and main only lands it. An expanded record's line and its Rule stick under the section's sticky heading until the record's end scrolls past. Detail in decisions-view Amendment 1 |
| 3 | At 2200 with the rail expanded, goals fall to about 30 characters where 2199 shows them whole | W1, wf-gap1, code review (1) | 2 | DS | responsive-home | Widths, as amended: wide is measured on the row (2200 is the floor). Wide only while the list beside Needs me keeps about 70 characters of goal. Gate it at 2200 and 2560, both with the rail expanded |
| 4 | At 1440, regular cuts goals to 25–30 characters while an empty next-date column keeps its width | wf-gap3 | 2 | DS | responsive-home | Same rule as row 1 (the empty column first). Then the goal has the room |
| 5 | On the laptop with Details open, the stage leaves the bar and the strip sits below a region with no sign it scrolls | U1, hf-gap1 | 2 | Design + DS | initiative-header | At compact, the bar keeps its stage while Details is open, so the stage never leaves the view. The open header's scroll area shows its edge (DS, as amended) |
| 6 | After clicking the record's text in a rule box, Escape does not close it | W3 | 2 | DS | responsive-home (the rule box) | Focus and names: Escape closes every inline box wherever focus sits inside the view. Listen on the document while a box is open. Also fixes it on Decisions |
| 7 | With a rule box open, he cannot tell which row's Rule opened it: the opener is dimmed under the scrim | W4 | 1 | DS | responsive-home | Disclosure state: the opener stays above the scrim with `--surface-selected` |
| 8 | In a conversation, the reply and branch buttons have no names, the divider icons are 20×28, and Tab after "hide" falls to the page body | W5, wf code review (4) | 1 | DS | responsive-home (FR-19) | Names ("Reply to <author>", "Branch from <author>'s message"); a 24 px minimum on `.rail-icon`; after hide, focus goes to the control that shows it again |
| 9 | The record's line is read as "… waiting owner pablo · 5d waiting" | U3 | 1 | DS | **decisions-view** | One "waiting". decisions-view's turnaround words ("after N days") already change the meta; its name follows the visible text |
| 10 | In a malformed roadmap, a tile whose stage id is a duplicate opens the other stage | hf-gap3 | 1 | Design | initiative-header | A tile opens its own stage by position, not by id. The problem is already reported (`checkStages`); nothing more is shown on the tile |
| 11 | A cell-state lozenge ("cell in definition") would be clipped mid-word if cut: it has no text span | wf code review (2) | 1 | DS | responsive-home | Widths: the ellipsis on the lozenge's text. The same fix as rh2-R1, for CellStateLz |

## Gates and fixtures (not UI changes)

| # | What | From | Direction |
|---|---|---|---|
| G-a | G15 checks "the all view unchanged", but the all-initiatives Agents view is not mounted | hf code review, U-gap | Drop the clause. If the view is ever mounted, its own card gates it |
| G-b | G12 does not say whether the strip may scroll out of view | hf-gap1 | Row 5 answers it: at compact the stage is in the bar, and the strip may scroll |
| G-c | FR-11 (a landing stores "folded") has no test | hf code review | The FSE's: a store test, or a gate row by hand |
| G-d | The fixture has no Needs me card row; no `--twenty` row cuts a lozenge or reaches "+N" by itself | both UI reviews | Add one card row whose next starts `pablo`, and one initiative with seven signals and a long waiting list, so rows 1, 3 and 11 can be seen without forcing the DOM |
| G-e | The boundary named `Roadmap.tsx`/`RoadmapView.tsx` for the stage word, which lives in `StageRoadmap.tsx` | hf code review | The FSE's: boundary correction, no UI |

## Not verified by anyone yet

WKWebView: every number is headless Chromium. Overlay scrollbars (row 5) and
font widths (rows 1, 3, 4) may differ in the real app. The batch's UI
reviewer should take one shot per row in the built app, as well as in
Chromium.
