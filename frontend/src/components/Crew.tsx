import { useEffect, useId, useRef, useState } from "react";
import { FileXCorner, MessageSquare, PencilRuler, SquareTerminal, Trash2, UserRoundX, Users } from "lucide-react";
import { Retire } from "./Retire";
import { api, type AgentGroup, type Seat } from "../hooks/useWails";
import type { model } from "../../wailsjs/go/models";
import { ContextBar, WatcherBadge } from "./ContextBar";
import { HealthWhy } from "./AgentList";
import { healthState } from "../lib/health";
import { missingPersonas, personaMissing } from "../lib/queue";
import { useBoard } from "../stores/board.store";
import { escapeCloses, useConfirmFocus } from "../lib/focus";

const STATE_LABEL: Record<string, string> = { working: "working", running: "idle", shell: "shell", exited: "exited" };

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
  // `fold` is how soon Home's signals fold it into "+N" (FR-20).
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
 *  context fill. "Bring crew up" opens one probe per seat in one iTerm2
 *  window; seats already running just reattach. */
export function Crew({ group, readOnly = false, onMessage }: { group: AgentGroup; readOnly?: boolean; onMessage?: (seat: string) => void }) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [confirmKill, setConfirmKill] = useState<string | null>(null);
  const [retiring, setRetiring] = useState(false);
  const reasonId = useId();
  const { opener: crewUp, commit: openBtn } = useConfirmFocus(asking);
  const box = useRef<HTMLDivElement>(null);
  const { agentsLanding, clearAgentsLanding } = useBoard();
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
    api.createCrew(group.id).then(
      (cmds) => { flash(`opened ${cmds.length} seats in iTerm2`); setAsking(false); },
      (e) => flash(String(e)),
    ).finally(() => setBusy(false));
  };

  return (
    <div className="crew" ref={box}>
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
            <span className="meta">one iTerm2 window, {seats.length} tabs, each seat with its discuss identity; running seats reattach</span>
            <button ref={openBtn} className="tiny-btn primary" onClick={bringUp} disabled={busy}>{busy ? "Opening…" : "Open"}</button>
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
    <li className={state} data-seat={seat.name} tabIndex={-1}>
      <span className={`a-state ${state}`}><i />{STATE_LABEL[state] ?? state}</span>
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
      {health && health !== "alive" && <HealthWhy state={health} />}
    </li>
  );
}
