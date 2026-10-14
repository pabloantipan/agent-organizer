import { useEffect, useId, useRef, useState } from "react";
import { FileXCorner, MessageSquare, PencilRuler, SquareTerminal, Trash2, UserRoundX, Users } from "lucide-react";
import { Retire } from "./Retire";
import { api, type AgentGroup, type Seat } from "../hooks/useWails";
import type { model } from "../../wailsjs/go/models";
import { ContextBar, WatcherBadge } from "./ContextBar";
import { HealthWhy, MemoryCell } from "./AgentList";
import { healthState } from "../lib/health";
import { missingPersonas, personaMissing } from "../lib/queue";
import { useBoard } from "../stores/board.store";
import { escapeCloses, useConfirmFocus } from "../lib/focus";
import { stateWord } from "../lib/stateWords";
import { RetrySeat, SeenLaunch, StopStarting } from "../../wailsjs/go/main/App";
import { ClipboardSetText } from "../../wailsjs/runtime/runtime";
import type { service } from "../../wailsjs/go/models";
import "../styles/launch.css";

export type Launch = service.InitiativeLaunch;
export type SeatStart = service.SeatLaunch;

/** Whole seconds since a seat's try began (launch-progress §1): counted here
 *  from `started_at`, never sent per second by the service. */
export const elapsed = (s: Pick<SeatStart, "started_at">, now: number) =>
  s.started_at ? Math.max(0, Math.floor((now - Date.parse(String(s.started_at))) / 1000)) : 0;

/** A seat's start as launch-progress §1 draws it: a word with a shape, never
 *  a colour alone. `count` is the seconds part, drawn aria-hidden. */
export function seatWord(s: Pick<SeatStart, "state" | "started_at">, now: number): { tone: string; shape: string; word: string; count: string } {
  switch (s.state) {
    case "starting": return { tone: "starting", shape: "…", word: "starting", count: ` · ${elapsed(s, now)} s` };
    case "retrying": return { tone: "retrying", shape: "↻", word: "trying again", count: ` · ${elapsed(s, now)} s` };
    case "running": return { tone: "running", shape: "✓", word: "running", count: "" };
    case "failed": return { tone: "failed", shape: "✕", word: "didn't start", count: "" };
    case "skipped": return { tone: "waiting", shape: "", word: "off", count: "" };
    default: return { tone: "waiting", shape: "", word: "waiting", count: "" };
  }
}

export const launchHeading = (l: Pick<Launch, "running" | "seats">) => `Starting crew · ${l.running} of ${l.seats?.length ?? 0} running`;

/** The start's total, said once when no seat is left to start. */
export function launchTotal(l: Pick<Launch, "running" | "failed" | "seats">): string {
  const skipped = (l.seats ?? []).filter((s) => s.state === "skipped").length;
  return `${l.running} of ${l.seats?.length ?? 0} running${l.failed > 0 ? `, ${l.failed} didn't start` : ""}${skipped > 0 ? `, ${skipped} off` : ""}`;
}

const ended = (state: string) => state === "running" || state === "failed";

/** What the live region says for a feed update (L2): each seat's result
 *  once and the total once, nothing per second. `said` holds what was said
 *  already (`seat:state`, `total`); a seat that starts again (Try again)
 *  leaves it, so its next result is said. Returns the new lines and set. */
export function announce(said: ReadonlySet<string>, l: Pick<Launch, "seats" | "done" | "running" | "failed">): { lines: string[]; said: Set<string> } {
  const next = new Set(said);
  const lines: string[] = [];
  for (const s of l.seats ?? []) {
    if (!ended(s.state)) { next.delete(`${s.seat}:running`); next.delete(`${s.seat}:failed`); continue; }
    const key = `${s.seat}:${s.state}`;
    if (next.has(key)) continue;
    next.add(key);
    lines.push(`${s.seat} ${s.state === "running" ? "running" : "didn't start"}`);
  }
  if (!l.done) next.delete("total");
  else if (!next.has("total")) { next.add("total"); lines.push(launchTotal(l)); }
  return { lines, said: next };
}

/** What has been said already, so a remount (leaving Agents and coming back,
 *  L7) says nothing it said before. */
export const saidOf = (l: Pick<Launch, "seats" | "done" | "running" | "failed"> | undefined) => (l ? announce(new Set(), l).said : new Set<string>());

/** The live region's text for one launch: the newest results, once. */
export function useAnnouncer(l: Launch | undefined): [string, (m: string) => void] {
  const said = useRef<Set<string>>(saidOf(l));
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (!l) { said.current = new Set(); return; }
    const r = announce(said.current, l);
    said.current = r.said;
    if (r.lines.length > 0) setMsg(r.lines.join(". "));
  }, [l]);
  return [msg, setMsg];
}

/** Now, ticking once a second while `on`: the seconds are text, nothing
 *  spins (WCAG 2.2.2). */
export function useNow(on: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!on) return;
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [on]);
  return now;
}

const starting = (l: Launch | undefined) => !!l?.seats?.some((s) => s.state === "starting" || s.state === "retrying");

/** The initiative's start on the agents feed, if any. */
export const launchOf = (launches: Launch[] | undefined, id: string) => (launches ?? []).find((l) => l.initiative === id);

/** A settled start with a failure stays until the lead acts (launch-progress
 *  §1); Close is one way to act. Module state, so the list stays closed
 *  across navigation until the start changes. */
const closed = new Map<string, string>();
const shapeOf = (l: Launch) => (l.seats ?? []).map((s) => `${s.seat}:${s.state}:${s.started_at ?? ""}`).join("|");

/** Try again and Copy the command of a seat that did not start (§2). */
export function FailedActions({ initiative, seat, retryRef, onCopied, onError }: { initiative: string; seat: SeatStart; retryRef?: React.Ref<HTMLButtonElement>; onCopied: () => void; onError: (m: string) => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => ClipboardSetText(seat.launch_line).then(
    (ok) => { if (!ok) { onError("the clipboard refused the command"); return; } setCopied(true); onCopied(); window.setTimeout(() => setCopied(false), 2000); },
    (e) => onError(String(e)),
  );
  return (
    <span className="ls-acts">
      <button ref={retryRef} className="tiny-btn" aria-label={`Try again, ${seat.seat}`} onClick={() => RetrySeat(initiative, seat.seat).catch((e) => onError(String(e)))}>Try again</button>
      <button className="tiny-btn ghost" aria-label={`Copy the command, ${seat.seat}`} title={seat.launch_line} onClick={copy}>{copied ? "Copied" : "Copy the command"}</button>
    </span>
  );
}

/** Bring crew up's progress in place of the crew rows (launch-progress §1,
 *  FR-6): the heading takes focus after the press, since the button is
 *  gone; one line per seat in launch order; Stop starting while any seat
 *  waits or starts. */
function LaunchList({ initiative, launch, focusHead, say, onClose }: { initiative: string; launch: Launch; focusHead: React.MutableRefObject<boolean>; say: (m: string) => void; onClose: () => void }) {
  const head = useRef<HTMLHeadingElement>(null);
  const now = useNow(starting(launch));
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!focusHead.current) return;
    focusHead.current = false;
    head.current?.focus();
  }, [focusHead]);
  const failed = launch.done && launch.failed > 0;
  return (
    <div className="launch">
      <div className="crew-head">
        <h3 ref={head} tabIndex={-1} className="launch-head">{launchHeading(launch)}</h3>
        <span className="spacer" />
        {error && <span className="meta ls-err">{error}</span>}
        {!launch.done && <button className="tiny-btn ghost" onClick={() => StopStarting(initiative).catch((e) => setError(String(e)))} title="the seat in flight finishes; the waiting ones stay off">Stop starting</button>}
        {failed && <button className="tiny-btn ghost" onClick={() => { closed.set(initiative, shapeOf(launch)); onClose(); }} title="back to the crew rows; Bring up starts the off seats again">Close the list</button>}
      </div>
      <ul className="launch-seats">
        {(launch.seats ?? []).map((s, i) => {
          const w = seatWord(s, now);
          return (
            <li key={`${s.seat}-${i}`} className={`ls ${w.tone}`} data-launch-seat={s.seat}>
              <span className="ls-shape" aria-hidden="true">{w.shape}</span>
              <span className="ident ls-name">{s.seat}</span>
              <span className="ls-word">{w.word}{w.count && <span aria-hidden="true">{w.count}</span>}</span>
              {s.state === "failed" && (
                <>
                  {/* One line in words; probe's whole output is the hover
                      and organizer.log, never on screen (§2). */}
                  <span className="ls-why" title={s.output || s.reason}>· {s.reason}</span>
                  <FailedActions initiative={initiative} seat={s} onCopied={() => say(`command for ${s.seat} copied`)} onError={setError} />
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** What a cell in definition waits on (decision 0030): no seat has had a
 *  session or a run, so the roster is still being written. */
export const IN_DEFINITION_WAITS = "no seat has run yet; waits on its first launch";

/** A drafted roster waits on its accept record, not on a launch
 *  (discovery-in-a-cell FR-3e). */
export const DRAFT_WAITS = "draft roster; nothing launches until its accept record is ruled";

/** What a cell in definition waits on, as the Crew header says it: a
 *  draft's accept record, linked to Decisions with the record expanded
 *  (lead-side-fixes FR-6), or its first launch. The record is the service's
 *  (`accept_record`, FR-9); the rule is not repeated here. A missing persona
 *  file is what it waits on instead of a launch (ui-leftovers FR-9); that
 *  reason is said once, beside Bring crew up, so it shows here only when
 *  the button is not drawn (`said`). */
function DefinitionWaits({ id, cell, missing, said }: { id: string; cell: model.Cell; missing: string[]; said: boolean }) {
  const openDecision = useBoard((s) => s.openDecision);
  if (cell.state !== "in_definition") return null;
  if (!cell.draft && missing.length > 0) return said ? null : <span className="meta">{personaMissing(missing)}</span>;
  if (!cell.draft) return <span className="meta">{IN_DEFINITION_WAITS}</span>;
  const record = cell.accept_record;
  const drafted = cell.drafted ? `drafted ${cell.drafted}; ` : "";
  if (!record) return <span className="meta" title={DRAFT_WAITS}>{drafted}no accept record yet</span>;
  return (
    <span className="meta" title={DRAFT_WAITS}>
      {drafted}waits on{" "}
      <button className="linkish meta" onClick={() => openDecision(id, record.number)} title="Open in Decisions">
        <span className="num">{record.number}</span> {record.slug}
      </button>
    </span>
  );
}

/** Why a cell in definition waits, in one line: a draft's accept record, a
 *  missing persona file (ui-leftovers FR-9), or its first launch. */
export const definitionWaits = (cell: model.Cell, missing: string[]) =>
  cell.draft ? DRAFT_WAITS : missing.length > 0 ? personaMissing(missing) : `${IN_DEFINITION_WAITS} (Bring crew up)`;

/** The cell's derived state as a lozenge, word and icon, or nothing. One
 *  source for Crew, the Agents tab and Home's signals. */
export function CellStateLz({ cell, missing = [], label = "in definition", fold }: { cell?: model.Cell | null; missing?: string[]; label?: string; fold?: number }) {
  if (cell?.state !== "in_definition") return null;
  // The words sit in a text span that takes the ellipsis (responsive-home
  // FR-25, as FR-14): the lozenge is a flex box, which clips mid-word.
  // `fold` is how soon Home's signals fold it into "+N" (FR-20, 0076).
  return (
    <span className="lz tone" title={`${cell.project}: ${definitionWaits(cell, missing)}`} data-fold={fold}>
      <PencilRuler size={12} strokeWidth={2} aria-hidden="true" /><span className="lz-t">{label}</span>
    </span>
  );
}

/** Why Bring crew up cannot run, before the click (discovery-in-a-cell
 *  FR-6): the seats with no persona file, and a draft's accept record. Null
 *  when it can. CreateCrew still refuses both, for the CLI and a stale view. */
export function crewBlocked(seats: Seat[], cell: model.Cell): string | null {
  const why: string[] = [];
  const missing = missingPersonas(seats);
  if (missing.length > 0) why.push(personaMissing(missing));
  if (cell.draft) {
    const record = cell.accept_record;
    why.push(record ? `draft roster: nothing launches until ${record.number} is ruled` : "draft roster: no accept record yet");
  }
  return why.length > 0 ? why.join("; ") : null;
}

/** The persona cell of an initiative: one row per seat of agents/cell.json,
 *  joined to whatever process runs for it, its discuss watcher and its
 *  context fill. "Bring crew up" starts one probe per seat, detached, one
 *  after another, and the block shows each seat starting (FR-6). */
export function Crew({ group, launch, readOnly = false, onMessage }: { group: AgentGroup; launch?: Launch; readOnly?: boolean; onMessage?: (seat: string) => void }) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [confirmKill, setConfirmKill] = useState<string | null>(null);
  const [retiring, setRetiring] = useState(false);
  const reasonId = useId();
  const { opener: crewUp, commit: openBtn } = useConfirmFocus(asking);
  const box = useRef<HTMLDivElement>(null);
  const { agentsLanding, clearAgentsLanding } = useBoard();
  const [said, say] = useAnnouncer(launch);
  const focusHead = useRef(false);
  const [, setClosedAt] = useState(0);
  // A failure shown here is seen (FR-7): its Needs me row goes.
  const unseen = !!launch && launch.failed > 0 && !launch.seen;
  useEffect(() => { if (unseen) SeenLaunch(group.id).catch(() => undefined); }, [unseen, group.id]);
  // A Needs me verb lands here (ui-leftovers FR-5): Launch on Bring crew up,
  // Open on the seat whose persona file is missing.
  useEffect(() => {
    if (!agentsLanding) return;
    const el = agentsLanding === "crew-up"
      ? crewUp.current
      : box.current?.querySelector<HTMLElement>(`[data-seat="${CSS.escape(agentsLanding.replace(/^seat:/, ""))}"]`);
    if (!el) return;
    el.focus();
    el.scrollIntoView({ block: "nearest" });
    clearAgentsLanding();
  }, [agentsLanding, clearAgentsLanding, crewUp, group.crew]);
  const cell = group.cell;
  if (!cell) return null;
  const seats = group.crew ?? [];
  const blocked = seats.length === 0 ? "no seats: the roster is empty between waves" : crewBlocked(seats, cell);
  const live = seats.filter((s) => s.agent && (s.agent.state === "working" || s.agent.state === "running")).length;
  const off = seats.filter((s) => !s.agent || s.agent.state === "exited").length;
  const flash = (m: string) => { setNote(m); window.setTimeout(() => setNote(null), 5000); };

  const bringUp = () => {
    setBusy(true);
    // The list replaces the button; focus goes to its heading (L3).
    focusHead.current = true;
    api.createCrew(group.id).then(
      () => setAsking(false),
      (e) => { focusHead.current = false; flash(String(e)); },
    ).finally(() => setBusy(false));
  };
  const showList = !!launch && launch.kind === "crew" && closed.get(group.id) !== shapeOf(launch);

  if (showList) {
    return (
      <div className="crew" ref={box}>
        <span className="sr-only" role="status" aria-live="polite">{said}</span>
        <div className="crew-head">
          <Users size={14} />
          <span className="ident">{cell.project}</span>
        </div>
        <LaunchList initiative={group.id} launch={launch} focusHead={focusHead} say={say} onClose={() => { setClosedAt(Date.now()); window.setTimeout(() => crewUp.current?.focus(), 0); }} />
      </div>
    );
  }

  return (
    <div className="crew" ref={box}>
      <span className="sr-only" role="status" aria-live="polite">{said}</span>
      <div className="crew-head">
        <Users size={14} />
        <span className="ident">{cell.project}</span>
        <CellStateLz cell={cell} missing={missingPersonas(seats)} />
        <DefinitionWaits id={group.id} cell={cell} missing={missingPersonas(seats)} said={!readOnly && !asking} />
        <span className="meta">{seats.length} seats · {live} live · {off} off{cell.reconciler ? ` · reconciler ${cell.reconciler}` : ""}</span>
        {group.discuss && <span className="badge watcher stale" title="crew health comes from the discuss API">{group.discuss}</span>}
        <span className="spacer" />
        {note && <span className="meta">{note}</span>}
        {!readOnly && !asking && <button className={`tiny-btn ${(group.retirable?.length ?? 0) > 0 ? "" : "ghost"}`} onClick={() => setRetiring(true)} title={(group.retirable?.length ?? 0) > 0 ? `wave done with ${group.retirable.join(", ")}: organizer retire ${group.id} --retirable` : `organizer retire ${group.id}: end a wave`}><UserRoundX size={13} /> {(group.retirable?.length ?? 0) > 0 ? `${group.retirable.length} retirable` : "Retire…"}</button>}
        {retiring && <Retire group={group} onClose={() => setRetiring(false)} />}
        {/* The reason is text beside the button, not only its hover: a
            disabled button takes no focus and no WebKit mouse events
            (lead-side-fixes FR-4). */}
        {!readOnly && !asking && blocked && <span id={reasonId} className="meta">{blocked}</span>}
        {!readOnly && !asking && (
          <span title={blocked ?? `organizer crew ${group.id}`}>
            <button ref={crewUp} className="tiny-btn primary" onClick={() => setAsking(true)} disabled={busy || !!blocked} aria-describedby={blocked ? reasonId : undefined}>
              <Users size={13} /> {off === seats.length ? "Bring crew up" : off > 0 ? `Bring ${off} up` : "Reattach all"}
            </button>
          </span>
        )}
        {asking && (
          <span className="confirm-inline" onKeyDown={escapeCloses(() => setAsking(false))}>
            <span className="meta">starts the off seats one after another, detached, each with its discuss identity; running seats stay as they are</span>
            <button ref={openBtn} className="tiny-btn primary" onClick={bringUp} disabled={busy}>Start</button>
            <button className="tiny-btn ghost" onClick={() => setAsking(false)}>Cancel</button>
          </span>
        )}
      </div>
      <ul className="agents crew-seats">
        {seats.map((s) => <SeatRow key={s.name} seat={s} readOnly={readOnly} confirm={confirmKill} setConfirm={setConfirmKill} flash={flash} onMessage={onMessage} />)}
      </ul>
    </div>
  );
}

function SeatRow({ seat, readOnly, confirm, setConfirm, flash, onMessage }: { seat: Seat; readOnly: boolean; confirm: string | null; setConfirm: (s: string | null) => void; flash: (m: string) => void; onMessage?: (seat: string) => void }) {
  const a = seat.agent;
  const state = a?.state ?? "off";
  const session = a?.session || "";
  const asking = confirm === seat.name;
  const health = healthState({ watcher: seat.watcher, deaf: seat.deaf, capped: seat.capped });
  const { opener: killBtn, commit: killCommit } = useConfirmFocus(asking);
  return (
    <li className={state} data-seat={seat.name} tabIndex={-1} aria-label={`${session || seat.session} (${seat.name}, ${stateWord(state)})`}>
      <span className={`a-state ${state}`}><i />{stateWord(state)}</span>
      <span className="a-name"><span className="ident">{seat.name}</span></span>
      {seat.no_persona && (
        <span className="lz warning" title={`agents/${seat.name}.md is missing; the drafting session writes it, or write it by the persona-agents skill`}>
          <FileXCorner size={12} strokeWidth={2} aria-hidden="true" />no persona file
        </span>
      )}
      <WatcherBadge watcher={seat.watcher} deaf={seat.deaf} capped={seat.capped} undelivered={seat.undelivered} />
      {(seat.owes?.length ?? 0) > 0 && <span className="badge owes" title={seat.owes.map((o) => o.subject || o.id).join("\n")}>owes {seat.owes.length}</span>}
      <ContextBar c={a?.context} />
      <span className="meta mono a-proc">{a && a.pid > 0 ? `${a.tty} · up ${a.uptime}` : a?.created ? `session ${a.created}` : a ? "layout only" : seat.session}</span>
      <span className="a-tail">
      {!readOnly && <span className="a-actions">
        {onMessage && !asking && <button className="tiny-btn" onClick={() => onMessage(seat.name)} title={`write to ${seat.name}`} aria-label={`Message ${seat.name}`}><MessageSquare size={13} /> Message</button>}
        {asking && session && (
          <span className="confirm-inline" onKeyDown={escapeCloses(() => setConfirm(null))}>
            <span className="meta">remove session, layout and profile? conversation stays resumable</span>
            <button ref={killCommit} className="tiny-btn danger" aria-label={`Kill ${seat.name}`} onClick={() => api.killAgent(session).then(() => flash(`killed ${session}`), (e) => flash(String(e))).finally(() => setConfirm(null))}>Kill</button>
            <button className="tiny-btn ghost" onClick={() => setConfirm(null)}>Cancel</button>
          </span>
        )}
        {!asking && session && (
          <>
            <button className="tiny-btn" onClick={() => api.attachSession(session)} title={`probe ${session}`} aria-label={`Attach ${seat.name}`}><SquareTerminal size={13} /> Attach</button>
            <button ref={killBtn} className="tiny-btn ghost" onClick={() => setConfirm(seat.name)} title={`probe -k ${session}`} aria-label={`Kill ${seat.name}`}><Trash2 size={13} /> Kill</button>
          </>
        )}
      </span>}
      <MemoryCell a={a} />
      </span>
      {health && health !== "alive" && <HealthWhy state={health} />}
    </li>
  );
}
