import { useEffect, useState } from "react";
import { Broom, UserRoundX, X } from "lucide-react";
import { api, type AgentGroup, type RetirePlan, type RetireReport } from "../hooks/useWails";

/** Retire seats of a cell: the end of a wave as one action. The plan is
 *  shown first; nothing happens until Retire. Seats default to every one
 *  but the reconciler; sessions beyond the seats' own can be added. */
export function Retire({ group, onClose }: { group: AgentGroup; onClose: () => void }) {
  const cell = group.cell!;
  // Preselect what the wave is done with when the organizer knows it;
  // otherwise everyone but the reconciler.
  const retirable = new Set(group.retirable ?? []);
  const [seats, setSeats] = useState<Record<string, boolean>>(() => Object.fromEntries((cell.agents ?? []).map((a) => [a, retirable.size ? retirable.has(a) : a !== cell.reconciler])));
  const [force, setForce] = useState(false);
  const [extra, setExtra] = useState<Record<string, boolean>>({});
  const [closeThreads, setCloseThreads] = useState(true);
  const [revoke, setRevoke] = useState(true);
  const [commit, setCommit] = useState(true);
  const [plan, setPlan] = useState<RetirePlan | null>(null);
  const [report, setReport] = useState<RetireReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const chosen = (cell.agents ?? []).filter((a) => seats[a]);
  // Sessions of this initiative that are not a seat's crew session: the
  // supervisor's own, or a stray probe.
  const crewSessions = new Set((group.crew ?? []).map((s) => s.session));
  const others = (group.agents ?? []).filter((a) => a.session && !crewSessions.has(a.session)).map((a) => a.session);
  const waveOnly = chosen.every((a) => retirable.has(a));
  const options = { initiative_id: group.id, seats: chosen, retirable: false, force, wave_threads: waveOnly, sessions: others.filter((s) => extra[s]), close_threads: closeThreads, revoke_tokens: revoke, commit_cell: commit };

  useEffect(() => {
    let live = true;
    api.planRetire(options as never).then((p) => { if (live) { setPlan(p); setErr(null); } }, (e) => { if (live) setErr(String(e)); });
    return () => { live = false; };
  }, [JSON.stringify(options)]); // eslint-disable-line react-hooks/exhaustive-deps

  const run = () => {
    setBusy(true);
    api.retire(options as never).then(setReport, (e) => setErr(String(e))).finally(() => setBusy(false));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal retire" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Retire seats">
        <header className="modal-head">
          <div>
            <h2><UserRoundX size={16} /> Retire seats of {cell.project}</h2>
            <div className="meta">the end of a wave: seats leave the roster, their sessions and tokens go, the mailbox closes. Conversations stay resumable.</div>
          </div>
          <button className="ghost" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </header>
        {report ? (
          <div className="retire-body">
            <div className="section-label">Done</div>
            <ul className="plain report">
              {report.steps?.map((s, i) => <li key={i} className="ok">{s}</li>)}
              {report.errors?.map((s, i) => <li key={`e${i}`} className="err">{s}</li>)}
            </ul>
            <div className="actions-row"><span className="spacer" /><button className="tiny-btn primary" onClick={onClose}>Close</button></div>
          </div>
        ) : (
          <div className="retire-body">
            <div className="retire-cols">
              <div>
                <div className="section-label">Seats to retire</div>
                <ul className="plain checks">
                  {(cell.agents ?? []).map((a) => (
                    <li key={a}><label><input type="checkbox" checked={!!seats[a]} onChange={(e) => setSeats({ ...seats, [a]: e.target.checked })} /> <span className="mono">{a}</span>{a === cell.reconciler && <span className="meta"> reconciler</span>}{retirable.has(a) && <span className="badge watcher alive" title="named by no open card, not working">done</span>}</label></li>
                  ))}
                </ul>
                {others.length > 0 && (
                  <>
                    <div className="section-label">Also kill</div>
                    <ul className="plain checks">
                      {others.map((s) => <li key={s}><label><input type="checkbox" checked={!!extra[s]} onChange={(e) => setExtra({ ...extra, [s]: e.target.checked })} /> <span className="mono">{s}</span></label></li>)}
                    </ul>
                  </>
                )}
              </div>
              <div>
                <div className="section-label">Also</div>
                <ul className="plain checks">
                  <li><label><input type="checkbox" checked={closeThreads} onChange={(e) => setCloseThreads(e.target.checked)} /> close every open thread of the project as {cell.human}, and pick up the kept seats' mail</label></li>
                  <li><label><input type="checkbox" checked={revoke} onChange={(e) => setRevoke(e.target.checked)} /> revoke the retired seats' tokens, then restart the discuss API</label></li>
                  <li><label><input type="checkbox" checked={commit} onChange={(e) => setCommit(e.target.checked)} /> commit agents/cell.json</label></li>
                  <li><label><input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} /> force: retire a seat even if an open card names it or it is working</label></li>
                </ul>
                <div className="section-label">Plan</div>
                {err && <div className="meta err">{err}</div>}
                {plan && (
                  <ul className="plain plan">
                    <li>keep <b>{plan.keep?.length ? plan.keep.join(", ") : "nobody"}</b></li>
                    <li>kill <b>{plan.sessions?.length ?? 0}</b> session{plan.sessions?.length === 1 ? "" : "s"}{plan.sessions?.length ? `: ${plan.sessions.join(", ")}` : ""}</li>
                    <li>close <b>{plan.threads?.length ?? 0}</b> threads{waveOnly ? " (the wave's own)" : " (every open thread of the project)"}</li>
                    <li>revoke <b>{plan.tokens?.length ?? 0}</b> tokens{plan.restart_api ? ", restart the API" : ""}</li>
                    <li>delete <b>{plan.files?.length ?? 0}</b> crew files</li>
                    <li>rewrite cell.json{plan.cell_is_git && commit ? " and commit" : ""}</li>
                    {plan.problems?.map((p, i) => <li key={i} className="err">! {p}</li>)}
                  </ul>
                )}
              </div>
            </div>
            <div className="actions-row">
              <span className="meta">{chosen.length} seat{chosen.length === 1 ? "" : "s"} leave; the roster keeps what is unchecked</span>
              <span className="spacer" />
              <button className="tiny-btn ghost" onClick={onClose}>Cancel</button>
              <button className="tiny-btn danger" onClick={run} disabled={busy || !plan || (chosen.length === 0 && !(plan.sessions?.length) && !(plan.threads?.length))}>{busy ? "Retiring…" : "Retire"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Clean exited sessions and stale records: the thing between waves. */
export function CleanButton() {
  const [note, setNote] = useState<string | null>(null);
  const run = () => api.clean().then((r) => setNote([...(r.steps ?? []), ...(r.errors ?? [])].join(" · ")), (e) => setNote(String(e))).then(() => window.setTimeout(() => setNote(null), 6000));
  return (
    <span className="new-agent">
      {note && <span className="meta">{note}</span>}
      <button className="tiny-btn ghost" onClick={run} title="probe -c: delete exited sessions and their layouts; prune stale statusline records"><Broom size={13} /> Clean exited</button>
    </span>
  );
}
