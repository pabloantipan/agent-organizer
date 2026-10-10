import { useState } from "react";
import { MessageSquare, Square, SquareTerminal, Trash2 } from "lucide-react";
import { api, type Agent } from "../hooks/useWails";
import { shortHome } from "../lib";
import { ContextBar, WatcherBadge } from "./ContextBar";
import { HEALTH, healthState, healthTitle, type HealthState } from "../lib/health";
import { stateWord } from "../lib/stateWords";
import { agentMemory, rowMemoryWords, type MemoryFeed } from "../lib/initiatives";
import { useBoard } from "../stores/board.store";
import "../styles/initiatives.css";

/** The word a row shows for its state, which its accessible name reads too
 *  (leftovers-11 FR-3, WCAG 2.5.3): a running agent shows and is named idle. */
const stateLabel = (a: Agent) => stateWord(a.state);

/** Rows of agents. Attach opens the zellij session in iTerm2 through the
 *  probe profile. Kill removes a probe (session, layout, profile; the
 *  conversation survives). Stop sends SIGTERM to a plain-terminal agent.
 *  Both destructive actions ask inline first. */
export function AgentList({ agents, root, local = true, readOnly = false, onMessage }: { agents: Agent[]; root?: string; local?: boolean; readOnly?: boolean; onMessage?: (persona: string) => void }) {
  const [confirm, setConfirm] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const feed = useBoard((s) => s.agents);
  if (!agents || agents.length === 0) return <div className="meta">No agents here.</div>;
  const flash = (m: string) => { setNote(m); window.setTimeout(() => setNote(null), 3000); };
  const run = (p: Promise<void>, ok: string) => p.then(() => flash(ok), (e) => flash(String(e))).finally(() => setConfirm(null));

  return (
    <>
      {note && <div className="meta agent-note">{note}</div>}
      <ul className="agents">
        {agents.map((a) => {
          const sub = root && a.dir && a.dir !== root ? `./${a.dir.slice(root.length + 1)}` : root ? "" : shortHome(a.dir || "");
          // Processes can share a session name (children inherit it), so the
          // pid disambiguates; a layout-only row has pid 0 and a unique session.
          const key = `${a.session}#${a.pid}`;
          const asking = confirm === key;
          const health = healthState({ watcher: a.watcher, deaf: a.deaf, capped: a.capped, noIdentity: a.no_identity });
          return (
            <li key={key} className={a.state} data-session={a.session || undefined} tabIndex={-1} aria-label={rowName(a, feed)}>
              <span className={`a-state ${a.state}`}><i />{stateLabel(a)}</span>
              <span className="a-name">
                {a.family && <span className="a-family">{a.family}</span>}
                <span className="ident">{a.short || a.name}</span>
              </span>
              {a.persona && <span className="badge persona" title={a.cell ? `${a.cell} cell` : "persona"}>{a.persona}</span>}
              {health === "no identity"
                ? <span className="badge watcher no-identity" title={healthTitle(health, a.undelivered)}>{HEALTH[health].label}{a.undelivered > 0 ? ` · ${a.undelivered} waiting` : ""}</span>
                : <WatcherBadge watcher={a.watcher} deaf={a.deaf} capped={a.capped} undelivered={a.undelivered} />}
              <span className={`badge kind ${a.kind}`}>{a.kind}</span>
              <ContextBar c={a.context} />
              <span className="meta mono a-proc">{a.pid > 0 ? `${a.tty} · up ${a.uptime}` : a.created ? `session ${a.created}` : "layout only"}</span>
              <span className="meta mono a-dir" title={a.dir}>{sub}</span>
              {/* Actions and Memory are one tail at the row's right edge, so
                  the cell holds its track on whatever line the tail lands. */}
              <span className="a-tail">
              {!readOnly && <span className="a-actions">
                {onMessage && a.persona && !asking && <button className="tiny-btn" onClick={() => onMessage(a.persona)} title={`write to ${a.persona}`}><MessageSquare size={13} /> Message</button>}
                {local && asking && a.session && (
                  <>
                    <span className="meta">remove session, layout and profile? conversation stays resumable</span>
                    <button className="tiny-btn danger" onClick={() => run(api.killAgent(a.session), `killed ${a.session}`)}>Kill</button>
                    <button className="tiny-btn ghost" onClick={() => setConfirm(null)}>Cancel</button>
                  </>
                )}
                {local && asking && !a.session && a.pid > 0 && (
                  <>
                    <span className="meta">send SIGTERM to pid {a.pid}?</span>
                    <button className="tiny-btn danger" onClick={() => run(api.stopAgent(a.pid), `stopped ${a.pid}`)}>Stop</button>
                    <button className="tiny-btn ghost" onClick={() => setConfirm(null)}>Cancel</button>
                  </>
                )}
                {local && !asking && a.session && (
                  <>
                    <button className="tiny-btn" onClick={() => api.attachSession(a.session)} title={`probe ${a.session}`}>
                      <SquareTerminal size={13} /> Attach
                    </button>
                    <button className="tiny-btn ghost" onClick={() => setConfirm(key)} title={`probe -k ${a.session}`}>
                      <Trash2 size={13} /> Kill
                    </button>
                  </>
                )}
                {local && !asking && !a.session && a.pid > 0 && (
                  <button className="tiny-btn ghost" onClick={() => setConfirm(key)} title={`SIGTERM ${a.pid}`}>
                    <Square size={13} /> Stop
                  </button>
                )}
              </span>}
              <MemoryCell a={a} />
              </span>
              {health && health !== "alive" && <HealthWhy state={health} />}
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** The row's Memory (initiatives-view, Agents: memory on every row): its
 *  footprint, tabular and right-aligned in neutral ink, or `—` with why.
 *  It never folds; it does not re-sort rows. A crew seat's row shows the
 *  same cell. It is the row's last cell on its first line, a fixed track at
 *  the row's right edge, so the figures line up row under row whatever the
 *  cells and actions before it (leftovers-15 FR-4). */
export function MemoryCell({ a }: { a: { pid: number; state: string; mem_bytes?: number } | null | undefined }) {
  const agents = useBoard((s) => s.agents);
  const m = a ? agentMemory(a, agents) : { text: "—", title: "not running" };
  return <span className="a-mem num" title={m.title} aria-label={`Memory ${m.text === "—" ? `unknown, ${m.title}` : m.text}`}>{m.text}</span>;
}

/** A row's accessible name, what a landing on it reads first (a role's
 *  session line, transversal-roles A3): its session, the state word the row
 *  shows (leftovers-11 FR-3), context and memory. */
function rowName(a: Agent, feed: MemoryFeed): string {
  const ctx = a.context ? `, ${Math.round(a.context.used_percent)}% context` : "";
  // The cell's own words, so the name never reads a number the screen does
  // not show (leftovers-15 FR-5).
  const words = rowMemoryWords(a, feed);
  const mem = words ? `, ${words}` : "";
  return `${a.session || a.short || a.name}, ${stateLabel(a)}${ctx}${mem}`;
}

/** Why a row's health word is what it is and what to do about it, from the
 *  one table in lib/health, shown on the row rather than only in the badge's
 *  tooltip: the row is where someone looks when a seat is not hearing. A
 *  roster seat's row in Crew shows the same line. */
export function HealthWhy({ state }: { state: HealthState }) {
  const w = HEALTH[state];
  return <span className="meta a-health">{w.label}: {w.why} What to do: {w.what}</span>;
}
