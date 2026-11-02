import { Fragment, useLayoutEffect, useRef, useState } from "react";
import type { service } from "../../wailsjs/go/models";
import { dateWords } from "../lib/dates";
import { LOCAL_CAPTION, NO_TRACKS, boardAsOf, envCell, moreWaits, trackName, trackTitle, tracksOf, waitsThatFit, type TrackRow } from "../lib/runReport";
import type { Nav } from "./RunReport";

const RECORD_RE = /^\d{1,4}$/;

/** One wait: a record number opens the record, a card slug its back;
 *  anything else is words. The owner reads in parentheses (FR-1, AR22). */
function Wait({ w, nav }: { w: service.Wait; nav: Nav }) {
  const what = w.what || "";
  const slug = /^[a-z0-9][a-z0-9-]*$/i.test(what) && !RECORD_RE.test(what) ? what : null;
  return (
    <>
      {RECORD_RE.test(what)
        ? <button type="button" className="rr-card" onClick={() => nav.decision(what.padStart(4, "0"))}>{what}</button>
        : slug ? <button type="button" className="rr-card" onClick={() => nav.card(slug)}>{slug}</button>
        : <span>{what}</span>}
      {w.who && <span className="rt-who"> ({w.who})</span>}
    </>
  );
}

/** What a track waits on, on one line (FR-1, AR22): `0002 (pablo) · 0003
 *  (pablo)`, `·` between waits only; past the cell's width the waits that
 *  do not fit become `+N`, the rest in its hover and name. Every wait is
 *  measured once, drawn hidden, so the fit holds on resize. */
export function Waits({ waits, nav }: { waits: service.Wait[]; nav: Nav }) {
  const cell = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(waits.length);
  useLayoutEffect(() => {
    const el = cell.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const fit = () => {
      const items = Array.from(el.querySelectorAll<HTMLElement>(".rt-measure > .rt-wait"));
      const sep = el.querySelector<HTMLElement>(".rt-measure > .rt-sep")?.getBoundingClientRect().width ?? 0;
      const plus = el.querySelector<HTMLElement>(".rt-measure > .rt-more")?.getBoundingClientRect().width ?? 0;
      const avail = el.getBoundingClientRect().width;
      if (avail > 0) setShown(waitsThatFit(items.map((x) => x.getBoundingClientRect().width), sep, plus, avail));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [waits]);
  const more = moreWaits(waits, shown);
  return (
    <span ref={cell} className="rt-waitline">
      {waits.slice(0, shown).map((w, k) => (
        <span key={k} className="rt-wait">
          {k > 0 && <span className="rt-sep" aria-hidden>·</span>}
          <Wait w={w} nav={nav} />
        </span>
      ))}
      {more && <span className="rt-more" title={more.name} aria-label={more.name}><span className="rt-sep" aria-hidden>·</span>{more.text}</span>}
      <span className="rt-measure" aria-hidden>
        {waits.map((w, k) => <span key={k} className="rt-wait"><span className="rt-what">{w.what}</span>{w.who ? <span className="rt-who"> ({w.who})</span> : null}</span>)}
        <span className="rt-sep">·</span>
        <span className="rt-more">+{waits.length}</span>
      </span>
    </span>
  );
}

/** One track row: the letter, title and stage; `local` and the JSON's other
 *  envs; under it the fraction and what is left; `waits on` beside it, or
 *  under the fraction in a narrow section (FR-13, AR14). */
function TrackRowView({ x, prev, envs, nav, toCut }: { x: TrackRow; prev: TrackRow | null; envs: string[]; nav: Nav; toCut: Set<string> }) {
  const t = x.track;
  const waits = t.waits ?? [];
  return (
    <li className={`rt-row${prev ? " chained" : ""}`} aria-label={trackName(x, prev, envs)}>
      {prev && <span className="rt-link" aria-hidden>↓</span>}
      <span className="rt-name">
        <span className="rt-letter mono" aria-hidden>{x.letter}</span>
        <span className="rt-title">{trackTitle(t)}</span>
        {x.stage !== null && <span className="rt-stage">stage {x.stage}</span>}
        {x.current && <span className="lz now">now</span>}
      </span>
      {envs.map((e) => <span key={e} className="rt-env mono num">{envCell(t.env?.[e])}</span>)}
      <span className="rt-waits">{waits.length > 0 && <Waits waits={waits} nav={nav} />}</span>
      <span className="rt-frac">
        {t.planned > 0 ? (
          <>
            <span className="mono num">{t.passed}/{t.planned}</span>
            {/* The comma follows its item as a sibling, outside the link, so a
                link's side padding can take it in (leftovers-72 FR-1, AR35). */}
            {(t.left ?? []).length > 0 && <> · left {(t.left ?? []).map((s, k) => (
              <Fragment key={s}>{k > 0 && <><span className="rt-comma">,</span>{" "}</>}{toCut.has(s) ? <span className="rt-tocut">{s} (not cut)</span> : <button type="button" className="rr-card" onClick={() => nav.card(s)}>{s}</button>}</Fragment>
            ))}</>}
          </>
        ) : "no card names it"}
      </span>
    </li>
  );
}

/** Chart 2 as Amendment 2 draws it (FR-9). Tracks come in the command's
 *  order, a chain in one column joined by `↓`; done ones fold. */
export function RunTracks({ report, nav, narrow, showDone }: { report: service.FactoryReport; nav: Nav; narrow?: boolean; showDone?: boolean }) {
  const [doneOpen, setDoneOpen] = useState(!!showDone);
  const tr = report.tracks;
  const { open, done } = tracksOf(report);
  if (!tr || !tr.drawn || (open.length === 0 && done.length === 0)) {
    return (
      <div className="rt">
        <h4 className="rr-sub">Tracks</h4>
        <p className="rr-note">{NO_TRACKS}</p>
      </div>
    );
  }
  const envs = tr.envs && tr.envs.length ? tr.envs : ["local"];
  const toCut = new Set(open.flatMap((x) => x.track.to_cut ?? []));
  const asOf = boardAsOf(tr);
  return (
    <div className={`rt${narrow ? " narrow" : ""}`} style={{ ["--rt-envs" as string]: envs.length }}>
      <h4 className="rr-sub">Tracks</h4>
      <p className="rr-note">{LOCAL_CAPTION}</p>
      {asOf && <p className="rr-note">{asOf}</p>}
      {done.length > 0 && (
        <div className="rt-done">
          <button type="button" className="rt-fold" aria-expanded={doneOpen} onClick={() => setDoneOpen(!doneOpen)}>
            {done.length} {done.length === 1 ? "track" : "tracks"} done · {doneOpen ? "Hide" : "Show"}
          </button>
          {doneOpen && (
            <ul className="rt-done-list">
              {done.map((x) => <li key={x.letter} aria-label={trackName(x, null, envs)}><span className="mono" aria-hidden>{x.letter}</span> {trackTitle(x.track)} · done {dateWords(x.track.done)}</li>)}
            </ul>
          )}
        </div>
      )}
      <div className="rt-head" aria-hidden>
        <span>track</span>
        {envs.map((e) => <span key={e}>{e}</span>)}
        <span>waits on</span>
      </div>
      <ol className="rt-rows">
        {open.map((x, i) => <TrackRowView key={x.letter} x={x} prev={i > 0 && x.track.id !== "" ? open[i - 1] : null} envs={envs} nav={nav} toCut={toCut} />)}
      </ol>
      {tr.goal && <p className="rt-goal">{tr.goal}</p>}
    </div>
  );
}
