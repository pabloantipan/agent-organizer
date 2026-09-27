import { useEffect, useState } from "react";
import type { merge, model } from "../../wailsjs/go/models";
import { api, type RunsView } from "../hooks/useWails";
import { parseISO, today, daysBetween } from "../lib/dates";
import { useBoard } from "../stores/board.store";
import { FsePanel } from "./FsePanel";
import "../styles/overview.css";

type BoardInitiative = merge.BoardInitiative;

const RUNS_EVERY_MS = 30000;
const REVIEW_RE = /^\s*review:/i;

/** 1234 → "1.2k", 1_600_000 → "1.6M": token figures, never dollars (0020). */
export function tokens(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return String(n);
}

const daysSince = (iso: string | undefined) => {
  const d = parseISO(iso?.slice(0, 10));
  return d ? Math.max(0, daysBetween(d, today())) : null;
};

/** One gate of the current stage: the decision record it names, drawn as a
 *  diamond (hollow fuchsia waiting, solid indigo ruled), or "missing" when no
 *  record has that number. The scan reports the missing one as a problem;
 *  here it is a row like the others. */
function GateRow({ initiative, number, record }: { initiative: string; number: string; record?: model.Decision }) {
  const { openNeedsMe, openInitiative } = useBoard();
  if (!record) {
    return (
      <li className="gl-row missing" title={`no decision record ${number} in working-on/decisions/`}>
        <span className="diamond missing" aria-hidden />
        <span className="gl-text"><span className="mono num">{number}</span> no record by this number</span>
        <span className="lz">missing</span>
      </li>
    );
  }
  const waiting = record.status === "proposed";
  const ruled = record.status === "ruled";
  const waited = daysSince(record.raised);
  const open = () => (waiting ? openNeedsMe(`decision:${initiative}/${record.number}`) : openInitiative(initiative, "decisions"));
  return (
    <li>
      <button className="gl-row" onClick={open} title={waiting ? "Open this record's row in Needs me" : "Open in Decisions"}>
        <span className={`diamond ${waiting ? "waiting" : ruled ? "ruled" : "other"}`} aria-hidden />
        <span className="gl-text"><span className="mono num">{record.number}</span> {record.title || record.slug}</span>
        {waiting ? (
          <span className="lz waiting">waiting <span className="num">{waited === null ? "" : `${waited}d`}</span></span>
        ) : ruled ? (
          <span className="lz ruled">ruled <span className="num">{record.ruled}</span></span>
        ) : (
          <span className="lz">{record.status}</span>
        )}
      </button>
    </li>
  );
}

function ExitRow({ item }: { item: model.ExitItem }) {
  const met = parseISO(item.met);
  return (
    <li className={`gl-row exit ${met ? "met" : ""}`}>
      <span className={`check ${met ? "ok" : ""}`} role="img" aria-label={met ? "met" : "not met"} />
      <span className="gl-text">{item.text}</span>
      {met ? <span className="lz mono num">met {item.met}</span> : <span className="lz">open</span>}
    </li>
  );
}

/** The current stage (FR-18, O4): its gates as decision records, then its exit items. */
function StageGates({ initiative: i }: { initiative: BoardInitiative }) {
  const stages = i.stages ?? [];
  const k = stages.findIndex((s) => s.current);
  if (stages.length === 0) {
    return (
      <div className="panel empty-state">
        <div>No roadmap yet.</div>
        <div className="sub">Stages come from working-on/roadmap.yaml; the roadmapping skill writes it.</div>
      </div>
    );
  }
  if (k < 0) {
    return <div className="panel empty-state"><div>Every stage is done.</div><div className="sub">The roadmap has no stage left without a done date.</div></div>;
  }
  const s = stages[k];
  const byNumber = new Map((i.decisions ?? []).map((d) => [d.number, d]));
  const gates = s.gates ?? [];
  const exit = s.exit ?? [];
  return (
    <section className="ov-sec">
      <h2 className="sec-title">
        Stage <span className="sec-count">{k + 1}</span> · {s.title || s.id}
        <span className="sec-sub">what stands between it and its exit</span>
      </h2>
      <div className="panel gate-list">
        {s.outcome && <div className="gl-outcome">{s.outcome}</div>}
        <div className="gl-label">Gates <span className="num">{gates.length}</span></div>
        {gates.length === 0 ? (
          <div className="gl-none">No decision gates this stage.</div>
        ) : (
          <ul className="gl-rows">{gates.map((g) => <GateRow key={g} initiative={i.id} number={g} record={byNumber.get(g)} />)}</ul>
        )}
        <div className="gl-label">Exit <span className="num">{exit.filter((x) => parseISO(x.met)).length}/{exit.length}</span></div>
        {exit.length === 0 ? (
          <div className="gl-none">No exit items written.</div>
        ) : (
          <ul className="gl-rows">{exit.map((x, n) => <ExitRow key={n} item={x} />)}</ul>
        )}
      </div>
    </section>
  );
}

/** Work now: cards per column, and input tokens per card and in total from
 *  the runs binding (FR-10: archived plus live). Wave.InputTokens is live
 *  only, so it is not the total. */
function WorkSummary({ initiative: i }: { initiative: BoardInitiative }) {
  const { view } = useBoard();
  const [runs, setRuns] = useState<RunsView | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let live = true;
    const load = () => api.runs(i.id).then((r) => { if (live) { setRuns(r); setErr(""); } }).catch((e) => { if (live) setErr(String(e)); });
    setRuns(null);
    load();
    const t = window.setInterval(load, RUNS_EVERY_MS);
    return () => { live = false; window.clearInterval(t); };
  }, [i.id]);

  const cols = view?.board.columns ?? {};
  const mine = (st: string) => (cols[st] ?? []).filter((c) => c.initiative_id === i.id && c.machine === i.machine);
  const open = [...mine("now"), ...mine("blocked"), ...mine("next")];
  const review = open.filter((c) => REVIEW_RE.test(c.next || ""));
  const notReview = (st: string) => mine(st).filter((c) => !REVIEW_RE.test(c.next || "")).length;
  const counts: [string, number, string][] = [
    ["next", notReview("next"), "next"],
    ["now", notReview("now"), "now"],
    ["blocked", notReview("blocked"), "blocked"],
    ["in review", review.length, "review"],
    ["done", i.done ?? 0, "done"],
  ];
  const perCard = [...(runs?.cards ?? [])].filter((c) => c.input_tokens > 0).sort((a, b) => b.input_tokens - a.input_tokens);

  return (
    <section className="ov-sec">
      <h2 className="sec-title">Work now</h2>
      <div className="panel work-sum">
        <ul className="ws-counts">
          {counts.map(([label, n, tone]) => (
            <li key={label} className={`ws-count ${tone}`}><b className="num">{n}</b> {label}</li>
          ))}
        </ul>
        <div className="ws-tokens">
          <div className="gl-label">Input tokens <span className="sec-sub">archived and live sessions</span></div>
          {err ? (
            <div className="gl-none">Runs could not be read: {err}</div>
          ) : !runs ? (
            <div className="gl-none">Reading runs…</div>
          ) : (
            <>
              <div className="ws-total"><b className="num mono">{tokens(runs.input_tokens)}</b> in total</div>
              {perCard.length === 0 ? (
                <div className="gl-none">No run has been attributed to a card yet.</div>
              ) : (
                <ul className="ws-cards">
                  {perCard.map((c) => (
                    <li key={c.card || "-"}>
                      <span className={`mono ${c.card ? "" : "unattributed"}`}>{c.card || "no card"}</span>
                      {c.live > 0 && <span className="lz live"><span className="num">{c.live}</span> live</span>}
                      <span className="mono num ws-n">{tokens(c.input_tokens)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/** Overview of one initiative (FR-18): the current stage's gates and exit
 *  items and the work summary on the left, the FSE panel on the right. */
export function Overview({ initiative }: { initiative: BoardInitiative }) {
  return (
    <div className="ov">
      <div className="ov-main">
        <StageGates initiative={initiative} />
        <WorkSummary initiative={initiative} />
      </div>
      <section className="ov-sec">
        <h2 className="sec-title">FSE <span className="sec-sub">what it waits on and did lately</span></h2>
        <FsePanel initiative={initiative} />
      </section>
    </div>
  );
}
