import { useState } from "react";
import { MessageSquare, SquareTerminal, Trash2, UserRoundX, Users } from "lucide-react";
import { Retire } from "./Retire";
import { api, type AgentGroup, type Seat } from "../hooks/useWails";
import { ContextBar, WatcherBadge } from "./ContextBar";

const STATE_LABEL: Record<string, string> = { working: "working", running: "idle", shell: "shell", exited: "exited" };

/** The persona cell of an initiative: one row per seat of agents/cell.json,
 *  joined to whatever process runs for it, its discuss watcher and its
 *  context fill. "Bring crew up" opens one probe per seat in one iTerm2
 *  window; seats already running just reattach. */
export function Crew({ group, onMessage }: { group: AgentGroup; onMessage?: (seat: string) => void }) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [confirmKill, setConfirmKill] = useState<string | null>(null);
  const [retiring, setRetiring] = useState(false);
  const cell = group.cell;
  if (!cell) return null;
  const seats = group.crew ?? [];
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
    <div className="crew">
      <div className="crew-head">
        <Users size={14} />
        <span className="ident">{cell.project}</span>
        <span className="meta">{seats.length} seats · {live} live · {off} off{cell.reconciler ? ` · reconciler ${cell.reconciler}` : ""}</span>
        {group.discuss && <span className="badge watcher stale" title="crew health comes from the discuss API">{group.discuss}</span>}
        <span className="spacer" />
        {note && <span className="meta">{note}</span>}
        {!asking && <button className={`tiny-btn ${(group.retirable?.length ?? 0) > 0 ? "" : "ghost"}`} onClick={() => setRetiring(true)} title={(group.retirable?.length ?? 0) > 0 ? `wave done with ${group.retirable.join(", ")}: organizer retire ${group.id} --retirable` : `organizer retire ${group.id}: end a wave`}><UserRoundX size={13} /> {(group.retirable?.length ?? 0) > 0 ? `${group.retirable.length} retirable` : "Retire…"}</button>}
        {retiring && <Retire group={group} onClose={() => setRetiring(false)} />}
        {!asking && (
          <button className="tiny-btn primary" onClick={() => setAsking(true)} title={`organizer crew ${group.id}`} disabled={busy}>
            <Users size={13} /> {off === seats.length ? "Bring crew up" : off > 0 ? `Bring ${off} up` : "Reattach all"}
          </button>
        )}
        {asking && (
          <>
            <span className="meta">one iTerm2 window, {seats.length} tabs, each seat with its discuss identity; running seats reattach</span>
            <button className="tiny-btn primary" onClick={bringUp} disabled={busy}>{busy ? "Opening…" : "Open"}</button>
            <button className="tiny-btn ghost" onClick={() => setAsking(false)}>Cancel</button>
          </>
        )}
      </div>
      <ul className="agents crew-seats">
        {seats.map((s) => <SeatRow key={s.name} seat={s} confirm={confirmKill} setConfirm={setConfirmKill} flash={flash} onMessage={onMessage} />)}
      </ul>
    </div>
  );
}

function SeatRow({ seat, confirm, setConfirm, flash, onMessage }: { seat: Seat; confirm: string | null; setConfirm: (s: string | null) => void; flash: (m: string) => void; onMessage?: (seat: string) => void }) {
  const a = seat.agent;
  const state = a?.state ?? "off";
  const session = a?.session || "";
  const asking = confirm === seat.name;
  return (
    <li className={state}>
      <span className={`a-state ${state}`}><i />{STATE_LABEL[state] ?? state}</span>
      <span className="a-name"><span className="ident">{seat.name}</span></span>
      <WatcherBadge watcher={seat.watcher} deaf={seat.deaf} capped={seat.capped} undelivered={seat.undelivered} />
      {(seat.owes?.length ?? 0) > 0 && <span className="badge owes" title={seat.owes.map((o) => o.subject || o.id).join("\n")}>owes {seat.owes.length}</span>}
      <ContextBar c={a?.context} />
      <span className="meta mono a-proc">{a && a.pid > 0 ? `${a.tty} · up ${a.uptime}` : a?.created ? `session ${a.created}` : a ? "layout only" : seat.session}</span>
      <span className="a-actions">
        {onMessage && !asking && <button className="tiny-btn" onClick={() => onMessage(seat.name)} title={`write to ${seat.name}`}><MessageSquare size={13} /> Message</button>}
        {asking && session && (
          <>
            <span className="meta">remove session, layout and profile? conversation stays resumable</span>
            <button className="tiny-btn danger" onClick={() => api.killAgent(session).then(() => flash(`killed ${session}`), (e) => flash(String(e))).finally(() => setConfirm(null))}>Kill</button>
            <button className="tiny-btn ghost" onClick={() => setConfirm(null)}>Cancel</button>
          </>
        )}
        {!asking && session && (
          <>
            <button className="tiny-btn" onClick={() => api.attachSession(session)} title={`probe ${session}`}><SquareTerminal size={13} /> Attach</button>
            <button className="tiny-btn ghost" onClick={() => setConfirm(seat.name)} title={`probe -k ${session}`}><Trash2 size={13} /> Kill</button>
          </>
        )}
      </span>
    </li>
  );
}
