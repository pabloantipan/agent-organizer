import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { merge, service } from "../../wailsjs/go/models";
import * as App from "../../wailsjs/go/main/App";
import { useBoard } from "../stores/board.store";
import { api } from "../hooks/useWails";
import { useLiveRegion } from "../lib/liveRegion";
import {
  CUSTOM, NO_CARD_PASSED, argsOf, arrivalPreset, captionOf, clock, copyReport, costWords, customWindow, day,
  latestRun, markSeen, notDrawn, presetsOf, reasonOf, remoteLine, rememberPreset, rememberedPreset, roundWords, roundsOf,
  rowName, rowTime, rowsOf, rulingName, runPlace, seenAtOf, spanWords, spansDays, toLocalInput, waveCell, waveFooterParts, NO_RUN_RECORD,
  waveLabel, waveLinkName, waveTarget, whileAway, type LineRow, type Preset, type PresetKind, type Row, type Strip, type WaveTarget,
} from "../lib/runReport";
import { inactiveIds } from "../lib/queue";
import { openSpec } from "./SpecReader";
import { RunTracks } from "./RunTracks";
import { running } from "./WaveStrip";
import "../styles/runreport.css";

type BoardInitiative = merge.BoardInitiative;

/** Re-read while live (FR-12): every 60 s, with no live announcement. */
export const LIVE_EVERY_MS = 60000;
/** Under this width of the section the tracks' `waits on` moves under its row (FR-13, AR14). */
export const RR_NARROW_BELOW = 820;

/** Where the view goes when a link is pressed: a card's back, a decision
 *  record, a wave by its target (`waveTarget`: its run record in the
 *  reader, Needs me's unread row, or Work with its strip). Without
 *  `waveTarget` every wave goes to Work. */
export type Nav = {
  card: (slug: string) => void;
  decision: (id: string) => void;
  wave: (w: service.RunWave, el?: HTMLElement | null) => void;
  waveTarget?: (w: service.RunWave) => WaveTarget;
};

/** What a wave's press calls, by its target (FR-15, FR-17): the run record
 *  in the reader over the report, the initiative's unread row in Needs me,
 *  or Work with the wave's strip (PW4). */
export function goToWave(
  id: string, w: service.RunWave, t: WaveTarget, el: HTMLElement | null,
  go: { openSpec: typeof openSpec; openNeedsMe: (key: string) => void; openWave: (id: string, wave: number | string) => void },
) {
  if (t.kind === "none") return;
  if (t.kind === "record") void go.openSpec(el, id, t.path, true, "the run report", t.unread);
  else if (t.kind === "unread") go.openNeedsMe(`unread:${id}`);
  else go.openWave(id, w.wave);
}

/** The wave numbers Work draws a strip for: Work's own predicate (`running`,
 *  Board.tsx) over the agents feed's waves of the initiative, the one place
 *  the footer asks it (FR-7). */
export const stripsOf = (ws: service.Wave[] | null | undefined): Strip[] =>
  (ws ?? []).filter(running).map((w) => ({ n: w.n, supervisor: w.supervisor || undefined }));

/** One window drawn: the preset (or Custom's window) and what came back. */
export type Shown = { kind: PresetKind; since: number; until: number; live: boolean };

/** A card as a link to its back; the commit lives in its name and hover (A2). */
export function CardLink({ slug, commit, nav }: { slug: string; commit?: string; nav: Nav }) {
  return (
    <button type="button" className="rr-card" onClick={() => nav.card(slug)} title={commit ? `${slug} · ${commit}` : slug} aria-label={commit ? `${slug}, commit ${commit}` : slug}>
      {slug}
    </button>
  );
}

/** A progress line with its disclosure (FR-7, FR-8). */
function LineRowView({ row, time, report, nav, open: initiallyOpen }: { row: LineRow; time: string; report: service.FactoryReport; nav: Nav; open?: boolean }) {
  const [open, setOpen] = useState(!!initiallyOpen);
  const l = row.line;
  const rounds = roundsOf(report, row);
  const id = `rr-cost-${l.t}`;
  return (
    <li className="rr-row line" aria-label={rowName(row, time)}>
      <span className="rr-time mono">{time}</span>
      <span className="rr-wave mono">{waveCell(row)}</span>
      <span className="rr-bar" aria-hidden><span className="rr-fill" style={{ width: `${Math.max(0, Math.min(100, l.pct))}%` }} /></span>
      <span className="rr-cards">
        <span className="rr-count">{l.cards.length} {l.cards.length === 1 ? "card" : "cards"}</span>
        {l.cards.map((c, k) => <CardLink key={c} slug={c} commit={l.commits?.[k]} nav={nav} />)}
      </span>
      <span className="rr-pct mono">{l.pct}%</span>
      <button type="button" className="rr-more" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        <span aria-hidden>{open ? "▾" : "▸"}</span> {costWords(row)}
      </button>
      {open && (
        <ul className="rr-rounds" id={id}>
          {rounds.length === 0 ? <li>No round recorded for these cards in this window.</li> : rounds.map((rd, k) => (
            <li key={k} className={rd.result === "fail" ? "failed" : ""}><span className="mono">{rd.wave}</span> {roundWords(rd)}</li>
          ))}
        </ul>
      )}
    </li>
  );
}

function OtherRow({ row, time }: { row: Exclude<Row, LineRow>; time: string }) {
  if (row.kind === "mode") {
    return (
      <li className="rr-row mode" aria-label={rowName(row, time)}>
        <span className="rr-time mono">{time}</span>
        <span className="rr-wave mono" aria-hidden>·</span>
        <span className="rr-words">{row.words}</span>
      </li>
    );
  }
  const d = row.dead;
  return (
    <li className={`rr-row dead${row.now ? " now" : ""}`} aria-label={rowName(row, time)}>
      <span className="rr-time mono">{time}</span>
      <span className="rr-wave mono" aria-hidden>·</span>
      <span className="rr-bar hatch" aria-hidden />
      <span className="rr-words">{d.cause} · {row.now ? <b>stopped now</b> : spanWords(d.minutes)}</span>
    </li>
  );
}

/** Chart 1 with option B's column, disclosure and footer. */
export function Progress({ report, lineTokens, shown, nav, openRows }: { report: service.FactoryReport; lineTokens: service.LineTokens[] | null | undefined; shown: Shown; nav: Nav; openRows?: boolean }) {
  const rows = rowsOf(report, shown.kind, shown.live, lineTokens);
  const spans = spansDays(report);
  const none = (report.progress?.denominator?.count ?? 0) === 0;
  const waves = report.waves?.waves ?? [];
  return (
    <div className={`rr-progress${spans ? " days" : ""}`}>
      <p className="rr-caption">{captionOf(report)}</p>
      {none && <p className="rr-none">{NO_CARD_PASSED}</p>}
      <div className="rr-head" aria-hidden><span>time</span><span>wave</span><span /><span /><span>share</span></div>
      <ol className="rr-rows">
        {rows.map((r, i) => r.kind === "line"
          ? <LineRowView key={`l${r.t}`} row={r} time={rowTime(rows, i, spans)} report={report} nav={nav} open={openRows} />
          : <OtherRow key={`${r.kind}${i}`} row={r} time={rowTime(rows, i, spans)} />)}
      </ol>
      {(report.progress?.notes ?? []).map((n, k) => <p key={k} className="rr-note">{n}</p>)}
      {waves.length > 0 && (
        <div className="rr-waves">
          <h4 className="rr-sub">Waves in this window</h4>
          <ul>
            {waves.map((w) => {
              const t = nav.waveTarget?.(w) ?? { kind: "work" as const };
              const name = waveLinkName(waveLabel(w, waves), t, w.key);
              // The wave in the link colour when it presses, muted with the
              // words on the line when it does not (leftovers-67 FR-8, AR27).
              const { wave, rest } = waveFooterParts(w);
              return (
                <li key={w.key}>
                  {t.kind === "none"
                    ? <span className="rr-wave-line still" title={name} aria-label={name}>
                        {[<span key="w" className="rr-wave-key">{wave}</span>, rest, <span key="n" className="rr-no-record">{NO_RUN_RECORD}</span>]}
                      </span>
                    : <button type="button" className="rr-wave-line" onClick={(e) => nav.wave(w, e?.currentTarget)} title={name} aria-label={name}>
                        {[<span key="w" className="rr-wave-key">{wave}</span>, rest]}
                      </button>}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {(report.waves?.notes ?? []).map((n, k) => <p key={`w${k}`} className="rr-note">{n}</p>)}
    </div>
  );
}

/** Ruled while you were away (FR-10): absent when the list is empty. */
export function Rulings({ rulings, nav }: { rulings: service.Ruling[] | null | undefined; nav: Nav }) {
  const list = rulings ?? [];
  if (list.length === 0) return null;
  return (
    <div className="rr-rulings">
      <h4 className="rr-sub">Ruled while you were away <span className="num">{list.length}</span></h4>
      <ul>
        {list.map((r) => (
          <li key={r.id}>
            <button type="button" className="rr-ruling" onClick={() => nav.decision(r.id)} aria-label={rulingName(r)} title="Open the record in Decisions">
              <span className="diamond ruled" aria-hidden />
              <span className="mono num">{r.id}</span>
              <span className="rr-ruling-title">{r.title}</span>
              {r.ruled_by && <span className="rr-meta">ruled by {r.ruled_by}</span>}
              <span className="rr-meta mono">{clock(r.ruled_at)}</span>
              {whileAway(r) && <span className="lz tone">while away</span>}
            </button>
            {r.note && <p className="rr-ruling-note">{r.note}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The window control (FR-3, A1): the presets, then Custom… with From and To. */
function WindowControl({ presets, pick, custom, onPick, onCustom }: {
  presets: Preset[]; pick: string; custom: { from: string; to: string; error: string };
  onPick: (key: string) => void; onCustom: (from: string, to: string) => void;
}) {
  return (
    <span className="rr-window">
      <label>
        <span className="sr-only">Window</span>
        <select value={pick} onChange={(e) => onPick(e.target.value)}>
          {presets.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          <option value={CUSTOM}>Custom…</option>
        </select>
      </label>
      {pick === CUSTOM && (
        <span className="rr-custom">
          <label>From <input type="datetime-local" value={custom.from} onChange={(e) => onCustom(e.target.value, custom.to)} /></label>
          <label>To <input type="datetime-local" value={custom.to} onChange={(e) => onCustom(custom.from, e.target.value)} /></label>
          {custom.error && <span className="rr-error" role="status">{custom.error}</span>}
        </span>
      )}
    </span>
  );
}

export type ViewProps = {
  heading: string;
  presets: Preset[];
  pick: string;
  custom: { from: string; to: string; error: string };
  shown: Shown | null;
  data: service.RunReport | null;
  error: string;
  said: string;
  narrow: boolean;
  folded: boolean;
  foldLabel: string;
  nav: Nav;
  onPick: (key: string) => void;
  onCustom: (from: string, to: string) => void;
  onCopy: () => void;
  onUnfold: () => void;
  openRows?: boolean;
  showDone?: boolean;
};

/** The section as drawn from what it was given; RunReport feeds it. */
export function RunReportView(p: ViewProps) {
  if (p.folded) {
    return (
      <section className="rr fold" aria-label="Last run">
        <button type="button" className="rr-unfold" aria-expanded={false} onClick={p.onUnfold}><span aria-hidden>▸</span> {p.foldLabel}</button>
      </section>
    );
  }
  const report = p.data?.report ?? null;
  return (
    <section className={`rr${p.narrow ? " narrow" : ""}`} aria-labelledby="rr-title" id="while-you-were-away">
      <header className="rr-top">
        <h2 className="sec-title" id="rr-title">{p.heading}</h2>
        <WindowControl presets={p.presets} pick={p.pick} custom={p.custom} onPick={p.onPick} onCustom={p.onCustom} />
        <button type="button" className="rr-copy" onClick={p.onCopy} disabled={!report || !!p.error}>Copy as text</button>
      </header>
      <div className="sr-only" role="status" aria-live="polite">{p.said}</div>
      <div className="panel rr-body">
        {p.error ? (
          <p className="rr-not-drawn">{notDrawn(p.error)}</p>
        ) : !report || !p.shown ? (
          <p className="rr-note">Reading the report…</p>
        ) : !report.window ? (
          <p className="rr-note">{report.why}</p>
        ) : (
          <>
            <Progress report={report} lineTokens={p.data?.line_tokens} shown={p.shown} nav={p.nav} openRows={p.openRows} />
            <RunTracks report={report} nav={p.nav} narrow={p.narrow} showDone={p.showDone} />
            <Rulings rulings={report.rulings} nav={p.nav} />
          </>
        )}
      </div>
    </section>
  );
}

const nowS = () => Math.floor(Date.now() / 1000);

/** The heading (FR-12): `Running now · since 23:40` while live. */
export function headingOf(shown: Shown | null): string {
  return shown?.live ? `Running now · since ${clock(shown.since)}` : "While you were away";
}

/** Overview's `While you were away` (leftovers-57 FR-7 to FR-13): reads the
 *  windows, draws the picked one, and places itself by the recent rule:
 *  first while live or recent, folded at the end after (the section is the
 *  first child of Overview's grid, ordered by runreport.css). A remote
 *  initiative gets the one line; no run in 14 days, nothing. */
export function RunReport({ initiative }: { initiative: BoardInitiative }) {
  if (!initiative.local) {
    return (
      <div className="rr-place head">
        <section className="rr remote" aria-label="Run report">
          <p className="rr-note">{remoteLine(initiative.machine)}</p>
        </section>
      </div>
    );
  }
  return <LocalRunReport id={initiative.id} />;
}

function LocalRunReport({ id }: { id: string }) {
  const { openCardLanding, openDecision, openNeedsMe, openWave, view, agents, applyAgents } = useBoard();
  // Work's strips come from the agents feed; load it as Work does when the
  // app has not yet (FR-7).
  useEffect(() => {
    if (!agents) api.getAgents().then(applyAgents, () => undefined);
  }, [agents, applyAgents]);
  const [windows, setWindows] = useState<service.ReportWindow[] | null>(null);
  const [wErr, setWErr] = useState("");
  const [pick, setPick] = useState<string | null>(null);
  const [custom, setCustom] = useState({ from: "", to: "", error: "" });
  const [customWin, setCustomWin] = useState<{ since: number; until: number } | null>(null);
  const [data, setData] = useState<service.RunReport | null>(null);
  const [err, setErr] = useState("");
  const [tick, setTick] = useState(0);
  const [unfolded, setUnfolded] = useState(false);
  const [said, say] = useLiveRegion();
  const pane = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    let live = true;
    setWindows(null); setWErr(""); setPick(null); setData(null); setUnfolded(false);
    App.ReportWindows(id).then((w) => { if (live) setWindows(w.windows ?? []); }).catch((e) => { if (live) setWErr(reasonOf(e)); });
    return () => { live = false; };
  }, [id]);

  const presets = useMemo(() => presetsOf(windows, nowS()), [windows, tick]);
  const latest = latestRun(presets);
  useEffect(() => {
    if (windows && pick === null) setPick(arrivalPreset(presets, rememberedPreset(id))?.key ?? null);
  }, [windows, pick, presets, id]);

  const preset = presets.find((x) => x.key === pick) ?? null;
  const shown: Shown | null = pick === CUSTOM
    ? (customWin ? { kind: "custom", ...customWin, live: false } : null)
    : preset ? { kind: preset.kind, since: preset.since, until: preset.kind === "current" ? nowS() : preset.until, live: preset.kind === "current" } : null;
  const since = shown?.since, until = shown?.kind === "current" ? undefined : shown?.until;

  useEffect(() => {
    if (since === undefined || !shown) return;
    let live = true;
    const load = () => {
      const [s, u] = argsOf(since, shown.kind === "current" ? nowS() : shown.until);
      App.Report(id, s, u).then((r) => { if (live) { setData(r); setErr(""); } }).catch((e) => { if (live) { setData(null); setErr(reasonOf(e)); } });
    };
    load();
    if (!shown.live) return () => { live = false; };
    const t = window.setInterval(() => { load(); setTick((n) => n + 1); }, LIVE_EVERY_MS);
    return () => { live = false; window.clearInterval(t); };
    // until is undefined while live, so the interval is not re-armed every render.
  }, [id, since, until, shown?.kind]);

  useLayoutEffect(() => {
    const el = pane.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () => setNarrow(el.clientWidth > 0 && el.clientWidth < RR_NARROW_BELOW);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [windows]);

  const place = latest ? runPlace({ live: latest.kind === "current", until: latest.until * 1000, seenAt: seenAtOf(id, latest.until), now: Date.now() }) : "head";
  const folded = place === "fold" && !unfolded;
  useEffect(() => {
    if (latest && !folded && latest.kind !== "current") markSeen(id, latest.until);
  }, [id, latest?.until, folded]);

  if (wErr) {
    return (
      <div ref={pane} className="rr-place head">
        <section className="rr" aria-label="While you were away">
          <h2 className="sec-title">While you were away</h2>
          <div className="panel rr-body"><p className="rr-not-drawn">{notDrawn(wErr)}</p></div>
        </section>
      </div>
    );
  }
  if (!windows || !latest) return null; // never a run in the 14 days: absent

  const init = view?.board.initiatives.find((x) => x.id === id);
  const active = !inactiveIds(view).has(id);
  const strips = stripsOf(agents?.groups?.find((g) => g.id === id)?.waves);
  const targetOf = (w: service.RunWave) => waveTarget(w, { root: init?.path ?? data?.report?.root ?? "", waves: init?.waves, problems: init?.problems, active, strips });

  const nav: Nav = {
    card: (slug) => {
      const cols = view?.board.columns ?? {};
      const all = Object.values(cols).flat().filter((c) => c.initiative_id === id);
      const card = all.find((c) => c.slug === slug && c.local) ?? all.find((c) => c.slug === slug);
      if (card) openCardLanding(card);
    },
    decision: (n) => openDecision(id, n),
    waveTarget: (w) => targetOf(w),
    wave: (w, el) => goToWave(id, w, targetOf(w), el ?? null, { openSpec, openNeedsMe, openWave }),
  };
  const onPick = (key: string) => {
    setPick(key);
    if (key !== CUSTOM) { rememberPreset(id, key); return; }
    const from = custom.from || toLocalInput(shown?.since ?? nowS() - 86400);
    const to = custom.to || toLocalInput(shown?.until ?? nowS());
    setCustom({ from, to, error: "" });
    const w = customWindow(from, to);
    if (w && !("error" in w)) setCustomWin(w);
  };
  const onCustom = (from: string, to: string) => {
    const w = customWindow(from, to);
    if (w && "error" in w) { setCustom({ from, to, error: w.error }); return; }
    setCustom({ from, to, error: "" });
    if (w) setCustomWin(w);
  };
  const onCopy = () => {
    if (!shown) return;
    const [s, u] = argsOf(shown.since, shown.live ? nowS() : shown.until);
    void copyReport(() => App.ReportText(id, s, u), (t) => navigator.clipboard.writeText(t), say);
  };

  return (
    <div ref={pane} className={`rr-place ${folded ? "fold" : "head"}`}>
      <RunReportView
        heading={headingOf(shown)} presets={presets} pick={pick ?? ""} custom={custom} shown={shown} data={data} error={err}
        said={said} narrow={narrow} folded={folded} foldLabel={`Last run · ${day(latest.until)}`} nav={nav}
        onPick={onPick} onCustom={onCustom} onCopy={onCopy} onUnfold={() => setUnfolded(true)}
      />
    </div>
  );
}
