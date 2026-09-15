import { useEffect, useState } from "react";
import { Bot, Plus } from "lucide-react";
import { api } from "../hooks/useWails";
import { since } from "../lib";
import { useBoard } from "../stores/board.store";
import { AgentList } from "./AgentList";
import { Crew } from "./Crew";
import { queueOf } from "../lib/queue";
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
        <CleanButton />
      </div>
      {groups.length === 0 && <div className="empty">No agents{selectedInitiative ? " in this initiative" : ""}.</div>}
      {groups.map((g) => (
        <section key={g.id} className="agent-group">
          <header className={`agent-group-head ${selectedInitiative ? "static" : ""}`}>
            <span className="agent-group-title" onClick={() => !selectedInitiative && setSelectedInitiative(g.id)} title={selectedInitiative ? "" : "Show only this initiative"}>
              <Bot size={14} />
              <span className="ident">{g.id}</span>
              {g.client && <span className="badge client">{g.client}</span>}
              <span className="meta">{g.agents?.length ?? 0} agents · {g.live} live · {g.working} working</span>
              {g.cell && <span className="meta">· {g.crew?.length ?? 0} seats</span>}
            </span>
            <span className="spacer" />
            {g.cell && queueOf(g, board).total > 0 && <button className="tiny-btn ghost hot" onClick={() => openSlack(g.id, null)} title="escalated to you, or asked of you: threads and cards">{queueOf(g, board).total} need you</button>}
            <NewAgent initiativeId={g.id} />
          </header>
          {g.cell && <Crew group={g} onMessage={g.can_post ? (seat) => openSlack(g.id, seat) : undefined} />}
          <AgentList agents={(g.agents ?? []).filter((a) => !g.cell || !a.persona)} root={g.path} onMessage={g.cell && g.can_post ? (p) => openSlack(g.id, p) : undefined} />
        </section>
      ))}
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
