import { useEffect, useState } from "react";
import type { review as rv, service } from "../../wailsjs/go/models";
import { AskReview, MarkReview, ReviewFile } from "../../wailsjs/go/main/App";
import { busyButton, busyLabel } from "../lib/busy";
import {
  affectedLine, afterSave, askedLine, askFailedLine, askLine, backTo, calledBy, callsOf, canSave, flagLook, flagWords, isAffected, markOf, primaryOf, shasOf, shortName, symbolDiff, testsOf, WORDS,
  type Addressee, type MarkState, type RangeText, type Row, type Via,
} from "../lib/review";

/** The symbol's panel (docs/ux/specs/review-view.md §3.3, §5; review-map
 *  v2 FR-19), mounted in Review's SymbolPane: the title, the diff scoped to
 *  the symbol's base and head ranges, the facts (flags, tests, Called by,
 *  Calls), the builder's claim apart from them, and the mark. An affected
 *  symbol opens read-only: its line, no diff, no mark, and back. */
export function ReviewSymbol({ initiative, card, head, map, node, row, marks, from, via, to, last, title, onOpen, onBack, onMarks, onAsked, onOpenThread, onNext }: {
  initiative: string; card: string; head: string; map: rv.RevMap; node: rv.Node; row: Row | null; marks: rv.Marks | null;
  /** The changed symbol an affected one was opened from, and the list. */
  from: rv.Node | null; via?: Via;
  /** Who a Question or Blocked asks (FR-25); null until known. */
  to: Addressee | null;
  /** No other symbol is unmarked (FR-38). */
  last: boolean;
  title: React.RefObject<HTMLHeadingElement | null>;
  onOpen: (id: string, via?: Via) => void; onBack: () => void; onMarks: (m: rv.Marks) => void; onAsked: (r: service.ReviewAsk) => void; onOpenThread: (thread: string) => void; onNext: () => void;
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
  const ask = async (state: MarkState, note: string) => {
    const r = await AskReview(initiative, card, head, node.id, state, note);
    onAsked(r);
    return r;
  };
  return <ReviewSymbolView map={map} node={node} row={row} marks={marks} from={from} via={via} to={to} last={last} texts={texts} error={error} title={title}
    onOpen={onOpen} onBack={onBack} onMark={mark} onAsk={ask} onOpenThread={onOpenThread} onNext={onNext} />;
}

export type ReviewSymbolViewProps = {
  map: rv.RevMap; node: rv.Node; row: Row | null; marks: rv.Marks | null; from: rv.Node | null; via?: Via;
  to?: Addressee | null; last?: boolean;
  texts: { base: RangeText | null; head: RangeText | null } | null; error: string | null;
  title: React.RefObject<HTMLHeadingElement | null>;
  onOpen: (id: string, via?: Via) => void; onBack: () => void; onMark: (state: MarkState, note: string) => Promise<void>;
  onAsk?: (state: MarkState, note: string) => Promise<service.ReviewAsk>; onOpenThread?: (thread: string) => void; onNext: () => void;
};

/** What the panel draws, pure, so vitest renders each case. */
export function ReviewSymbolView({ map, node, row, marks, from, via, to = null, last = false, texts, error, title, onOpen, onBack, onMark, onAsk, onOpenThread, onNext }: ReviewSymbolViewProps) {
  const name = shortName(node, true);
  const range = node.range_head ?? node.range_base;
  const where = <div className="meta mono rs-where">{node.file}{range ? ` ${range[0]}-${range[1]}` : ""}</div>;

  if (isAffected(node)) {
    return (
      <>
        <h2 ref={title} tabIndex={-1} className="review-symbol-title"><span className="mono">{name}</span></h2>
        {where}
        <p className="rs-affected">{affectedLine(map, node, from, via)}</p>
        {from && <div><button className="ghost rs-back" onClick={onBack}>{backTo(from)}</button></div>}
      </>
    );
  }

  const callers = calledBy(map, node.id);
  const callees = callsOf(map, node.id);
  const tests = testsOf(map, node);
  const links = (ns: rv.Node[], list: Via) => ns.length === 0 ? <span className="meta">{WORDS.noneFound}</span> : (
    <ul className="rs-links">{ns.map((n) => <li key={n.id}><button className="link mono" onClick={() => onOpen(n.id, list)}>{shortName(n, true)}</button></li>)}</ul>
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
            <dd>{links(callers, "calledBy")}</dd>
            <dt>{WORDS.calls}</dt>
            <dd>{links(callees, "calls")}</dd>
          </dl>
          {node.claim && (
            <figure className="rs-claim">
              <figcaption>{WORDS.builderSays}</figcaption>
              <blockquote>{node.claim}</blockquote>
            </figure>
          )}
          <MarkForm key={node.id} name={name} marks={marks} id={node.id} to={to} last={last} onMark={onMark} onAsk={onAsk} onOpenThread={onOpenThread} onNext={onNext} />
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

/** The mark (§3.3, Amendment 2): a radio group, a note, the primary (saves
 *  the chosen mark, Reviewed when none, and moves on; its label says which,
 *  primaryOf) and `Save` (keeps the chosen mark and stays), disabled until
 *  it has a mark; for Question and Blocked both wait on a note
 *  (incomplete). With someone to ask (v3 FR-28) the primary on Question
 *  and Blocked asks them, and the muted line says so; on the last
 *  unmarked symbol it stays (FR-38). After an ask the panel says who was
 *  asked and opens the thread; a failed post says why, with Try again
 *  (FR-29). */
function MarkForm({ name, id, marks, to, last, onMark, onAsk, onOpenThread, onNext }: {
  name: string; id: string; marks: rv.Marks | null; to: Addressee | null; last: boolean;
  onMark: (s: MarkState, note: string) => Promise<void>; onAsk?: (s: MarkState, note: string) => Promise<service.ReviewAsk>; onOpenThread?: (thread: string) => void; onNext: () => void;
}) {
  const saved = markOf(marks, id);
  const [state, setState] = useState<MarkState>(saved.state);
  const [note, setNote] = useState(saved.note);
  const [busy, setBusy] = useState<"" | "next" | "save" | "retry">("");
  const [error, setError] = useState<string | null>(null);
  // A post that failed (ReviewAsk.error): the mark is saved, the ask is not.
  const [failed, setFailed] = useState<Failed | null>(null);
  const seat = to?.seat ?? "";
  const primary = primaryOf(state, note, { seat, last });
  const run = (which: "next" | "save" | "retry", s: MarkState, ask: boolean, then?: () => void) => async () => {
    setBusy(which);
    setError(null);
    try {
      const r = await markPress({ ask: ask && !!onAsk, state: s, note, seat, onAsk, onMark, then: () => {
        const shown = afterSave(s, note);
        setState(shown.state);
        setNote(shown.note);
        then?.();
      } });
      setFailed(r);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy("");
    }
  };
  const opts: [MarkState, string][] = [["reviewed", WORDS.reviewed], ["question", WORDS.question], ["blocked", WORDS.blocked]];
  const noteId = `rs-note-${id}`;
  const line = askLine(to, state);
  const mark = (marks?.marks ?? []).find((m) => m.symbol === id && m.state);
  const thread = marks?.thread ?? "";
  return (
    <div className="rs-mark">
      <fieldset className="rs-radios">
        <legend className="sr-only">Mark {name}</legend>
        {opts.map(([s, label]) => (
          <label key={s} className={`rs-radio ${s} ${state === s ? "on" : ""}`}>
            <input type="radio" name={`rs-mark-${id}`} value={s} checked={state === s} onChange={() => setState(s)} />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
      <label className="rs-note-label" htmlFor={noteId}>{WORDS.note}</label>
      <textarea id={noteId} className="rs-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)}
        placeholder={state === "question" || state === "blocked" ? "required for Question and Blocked" : "optional"} />
      <div className="rs-buttons">
        <button className="primary" {...busyButton({ busy: busy === "next", disabled: busy !== "" || !primary.ready, onPress: run("next", primary.mark, primary.ask, last ? undefined : onNext) })}>{busyLabel(busy === "next", primary.label, primary.ask ? WORDS.asking : WORDS.saving)}</button>
        <button {...busyButton({ busy: busy === "save", disabled: busy !== "" || !canSave(state, note, saved), onPress: run("save", state, false) })}>{busyLabel(busy === "save", WORDS.save, WORDS.saving)}</button>
      </div>
      {line && <p className="rs-ask-line meta">{line}</p>}
      <AskStatus failed={failed} asked={!!mark?.asked} seat={seat} thread={thread} busy={busy} onRetry={failed ? run("retry", failed.state, true) : () => undefined} onOpenThread={() => onOpenThread?.(thread)} />
      {error && <p className="review-error">{error}</p>}
    </div>
  );
}

/** An ask whose post failed (ReviewAsk.error): the mark is saved here. */
export type Failed = { seat: string; state: MarkState; error: string };

/** One press of the primary, Save or Try again (FR-28, FR-29, FR-38): an
 *  ask posts through AskReview, a save writes the mark. `then` (the form
 *  shows the saved mark, and the primary moves on unless it is the last)
 *  runs only when it worked; a failed post resolves with what to say and
 *  stays, so focus stays on the pressed button. A refusal rejects. */
export async function markPress(o: {
  ask: boolean; state: MarkState; note: string; seat: string;
  onAsk?: (s: MarkState, note: string) => Promise<service.ReviewAsk>; onMark: (s: MarkState, note: string) => Promise<void>; then?: () => void;
}): Promise<Failed | null> {
  if (o.ask && o.onAsk) {
    const r = await o.onAsk(o.state, o.note.trim());
    if (r.error) return { seat: r.to?.seat || o.seat, state: o.state, error: r.error };
  } else {
    await o.onMark(o.state, o.note.trim());
  }
  o.then?.();
  return null;
}

/** After an ask (FR-29): `Asked <seat> · Open the thread`, or, when the
 *  post failed, `Saved here; couldn't ask <seat>: <first error line>` with
 *  Try again, which reads `Asking…` while it posts. */
export function AskStatus({ failed, asked, seat, thread, busy, onRetry, onOpenThread }: {
  failed: Failed | null; asked: boolean; seat: string; thread: string; busy: string; onRetry: () => void; onOpenThread: () => void;
}) {
  if (failed) {
    return (
      <p className="rs-asked review-error">
        {askFailedLine(failed.seat, failed.error)}{" "}
        <button {...busyButton({ busy: busy === "retry", disabled: busy !== "", onPress: onRetry })}>{busyLabel(busy === "retry", WORDS.tryAgain, WORDS.asking)}</button>
      </p>
    );
  }
  if (!asked || !seat || !thread) return null;
  return <p className="rs-asked">{askedLine(seat)} · <button className="link" onClick={onOpenThread}>{WORDS.openThread}</button></p>;
}
