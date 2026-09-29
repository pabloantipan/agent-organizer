# Triage: the UI reviews' severity 2–1 leftovers

- **Asked by:** the FSE, thread 01M3Q04G1TTG9JX71GA5CKMWBW.
- **Sources:** the `## UI review` sections of
  `working-on/done/home-rule-and-rows.md` (U1–U8), `cell-screens-fix.md`
  (U1–U4) and `conform-and-waiting.md` (C1–C6), plus sup19's closing notes.
  Checked against main at `cc4c974`. Findings below are cited as `hr-U1`,
  `cs-U1` and `cw-C1`.
- **Already fixed:** `hr-U8`, the Needs me row verbs, fixed by
  conform-and-waiting. Every other finding is still true on main.
  `hr-U5` checked in code: `RuleDecisionBox.tsx:108` still calls
  `openInitiative(…, "decisions")`, not `openDecision`.
- **Design system, amended in the same commit as this file:** a new section,
  **Focus and names**, and "said once per view" under Disabled actions. With
  them, the focus findings and the no-token finding become conformance: the
  rule now exists, and the code must follow it.

## Categories

- **DS**: conformance to `docs/design-system.md`. The rule is written, so no
  one needs to decide anything; spec it.
- **Design**: a behaviour or wording the design system does not fix. My call,
  proposed here; you spec it. Pablo sees it in the batch's accept record.
- **Pablo**: needs his word, because it depends on how he uses the app or
  names himself.
- **Fixture**: not a UI change; it is why something could not be verified.

## The list, ranked

| # | What the lead cannot do, or does wrong | From | Sev | Kind | Direction |
|---|---|---|---|---|---|
| 1 | Rules without the Recommendation in view. The clamp shows part of the Question and a repeated Options list, and cuts a heading in half | hr-U1, hr-U4 | 2 | Design | The rule box shows `## Question` and `## Recommendation`, each clamped at a block boundary with "more". It drops `## Options`, since the radio buttons carry it. The full record stays one link away. This amends lead-side-fixes FR-1 ("clamp the whole body") |
| 2 | Loses their place with the keyboard: the rule box opens on the first radio and the body is never read; after Open, Launch, the roster link, Draft the cell or Cancel, focus falls to the page body; Escape does not close Draft the cell's confirm | hr-U2, hr-U7, cs-U1, cs-U4, cw (Escape) | 2 | DS | Focus and names, bullets 1–4: into the box on its title, with the body as `aria-describedby`; back to the opener on close; on the named thing after a navigation (the record's row, the blocked seat, Bring crew up); Escape closes every confirm |
| 3 | Hears "Rule, button" four times with no record in the name | cw-C4 | 2 | DS | Focus and names, bullet 5: "Rule init-a 0002", "Open onboarding-flow Step map", "Launch init-ready" |
| 4 | Must scroll Home to reach the rule box's Rule and Cancel at the minimum window, and at 1440 on a long roster record | hr-U3 | 2 | Design | Cap the box at the viewport minus the top bar. The record scrolls inside it, and the options, words and buttons stay in view. Becomes a component rule for Overlay once built |
| 5 | In Conversations, the accent marks every row (Discuss, Answer, Open) and the People toggle, not the commit | cw-C1, sup19 | 2 | DS | Principle 3 and Inbox row: the row verbs are default buttons. The People toggle is a disclosure: `aria-pressed` and `--surface-selected`, never the accent |
| 6 | Reads "no token" three ways on one screen, one of them a raw OS error with a path, one in the danger role | cw-C2, sup19 | 2 | DS | Disabled actions, "said once per view": keep FR-12's chat-list line as the only reason. The composer is not drawn without a token ("never here"), and the header says "read only" with no error text |
| 7 | Reads the wrong blocker for init-define: "waits on its first launch" beside "no persona file", in the Crew header and in the rail's hover | cs-U2 (the rail's hover checked in `Rail.tsx:224`) | 2 | Design | Wherever `IN_DEFINITION_WAITS` shows, it gives way to the missing file, as the Needs me row already does (lead-side-fixes FR-3): "designer_diego has no persona file" |
| 8 | The rule box's "0002 in Decisions" opens Decisions with nothing expanded | hr-U5 | 2 | DS | Focus and names, bullet 3: call `openDecision` (cell-screens-fix FR-6), which exists now. A one-line fix |
| 9 | At 1024×640, Home rows take two lines, so about three initiatives show under Needs me, and the stage column is now what cuts | hr-U6 | 2 | **Pablo** | Ask Pablo: at which window does he read Home? If 1024 is real, the stage keeps only its number and title there. If he reads at 1440 or wider, keep it as built. twenty-at-a-glance should say which width "at a glance" means |
| 10 | Is not told who writes the missing persona file | cs-U3 | 1 | DS | Disabled actions ("who or what fixes it"): "no persona file: agents/designer_diego.md; the drafting session writes it, or write it by the persona-agents skill" |
| 11 | Sees Rule open on Home look like Rule closed, while in Conversations it turns selected | cw-C3 | 1 | DS | Focus and names, last bullet: Home's open Rule gets `--surface-selected` too, and keeps `aria-expanded` |
| 12 | Reads "owner —" on the row and "no owner" in the signal for the same record | cw-C5 (first half) | 1 | Design | One phrase everywhere: "no owner" |
| 13 | Reads himself in the third person: "waits on you" beside "1 waiting · pablo" | cw-C5 (second half) | 1 | **Pablo** | Ask Pablo: "you" or his name? My recommendation is "you", with the name kept for other people. Assumption A1 (the lead is the cell's human, else pablo) already decides who "you" is |
| 14 | A card back with no cell promises "Write about this card", which is not drawn | cw-C6 | 1 | Design | Drop that clause from the hint when there is no cell |

## Not a UI change: what could not be verified

| # | Gap | From | Kind | Direction |
|---|---|---|---|---|
| V1 | No fixture thread asks the human, so Answer on Home and the worklist's thread rows (Answer, Open, Rule on a thread) were never seen | sup19, cw Not verified | Fixture | A canned thread in the fixture's health or mailbox double, addressed to the human |
| V2 | The fixture's roster record has no seat lines, so the rule box's roster view cannot be seen | hr spec gaps | Fixture | A roster record shaped like drafting.md §5 in init-drafted |
| V3 | "canned health: no project …" crowds every fixture Crew header at 1024 | cs spec gaps | Fixture | The canned file names the fixture's cell projects |
| V4 | No review has seen WKWebView, VoiceOver, or Draft the cell's opened and error states with a real Open | all three | — | Keep them in "not verified" until someone runs the installed app. The G5 double covers the states |

## Parked from my first look, still not carried

Recorded so that nothing is lost; I do not ask for them now. F4 (one agent,
three state words), F5 (rail counts without labels), F6 (Conversations'
no-cell empty state has no action), F8 (stale words: "Slack", "Datastore"),
first-look C9 and C10. F4 is the only one I would bring back: it is the
same rule as row 12, one word per state.

## How the batch could split

- **One card, all conformance and design, frontend only:** rows 1–8, 10–12
  and 14. Most are small, and rows 2, 3 and 11 are one pass over the same
  components.
- **Pablo's two words** (rows 9 and 13) fit one record with two questions.
- **The fixture** (V1–V3) is its own small card, or folds into the first
  card's boundary, so its UI reviewer can see Answer.
