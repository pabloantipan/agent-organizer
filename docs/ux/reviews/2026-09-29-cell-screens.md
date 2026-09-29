# Stage 5's cell screens (cell-draft, cell-definition-finish)

- **Asked by:** the FSE, thread 01M3PVQZ7JS5F40030Z09M2NMS, five points.
- **Reviewed:** main `b002aa3` (8004e3f cell-draft, b002aa3
  cell-definition-finish), spec `docs/specs/discovery-in-a-cell.md`
  amendment 1, FR-1, FR-3, FR-5, FR-6, FR-7.
- **How:** `wails dev` on `scripts/fixture-home.sh` (init-draftable,
  init-nopeople, init-drafted, init-define), Chrome at 1440×900. Screenshots
  in `2026-09-29-cell-screens/`.
- **Method:** heuristic review (Nielsen, WCAG 2.2 AA, the design system);
  C3 and C4 come from reading `AgentsView.tsx:132-179`, because pressing
  **Open** starts a real Claude session, so I did not press it.
- **Not verified:** Draft the cell's Open, its success and its error (no
  gate pressed it either); what the view shows while a drafting session runs.

## Verdict per point

1. **Draft the cell, enabled and disabled:** both states read well. The
   disabled one shows its reason as text beside the button and says who fixes
   it ("the FSE's intake writes it"). The confirm step says what will run and
   what it may write. The gaps are the states after Open (C3, C4).
2. **A drafted cell:** "in definition" and "waits on 0001 the-cell-roster"
   are clear. The link lands on Decisions with nothing opened (C5).
   Bring crew up's reason is hover only (C2).
3. **Rail mark:** it passes. Expanded, it is a worded lozenge. Collapsed, it
   is an icon of about 9 px beside the rank, and the words are in the hover
   (C9).
4. **The Launch row:** it dead-ends when the cell cannot launch (C1). The
   subtitle is stale (C7).
5. **Disabled at .6:** I agree. The design system says 45% (C8).

## Findings, most severe first

### C1: Launch promises what the lead cannot do (3)

1. The lead presses **Launch** on "init-define … waits on its first launch"
   and lands on Agents, where Bring crew up is disabled: one seat has no
   persona file. The row names the wrong blocker, and its verb says "launch"
   but only navigates.
2. Home → Needs me, cell row → Launch; `home-1440.png`,
   `launch-lands-agents-init-define-1440.png`.
3. `heuristic`: Nielsen 1 (status), 2 (words match the outcome), 9 (say
   what went wrong).
4. Severity **3**. The row is the only thing asked of the lead about that
   cell, and it sends him to a dead end.
5. Proposal: when a seat has no persona file, the row says so ("designer_diego
   has no persona file") with the verb **Open**. **Launch** stays for a cell
   that can launch, and its landing puts the focus on Bring crew up.

### C2: Bring crew up hides why it is disabled (3)

1. The lead sees a disabled Bring crew up and no reason. The reason
   ("no persona file: agents/designer_diego.md" or "draft roster: nothing
   launches until 0001 …") lives only in a `title` on a wrapper span. No
   keyboard or screen reader reaches it, because a disabled button takes no
   focus, and a mouse user must guess to hover.
2. Agents on init-define and on init-drafted;
   `launch-lands-agents-init-define-1440.png`, `agents-init-drafted-1440.png`.
   The Crew row already shows "no persona file" on the seat, which helps.
3. `heuristic`: Nielsen 1; WCAG 1.3.1 and 2.1.1. FR-6 says "its hover
   names", so the build meets the spec. **This is a spec gap, not a
   builder's fault.**
4. Severity **3**.
5. Proposal: show the reason as text beside the button, as Draft the cell
   already does (`AgentsView.tsx:160`). One pattern for every disabled
   action.

### C3: Draft the cell can be pressed twice (3, from code)

1. After Open succeeds, the note "terminal opened…" appears and Draft the
   cell comes back **enabled**. `blocked` stays null until `cell.json`
   exists, so a second press opens a second drafting session on the same
   root, writing the same `agents/`.
2. `AgentsView.tsx:145-150` and `163-169`. Not pressed; read.
3. `heuristic`: Nielsen 5 (error prevention).
4. Severity **3**. Two sessions drafting one roster collide, and each costs
   a session.
5. Proposal: after Open, the button becomes "Drafting… (terminal open)",
   disabled, until the draft appears or the prompt file is older than a
   bound. Whether the Go side should also refuse a second draft is yours to
   decide.

### C4: the states the spec did not name (2, spec gap, your question)

What each state should be:

| state | today (`AgentsView.tsx`) | should be |
|---|---|---|
| checking (preflight in flight) | the button is **enabled** until the answer arrives | disabled, no reason text; or not drawn until the answer |
| confirm | the words and Open / Cancel: good | as is |
| opening | "Opening…": good | as is |
| opened | "terminal opened: the session writes a draft roster and raises its accept record", beside an enabled button (C3) | "Drafting in a Terminal: the draft shows here as *in definition*, and its accept record in Needs me." Button disabled (C3) |
| error on Open | `String(e)` with its "Error:" prefix, as plain meta text styled like the success note; confirm stays open | what failed and what to do, in the danger role: "The Terminal did not open: <reason>. Run `organizer draft-cell <id>` in a terminal at the root." Prefix stripped; confirm stays for a retry |

### C5: the record link opens nothing (2)

1. "waits on 0001 the-cell-roster" opens Decisions but does not expand or
   highlight 0001, so the lead must find and click it again.
2. `roster-record-init-drafted-1440.png`.
3. `heuristic`: Nielsen 7. `openNeedsMe` already highlights a row, and this
   link could land the same way.
4. Severity **2**.
5. Proposal: land with 0001 expanded, as the Needs me keys do.

### C6: accepting a roster without seeing it (2; same as first-look F2)

The Needs me Rule box for "init-drafted 0001 Is this the cell for the first
stage?" (accept / accept with edits / redraft) shows neither the seats nor
the record's body. Accepting a roster blind is F2 at its worst. One fix
covers both: show the question and recommendation in the box.

### Minor

- **C7 (1)** The Needs me subtitle, "decisions, threads, cards and seats",
  misses cells. Any list of kinds will drift again; "everything waiting on
  you, oldest first" will not.
- **C8 (2)** Disabled primary at `.6`, where the design system says 45%. At
  .6 it reads as enabled beside the enabled purple (compare
  `agents-init-draftable-1440.png` and `agents-init-nopeople-1440.png`).
  It is one rule for every button, and it is first-look F7.
- **C9 (1)** The collapsed rail's mark is about 9 px and magenta, beside
  the rank; the hover has the words (`rail-collapsed-1440.png`). It meets
  FR-1. It is small, but acceptable in a strip whose whole job is the hover.
- **C10 (1)** "Retire…" on a cell that never ran (FR-5, as specified).
  Retire reads as "end a wave"; for a roster being defined, the act is
  "remove seats". Noted, not carried.

## Top three, for the FSE

C1, C2, C3. C4 is the answer to your question on loading and error states.
