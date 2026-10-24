# Ruling a question record (aglaea, 2026-10-24)

Amendments to the rule box for question records (`docs/specs/leftovers-49.md`
and its Amendment 1), answering l49-ui's UI review of lf49-rule-questions
(pass at 592359b; `working-on/lf49-rule-questions.md`, ## UI review).

## Amendment 1 (aglaea, 2026-10-24): from l49-ui, U1 to U4

- **U1: the chosen is read in full where the record is open, and floored
  per answer in the list.**
  - **The opened record's head** shows `Chosen` for every ruled record,
    plain or question. A question record gets one line per answer
    (`Q1 after-graph-performs-start-now`, `Q2 record-page`), in full,
    wrapping and never cut. Today the open record has the options and the
    Ruling words but not the one thing that was ruled.
  - **The list line** floors each answer, not the whole string: `Q1 after…,
    Q2 record…`, each `Q<n>` kept whole and its alternative cut to share
    the floor equally. The accessible name keeps the full chosen.
  - While a record is open under its own line, that line drops its chosen
    (a fact shows once per screen); it comes back when the record closes.
- **U2: the group is named by its question.** When the record's Question
  section has a `**Q<n>. …**` line, the legend reads `Q1 · Where in the
  order?`: the line without its markdown, wrapping in full and never cut,
  since it is the question being answered. When the line is missing, the
  legend reads `Q1` alone. The radio labels stay the alternatives verbatim.
- **U3: the foot says what is missing.** A question box can put a group
  below its own fold, which breaks the premise of the design system's
  incomplete treatment ("the missing input is in view"). Beside the
  disabled Rule, the foot says what is missing, in reading order, `sm`
  `--fg-muted`, linked to Rule by `aria-describedby`:
  - `Q2 not answered yet.`
  - `Q1 and Q2 not answered yet.` (three or more: `Q1, Q2 and Q3 …`)
  - `Your words are missing.` when only the words are.
  - Both missing: `Q2 not answered yet. Your words are missing.`

  The text updates silently, with no live region. It goes when Rule is
  enabled. The plain box keeps today's treatment unless its options run
  below the fold too; the design system now says when.
- **U4: the placeholder follows the record.** On a question record it is
  `Why these answers, in your words. They go under ## Ruling.`; on a plain
  record it stays `Why this option, …`.

| # | Pablo can | Checked by |
|---|---|---|
| Q1 | read what was ruled | open a ruled question record at 1024: its head shows `Chosen` with `Q1 …` and `Q2 …` in full; a plain ruled record shows its one option |
| Q2 | scan the list | at 1024 the Ruled list line of a two-answer record reads `Q1 <cut>…, Q2 <cut>…`; its accessible name has the full chosen |
| Q3 | hear the question | the group's accessible name is `Q1 · <the question's words>` when the record has the line, `Q1` when it does not |
| Q4 | know why Rule waits | Decisions at 1024, only Q1 picked and words written: beside Rule, `Q2 not answered yet.`, and Rule's description is that text |
| Q5 | read the right prompt | an empty words box reads `Why these answers, …` on a question record and `Why this option, …` on a plain one |

## Amendment 2 (aglaea, 2026-10-24): from the UI review of lf51-rule-words

- **UW1: the missing text has its own row, at every width.** It is the
  first row of the foot, full width and left-aligned with the box's
  content. The signature and the buttons keep their own row under it,
  as they are when nothing is missing. It never shares a line with the
  signature, so no width can squeeze either one; and one place at every
  width beats a layout that moves at a breakpoint. It wraps when it must.
  When Rule is enabled the row goes, and the foot is as on main.
- **UW2: whole answers when they fit.** The list line shows each answer
  whole while the line has room. The per-answer floor of A1 applies only
  when it does not: then each answer is cut, `Q<n>` kept whole, until the
  line fits. A plain line already works this way.
- **UW3: said once while open.** While its record is open under it, the
  line's accessible name drops the chosen too, matching what the line
  draws (A1). The name gets it back when the record closes.

| # | Pablo can | Checked by |
|---|---|---|
| Q4 (amended) | know why Rule waits | Decisions at 1024 and 1440 (the 354 px box) and Needs me: with Q1, Q2 and the words missing, the missing text is its own row above `signed … · commits one file` and the buttons; the signature reads in full on one line; Rule's description is the missing text |
| Q2 (amended) | scan the list | at 1440 a two-answer Ruled line reads both answers whole; at 1024, where it cannot, `Q1 <cut>…, Q2 <cut>…` |
| Q6 | hear the chosen once | with a ruled record open, its line's accessible name has no chosen; closed, it has the full chosen |
