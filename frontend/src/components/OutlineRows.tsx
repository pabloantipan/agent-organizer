import type { merge, model } from "../../wailsjs/go/models";
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { addLocalDays, dayMonth, hhmm } from "../lib/axis";
import { cardBar } from "../lib/cardBar";
import { dateWords, parseISO } from "../lib/dates";
import {
  OUTSIDE, alsoIn, decisionName, gemsOf, mergedWords, mergesAt, outsideWords, roundSegments, roundsHeading, stageDecisions, stageWord,
  staggerGems, waveSpan, waveWord, type OutlineRow, type StageGeo,
} from "../lib/outline";
import { DayBand, EdgePointer, type Zoom } from "./TimeZoom";

/** What every outline row draws with: the zoom and its scale, the stage
 *  geometry, the board's cards, the undated slots, and the outline's
 *  keyboard (one row in the tab order at a time, the one last moved to). */
export type OutlineCtx = {
  z: Zoom;
  initiative: merge.BoardInitiative;
  stages: model.Stage[];
  geo: StageGeo[];
  bySlug: Map<string, merge.BoardCard>;
  now: number;
  today: number;
  showGems: boolean;
  slotLeft: (i: number) => number;
  slotW: number;
  slotOf: Map<number, number>;
  extentOf: (key: string) => { from: number; to: number } | null;
  toggle: (key: string, open: boolean) => void;
  openDecision: (initiative: string, number: string) => void;
  select: (c: merge.BoardCard) => void;
  active: string | null;
  setActive: (key: string) => void;
  labelRef: (key: string, el: HTMLElement | null) => void;
};

const INDENT = 12;

export function OutlineRowView({ r, ctx }: { r: OutlineRow; ctx: OutlineCtx }) {
  switch (r.kind) {
    case "stage": return <StageRow r={r} ctx={ctx} />;
    case "outside": return <OutsideRow r={r} ctx={ctx} />;
    case "exit": return <ExitRow r={r} ctx={ctx} />;
    case "wave": return <WaveRow r={r} ctx={ctx} />;
    case "rounds": return <RoundsRow r={r} ctx={ctx} />;
    case "card": return <CardRow r={r} ctx={ctx} />;
    case "note": return (
      <Row r={r} ctx={ctx} cls="note" label={<><NoChevron /><span className="ol-note">{r.text}</span></>} name={r.text} />
    );
  }
}

/** One outline row: the label column (a treeitem, indented by level, with a
 *  chevron where it opens) beside its lane. */
function Row({ r, ctx, cls, label, name, lane, title, onActivate, expanded }: {
  r: OutlineRow; ctx: OutlineCtx; cls: string; label: ReactNode; name: string; lane?: ReactNode; title?: string;
  onActivate?: () => void; expanded?: boolean;
}) {
  const ext = ctx.extentOf(r.key);
  const props = {
    ref: (el: HTMLElement | null) => ctx.labelRef(r.key, el),
    className: `ol-label tz-label ${onActivate ? "act" : ""}`,
    style: { paddingLeft: 8 + r.level * INDENT } as CSSProperties,
    role: "treeitem",
    "aria-level": r.level + 1,
    "aria-expanded": expanded,
    "aria-label": name,
    tabIndex: ctx.active === r.key ? 0 : -1,
    title: title ?? name,
    onFocus: () => ctx.setActive(r.key),
  };
  return (
    <div className={`ol-row tz-row ${cls.split(" ").filter(Boolean).map((c) => `ol-k-${c}`).join(" ")}`}>
      {onActivate ? <button {...props} onClick={onActivate}>{label}</button> : <div {...props}>{label}</div>}
      <div className="ol-lane tz-lane">
        {lane}
        {ext && <EdgePointer z={ctx.z} from={ext.from} to={ext.to} />}
      </div>
    </div>
  );
}

const Chevron = ({ open }: { open: boolean }) => <span className={`ol-chev ${open ? "open" : ""}`} aria-hidden>▸</span>;
const NoChevron = () => <span className="ol-chev none" aria-hidden />;

// ---- stage -----------------------------------------------------------------

function StageRow({ r, ctx }: { r: Extract<OutlineRow, { kind: "stage" }>; ctx: OutlineCtx }) {
  const s = ctx.stages[r.index];
  const g = ctx.geo[r.index];
  const x = ctx.z.scale.x;
  const word = stageWord(s, g.state);
  const title = s.title || s.id;
  const span = g.end !== null && g.start !== null && g.end > g.start
    ? `${dateWords(new Date(g.start))} to ${dateWords(new Date(g.end))}${g.state === "done" ? "" : ", target"}`
    : g.toToday && g.start !== null ? `since ${dateWords(new Date(g.start))}` : s.target ? `target ${dateWords(s.target)}` : s.appetite ? `appetite ${s.appetite}` : "no dates";
  const missing = (s.gates ?? []).filter((id) => !(ctx.initiative.decisions ?? []).some((d) => Number(d.number) === Number(id) || d.number === id));
  const name = `Stage ${r.index + 1}: ${title}, ${word}, ${span}${missing.length ? `. ${missing.join(", ")} ${missing.length === 1 ? "names" : "name"} no record` : ""}. ${r.open ? "Hide" : "Show"} its waves`;
  const nowEnd = x(addLocalDays(ctx.today, 1));
  const slot = ctx.slotOf.get(r.index);
  const lane = (
    <>
      {g.end !== null && (g.start !== null && g.end > g.start
        ? <Summary cls={g.state} left={x(g.start)} right={x(addLocalDays(g.end, 1))} title={`${title}: ${dateWords(new Date(g.start))} → ${dateWords(new Date(g.end))}${g.state === "done" ? " (done)" : " (target)"}`} />
        : <span className={`ol-sdot ${g.state}`} style={{ left: (x(g.end) + x(addLocalDays(g.end, 1))) / 2 }} title={`${title}: ${g.state === "done" ? "done" : "target"} ${dateWords(new Date(g.end))}`} />)}
      {g.toToday && g.start !== null && <Summary cls="current" left={x(g.start)} right={Math.max(nowEnd, x(g.start) + 4)} title={`${title}: since ${dateWords(new Date(g.start))}, in progress`} />}
      {slot !== undefined && <Planned left={ctx.slotLeft(slot)} width={ctx.slotW} state={g.state} appetite={s.appetite || "no appetite"} title={`${title}: no target. Sized by order only; appetite ${s.appetite || "none"}. No date is computed from it.`} />}
      {ctx.showGems && <Gems decisions={stageDecisions(ctx.stages, r.index, ctx.initiative.decisions)} ctx={ctx} />}
    </>
  );
  return (
    <Row r={r} ctx={ctx} cls={`stage ${g.state}`} name={name} title={s.outcome ? `${title}: ${s.outcome}` : title} expanded={r.open}
      onActivate={() => ctx.toggle(r.key, !r.open)} lane={lane}
      label={<><Chevron open={r.open} /><span className="ol-n num">{r.index + 1}</span><span className="ol-title">{title}</span><span className={`ol-word ${g.state}`}>{word}</span></>} />
  );
}

/** A summary bar with end caps, Project's bracket. */
function Summary({ cls, left, right, title }: { cls: string; left: number; right: number; title: string }) {
  return <span className={`ol-sum ${cls}`} style={{ left, width: Math.max(right - left, 4) }} title={title} />;
}

const AFTER_GAP = 6;

/** An undated stage's dashed slot with its appetite inside when it fits,
 *  else beside it, as Stages has drawn it (leftovers-6 row 13). */
function Planned({ left, width, state, appetite, title }: { left: number; width: number; state: string; appetite: string; title: string }) {
  const l = left + 4;
  const w = Math.max(width - 8, 4);
  const inner = useRef<HTMLSpanElement>(null);
  const [beside, setBeside] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const text = el.scrollWidth;
    if (text <= el.clientWidth) { setBeside(null); return; }
    const lane = el.closest<HTMLElement>(".ol-lane")?.getBoundingClientRect();
    const frame = el.closest<HTMLElement>(".tz-frame");
    const end = lane && frame ? frame.getBoundingClientRect().left + frame.clientWidth - lane.left : Infinity;
    const after = l + w + AFTER_GAP;
    setBeside(after + text <= end ? after : Math.max(0, l - AFTER_GAP - text));
  }, [appetite, l, w]);
  return (
    <>
      <span className={`ol-planned ${state}`} style={{ left: l, width: w }} title={title}>
        <span ref={inner} className="ol-appetite" aria-hidden={beside !== null || undefined} style={beside !== null ? { visibility: "hidden" } : undefined}>{appetite}</span>
      </span>
      {beside !== null && <span className="ol-after" style={{ left: beside }} title={title}>{appetite}</span>}
    </>
  );
}

/** The decisions of a stage on its own row: hollow fuchsia at raised, solid
 *  at ruled, a line between; while waiting a dashed line to today. Same-day
 *  diamonds stagger, the third carries `+N`. Each record is one button, at
 *  its ruled diamond (else its raised one), named with the record; the
 *  raised diamond of a ruled record is the same press, out of the tab
 *  order. Diamonds past the third stay buttons, visually hidden. */
function Gems({ decisions, ctx }: { decisions: model.Decision[]; ctx: OutlineCtx }) {
  const x = ctx.z.scale.x;
  // At Hours a whole-day date is not a point in time: the diamond sits at
  // its day's left edge with the day's band behind it (time-zoom, marks).
  const hours = ctx.z.level === "hours";
  const mid = (d: number) => (hours ? x(d) : (x(d) + x(addLocalDays(d, 1))) / 2);
  const all = decisions.flatMap((d) => gemsOf(d).map((g) => ({ d, g })));
  const st = staggerGems(all.map((a) => a.g.at));
  const xNow = x(ctx.now);
  const lines = decisions.map((d) => {
    const gs = gemsOf(d);
    const raised = gs.find((g) => g.kind !== "ruled");
    const ruled = gs.find((g) => g.kind === "ruled");
    if (raised && ruled) return <span key={`l${d.number}`} className="ol-link" style={{ left: mid(raised.at), width: Math.max(mid(ruled.at) - mid(raised.at), 0) }} aria-hidden />;
    if (raised && raised.kind === "waiting" && xNow > mid(raised.at)) return <span key={`l${d.number}`} className="ol-link waiting" style={{ left: mid(raised.at), width: xNow - mid(raised.at) }} aria-hidden />;
    return null;
  });
  return (
    <>
      {hours && all.map(({ d, g }) => (
        <span key={`b${d.number}-${g.kind}`} className={`tz-band ${g.kind === "ruled" ? "ruled" : "proposed"}`} style={{ left: x(g.at), width: x(addLocalDays(g.at, 1)) - x(g.at) }}
          title={`${decisionName(d)}: all day, no time recorded`} aria-hidden />
      ))}
      {lines}
      {all.map(({ d, g }, i) => {
        const primary = g.kind === "ruled" || !gemsOf(d).some((o) => o.kind === "ruled");
        const name = decisionName(d);
        const open = () => ctx.openDecision(ctx.initiative.id, d.number);
        const s = st[i];
        return (
          <button key={`${d.number}-${g.kind}`} className={`ol-gem ${g.kind} ${s.shown ? "" : "folded"}`}
            style={{ left: mid(g.at) + s.dx }} onClick={open}
            aria-label={primary ? name : undefined} aria-hidden={primary ? undefined : true} tabIndex={primary ? 0 : -1}
            title={g.kind === "ruled" || g.kind === "waiting" ? name : `${d.number} ${d.title}, raised ${dateWords(d.raised)}`}>
            <i />
            {s.more > 0 && <span className="ol-more num" aria-hidden>+{s.more}</span>}
          </button>
        );
      })}
    </>
  );
}

// ---- outside ---------------------------------------------------------------

function OutsideRow({ r, ctx }: { r: Extract<OutlineRow, { kind: "outside" }>; ctx: OutlineCtx }) {
  const ext = ctx.extentOf(r.key);
  const x = ctx.z.scale.x;
  const words = r.open ? "Outside any stage" : outsideWords(r.count);
  return (
    <Row r={r} ctx={ctx} cls="stage outside" name={`${outsideWords(r.count)}. ${r.open ? "Hide" : "Show"} its waves`} expanded={r.open}
      onActivate={() => ctx.toggle(r.key, !r.open)}
      lane={ext && <Summary cls="outside" left={x(ext.from)} right={x(ext.to)} title={`Outside any stage: ${dateWords(new Date(ext.from))} → ${dateWords(new Date(ext.to - 1))}`} />}
      label={<><Chevron open={r.open} /><span className="ol-title subtle">{words}</span></>} />
  );
}

// ---- exit items ------------------------------------------------------------

function ExitRow({ r, ctx }: { r: Extract<OutlineRow, { kind: "exit" }>; ctx: OutlineCtx }) {
  const item = ctx.stages[r.index].exit?.[r.k];
  const met = parseISO(item?.met)?.getTime();
  const x = ctx.z.scale.x;
  const text = item?.text ?? "";
  const name = `${met !== undefined ? "Met" : "Open"}: ${text}${met !== undefined ? `, ${dateWords(item?.met)}` : ""}`;
  return (
    <Row r={r} ctx={ctx} cls={`exit ${met !== undefined ? "met" : ""}`} name={name}
      lane={met !== undefined && <span className="ol-met" style={{ left: (x(met) + x(addLocalDays(met, 1))) / 2 }} title={`met ${dateWords(item?.met)}`}>✓</span>}
      label={<><NoChevron /><span className={`ol-box ${met !== undefined ? "met" : ""}`} aria-hidden>{met !== undefined ? "✓" : ""}</span><span className="ol-title exit">{text}</span></>} />
  );
}

// ---- waves -----------------------------------------------------------------

function WaveRow({ r, ctx }: { r: Extract<OutlineRow, { kind: "wave" }>; ctx: OutlineCtx }) {
  const w = r.wave;
  const z = ctx.z;
  const x = z.scale.x;
  const span = waveSpan(w, ctx.now);
  const word = waveWord(w);
  const also = r.stage === OUTSIDE ? [] : alsoIn(w, r.stage, ctx.stages);
  const alsoText = also.length ? `also in ${also.join(", ")}` : "";
  const when = span ? (w.dot ? dateWords(new Date(span.from)) : `${dateWords(new Date(span.from))} ${hhmm(span.from)} → ${span.open ? "now" : `${dateWords(new Date(span.to))} ${hhmm(span.to)}`}`) : "no dates";
  const task = w.task || w.record;
  const name = `Wave: ${task}${w.supervisor ? `, ${w.supervisor}` : ""}, ${word}, ${when}${alsoText ? `, ${alsoText}` : ""}. ${r.open ? "Hide" : "Show"} its rounds and cards`;
  let lane: ReactNode = null;
  if (span && w.dot) {
    lane = z.level === "hours"
      ? <DayBand z={z} from={span.from} to={span.to} status="now" dot="ol-wdot" title={`${task} · ${w.record}, all day: no time recorded`} />
      : <span className="ol-wdot" style={{ left: (x(span.from) + x(span.to)) / 2 }} title={`${task} · ${w.record}: a run record with no waves block`} />;
  } else if (span) {
    const left = x(span.from);
    const width = Math.max(x(span.to) - left, 4);
    lane = (
      <>
        <span className={`ol-wave ${span.open ? "open" : ""}`} style={{ left, width }} title={`${task}: ${when}. Double-click to fit it`}
          onDoubleClick={(e) => { e.stopPropagation(); z.fitTo(span.from, span.to); }} />
        {alsoText && <span className="ol-after" style={{ left: left + width + AFTER_GAP }}>{alsoText}</span>}
      </>
    );
  }
  return (
    <Row r={r} ctx={ctx} cls={`wave ${w.dot ? "dot" : ""}`} name={name} title={`${task}${w.supervisor ? ` · ${w.supervisor}` : ""} · ${word}${alsoText ? ` · ${alsoText}` : ""}`}
      expanded={r.open} onActivate={() => ctx.toggle(r.key, !r.open)} lane={lane}
      label={<><Chevron open={r.open} /><span className="ol-title">{task}</span>{w.supervisor && <span className="ol-sup mono">{w.supervisor}</span>}<span className={`ol-word ${w.merged ? "merged" : w.dot ? "" : "flight"}`}>{word}</span></>} />
  );
}

/** One Rounds row per wave: each round a segment, a 1 px gap between; a
 *  failed one outlined in magenta with `✕` and `fail · <why>`. Where any
 *  segment would be under 4 px the row draws one merged segment for the
 *  wave's rounds and says `n rounds · k fail` after it, the `✕` kept. */
function RoundsRow({ r, ctx }: { r: Extract<OutlineRow, { kind: "rounds" }>; ctx: OutlineCtx }) {
  const z = ctx.z;
  const x = z.scale.x;
  const segs = roundSegments(r.wave, ctx.now);
  const heading = roundsHeading(segs);
  let lane: ReactNode = null;
  if (segs.length > 0 && mergesAt(segs, x)) {
    const from = Math.min(...segs.map((s) => s.from));
    const to = Math.max(...segs.map((s) => s.to));
    const left = x(from);
    const width = Math.max(x(to) - left, 4);
    const { count, fail } = mergedWords(segs);
    const open = segs.some((s) => s.open);
    lane = (
      <>
        <span className={`ol-seg merged ${fail ? "has-fail" : ""} ${open ? "open" : ""}`} style={{ left, width }} title={segs.map((s) => s.title).join("\n")}>
          {fail && <span className="ol-x" aria-hidden>✕</span>}
        </span>
        <span className="ol-after rounds" style={{ left: left + width + AFTER_GAP }} title={segs.map((s) => s.title).join("\n")}>
          {count}{fail && <> · <span className="ol-fail">{fail}</span></>}
        </span>
      </>
    );
  } else if (segs.length > 0) {
    // A fail's words are never left to the hover alone (P5): one too long
    // for its segment is said after the row's last segment, in magenta.
    const out: string[] = [];
    const drawn = segs.map((s) => {
      const left = x(s.from);
      const width = Math.max(x(s.to) - left - 1, 3);
      const fits = width >= s.word.length * 6.4 + 12;
      if (!fits && s.tone === "fail") out.push(s.word);
      return (
        <span key={s.n} className={`ol-seg ${s.tone} ${s.open ? "open" : ""}`} style={{ left, width }} title={s.title}>
          {fits && <span className="ol-segw">{s.word}</span>}
          {s.tone === "fail" && <span className="ol-x" aria-hidden>✕</span>}
        </span>
      );
    });
    const end = x(Math.max(...segs.map((s) => s.to)));
    lane = (
      <>
        {drawn}
        {out.length > 0 && <span className="ol-after ol-fail" style={{ left: end + AFTER_GAP + 4 }} title={segs.filter((s) => s.tone === "fail").map((s) => s.title).join("\n")}>✕ {out.join("; ")}</span>}
      </>
    );
  }
  const fails = segs.filter((s) => s.tone === "fail");
  const name = `${heading}${fails.length ? `: ${fails.map((s) => `round ${s.n} ${s.word}`).join(", ")}` : ""}`;
  return (
    <Row r={r} ctx={ctx} cls={`rounds ${segs.length ? "" : "none"}`} name={name} title={segs.length ? segs.map((s) => s.title).join("\n") : heading} lane={lane}
      label={<><NoChevron /><span className={`ol-title rounds ${segs.length ? "" : "none"}`}>{heading}</span></>} />
  );
}

// ---- cards -----------------------------------------------------------------

function CardRow({ r, ctx }: { r: Extract<OutlineRow, { kind: "card" }>; ctx: OutlineCtx }) {
  const c = ctx.bySlug.get(r.slug);
  const z = ctx.z;
  const x = z.scale.x;
  if (!c) {
    return <Row r={r} ctx={ctx} cls="card missing" name={`${r.slug}, not on the board`}
      label={<><NoChevron /><span className="ol-title subtle">{r.slug}</span><span className="ol-word">not on the board</span></>} />;
  }
  const b = cardBar(c, ctx.today);
  const atHours = z.level === "hours";
  const from = b.start.at;
  const to = b.openEnded ? (atHours ? ctx.now : addLocalDays(ctx.today, 1)) : b.end.timed ? b.end.at : addLocalDays(b.end.at, 1);
  const dayMid = (d: number) => (x(d) + x(addLocalDays(d, 1))) / 2;
  const lane = b.dot
    ? (atHours
      ? <DayBand z={z} from={from} to={to} status={c.status} dot="g-dot" title={`${c.slug} · ${dateWords(new Date(from))}, all day: no time recorded`} />
      : <span className={`g-dot ol-cdot ${c.status}`} style={{ left: dayMid(from) }} title={`${c.slug} · ${dateWords(new Date(from))}`} />)
    : <span className={`ol-card ${c.status} ${b.openEnded ? "open" : ""} ${b.overdue ? "overdue" : ""}`} style={{ left: x(from), width: Math.max(x(to) - x(from), 4) }}
        title={`${c.slug}: ${dateWords(new Date(from))} → ${b.openEnded ? "in progress" : dateWords(new Date(b.end.at))}${c.due ? `, due ${dayMonth(b.end.at)}` : ""}`} />;
  const title = c.title || c.slug;
  return (
    <Row r={r} ctx={ctx} cls={`card ${c.status}`} name={`Card ${title}, ${c.status}. Enter opens its card back`} title={c.next ? `${title}\nnext: ${c.next}` : title}
      onActivate={() => ctx.select(c)} lane={lane}
      label={<><NoChevron /><span className="ol-title">{title}</span><span className={`lz ${c.status}`}>{c.status}</span></>} />
  );
}
