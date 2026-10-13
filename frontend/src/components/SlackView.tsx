import { useId, useRef, useState } from "react";
import { Users, X } from "lucide-react";
import type { Seat } from "../hooks/useWails";
import { useBoard } from "../stores/board.store";
import { queueOf, readOnlyOf } from "../lib/queue";
import { ContextBar, WatcherBadge } from "./ContextBar";
import { HEALTH, peopleLabel } from "../lib/health";
import { stateWord } from "../lib/stateWords";
import { Conversation } from "./Conversation";

const PEOPLE_KEY = "slack.people";

/** The Slack tab, laid out the way Teams lays out a channel: the rail is
 *  the team list, the stream is the channel, and the members live in a
 *  panel on the right that a button in the header opens and closes. The roster and
 *  threads ride the agents feed; only open conversations and the archive
 *  are fetched. Lifecycle stays in Agents. */
export function SlackView() {
  const { selectedInitiative, agents: view, slackFocus, setSlackFocus, view: board, widthClass } = useBoard();
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
          // (live or off, the watcher's word, what it owes, context) is its
          // description. The dot's word is said, since a colour is not.
          const d = `${idBase}-${s.name}`;
          return (
          <li key={s.name}>
            {/* leftovers-24 FR-3: shows the chat in place, so a button (F3).
                leftovers-25 FR-3: it stays mounted and keeps focus; the chat
                it shows does not take it (Conversation's askedNew). */}
            <button type="button" className={`person ${s.agent?.state ?? "off"} ${s.deaf && !s.capped ? "deaf" : ""} ${s.capped ? "capped" : ""} ${focus === s.name ? "active" : ""}`} aria-label={`Chat with ${s.name}`} aria-describedby={`${d}-state ${d}-meta ${d}-ctx`} aria-current={focus === s.name ? "true" : undefined} onClick={() => onFocus(focus === s.name ? null : s.name)} title={`${s.agent ? s.agent.state : "no session"}. Click for the conversation with ${s.name}.`}>
            <i className={`dot ${s.agent?.state ?? "off"}`} />
            <span className="sr-only" id={`${d}-state`}>{s.agent ? (s.agent.state === "working" || s.agent.state === "running" ? "live" : stateWord(s.agent.state)) : "off"}</span>
            <span className="person-main">
              <span className="mono">{s.name}</span>
              <span className="person-meta" id={`${d}-meta`}>
                <WatcherBadge watcher={s.watcher} deaf={s.deaf} capped={s.capped} undelivered={s.undelivered} />{" "}
                {(s.owes?.length ?? 0) > 0 && <span className="badge owes" title={s.owes.map((o) => o.subject || o.id).join("\n")}>owes {s.owes.length}</span>}
              </span>
            </span>
            <span className="person-ctx" id={`${d}-ctx`}><ContextBar c={s.agent?.context} /></span>
            </button>
          </li>
          );
        })}
      </ul>
    </aside>
  );
}

