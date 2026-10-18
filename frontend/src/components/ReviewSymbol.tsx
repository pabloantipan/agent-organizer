import { useEffect, useState } from "react";
import type { review as rv } from "../../wailsjs/go/models";
import { MarkReview, ReviewFile } from "../../wailsjs/go/main/App";
import { busyButton, busyLabel } from "../lib/busy";
import {
  affectedLine, backTo, calledBy, callsOf, canSave, flagLook, flagWords, isAffected, markOf, shasOf, shortName, symbolDiff, testsOf, WORDS,
  type MarkState, type RangeText, type Row,
} from "../lib/review";

/** The symbol's panel (docs/ux/specs/review-view.md §3.3, §5; review-map
 *  v2 FR-19), mounted in Review's SymbolPane: the title, the diff scoped to
 *  the symbol's base and head ranges, the facts (flags, tests, Called by,
 *  Calls), the builder's claim apart from them, and the mark. An affected
 *  symbol opens read-only: its line, no diff, no mark, and back. */
export function ReviewSymbol({ initiative, card, head, map, node, row, marks, from, title, onOpen, onBack, onMarks, onNext }: {
  initiative: string; card: string; head: string; map: rv.RevMap; node: rv.Node; row: Row | null; marks: rv.Marks | null;
  /** The changed symbol an affected one was opened from. */
  from: rv.Node | null;
  title: React.RefObject<HTMLHeadingElement | null>;
  onOpen: (id: string) => void; onBack: () => void; onMarks: (m: rv.Marks) => void; onNext: () => void;
}) {
  const [texts, setTexts] = useState<{ base: RangeText | null; head: RangeText | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setTexts(null);
    setError(null);
    if (isAffected(node)) return;
    let live = true;
    const shas = shasOf(map, node);
    const read = (sha: string, r: number[] | undefined) => (r ? ReviewFile(initiative, card, sha, node.file, r[0], r[1]) : Promise.resolve(null));
    Promise.all([read(shas.base, node.range_base), read(shas.head, node.range_head)])
      .then(([base, hd]) => { if (live) setTexts({ base, head: hd }); })
      .catch((e) => { if (live) setError(String(e)); });
    return () => { live = false; };
  }, [initiative, card, map, node]);

  const mark = async (state: MarkState, note: string) => onMarks(await MarkReview(initiative, card, head, node.id, state, note));
  return <ReviewSymbolView map={map} node={node} row={row} marks={marks} from={from} texts={texts} error={error} title={title} onOpen={onOpen} onBack={onBack} onMark={mark} onNext={onNext} />;
}

export type ReviewSymbolViewProps = {
  map: rv.RevMap; node: rv.Node; row: Row | null; marks: rv.Marks | null; from: rv.Node | null;
  texts: { base: RangeText | null; head: RangeText | null } | null; error: string | null;
  title: React.RefObject<HTMLHeadingElement | null>;
  onOpen: (id: string) => void; onBack: () => void; onMark: (state: MarkState, note: string) => Promise<void>; onNext: () => void;
};

/** What the panel draws, pure, so vitest renders each case. */
export function ReviewSymbolView({ map, node, row, marks, from, texts, error, title, onOpen, onBack, onMark, onNext }: ReviewSymbolViewProps) {
  const name = shortName(node, true);
  const range = node.range_head ?? node.range_base;
  const where = <div className="meta mono rs-where">{node.file}{range ? ` ${range[0]}-${range[1]}` : ""}</div>;

  if (isAffected(node)) {
    return (
      <>
        <h2 ref={title} tabIndex={-1} className="review-symbol-title"><span className="mono">{name}</span></h2>
        {where}
        <p className="rs-affected">{affectedLine(map, node, from)}</p>
        {from && <div><button className="ghost rs-back" onClick={onBack}>{backTo(from)}</button></div>}
      </>
    );
  }

  const callers = calledBy(map, node.id);
  const callees = callsOf(map, node.id);
  const tests = testsOf(map, node);
  const links = (ns: rv.Node[]) => ns.length === 0 ? <span className="meta">none</span> : (
    <ul className="rs-links">{ns.map((n) => <li key={n.id}><button className="link mono" onClick={() => onOpen(n.id)}>{shortName(n, true)}</button></li>)}</ul>
  );
  return (
    <>
      <h2 ref={title} tabIndex={-1} className="review-symbol-title">
        <span className="mono">{name}</span> <span className="rv-change">{node.change}</span>
      </h2>
      {where}
      {row?.changedSince && <div className="rv-since">{WORDS.changedSince}</div>}
      <div className="review-symbol-body">
        <div className="review-diff">
          <Diff name={name} texts={texts} error={error} />
        </div>
        <div className="review-facts">
          <dl className="rs-facts">
            {(node.flags ?? []).length > 0 && (
              <>
                <dt>{WORDS.flags}</dt>
                <dd className="rs-flags">{node.flags.map((f) => <span key={f} className={`rv-flag ${flagLook(f)}`}>{flagWords(f)}</span>)}</dd>
              </>
            )}
            <dt>{WORDS.tests}</dt>
            <dd>
              {tests.length === 0 ? <span className="meta">{WORDS.noTests}</span> : (
                <ul className="rs-links">{tests.map((t) => <li key={t.label}>{t.node ? <button className="link mono" onClick={() => onOpen(t.node!.id)}>{t.label}</button> : <span className="mono">{t.label}</span>}</li>)}</ul>
              )}
            </dd>
            <dt>{WORDS.calledBy}</dt>
            <dd>{links(callers)}</dd>
            <dt>{WORDS.calls}</dt>
            <dd>{links(callees)}</dd>
          </dl>
          {node.claim && (
            <figure className="rs-claim">
              <figcaption>{WORDS.builderSays}</figcaption>
              <blockquote>{node.claim}</blockquote>
            </figure>
          )}
          <MarkForm key={node.id} name={name} marks={marks} id={node.id} onMark={onMark} onNext={onNext} />
        </div>
      </div>
    </>
  );
}

/** The scoped diff (§3.3): head line numbers, `+` / `−` in the gutter, no
 *  colour but the two backgrounds; a scroll stop named `<symbol>, diff`. */
function Diff({ name, texts, error }: { name: string; texts: { base: RangeText | null; head: RangeText | null } | null; error: string | null }) {
  if (error) return <p className="review-error">{error}</p>;
  if (!texts) return <div className="meta">Loading…</div>;
  const lines = symbolDiff(texts.base, texts.head);
  return (
    <div className="rs-diff mono" tabIndex={0} role="region" aria-label={`${name}, diff`}>
      <table>
        <tbody>
          {lines.map((l, i) => (
            <tr key={i} className={l.sign === "+" ? "add" : l.sign === "−" ? "del" : undefined}>
              <td className="rs-ln" aria-hidden="true">{l.line ?? ""}</td>
              <td className="rs-sign">{l.sign === " " ? "" : l.sign}</td>
              <td className="rs-code">{l.text}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The mark (§3.3): a radio group, a note, `Reviewed, next` (marks Reviewed
 *  and moves on) and `Save` (keeps the chosen mark and stays), disabled
 *  until it has a mark, and for Question and Blocked a note (incomplete).
 *  The v3 line says where the note goes. */
function MarkForm({ name, id, marks, onMark, onNext }: { name: string; id: string; marks: rv.Marks | null; onMark: (s: MarkState, note: string) => Promise<void>; onNext: () => void }) {
  const saved = markOf(marks, id);
  const [state, setState] = useState<MarkState>(saved.state);
  const [note, setNote] = useState(saved.note);
  const [busy, setBusy] = useState<"" | "next" | "save">("");
  const [error, setError] = useState<string | null>(null);
  const run = (which: "next" | "save", s: MarkState, then?: () => void) => async () => {
    setBusy(which);
    setError(null);
    try {
      await onMark(s, note.trim());
      then?.();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy("");
    }
  };
  const opts: [MarkState, string][] = [["reviewed", WORDS.reviewed], ["question", WORDS.question], ["blocked", WORDS.blocked]];
  const noteId = `rs-note-${id}`;
  return (
    <div className="rs-mark">
      <fieldset className="rs-radios">
        <legend className="sr-only">Mark {name}</legend>
        {opts.map(([s, label]) => (
          <label key={s} className={`rs-radio ${s}`}>
            <input type="radio" name={`rs-mark-${id}`} value={s} checked={state === s} onChange={() => setState(s)} /> {label}
          </label>
        ))}
      </fieldset>
      <label className="rs-note-label" htmlFor={noteId}>{WORDS.note}</label>
      <textarea id={noteId} className="rs-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)}
        placeholder={state === "question" || state === "blocked" ? "required for Question and Blocked" : "optional"} />
      <div className="rs-buttons">
        <button className="primary" {...busyButton({ busy: busy === "next", disabled: busy !== "", onPress: run("next", "reviewed", onNext) })}>{busyLabel(busy === "next", WORDS.reviewedNext, "Saving…")}</button>
        <button {...busyButton({ busy: busy === "save", disabled: busy !== "" || !canSave(state, note), onPress: run("save", state) })}>{busyLabel(busy === "save", WORDS.save, "Saving…")}</button>
      </div>
      <p className="rs-v3 meta">{WORDS.v3}</p>
      {error && <p className="review-error">{error}</p>}
    </div>
  );
}
