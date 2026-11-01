import { useState } from "react";
import type { service } from "../../wailsjs/go/models";
import { dateWords } from "../lib/dates";
import { LOCAL_CAPTION, NO_TRACKS, boardAsOf, envCell, trackName, trackTitle, tracksOf, waitWords, type TrackRow } from "../lib/runReport";
import type { Nav } from "./RunReport";

const RECORD_RE = /^\d{1,4}$/;

/** What a track waits on, as links: a record number opens the record, a
 *  card slug its back; anything else is words. The owner reads as a role. */
function Waits({ waits, nav }: { waits: service.Wait[]; nav: Nav }) {
  return (
    <>
      {waits.map((w, k) => {
        const what = w.what || "";
        const slug = /^[a-z0-9][a-z0-9-]*$/i.test(what) && !RECORD_RE.test(what) ? what : null;
        return (
          <span key={k} className="rt-wait">
            {k > 0 && <span className="rt-sep" aria-hidden>·</span>}
            {RECORD_RE.test(what)
              ? <button type="button" className="rr-card" onClick={() => nav.decision(what.padStart(4, "0"))}>{what}</button>
              : slug ? <button type="button" className="rr-card" onClick={() => nav.card(slug)}>{slug}</button>
              : <span>{what}</span>}
            {w.who && <span className="rt-who"> · {w.who}</span>}
          </span>
        );
      })}
    </>
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
            {(t.left ?? []).length > 0 && <> · left {(t.left ?? []).map((s, k) => (
              <span key={s}>{k > 0 && ", "}{toCut.has(s) ? <span className="rt-tocut">{s} (not cut)</span> : <button type="button" className="rr-card" onClick={() => nav.card(s)}>{s}</button>}</span>
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
