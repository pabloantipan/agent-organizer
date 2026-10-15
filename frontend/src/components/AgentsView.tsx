import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Bot, PencilRuler, Plus } from "lucide-react";
import { api, type AgentGroup } from "../hooks/useWails";
import { since } from "../lib";
import { useBoard } from "../stores/board.store";
import { AgentList } from "./AgentList";
import { CellStateLz, Crew, elapsed, FailedActions, holdInView, keepHeldInView, launchOf, releaseHeld, useNow, type Launch, type SeatStart } from "./Crew";
import { SeenLaunch } from "../../wailsjs/go/main/App";
import { missingPersonas, queueOf, readOnlyOf } from "../lib/queue";
import { escapeCloses, useConfirmFocus } from "../lib/focus";
import { CleanButton } from "./Retire";
import { Usage as fetchUsage } from "../../wailsjs/go/main/App";
import { agentsWeekLine } from "../lib/usage";
import { agentRow, agentTarget } from "../lib/agentFocus";
import { groupMemory, plural } from "../lib/initiatives";
import { useLiveRegion } from "../lib/liveRegion";
import { busyButton, busyLabel } from "../lib/busy";

const REFRESH_MS = 10_000;

/** The initiative a Show only press filtered to, until its view lands focus
 *  on its first agent row (leftovers-25 FR-3). */
let landOn: string | null = null;

/** Agents tab: processes and sessions grouped per initiative. The Go side
 *  samples every ten seconds and pushes the "agents" event; this view only
 *  renders the latest payload. Working = CPU time grew between samples. */
export function AgentsView() {
  const { selectedInitiative, setSelectedInitiative, agents: view, applyAgents, openSlack, view: board, agentFocus, clearAgentFocus } = useBoard();

  useEffect(() => {
    if (!view) api.getAgents().then(applyAgents, () => undefined);
  }, [view, applyAgents]);

  // A memory session's Agents › (ram-indicator §1) lands on its row: focused,
  // brought into view, and marked as selected until focus leaves it.
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!agentFocus || !view) return;
    const t = agentTarget(view.groups, agentFocus, view.unassigned);
    const section = t && box.current?.querySelector(`[data-group="${CSS.escape(t.group)}"]`);
    const el = t && section ? agentRow(section, t) : null;
    clearAgentFocus();
    if (!el) return;
    el.classList.add("memory-landed");
    el.addEventListener("blur", () => el.classList.remove("memory-landed"), { once: true });
    el.focus({ preventScroll: true });
    // Centred (leftovers-30 FR-3) after the screen's own scroll to the top,
    // which runs after this (a parent's effect), so the landing is not
    // scrolled away again; once more when the feed's first draw has settled
    // the rows above it (a task row's Agents, leftovers-29 FR-8, found it
    // scrolled back to 0). Not cleared on cleanup: clearAgentFocus above
    // reruns this effect.
    // A task, not a frame: a window that draws no frame never runs
    // requestAnimationFrame.
    window.setTimeout(() => { if (document.activeElement === el) holdInView(el); }, 0);
    window.setTimeout(keepHeldInView, 400);
  }, [agentFocus, view, clearAgentFocus]);

  // Each feed update brings a held landed row back into view (FR-3); leaving
  // Agents lets it go.
  useEffect(() => { keepHeldInView(); }, [view]);
  useEffect(() => releaseHeld, []);

  // leftovers-25 FR-3: Show only <id> unmounts with its press (the filtered
  // view mounts in the initiative screen, a new instance); focus lands on the
  // first agent row of the initiative it filtered to, never the body.
  const factsId = useId();
  useEffect(() => {
    const id = landOn;
    if (!id || !view || selectedInitiative !== id) return;
    landOn = null;
    const section = box.current?.querySelector(`[data-group="${CSS.escape(id)}"]`);
    const el = section?.querySelector<HTMLElement>("ul.agents > li[tabindex]")
      ?? section?.querySelector<HTMLElement>("button:not([disabled]), a[href]");
    el?.focus({ preventScroll: true });
  }, [selectedInitiative, view]);

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
    <div className="agents-view" ref={box}>
      <div className="board-head">
        {!selectedInitiative && <h1>Agents</h1>}
        <span className="meta">
          {selectedInitiative ? (sel ? `${countsOf(sel)} · ` : "") : `${plural(totals.n, "agent")}, ${totals.live} live, ${totals.working} working · `}
          {sel && groupMemory(view, sel.id) && <span className="num">{groupMemory(view, sel.id)} · </span>}
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
        <section key={g.id} className="agent-group" data-group={g.id}>
          {!selectedInitiative && (
          <header className="agent-group-head">
            {/* leftovers-24 FR-1: a filter in place, so a plain button (F1).
                leftovers-25 FR-1: the short name is the verb; the counts, memory
                and cell state it draws are its description. FR-3: it unmounts
                with the filter, so focus goes to the group's first agent row. */}
            <button type="button" className="agent-group-title" aria-label={`Show only ${g.id}`} aria-describedby={`${factsId}-${g.id}`} onClick={() => { landOn = g.id; setSelectedInitiative(g.id); }} title="Show only this initiative">
              <Bot size={14} />
              <span className="ident">{g.id}</span>
              {g.client && <span className="badge client">{g.client}</span>}
              <span className="agent-group-title-facts" id={`${factsId}-${g.id}`}>
                <span className="meta">{countsOf(g)}</span>{" "}
                {groupMemory(view, g.id) && <span className="meta num a-group-mem">{groupMemory(view, g.id)}</span>}{" "}
                <CellStateLz cell={g.cell} missing={missingPersonas(g.crew)} />
              </span>
            </button>
            <span className="spacer" />
            {g.cell && q.total > 0 && <button className="tiny-btn ghost hot" onClick={() => openSlack(g.id, null)} title="escalated to you, or asked of you: threads and cards">{q.total} need you</button>}
            {!ro && <NewAgent initiativeId={g.id} />}
          </header>
          )}
          {/* A roster seat's agent shows in the crew block above; an agent
              with a persona outside the roster (a supervisor, a builder, a
              guest) has no seat there, so it is listed here (FR-6). */}
          {g.cell && <Crew group={g} launch={launchOf(view.launches, g.id)} readOnly={!!ro} onMessage={g.can_post && !ro ? (seat) => openSlack(g.id, seat) : undefined} />}
          {!g.cell && selectedInitiative && !ro && <DraftCell initiativeId={g.id} />}
          <AgentList agents={(g.agents ?? []).filter((a) => !a.persona || !g.cell?.agents?.includes(a.persona))} root={g.path} readOnly={!!ro} onMessage={g.cell && g.can_post && !ro ? (p) => openSlack(g.id, p) : undefined} />
        </section>
        );
      })}
      {!selectedInitiative && (view.unassigned?.length ?? 0) > 0 && (
        <section className="agent-group" data-group="">
          <header className="agent-group-head static">
            <Bot size={14} />
            <span className="ident">outside every initiative</span>
            <span className="meta">{view.unassigned.length}</span>
            {groupMemory(view, "") && <span className="meta num a-group-mem">{groupMemory(view, "")}</span>}
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
 *  one initiative selected (initiative-header FR-13). Each noun agrees with
 *  its count (leftovers-26 FR-5): `1 agent`, `1 seat`. */
export const countsOf = (g: Pick<AgentGroup, "agents" | "live" | "working" | "cell" | "crew">) =>
  `${plural(g.agents?.length ?? 0, "agent")} · ${g.live} live · ${g.working} working${g.cell ? ` · ${plural(g.crew?.length ?? 0, "seat")}` : ""}`;

/** The seat New agent started, per initiative, until it runs or fails and
 *  the lead has acted. Module state, so leaving and coming back keeps the
 *  button's state (launch-progress L7). */
const pendingAgent = new Map<string, string>();

/** The pending seat's start: the last entry of that name on the feed. */
export function agentStart(launch: Launch | undefined, seat: string | undefined): SeatStart | undefined {
  if (!launch || !seat) return undefined;
  const seats = launch.seats ?? [];
  for (let i = seats.length - 1; i >= 0; i--) if (seats[i].seat === seat) return seats[i];
  return undefined;
}

/** What the pressed button reads while its seat starts (launch-progress §3):
 *  the visible text, and its name with the reason and the seconds. */
export function startingButton(s: Pick<SeatStart, "seat" | "state" | "started_at">, now: number): { text: string; name: string } {
  const n = elapsed(s, now);
  const secs = `${n} second${n === 1 ? "" : "s"}`;
  if (s.state === "retrying") return { text: `Trying again · ${n} s`, name: `Trying again to start ${s.seat}, ${secs}` };
  if (s.state === "starting") return { text: `Starting · ${n} s`, name: `Starting ${s.seat}, ${secs}` };
  return { text: "Waiting to start", name: `${s.seat} waits for the seats before it` };
}

/** Focus on the new agent's row, once the feed draws it: where New agent's
 *  Start lands after the result (leftovers-34 F5). False while not drawn. */
export function landNewAgent(page: Pick<ParentNode, "querySelector">, session: string): boolean {
  const row = page.querySelector<HTMLElement>(`ul.agents > li[data-session="${CSS.escape(session)}"]`);
  if (!row) return false;
  row.focus();
  row.scrollIntoView?.({ block: "nearest" });
  return true;
}

const inFlight = (s: SeatStart | undefined) => !!s && (s.state === "queued" || s.state === "starting" || s.state === "retrying");

/** Inline "new agent" control: starts a probe in the initiative directory,
 *  in the family named after the initiative, detached. Empty name = animal
 *  name. The pressed button becomes the seat's state (FR-6, §3): Starting ·
 *  n s, Trying again · n s; then focus to the new row, or to Try again on one
 *  danger line under the button. */
export function NewAgent({ initiativeId }: { initiativeId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [target, setTargetState] = useState<string | undefined>(() => pendingAgent.get(initiativeId));
  const setTarget = (seat: string | undefined) => {
    if (seat) pendingAgent.set(initiativeId, seat); else pendingAgent.delete(initiativeId);
    setTargetState(seat);
  };
  const applyAgents = useBoard((s) => s.applyAgents);
  const launch = launchOf(useBoard((s) => s.agents?.launches), initiativeId);
  const s = agentStart(launch, target);
  const [said, setSaid] = useLiveRegion();
  const now = useNow(inFlight(s));
  const busy = useRef<HTMLButtonElement>(null);
  const retry = useRef<HTMLButtonElement>(null);
  const newBtn = useRef<HTMLButtonElement>(null);
  const state = s?.state;

  // The pressed button is now the state: focus stays on it (L3), taken in
  // the commit that draws it, so the busy Start hands it over with no body
  // between (leftovers-34 FR-2).
  useLayoutEffect(() => { if (inFlight(s)) busy.current?.focus(); }, [state]);
  // Started with no seat on the feed yet: back to New agent, never the body.
  const backToNew = useRef(false);
  useLayoutEffect(() => { if (backToNew.current && !open) { backToNew.current = false; newBtn.current?.focus(); } });
  // Failed: the danger line's Try again takes focus, and the failure is seen.
  useEffect(() => {
    if (state !== "failed") return;
    retry.current?.focus();
    if (launch?.kind !== "crew") setSaid(`${s!.seat} didn't start`);
    SeenLaunch(initiativeId).catch(() => undefined);
  }, [state]);
  // Running: focus to the new agent's row once the feed draws it.
  const agents = useBoard((st) => st.agents);
  useEffect(() => {
    if (!target) return;
    if (!s) { setTarget(undefined); return; } // dropped from the feed, or replaced
    if (s.state !== "running") return;
    if (!document.querySelector(`ul.agents > li[data-session="${CSS.escape(s.session)}"]`)) return;
    if (launch?.kind !== "crew") setSaid(`${s.seat} running`);
    setTarget(undefined);
    landNewAgent(document, s.session);
  }, [target, s, agents]);

  // Start is busy while createAgent runs: a second press starts nothing
  // (leftovers-34 FR-2, Amendment 1).
  const [starting, setStarting] = useState(false);
  const create = () => {
    if (starting) return;
    setStarting(true);
    api.createAgent(initiativeId, name.trim())
      .then(() => api.getAgents())
      .then((v) => {
        applyAgents(v);
        const l = launchOf(v.launches, initiativeId);
        const last = l?.seats?.[l.seats.length - 1];
        setOpen(false); setName(""); setNote(null);
        if (last) setTarget(last.seat); else backToNew.current = true;
      }, (e) => setNote(String(e)))
      .finally(() => setStarting(false));
  };
  const live = <span className="sr-only" role="status" aria-live="polite">{said}</span>;

  if (s && inFlight(s)) {
    const b = startingButton(s, now);
    return (
      <span className="new-agent">
        {live}
        {/* aria-disabled, not disabled: a disabled button drops focus to
            the body, and focus stays here while the seat starts (L3). */}
        <button ref={busy} className="tiny-btn na-busy" aria-disabled="true" aria-label={b.name} title={`${s.session}: probe checks the pane runs claude`}>{b.text}</button>
      </span>
    );
  }
  if (s?.state === "failed") {
    return (
      <span className="new-agent na-failed">
        {live}
        <button ref={newBtn} className="tiny-btn" onClick={() => { setTarget(undefined); setOpen(true); }} title={`${initiativeId}-probe <name> in the initiative directory`}><Plus size={13} /> New agent</button>
        <span className="na-danger">
          <span className="na-why" title={s.output || s.reason}><span className="ident">{s.seat}</span> didn't start · {s.reason}</span>
          <FailedActions initiative={initiativeId} seat={s} retryRef={retry} onCopied={() => setSaid(`command for ${s.seat} copied`)} onError={setSaid} />
        </span>
      </span>
    );
  }
  if (!open) {
    return (
      <span className="new-agent">
        {live}
        {note && <span className="meta">{note}</span>}
        <button ref={newBtn} className="tiny-btn" onClick={() => setOpen(true)} title={`${initiativeId}-probe <name> in the initiative directory`}><Plus size={13} /> New agent</button>
      </span>
    );
  }
  return (
    <span className="new-agent">
      {live}
      <span className="meta mono">{initiativeId}-probe-</span>
      <input
        autoFocus
        className="new-agent-name"
        placeholder="name, or empty for an animal"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") create(); if (e.key === "Escape" && !starting) setOpen(false); }}
      />
      <button className="tiny-btn primary" {...busyButton({ busy: starting, onPress: create })}>{busyLabel(starting, "Start", "Starting…")}</button>
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
export function DraftCell({ initiativeId }: { initiativeId: string }) {
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
            <button ref={openBtn} className="tiny-btn primary" {...busyButton({ busy, onPress: open })}>{busyLabel(busy, "Open", "Opening…")}</button>
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
