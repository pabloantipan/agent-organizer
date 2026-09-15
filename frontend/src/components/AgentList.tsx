import { useState } from "react";
import { MessageSquare, Square, SquareTerminal, Trash2 } from "lucide-react";
import { api, type Agent } from "../hooks/useWails";
import { shortHome } from "../lib";
import { ContextBar, WatcherBadge } from "./ContextBar";

const STATE_LABEL: Record<string, string> = { working: "working", running: "idle", shell: "shell", exited: "exited" };

/** Rows of agents. Attach opens the zellij session in iTerm2 through the
 *  probe profile. Kill removes a probe (session, layout, profile; the
 *  conversation survives). Stop sends SIGTERM to a plain-terminal agent.
 *  Both destructive actions ask inline first. */
export function AgentList({ agents, root, local = true, onMessage }: { agents: Agent[]; root?: string; local?: boolean; onMessage?: (persona: string) => void }) {
  const [confirm, setConfirm] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  if (!agents || agents.length === 0) return <div className="meta">No agents here.</div>;
  const flash = (m: string) => { setNote(m); window.setTimeout(() => setNote(null), 3000); };
  const run = (p: Promise<void>, ok: string) => p.then(() => flash(ok), (e) => flash(String(e))).finally(() => setConfirm(null));

  return (
    <>
      {note && <div className="meta agent-note">{note}</div>}
      <ul className="agents">
        {agents.map((a) => {
          const sub = root && a.dir && a.dir !== root ? `./${a.dir.slice(root.length + 1)}` : root ? "" : shortHome(a.dir || "");
          const key = a.session || `${a.pid}`;
          const asking = confirm === key;
          return (
            <li key={key} className={a.state}>
              <span className={`a-state ${a.state}`}><i />{STATE_LABEL[a.state] ?? a.state}</span>
              <span className="a-name">
                {a.family && <span className="a-family">{a.family}</span>}
                <span className="ident">{a.short || a.name}</span>
              </span>
              {a.persona && <span className="badge persona" title={a.cell ? `${a.cell} cell` : "persona"}>{a.persona}</span>}
              <WatcherBadge watcher={a.watcher} deaf={a.deaf} undelivered={a.undelivered} />
              <span className={`badge kind ${a.kind}`}>{a.kind}</span>
              <ContextBar c={a.context} />
              <span className="meta mono a-proc">{a.pid > 0 ? `${a.tty} · up ${a.uptime}` : a.created ? `session ${a.created}` : "layout only"}</span>
              <span className="meta mono a-dir" title={a.dir}>{sub}</span>
              <span className="a-actions">
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
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
