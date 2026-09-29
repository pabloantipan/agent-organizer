import { useEffect, useState } from "react";
import { Bot, PencilRuler, Plus } from "lucide-react";
import { api } from "../hooks/useWails";
import { since } from "../lib";
import { useBoard } from "../stores/board.store";
import { AgentList } from "./AgentList";
import { CellStateLz, Crew } from "./Crew";
import { queueOf, readOnlyOf } from "../lib/queue";
import { CleanButton } from "./Retire";

const REFRESH_MS = 10_000;

/** Agents tab: processes and sessions grouped per initiative. The Go side
 *  samples every ten seconds and pushes the "agents" event; this view only
 *  renders the latest payload. Working = CPU time grew between samples. */
export function AgentsView() {
  const { selectedInitiative, setSelectedInitiative, agents: view, applyAgents, openSlack, view: board } = useBoard();

  useEffect(() => {
    if (!view) api.getAgents().then(applyAgents, () => undefined);
  }, [view, applyAgents]);

  if (!view) return <div className="empty">Sampling processes…</div>;
  // FR-13: an initiative that is not active is watched, not driven; the flag
  // goes down to its crew block and agent rows.
  const readOnly = readOnlyOf(board, selectedInitiative);

  const groups = (view.groups ?? []).filter((g) => (!selectedInitiative || g.id === selectedInitiative) && ((g.agents?.length ?? 0) > 0 || !!g.cell || g.id === selectedInitiative));
  const totals = (view.groups ?? []).reduce(
    (t, g) => ({ n: t.n + (g.agents?.length ?? 0), live: t.live + g.live, working: t.working + g.working }),
    { n: 0, live: 0, working: 0 },
  );

  return (
    <div className="agents-view">
      <div className="board-head">
        <h1>{selectedInitiative ? selectedInitiative : "Agents"}</h1>
        <span className="meta">
          {selectedInitiative ? "" : `${totals.n} agents, ${totals.live} live, ${totals.working} working · `}
          sampled {since(view.sampled_at)} · every {REFRESH_MS / 1000}s
        </span>
        <span className="spacer" />
        {readOnly ? <span className="meta">{readOnly}: read-only</span> : <CleanButton />}
      </div>
      {groups.length === 0 && <div className="empty">No agents{selectedInitiative ? " in this initiative" : ""}.</div>}
      {groups.map((g) => {
        const q = queueOf(g, board);
        const ro = readOnlyOf(board, g.id);
        return (
        <section key={g.id} className="agent-group">
          <header className={`agent-group-head ${selectedInitiative ? "static" : ""}`}>
            <span className="agent-group-title" onClick={() => !selectedInitiative && setSelectedInitiative(g.id)} title={selectedInitiative ? "" : "Show only this initiative"}>
              <Bot size={14} />
              <span className="ident">{g.id}</span>
              {g.client && <span className="badge client">{g.client}</span>}
              <span className="meta">{g.agents?.length ?? 0} agents · {g.live} live · {g.working} working</span>
              {g.cell && <span className="meta">· {g.crew?.length ?? 0} seats</span>}
              <CellStateLz cell={g.cell} />
            </span>
            <span className="spacer" />
            {g.cell && q.total > 0 && <button className="tiny-btn ghost hot" onClick={() => openSlack(g.id, null)} title="escalated to you, or asked of you: threads and cards">{q.total} need you</button>}
            {!ro && <NewAgent initiativeId={g.id} />}
          </header>
          {/* A roster seat's agent shows in the crew block above; an agent
              with a persona outside the roster (a supervisor, a builder, a
              guest) has no seat there, so it is listed here (FR-6). */}
          {g.cell && <Crew group={g} readOnly={!!ro} onMessage={g.can_post && !ro ? (seat) => openSlack(g.id, seat) : undefined} />}
          {!g.cell && selectedInitiative && !ro && <DraftCell initiativeId={g.id} />}
          <AgentList agents={(g.agents ?? []).filter((a) => !a.persona || !g.cell?.agents?.includes(a.persona))} root={g.path} readOnly={!!ro} onMessage={g.cell && g.can_post && !ro ? (p) => openSlack(g.id, p) : undefined} />
        </section>
        );
      })}
      {!selectedInitiative && (view.unassigned?.length ?? 0) > 0 && (
        <section className="agent-group">
          <header className="agent-group-head static">
            <Bot size={14} />
            <span className="ident">outside every initiative</span>
            <span className="meta">{view.unassigned.length}</span>
          </header>
          <AgentList agents={view.unassigned} />
        </section>
      )}
      <p className="meta hint">Working means the process used CPU since the previous sample. Attach opens the zellij session in iTerm2; plain terminals show their tty instead. Context fill comes from each agent's own statusline (<code>organizer statusline</code>). Agents with a seat in <code>agents/cell.json</code> can send and receive messages: Message opens them in Slack.</p>
    </div>
  );
}

/** Inline "new agent" control: opens a probe in the initiative directory, in
 *  the family named after the initiative. Empty name = animal name. */
function NewAgent({ initiativeId }: { initiativeId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const create = () => {
    api.createAgent(initiativeId, name.trim()).then(
      () => { setNote(`opening ${initiativeId}-probe-${name.trim() || "<animal>"}`); setOpen(false); setName(""); window.setTimeout(() => setNote(null), 4000); },
      (e) => setNote(String(e)),
    );
  };
  if (!open) {
    return (
      <span className="new-agent">
        {note && <span className="meta">{note}</span>}
        <button className="tiny-btn" onClick={() => setOpen(true)} title={`${initiativeId}-probe <name> in the initiative directory`}><Plus size={13} /> New agent</button>
      </span>
    );
  }
  return (
    <span className="new-agent">
      <span className="meta mono">{initiativeId}-probe-</span>
      <input
        autoFocus
        className="new-agent-name"
        placeholder="name, or empty for an animal"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") create(); if (e.key === "Escape") setOpen(false); }}
      />
      <button className="tiny-btn primary" onClick={create}>Start</button>
      <button className="tiny-btn ghost" onClick={() => setOpen(false)}>Cancel</button>
      {note && <span className="meta err">{note}</span>}
    </span>
  );
}

/** "Draft the cell" for an initiative without agents/cell.json
 *  (discovery-in-a-cell FR-3): opens a Terminal at the root running the
 *  agent told to follow the persona-agents skill's drafting procedure. The
 *  Go side is asked, opening nothing, whether it can run; its refusal is the
 *  disabled button's hover. Accepting the draft is its record's ruling, so
 *  there is no accept button here or anywhere. */
function DraftCell({ initiativeId }: { initiativeId: string }) {
  const board = useBoard((s) => s.view);
  const [blocked, setBlocked] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    api.draftCell(initiativeId, false).then(() => live && setBlocked(null), (e) => live && setBlocked(String(e).replace(/^Error:\s*/, "")));
    return () => { live = false; };
  }, [initiativeId, board]);

  const open = () => {
    setBusy(true);
    api.draftCell(initiativeId, true).then(
      () => { setNote("terminal opened: the session writes a draft roster and raises its accept record"); setAsking(false); },
      (e) => setNote(String(e)),
    ).finally(() => setBusy(false));
  };

  return (
    <div className="crew">
      <div className="crew-head">
        <PencilRuler size={14} aria-hidden="true" />
        <span className="meta">no cell: no <code>agents/cell.json</code> at the root</span>
        <span className="spacer" />
        {note && <span className="meta">{note}</span>}
        {!asking && blocked && <span className="meta">{blocked}</span>}
        {/* The hover sits on a wrapper: a disabled button gets no mouse
            events in WebKit, and its title is the only place the reason is. */}
        {!asking && (
          <span title={blocked ?? `organizer draft-cell ${initiativeId}: a session drafts the roster from the goal, scope and agents/people.md`}>
            <button className="tiny-btn primary" onClick={() => setAsking(true)} disabled={!!blocked}>
              <PencilRuler size={13} /> Draft the cell
            </button>
          </span>
        )}
        {asking && (
          <>
            <span className="meta">one Terminal at the root running the agent; it writes only under agents/ and working-on/decisions/</span>
            <button className="tiny-btn primary" onClick={open} disabled={busy}>{busy ? "Opening…" : "Open"}</button>
            <button className="tiny-btn ghost" onClick={() => setAsking(false)}>Cancel</button>
          </>
        )}
      </div>
    </div>
  );
}
