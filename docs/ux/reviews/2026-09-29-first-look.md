# First look — every top-level screen

- **Reviewed:** the organizer at main `e6f6970`, hot-reloaded to `b002aa3`
  (cell-definition-finish merged mid-review: the Launch row and the rail's
  "in definition" mark appear in the later screenshots).
- **How:** `wails dev` on `scripts/fixture-home.sh --twenty` (twenty fixture
  initiatives, four stand-in agents), driven in Chrome at 1440×900 and at the
  window's minimum, 1024×700 (`main.go:38-39`: `MinWidth 1024`,
  `MinHeight 640`, so ~400 px cannot happen and was not checked).
- **Method:** heuristic review (Nielsen's ten, WCAG 2.2 AA, the design
  system's principles by number). No user watched; every finding below is
  `heuristic`. Pablo is the one user; nothing here is `observed` yet.
- **Screens:** Home with Needs me, the Rule box from Needs me, one
  initiative's Overview, Work, Roadmap, Decisions (empty), Conversations
  (no cell), Agents (no cell), Help, Settings. Screenshots in
  `2026-09-29-first-look/`.
- **Not verified:** Conversations and Agents with a live cell (the fixture's
  `--twenty` has no mailbox), the Decisions tab with records expanded, Card
  back, Calendar, the collapsed rail, keyboard-only use, 200% zoom.

## Findings, most severe first

### F1 — at the smallest window, Home rows lose their names (3)

1. The lead cannot tell which initiative a Home row is: the name column
   shows four or five characters ("auth-", "bill", "clai…"), and the goal
   one word.
2. Home, `--twenty`, 1024×700, rail expanded; `2026-09-29-first-look/home-1024.png`
   (compare `home-1440.png`, where names fit and goals cut at ~25 chars).
3. `heuristic`: design system principle 2 (the content leads; here the rail,
   state, phase and stage columns keep their width and the name gives way),
   Nielsen 1 (visibility of status). The twenty-at-a-glance gate G9 was
   timed at 1440×900 only.
4. Severity **3**: the window allows it, and a half-screen window on a
   laptop is this size.
5. Proposal: the name never truncates below its longest id; columns that
   carry less (goal, next date, phase) give way first, or drop into the row's
   second line under a width.

### F2 — ruling from Needs me hides what is being ruled (3)

1. The lead rules a decision from Needs me without seeing the question, what
   each option means, or the recommendation: the box shows only the option
   ids and a text area. To read them he must leave for the initiative's
   Decisions tab, where the body is rendered (`DecisionsView.tsx:129`).
2. Home → Needs me → Rule on `claims-portal 0002`;
   `2026-09-29-first-look/needs-me-rule-0002-1440.png`.
3. `heuristic`: Nielsen 6 (recognition rather than recall), 5 (error
   prevention: a ruling is committed to git). The fixture's option ids are
   `a`, `b`, which exaggerates it; real records use words ("a Launch row in
   Needs me"), but their question and recommendation are still not shown.
4. Severity **3**: ruling is the job Needs me exists for (0019, 0034), and
   a wrong ruling costs a superseding record.
5. Proposal: the Rule box shows the record's Question and Recommendation
   (collapsed to a few lines, "more"), with a link to the full record.

### F3 — the state word and the signals disagree on one row (2)

1. The lead reads "quiet" on a row that also says "1 blocked" (infra-costs,
   blocked on "Wait for the finance export") or "1 waiting" (email-digest, a
   record the FSE owns). Quiet reads as "nothing to look at"; the signals say
   otherwise, and the blocked one is waiting on business in all but name.
2. Home, rows 9 and 11; `home-1440.png`.
3. `heuristic`: Nielsen 4 (consistency within the row), 2 (match with the
   real world). As built to spec: twenty-at-a-glance FR-6 derives "waits on
   business" from records only, and its rabbit holes rule out cards on
   purpose. This is a finding against the spec's choice, not a defect in the
   build.
4. Severity **2**.
5. Proposal: either the "waiting" signal says whose (`1 waiting · fse`), and
   "quiet" is renamed for what it is (nothing asks you or business), or a
   blocked card counts toward a waiting state. A question for the FSE and
   Pablo, not a card yet.

### Minor (1–2), recorded, not carried

- **F4 (2)** One agent, three words: Work says `running`, Agents says `idle`,
  Home says `1 live` (auth-gateway, token-cache). `work-…png`, `agents-…png`.
  Nielsen 4. Proposal: one word per state, from one table, as `health.ts`
  does for health.
- **F5 (2)** The rail's counts are three bare numbers (`1 0 1`) whose meaning
  is only in the summary card above, and a screen reader reads "1 auth-gateway
  planta 1 0 1". Position is allowed by principle 4, but nothing labels it on
  the row. Proposal: an accessible label per count ("1 now, 0 blocked,
  1 next") and a hover title.
- **F6 (2)** Conversations with no cell says what is missing but not how to
  get it, and offers no action (design system, Empty state: "one line of how
  to get it, one action"). `conversations-…png`. Agents, on the same
  initiative, offers Draft the cell.
- **F7 (2)** A disabled primary button (Draft the cell) sits at 60% opacity,
  where the design system says 45%; it reads as enabled beside its reason.
  `agents-…png`.
- **F8 (1)** Words: Agents' footer says "Message opens them in Slack" (the tab
  is Conversations); "1 agents"; Settings says "key prefix in Datastore" (it
  is Firestore) and shows the Cloud (Firebase) fields while identity is off.
- **F9 (1)** Needs me puts a solid accent button on every decision and
  launch row (three in view), against principle 3 ("one solid accent action
  per view"); the Inbox row anatomy asks for "one primary verb on the row".
  The two rules of the design system disagree; for the design system's owner.

## Top three, for the FSE

F1, F2, F3 above.
