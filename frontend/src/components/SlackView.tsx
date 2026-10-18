import { useId, useRef, useState } from "react";
import { Users, X } from "lucide-react";
import type { Seat } from "../hooks/useWails";
import { useBoard } from "../stores/board.store";
import { queueOf, readOnlyOf } from "../lib/queue";
import { ContextBar } from "./ContextBar";
import { HEALTH, healthState, healthTitle, messages, peopleLabel, type HealthState } from "../lib/health";
import { plural } from "../lib/initiatives";
import { stateWord } from "../lib/stateWords";
import { WORDS } from "../lib/review";
import { Conversation } from "./Conversation";

const PEOPLE_KEY = "slack.people";

/** The Slack tab, laid out the way Teams lays out a channel: the rail is
 *  the team list, the stream is the channel, and the members live in a
 *  panel on the right that a button in the header opens and closes. The roster and
 *  threads ride the agents feed; only open conversations and the archive
 *  are fetched. Lifecycle stays in Agents. */
export function SlackView() {
  const { selectedInitiative, agents: view, slackFocus, setSlackFocus, view: board, widthClass, reviewBack, backToReview } = useBoard();
  // People starts closed at compact, so the timeline keeps the width
  // (initiative-header FR-6); the stored choice is untouched until toggled.
  const [people, setPeople] = useState<boolean>(() => { try { return localStorage.getItem(PEOPLE_KEY) !== "closed" && useBoard.getState().widthClass !== "compact"; } catch { return true; } });
  // People is a disclosure, not a commit: aria-pressed and the selected
  // surface while open, never the accent (ui-leftovers FR-7).
  const togglePeople = () => { const next = !people; setPeople(next); try { localStorage.setItem(PEOPLE_KEY, next ? "open" : "closed"); } catch { /* per-viewer convenience */ } };
  // The panel's hide unmounts with the panel: focus goes to the toggle that
  // shows it again, not to the page body (responsive-home FR-24).
  const peopleToggle = useRef<HTMLButtonElement>(null);
  const hidePeople = () => { togglePeople(); peopleToggle.current?.focus(); };
  if (!view) return <div className="empty">Sampling…</div>;
  // leftovers-25 FR-5: Conversations mounts only under an initiative (the
  // rail and Home choose it), so there is no list of cells to pick from.
  const cells = (view.groups ?? []).filter((g) => g.cell);

  const g = cells.find((c) => selectedInitiative === c.id);
  if (!g) {
    return (
      <div>
        <div className="empty">No mailbox: this initiative has no agents/cell.json, so its agents cannot send or receive messages.</div>
      </div>
    );
  }
  const seats = g.crew ?? [];
  const live = seats.filter((s) => s.agent && (s.agent.state === "working" || s.agent.state === "running")).length;
  // Deaf and capped come from the queue, so a cell that is not active counts
  // none (FR-13); the read-only flag goes down to the conversation.
  const { deaf, capped } = queueOf(g, board);
  const readOnly = readOnlyOf(board, g.id);
  return (
    <div className={`slack ${widthClass}`}>
      {/* No title row: the header above names the initiative (initiative-header
          FR-5); what is not the id stays on this toolbar line. */}
      <div className="slack-tools">
        <ReviewBack initiative={g.id} reviewBack={reviewBack} onBack={backToReview} />
        <span className="spacer" />
        {slackFocus && <span className="badge persona focus">with {slackFocus} <button className="rail-icon" onClick={() => setSlackFocus(null)} title="back to the channel"><X size={11} /></button></span>}
        <button ref={peopleToggle} className={`tiny-btn ${deaf > 0 ? "hot" : ""}`} aria-pressed={people} aria-label={peopleLabel({ seats: seats.length, live, capped, deaf })} onClick={togglePeople} title={people ? "hide people" : "show people"}>
          <Users size={13} /> {seats.length}{live > 0 ? ` · ${live} live` : ""}{capped > 0 ? ` · ${capped} ${HEALTH.capped.label}` : ""}{deaf > 0 ? ` · ${deaf} ${HEALTH.deaf.label}` : ""}
        </button>
      </div>
      <div className={`slack-body ${people ? "with-people" : ""}`}>
        <Conversation key={g.id} group={g} focus={slackFocus} onFocus={setSlackFocus} readOnly={readOnly} />
        {people && <People seats={seats} human={g.human} focus={slackFocus} onFocus={setSlackFocus} onClose={hidePeople} />}
      </div>
    </div>
  );
}

/** `← Review` (review-map v3 FR-29): Conversations opened from the Review
 *  screen's Open the thread returns to the same symbol; the place rides
 *  the store (reviewBack). */
export function ReviewBack({ initiative, reviewBack, onBack }: { initiative: string; reviewBack: { initiative: string } | null; onBack: () => void }) {
  if (reviewBack?.initiative !== initiative) return null;
  return <button className="ghost" data-review-back onClick={onBack}>{WORDS.backToReview}</button>;
}

/** The members panel: one row per seat, the human included, with the
 *  liveness facts that matter for a conversation. Click a seat for the
 *  direct view with it; that is the DM. */
export function People({ seats, human, focus, onFocus, onClose }: { seats: Seat[]; human: string; focus: string | null; onFocus: (a: string | null) => void; onClose: () => void }) {
  const idBase = useId();
  return (
    <aside className="people">
      <div className="people-head"><Users size={13} /> <span>People</span> <span className="meta">{seats.length + (human ? 1 : 0)}</span> <span className="spacer" /><button className="rail-icon" onClick={onClose} title="hide" aria-label="Hide people"><X size={12} /></button></div>
      <ul>
        {human && (
          <li className="person me" title="you: the seat this app reads and posts as">
            <i className="dot running" /><span className="mono">{human}</span><span className="meta">you</span>
          </li>
        )}
        {seats.map((s) => {
          // leftovers-25 FR-1: the short name is the verb; what the row draws
          // is its description, one line of facts each with its noun
          // (leftovers-26 FR-4). The dot's word is said, since a colour is not.
          const d = `${idBase}-${s.name}`;
          return (
          <li key={s.name}>
            {/* leftovers-24 FR-3: shows the chat in place, so a button (F3).
                leftovers-25 FR-3: it stays mounted and keeps focus; the chat
                it shows does not take it (Conversation's askedNew). */}
            <button type="button" className={`person ${s.agent?.state ?? "off"} ${s.deaf && !s.capped ? "deaf" : ""} ${s.capped ? "capped" : ""} ${focus === s.name ? "active" : ""}`} aria-label={`Chat with ${s.name}`} aria-describedby={`${d}-facts`} aria-current={focus === s.name ? "true" : undefined} onClick={() => onFocus(focus === s.name ? null : s.name)} title={`${s.agent ? s.agent.state : "no session"}. Click for the conversation with ${s.name}.`}>
            <i className={`dot ${s.agent?.state ?? "off"}`} />
            <span className="sr-only" id={`${d}-facts`}>{personFacts(s)}</span>
            <span className="person-main">
              <span className="mono">{s.name}</span>
              <span className="person-meta">
                <span className="person-watch"><PersonBadge s={s} /></span>
                {(s.owes?.length ?? 0) > 0 && <span className="badge owes" title={s.owes.map((o) => o.subject || o.id).join("\n")}>owes {s.owes.length}</span>}
              </span>
            </span>
            <span className="person-ctx"><ContextBar c={s.agent?.context} /></span>
            </button>
          </li>
          );
        })}
      </ul>
    </aside>
  );
}

/** A person's mail word as its badge draws it (leftovers-29 FR-6,
 *  launch-progress Amendment 1 to A3 §2): the word, then `· n waiting`
 *  whenever mail waits, deaf included, since for deaf and capped the count is
 *  the evidence for the word, and personFacts says the same count. Null
 *  without a watcher. */
export function personBadge(s: Pick<Seat, "watcher" | "deaf" | "capped" | "undelivered">): { state: HealthState; words: string } | null {
  const state = s.watcher ? healthState({ watcher: s.watcher, deaf: s.deaf, capped: s.capped }) : undefined;
  if (!state) return null;
  const waiting = s.undelivered ?? 0;
  return { state, words: `${HEALTH[state].label}${waiting > 0 ? ` · ${waiting} waiting` : ""}` };
}

function PersonBadge({ s }: { s: Pick<Seat, "watcher" | "deaf" | "capped" | "undelivered"> }) {
  const b = personBadge(s);
  if (!b) return null;
  return <span className={`badge watcher ${b.state.replace(" ", "-")}`} title={healthTitle(b.state, s.undelivered ?? 0)}>{b.words}</span>;
}

/** A person row's description (leftovers-26 FR-4, T23): `session <word>,
 *  mail <word>, <n> message(s) waiting, owes <n> message(s), context <n>%`,
 *  each fact with its noun first and the mail word from HEALTH. A fact the
 *  row does not draw is not said: no mail word without a watcher, the
 *  waiting count right after the mail word whatever the word and only when
 *  mail waits (leftovers-27 FR-9), owes only when it owes, no context before
 *  the statusline reported one. */
export function personFacts(s: Pick<Seat, "agent" | "watcher" | "deaf" | "capped" | "owes" | "undelivered">): string {
  const session = s.agent ? (s.agent.state === "working" || s.agent.state === "running" ? "live" : stateWord(s.agent.state)) : "off";
  const facts = [`session ${session}`];
  const mail = s.watcher ? healthState({ watcher: s.watcher, deaf: s.deaf, capped: s.capped }) : undefined;
  if (mail) facts.push(`mail ${HEALTH[mail].label}`);
  const waiting = s.undelivered ?? 0;
  if (mail && waiting > 0) facts.push(`${messages(waiting)} waiting`);
  const owes = s.owes?.length ?? 0;
  if (owes > 0) facts.push(`owes ${plural(owes, "message")}`);
  const c = s.agent?.context;
  if (c) facts.push(c.window_size ? `context ${Math.max(0, Math.min(100, Math.round(c.used_percent)))}%` : "context unknown");
  return facts.join(", ");
}
