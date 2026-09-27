import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { merge, model } from "../../wailsjs/go/models";
import type { CellThread } from "../hooks/useWails";
import { parseISO, today, daysBetween } from "../lib/dates";
import { useBoard } from "../stores/board.store";

/** One FSE-signed commit (FR-11). model.FSECommit reaches the frontend only
 *  nested in FSEActivity, so its shape is written here rather than imported. */
type FSECommit = { sha: string; at: string; subject: string };

/** The FSE's seat name (the fse skill: AGENT_NAME=fse). */
const FSE = "fse";
const MAX_ITEMS = 5;
const COLLAPSED_KEY = "organizer.fsePanelCollapsed";

/** One thing the FSE waits on from the owner (FR-12): a proposed record it
 *  raised that the human owns, or a thread it opened or asked that still asks
 *  the human. Derived on every render and never stored; `key` is the Needs me
 *  row's key, so the item links there. */
type WaitItem =
  | { kind: "decision"; key: string; since: Date | null; decision: model.Decision }
  | { kind: "thread"; key: string; since: Date | null; thread: CellThread };

export function fseWaiting(i: merge.BoardInitiative, threads: CellThread[], human: string, resolved: Record<string, unknown>, now = new Date()): WaitItem[] {
  // Without a cell the organizer has no human seat to compare with; the
  // owner is then anyone but the FSE itself (auth off: the owner runs it).
  const ownedByHuman = (owner: string) => (human ? owner === human : owner !== "" && owner !== FSE);
  const items: WaitItem[] = [];
  for (const d of i.decisions ?? []) {
    if (d.status === "proposed" && d.raised_by === FSE && ownedByHuman(d.owner)) {
      items.push({ kind: "decision", key: `decision:${i.id}/${d.number}`, since: parseISO(d.raised?.slice(0, 10)), decision: d });
    }
  }
  for (const t of threads) {
    if ((t.asked_of_me ?? 0) > 0 && (t.opener === FSE || t.asked_by === FSE) && !resolved[`thread:${t.id}`]) {
      items.push({ kind: "thread", key: `thread:${t.id}`, since: new Date(now.getTime() - (t.age_seconds ?? 0) * 1000), thread: t });
    }
  }
  const at = (w: WaitItem) => w.since?.getTime() ?? Number.MAX_SAFE_INTEGER;
  return items.sort((a, b) => at(a) - at(b));
}

/** Days for a record (its raised date has no time); minutes or hours for a
 *  thread younger than a day, as the Needs me row shows it. */
function age(w: WaitItem, now = new Date()): string {
  if (!w.since) return "—";
  if (w.kind === "thread") {
    const m = Math.max(0, Math.floor((now.getTime() - w.since.getTime()) / 60000));
    if (m < 60) return `${m}m`;
    if (m < 1440) return `${Math.floor(m / 60)}h`;
  }
  const n = Math.max(0, daysBetween(w.since, today()));
  return n === 0 ? "today" : `${n}d`;
}

/** "2026-09-26T14:06:00-03:00" as "09-26 14:06"; anything else verbatim. */
function when(at: string): string {
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return at;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** The hand-off is markdown; only bold and code spans are drawn, the rest is text. */
function inline(line: string) {
  return line.split(/(\*\*[^*]+\*\*|`[^`]+`)/).map((part, k) => {
    if (part.startsWith("**") && part.endsWith("**")) return <b key={k}>{part.slice(2, -2)}</b>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={k}>{part.slice(1, -1)}</code>;
    return part;
  });
}

function readCollapsed(): boolean {
  try { return localStorage.getItem(COLLAPSED_KEY) === "1"; } catch { return false; }
}

/** The FSE panel (FR-11, FR-12; mockup O5): what the FSE waits on from the
 *  owner, each item a link to its Needs me row, then its hand-off and its last
 *  signed commits. It collapses; the header counts the waiting items either
 *  way, so "waiting on you: N" reads with the list closed. */
export function FsePanel({ initiative: i }: { initiative: merge.BoardInitiative }) {
  const { view, agents, openNeedsMe } = useBoard();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const group = agents?.groups?.find((g) => g.id === i.id);
  const waiting = fseWaiting(i, group?.cell ? group.threads ?? [] : [], group?.human ?? "", view?.order?.resolved ?? {});
  const fse = i.fse;
  const commits: FSECommit[] = fse?.commits ?? [];
  const seat = group?.crew?.find((s) => s.name === FSE);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0"); } catch { /* per-machine convenience only */ }
  };

  return (
    <section className="panel fse-panel" aria-label="FSE">
      <button className="fse-head" aria-expanded={!collapsed} onClick={toggle}>
        {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        <span className="fse-name mono">{FSE}</span>
        {seat && <span className={`lz ${seat.agent ? "live" : ""}`}>{seat.agent ? seat.agent.state || "running" : "off"}</span>}
        {seat?.agent?.context?.window_size ? <span className="fse-ctx num mono">{Math.round(seat.agent.context.used_percent)}%</span> : null}
        <span className={`lz fse-count ${waiting.length > 0 ? "waiting" : ""}`}>
          waiting on you: <span className="num">{waiting.length}</span>
        </span>
      </button>
      {!collapsed && (
        <div className="fse-body">
          <div className="fse-sec">
            <div className="fse-label">Waiting on you</div>
            {waiting.length === 0 ? (
              <div className="fse-none">Nothing: the FSE waits on no record or thread of yours.</div>
            ) : (
              <ul className="fse-wait">
                {waiting.slice(0, MAX_ITEMS).map((w) => (
                  <li key={w.key}>
                    <button className="fse-item" onClick={() => openNeedsMe(w.key)} title="Open this row in Needs me">
                      {w.kind === "decision" ? <span className="diamond waiting" aria-hidden /> : <span className="fse-q" aria-hidden />}
                      <span className="fse-what">
                        {w.kind === "decision" ? (
                          <><span className="mono num">{w.decision.number}</span> {w.decision.title || w.decision.slug}</>
                        ) : (
                          w.thread.subject || w.thread.id
                        )}
                      </span>
                      <span className="lz">{w.kind === "decision" ? "rule" : "answer"}</span>
                      <span className="fse-age mono num">{age(w)}</span>
                    </button>
                  </li>
                ))}
                {waiting.length > MAX_ITEMS && <li className="fse-none">and <span className="num">{waiting.length - MAX_ITEMS}</span> more in Needs me</li>}
              </ul>
            )}
          </div>

          <div className="fse-sec">
            <div className="fse-label">Hand-off</div>
            {fse?.hand_off ? (
              <div className="fse-handoff">
                <div className="fse-handoff-h">{fse.hand_off.replace(/^HAND-OFF\s*[—–-]?\s*/i, "")}</div>
                {(fse.hand_off_body || "").split("\n").filter((l) => l.trim()).map((l, k) => (
                  <p key={k}>{inline(l.replace(/^\s*[-*]\s+/, ""))}</p>
                ))}
              </div>
            ) : (
              <div className="fse-none">No hand-off: {fse?.path ? "the bitácora has no HAND-OFF section." : "this initiative has no docs/bitacora/fse_bitacora.md."}</div>
            )}
          </div>

          <div className="fse-sec">
            <div className="fse-label">Signed commits</div>
            {commits.length === 0 ? (
              <div className="fse-none">No commit under this root carries a Committed-by: FSE trailer.</div>
            ) : (
              <ul className="fse-feed">
                {commits.map((c) => (
                  <li key={c.sha} title={c.sha}>
                    <span className="fse-when mono num">{when(c.at)}</span>
                    <span className="fse-subj mono">{c.subject}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
