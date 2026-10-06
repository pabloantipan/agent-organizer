import { useEffect, useId, useRef, useState } from "react";
import { Bot, PencilRuler, Plus } from "lucide-react";
import { api, type AgentGroup } from "../hooks/useWails";
import { since } from "../lib";
import { useBoard } from "../stores/board.store";
import { AgentList } from "./AgentList";
import { CellStateLz, Crew } from "./Crew";
import { missingPersonas, queueOf, readOnlyOf } from "../lib/queue";
import { escapeCloses, useConfirmFocus } from "../lib/focus";
import { CleanButton } from "./Retire";
import { Usage as fetchUsage } from "../../wailsjs/go/main/App";
import { agentsWeekLine } from "../lib/usage";

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
  // initiative-header FR-13: with one initiative selected its group head
  // would repeat the id and client the header shows; its counts and New
  // agent sit on the toolbar line instead. The all view keeps the head.
  const sel = selectedInitiative ? groups.find((g) => g.id === selectedInitiative) : undefined;
  const selQ = sel ? queueOf(sel, board) : null;

  return (
    <div className="agents-view">
      <div className="board-head">
        {!selectedInitiative && <h1>Agents</h1>}
        <span className="meta">
          {selectedInitiative ? (sel ? `${countsOf(sel)} · ` : "") : `${totals.n} agents, ${totals.live} live, ${totals.working} working · `}
          sampled {since(view.sampled_at)} · every {REFRESH_MS / 1000}s
        </span>
        {sel && <CellStateLz cell={sel.cell} missing={missingPersonas(sel.crew)} />}
        {sel && <WeekLine initiativeId={sel.id} />}
        <span className="spacer" />
        {sel?.cell && selQ && selQ.total > 0 && <button className="tiny-btn ghost hot" onClick={() => openSlack(sel.id, null)} title="escalated to you, or asked of you: threads and cards">{selQ.total} need you</button>}
        {sel && !readOnly && <NewAgent initiativeId={sel.id} />}
        {readOnly ? <span className="meta">{readOnly}: read-only</span> : <CleanButton />}
      </div>
      {groups.length === 0 && <div className="empty">No agents{selectedInitiative ? " in this initiative" : ""}.</div>}
      {groups.map((g) => {
        const q = queueOf(g, board);
        const ro = readOnlyOf(board, g.id);
        return (
        <section key={g.id} className="agent-group">
          {!selectedInitiative && (
          <header className="agent-group-head">
            <span className="agent-group-title" onClick={() => setSelectedInitiative(g.id)} title="Show only this initiative">
              <Bot size={14} />
              <span className="ident">{g.id}</span>
              {g.client && <span className="badge client">{g.client}</span>}
              <span className="meta">{countsOf(g)}</span>
              <CellStateLz cell={g.cell} missing={missingPersonas(g.crew)} />
            </span>
            <span className="spacer" />
            {g.cell && q.total > 0 && <button className="tiny-btn ghost hot" onClick={() => openSlack(g.id, null)} title="escalated to you, or asked of you: threads and cards">{q.total} need you</button>}
            {!ro && <NewAgent initiativeId={g.id} />}
          </header>
          )}
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
/** A group's counts: in its head in the all view, on the toolbar line with
 *  one initiative selected (initiative-header FR-13). */
const countsOf = (g: AgentGroup) =>
  `${g.agents?.length ?? 0} agents · ${g.live} live · ${g.working} working${g.cell ? ` · ${g.crew?.length ?? 0} seats` : ""}`;

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

/** Initiatives whose drafting Terminal this app opened. Module state on
 *  purpose: Draft the cell stays "Drafting…" across navigation until
 *  agents/cell.json appears or the app reloads (lead-side-fixes FR-5, A2),
 *  since nothing tells the service a drafting session still runs. */
const drafting = new Set<string>();

/** "Draft the cell" for an initiative without agents/cell.json
 *  (discovery-in-a-cell FR-3): opens a Terminal at the root running the
 *  agent told to follow the persona-agents skill's drafting procedure. The
 *  Go side is asked, opening nothing, whether it can run; its refusal is the
 *  reason beside the disabled button. Accepting the draft is its record's
 *  ruling, so there is no accept button here or anywhere.
 *
 *  States (lead-side-fixes FR-5): checking (disabled, no reason until the
 *  preflight answers), ready, confirm and opening, opened ("Drafting…",
 *  disabled), error on Open (in the danger role, the confirm kept for a
 *  retry), refused (the preflight's reason). */
function DraftCell({ initiativeId }: { initiativeId: string }) {
  const board = useBoard((s) => s.view);
  // The preflight's answer and the initiative it is for: checking until the
  // first answer for this initiative; later rechecks keep the last answer.
  const [answer, setAnswer] = useState<{ id: string; blocked: string | null } | null>(null);
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opened, setOpened] = useState(() => drafting.has(initiativeId));
  const reasonId = useId();
  // Focus and names (ui-leftovers FR-5): the confirm opens on Open; Cancel
  // and Escape go back to Draft the cell; after Open, the button reads
  // "Drafting…" disabled, so focus goes to the line that says so.
  const drafted = useRef<HTMLSpanElement>(null);
  const { opener: draftBtn, commit: openBtn } = useConfirmFocus(asking, drafted);

  // An answer is kept whenever it is for the initiative on screen: a board
  // update reissues the preflight, and dropping the one in flight would
  // leave the button checking while updates come faster than answers.
  const current = useRef(initiativeId);
  current.current = initiativeId;
  useEffect(() => {
    const live = () => current.current === initiativeId;
    setOpened(drafting.has(initiativeId));
    api.draftCell(initiativeId, false).then(
      () => live() && setAnswer({ id: initiativeId, blocked: null }),
      (e) => {
        if (!live()) return;
        const why = String(e).replace(/^Error:\s*/, "");
        // The draft's cell.json is there: the session wrote it.
        if (why.includes("agents/cell.json exists")) { drafting.delete(initiativeId); setOpened(false); }
        setAnswer({ id: initiativeId, blocked: why });
      },
    );
  }, [initiativeId, board]);

  const checking = answer?.id !== initiativeId;
  const blocked = checking ? null : answer.blocked;

  const open = () => {
    setBusy(true);
    setError(null);
    api.draftCell(initiativeId, true).then(
      () => { drafting.add(initiativeId); setOpened(true); setAsking(false); },
      (e) => setError(String(e).replace(/^Error:\s*/, "").replace(/\.$/, "")),
    ).finally(() => setBusy(false));
  };
  const cancel = () => { setAsking(false); setError(null); };

  return (
    <div className="crew">
      <div className="crew-head">
        <PencilRuler size={14} aria-hidden="true" />
        <span className="meta">no cell: no <code>agents/cell.json</code> at the root</span>
        <span className="spacer" />
        {opened && !blocked && <span ref={drafted} tabIndex={-1} id={reasonId} className="meta">Drafting in a Terminal: the draft shows here as <em>in definition</em>, and its accept record in Needs me.</span>}
        {!asking && !opened && blocked && <span id={reasonId} className="meta">{blocked}</span>}
        {/* The hover sits on a wrapper: a disabled button gets no mouse
            events in WebKit. The reason is the text beside it. */}
        {!asking && (
          <span title={blocked ?? (opened ? "a drafting session is open in a Terminal" : `organizer draft-cell ${initiativeId}: a session drafts the roster from the goal, scope and agents/people.md`)}>
            <button ref={draftBtn} className="tiny-btn primary" onClick={() => setAsking(true)} disabled={checking || !!blocked || opened} aria-describedby={!checking && (opened ? !blocked : !!blocked) ? reasonId : undefined}>
              <PencilRuler size={13} /> {opened && !blocked ? "Drafting…" : "Draft the cell"}
            </button>
          </span>
        )}
        {asking && (
          <span className="confirm-inline" onKeyDown={escapeCloses(cancel)}>
            {error
              ? <span className="meta" role="alert" style={{ color: "var(--danger)" }}>The Terminal did not open: {error}. Run <code>organizer draft-cell {initiativeId}</code> in a terminal at the root.</span>
              : <span className="meta">one Terminal at the root running the agent; it writes only under agents/ and working-on/decisions/</span>}
            <button ref={openBtn} className="tiny-btn primary" onClick={open} disabled={busy}>{busy ? "Opening…" : "Open"}</button>
            <button className="tiny-btn ghost" onClick={cancel}>Cancel</button>
          </span>
        )}
      </div>
    </div>
  );
}

/** The initiative's week in tokens (docs/ux/specs/usage.md, From an
 *  initiative; 0020: tokens, never money, outside Usage). It links to Usage
 *  filtered to this initiative; nothing shows while the week has none. */
function WeekLine({ initiativeId }: { initiativeId: string }) {
  const { openUsage } = useBoard();
  const [line, setLine] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    setLine(null);
    fetchUsage("").then((v) => { if (live) setLine(agentsWeekLine(v.cuts?.initiative, initiativeId)); }, () => undefined);
    return () => { live = false; };
  }, [initiativeId]);
  if (!line) return null;
  return <button className="ghost tiny-btn week-line num" onClick={() => openUsage(initiativeId)} title={`Usage for ${initiativeId} this week`}>{line}</button>;
}
