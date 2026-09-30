import { forwardRef, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { marked } from "marked";
import type { model } from "../../wailsjs/go/models";
import { api } from "../hooks/useWails";
import { recordSections } from "../lib/decisions";
import { leadOf } from "../lib/queue";
import { useBoard } from "../stores/board.store";
import "../styles/rule-box.css";

/** A ruling of a proposed record, from its Needs me row (FR-22) or its row on
 *  the Decisions tab (FR-12). The ruler signs it, not the owner (0045): the
 *  cell's human, else pablo, the same rule as `ruler` in service/rule.go.
 *  One option and the words, then RuleDecision (FR-13) writes the record and
 *  commits it; the rescan that follows drops the row from the queue. A refusal
 *  is the service's own sentence, shown here with what was typed kept.
 *  `withRecord` (Needs me, lead-side-fixes FR-1, amended by ui-leftovers
 *  FR-1) puts the record's Question and Recommendation above the options,
 *  clamped, with a link to it in Decisions; the Decisions tab leaves it off,
 *  since the body is already under the row there. */
export function RuleDecisionBox({ initiative, decision: d, withRecord = false, opener, afterRule, onClose }: {
  initiative: string; decision: model.Decision; withRecord?: boolean;
  /** The control that opened the box: focus goes back to it on close. */
  opener?: RefObject<HTMLElement | null>;
  /** Where focus goes once the ruling is written and the opener has left
   *  with its row. */
  afterRule?: () => void;
  onClose: () => void;
}) {
  const { refresh, agents } = useBoard();
  const ruler = leadOf((agents?.groups ?? []).find((g) => g.id === initiative));
  const owner = (d.owner ?? "").trim();
  const forOwner = owner !== "" && owner.toLowerCase() !== ruler ? ` · owner ${owner}` : "";
  const options = d.options ?? [];
  const [chosen, setChosen] = useState("");
  const [words, setWords] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const title = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const record = useRef<HTMLDivElement>(null);
  const name = useId();
  const titleId = useId();
  const bodyId = useId();
  const ready = chosen !== "" && words.trim() !== "" && !busy;
  const place = useFitViewport(box, record);

  // Focus and names: a box that shows a record opens on its title, and the
  // record is its description.
  useEffect(() => { title.current?.focus(); }, []);

  const close = () => { onClose(); opener?.current?.focus(); };

  const rule = async () => {
    if (!ready) return;
    setBusy(true);
    setError(null);
    try {
      await api.ruleDecision(initiative, d.number, chosen, words);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
      return;
    }
    await refresh();
    // The ruled record leaves the queue and the opener with it: focus goes
    // to what took its place.
    requestAnimationFrame(() => {
      const o = opener?.current;
      if (o && o.isConnected) o.focus(); else afterRule?.();
    });
  };

  return (
    <div ref={box} className={`rb ${withRecord ? "with-record" : ""}`} style={place} role="dialog" aria-labelledby={titleId} aria-describedby={withRecord ? bodyId : undefined}
      onKeyDown={(e) => { if (e.key === "Escape" && !busy) { e.stopPropagation(); close(); } }}>
      <div className="rb-head">
        <span className="rb-num">{d.number}</span>
        <span ref={title} id={titleId} className="rb-title" tabIndex={-1}>{d.title}</span>
      </div>
      {withRecord && <RecordBody ref={record} id={bodyId} initiative={initiative} decision={d} />}
      {options.length === 0 ? (
        <div className="rb-error">This record lists no options, so it cannot be ruled here. Add `options:` to the record.</div>
      ) : (
        <fieldset className="rb-options" disabled={busy}>
          <legend className="rb-label">Chosen option</legend>
          {options.map((o) => (
            <label key={o} className={`rb-option ${chosen === o ? "on" : ""}`}>
              <input type="radio" name={name} value={o}
                checked={chosen === o} onChange={() => setChosen(o)} />
              <span>{o}</span>
            </label>
          ))}
        </fieldset>
      )}
      <label className="rb-words">
        <span className="rb-label">Your words</span>
        <textarea rows={4} value={words} disabled={busy} placeholder="Why this option, in your words. They go under ## Ruling."
          onChange={(e) => setWords(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void rule(); }} />
      </label>
      {error && <div className="rb-error" role="alert">{error}</div>}
      <div className="rb-foot">
        <span className="rb-sign">signed {ruler}{forOwner} · commits one file</span>
        <button className="ghost" onClick={close} disabled={busy}>Cancel</button>
        <button className="primary" onClick={() => void rule()} disabled={!ready}>{busy ? "Ruling…" : "Rule"}</button>
      </div>
    </div>
  );
}

/** The room between the top bar and the window's bottom edge, less a gap. */
const GAP = 8;

/** ui-leftovers FR-2: the box fits the viewport below the top bar. It is
 *  fixed under its opener, moved up when there is no room below, and capped
 *  at the viewport minus the top bar; the record scrolls inside it, so the
 *  options, the words and the buttons stay in view. Placed again when the
 *  page scrolls, the window resizes or the record grows ("more"). */
function useFitViewport(box: RefObject<HTMLDivElement | null>, record: RefObject<HTMLDivElement | null>): CSSProperties | undefined {
  const [place, setPlace] = useState<CSSProperties>();
  useLayoutEffect(() => {
    const el = box.current;
    const anchor = el?.parentElement;
    if (!el || !anchor) return;
    const fit = () => {
      const a = anchor.getBoundingClientRect();
      const top0 = (document.querySelector(".topbar")?.getBoundingClientRect().bottom ?? 0) + GAP;
      const maxHeight = Math.max(0, window.innerHeight - top0 - GAP);
      const r = record.current;
      const natural = el.offsetHeight + (r ? r.scrollHeight - r.clientHeight : 0);
      const h = Math.min(natural, maxHeight);
      let top = a.bottom + 4;
      if (top + h > window.innerHeight - GAP) top = Math.max(top0, window.innerHeight - GAP - h);
      const right = Math.max(GAP, window.innerWidth - a.right);
      setPlace((p) => (p && p.top === top && p.right === right && p.maxHeight === maxHeight ? p : { position: "fixed", top, right, maxHeight }));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    if (record.current) for (const c of Array.from(record.current.children)) ro.observe(c);
    window.addEventListener("resize", fit);
    window.addEventListener("scroll", fit, true);
    return () => { ro.disconnect(); window.removeEventListener("resize", fit); window.removeEventListener("scroll", fit, true); };
  }, [box, record]);
  return place;
}

/** The part of the record a ruling needs (ui-leftovers FR-1): its Question
 *  and its Recommendation, each clamped at a block boundary with "more".
 *  The Options are the radios below, so they are not repeated. The whole
 *  record is one link away, landing on it expanded in Decisions (FR-3). */
const RecordBody = forwardRef<HTMLDivElement, { id: string; initiative: string; decision: model.Decision }>(function RecordBody({ id, initiative, decision: d }, ref) {
  const openDecision = useBoard((s) => s.openDecision);
  const { question, recommendation } = recordSections(d.body);
  return (
    <div ref={ref} className="rb-record">
      <div id={id} className="rb-sections">
        {question || recommendation ? (
          <>
            <Clamped label="Question" md={question} />
            <Clamped label="Recommendation" md={recommendation} />
          </>
        ) : (
          <div className="rb-body empty">This record has no Question or Recommendation section; read it in Decisions.</div>
        )}
      </div>
      <div className="rb-record-foot">
        <button className="link" onClick={() => openDecision(initiative, d.number)}>{d.number} in Decisions</button>
      </div>
    </div>
  );
});

/** Lines a section shows before "more". */
const CLAMP_LINES = 6;

/** One section of the record, rendered, then cut after the last whole block
 *  that fits in CLAMP_LINES lines: a paragraph, a heading or a list item,
 *  never half of one, and never ending on a heading. A first block longer
 *  than the budget shows whole. The cut is on the rendered blocks, not on
 *  the source's lines: the whole section renders once to be measured, then
 *  only the blocks that fit are rendered. */
function Clamped({ label, md }: { label: string; md: string | null }) {
  const [all, setAll] = useState(false);
  const html = md ? (marked.parse(md) as string) : "";
  // How many blocks fit, for this html; another html is measured again.
  const [fit, setFit] = useState<{ html: string; keep: number; total: number } | null>(null);
  const measured = fit?.html === html ? fit : null;
  const body = useRef<HTMLDivElement>(null);
  const id = useId();
  useLayoutEffect(() => {
    const el = body.current;
    if (!el || all || measured) return;
    const blocks = blocksOf(el);
    const budget = (parseFloat(getComputedStyle(el).lineHeight) || 20) * CLAMP_LINES;
    const top = el.getBoundingClientRect().top;
    let keep = 0;
    while (keep < blocks.length && (keep === 0 || blocks[keep].getBoundingClientRect().bottom - top <= budget)) keep++;
    while (keep > 1 && keep < blocks.length && /^H\d$/.test(blocks[keep - 1].tagName)) keep--;
    setFit({ html, keep, total: blocks.length });
  }, [html, all, measured]);
  const cut = !all && !!measured && measured.keep < measured.total;
  const shown = cut ? firstBlocks(html, measured!.keep) : html;
  return (
    <section className="rb-section" aria-label={label}>
      <div className="rb-label">{label}</div>
      {md
        ? <div id={id} ref={body} className="markdown dec-text rb-body" dangerouslySetInnerHTML={{ __html: shown }} />
        : <div className="rb-body empty">This record has no {label}.</div>}
      {md && (cut || all) && <button className="link rb-more" aria-expanded={all} aria-controls={id} onClick={() => setAll(!all)}>{all ? "less" : "more"}</button>}
    </section>
  );
}

/** The blocks a clamp may cut between: the top-level elements, with a
 *  list's items counted one by one. */
function blocksOf(root: ParentNode): Element[] {
  const out: Element[] = [];
  for (const c of Array.from(root.children)) {
    if (c.tagName === "UL" || c.tagName === "OL") out.push(...Array.from(c.children));
    else out.push(c);
  }
  return out;
}

/** The html with only its first n blocks (blocksOf), a list cut after its
 *  last kept item and dropped when none is kept. */
function firstBlocks(html: string, n: number): string {
  const t = document.createElement("template");
  t.innerHTML = html;
  blocksOf(t.content).slice(n).forEach((b) => b.remove());
  for (const c of Array.from(t.content.children)) if ((c.tagName === "UL" || c.tagName === "OL") && c.children.length === 0) c.remove();
  return t.innerHTML;
}

