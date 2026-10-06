import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { compact, duration, kindsLine, money, roleWords, startWords, type UsageSession } from "../lib/usage";

/** `▸ Sessions · N` (her §5): closed by default, newest first. A running
 *  session reads `running` for its length and its numbers `so far`; a
 *  session with no cost reads `—`, with why in the hover. */
export function UsageSessions({ sessions }: { sessions: UsageSession[] }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="usage-sec" aria-label="sessions">
      <button className="ghost usage-disclose" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />} Sessions · <span className="num">{sessions.length}</span>
      </button>
      {open && (
        <div className="usage-table-wrap">
          <table className="usage-table usage-sessions">
            <thead>
              <tr>
                <th scope="col">start</th><th scope="col">session</th><th scope="col">initiative</th><th scope="col">task</th>
                <th scope="col">role</th><th scope="col">model</th><th scope="col" className="c-num">length</th>
                <th scope="col" className="c-num">tokens</th><th scope="col" className="c-num">money</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const soFar = s.running ? <span className="so-far"> so far</span> : null;
                return (
                  <tr key={s.id} className={s.running ? "running" : ""} title={kindsLine(s)}>
                    <td className="num nowrap">{startWords(s.start)}</td>
                    <th scope="row" className="mono cut" title={s.id}>{s.name || s.id.slice(0, 8)}</th>
                    <td className="mono cut">{s.initiative || <span className="muted" title={s.reason}>—</span>}</td>
                    <td className="cut" title={s.task ? `${s.initiative}/${s.task}` : s.reason || undefined}>{s.task_title || s.task || <span className="muted">—</span>}</td>
                    <td className="cut">{s.role ? roleWords(s.role) : <span className="muted">—</span>}</td>
                    <td className="mono cut">{s.model || "—"}</td>
                    <td className="c-num nowrap">{s.running ? <span className="running-word">running</span> : duration(s.minutes)}</td>
                    <td className="c-num nowrap">{compact(s.tokens)}{soFar}</td>
                    <td className="c-num nowrap" title={s.money == null ? "no cost recorded" : s.cost_from ? `cost from the ${s.cost_from}` : undefined}>{money(s.money)}{s.money != null && soFar}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
