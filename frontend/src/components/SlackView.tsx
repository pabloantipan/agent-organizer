import { useRef, useState } from "react";
import { MessagesSquare, Users, X } from "lucide-react";
import type { Seat } from "../hooks/useWails";
import { useBoard } from "../stores/board.store";
import { queueOf, readOnlyOf } from "../lib/queue";
import { ContextBar, WatcherBadge } from "./ContextBar";
import { HEALTH, peopleLabel } from "../lib/health";
import { Conversation } from "./Conversation";

const PEOPLE_KEY = "slack.people";

/** The Slack tab, laid out the way Teams lays out a channel: the rail is
 *  the team list, the stream is the channel, and the members live in a
 *  panel on the right that a button in the header opens and closes. Nothing
 *  selected lists every mailbox with what needs the human. The roster and
 *  threads ride the agents feed; only open conversations and the archive
 *  are fetched. Lifecycle stays in Agents. */
export function SlackView() {
  const { selectedInitiative, setSelectedInitiative, agents: view, slackFocus, setSlackFocus, view: board, widthClass } = useBoard();
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
  const cells = (view.groups ?? []).filter((g) => g.cell);

  if (!selectedInitiative) {
    return (
      <div>
        <div className="board-head"><h1>Slack</h1><span className="meta">one channel per initiative with an agents/cell.json. Pick one in the rail, or here.</span></div>
        {cells.length === 0 && <div className="empty">No initiative on this machine has a mailbox.</div>}
        <ul className="cells">
          {cells.map((g) => {
            const seats = g.crew ?? [];
            const reachable = seats.filter((s) => s.watcher === "alive").length;
            const q = queueOf(g, board);
            const deaf = q.deaf;
            const open = (g.threads ?? []).filter((t) => t.kind !== "journal").length;
            const hot = q.total + deaf > 0;
            return (
              <li key={g.id} className={`cell-row ${hot ? "hot" : ""}`} onClick={() => setSelectedInitiative(g.id)}>
                <span className="cell-ident">
                  <MessagesSquare size={14} />
                  <span className="ident">{g.id}</span>
                  {g.client && <span className="badge client">{g.client}</span>}
                  <span className="meta">{g.project}</span>
                </span>
                <span className="cell-stats">
                  <b className={q.total > 0 ? "hot" : ""}>{q.total}</b><span>need me</span>
                  <b>{g.needs_reconciler ?? 0}</b><span>need {g.cell?.reconciler || "the reconciler"}</span>
                  <b>{open}</b><span>open</span>
                  <b>{g.waiting?.length ?? 0}</b><span>cards waiting</span>
                  <b className={deaf > 0 ? "hot" : ""}>{reachable}/{seats.length}</b><span>reachable{q.capped > 0 ? <span title={HEALTH.capped.why}>, {q.capped} {HEALTH.capped.label}</span> : ""}{deaf > 0 ? <span title={HEALTH.deaf.why}>, {deaf} {HEALTH.deaf.label}</span> : ""}</span>
                </span>
                {g.discuss && <span className="badge watcher stale">{g.discuss}</span>}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const g = cells.find((c) => c.id === selectedInitiative);
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
function People({ seats, human, focus, onFocus, onClose }: { seats: Seat[]; human: string; focus: string | null; onFocus: (a: string | null) => void; onClose: () => void }) {
  return (
    <aside className="people">
      <div className="people-head"><Users size={13} /> <span>People</span> <span className="meta">{seats.length + (human ? 1 : 0)}</span> <span className="spacer" /><button className="rail-icon" onClick={onClose} title="hide" aria-label="Hide people"><X size={12} /></button></div>
      <ul>
        {human && (
          <li className="person me" title="you: the seat this app reads and posts as">
            <i className="dot running" /><span className="mono">{human}</span><span className="meta">you</span>
          </li>
        )}
        {seats.map((s) => (
          <li key={s.name} className={`person ${s.agent?.state ?? "off"} ${s.deaf && !s.capped ? "deaf" : ""} ${s.capped ? "capped" : ""} ${focus === s.name ? "active" : ""}`} onClick={() => onFocus(focus === s.name ? null : s.name)} title={`${s.agent ? s.agent.state : "no session"}. Click for the conversation with ${s.name}.`}>
            <i className={`dot ${s.agent?.state ?? "off"}`} />
            <span className="person-main">
              <span className="mono">{s.name}</span>
              <span className="person-meta">
                <WatcherBadge watcher={s.watcher} deaf={s.deaf} capped={s.capped} undelivered={s.undelivered} />
                {(s.owes?.length ?? 0) > 0 && <span className="badge owes" title={s.owes.map((o) => o.subject || o.id).join("\n")}>owes {s.owes.length}</span>}
              </span>
            </span>
            <ContextBar c={s.agent?.context} />
          </li>
        ))}
      </ul>
    </aside>
  );
}
