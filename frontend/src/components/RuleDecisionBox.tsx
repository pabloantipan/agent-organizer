import { forwardRef, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type RefObject } from "react";
import { marked } from "marked";
import type { model } from "../../wailsjs/go/models";
import { api } from "../hooks/useWails";
import { recordSections } from "../lib/decisions";
import { leadOf } from "../lib/queue";
import { useBoard } from "../stores/board.store";
import type { WidthClass } from "../lib/width";
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
export function RuleDecisionBox({ initiative, decision: d, withRecord = false, widthClass: homeClass, draft, opener, afterRule, onClose, onCancel }: {
  initiative: string; decision: model.Decision; withRecord?: boolean;
  /** Home's class, which Home measures on its rows (responsive-home FR-21);
   *  elsewhere the window's. */
  widthClass?: WidthClass;
  /** The chosen option and the words, kept by the caller (Home keeps them in
   *  the store so a width class change keeps them, responsive-home FR-5);
   *  without it the box keeps its own. */
  draft?: { chosen: string; words: string; set: (patch: { chosen?: string; words?: string }) => void };
  /** The control that opened the box: focus goes back to it on close. */
  opener?: RefObject<HTMLElement | null>;
  /** Where focus goes once the ruling is written and the opener has left
   *  with its row. */
  afterRule?: () => void;
  /** Escape: the box closes, its draft kept by the caller (responsive-home
   *  FR-9). */
  onClose: () => void;
  /** Cancel: the box closes and its draft is discarded; onClose without it. */
  onCancel?: () => void;
}) {
  const { refresh, agents } = useBoard();
  const ruler = leadOf((agents?.groups ?? []).find((g) => g.id === initiative));
  const owner = (d.owner ?? "").trim();
  const forOwner = owner !== "" && owner.toLowerCase() !== ruler ? ` · owner ${owner}` : "";
  const options = d.options ?? [];
  const [own, setOwn] = useState({ chosen: "", words: "" });
  const { chosen, words } = draft ?? own;
  const setChosen = (chosen: string) => (draft ? draft.set({ chosen }) : setOwn((o) => ({ ...o, chosen })));
  const setWords = (words: string) => (draft ? draft.set({ words }) : setOwn((o) => ({ ...o, words })));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const title = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const record = useRef<HTMLDivElement>(null);
  const name = useId();
  const numId = useId();
  const titleId = useId();
  const bodyId = useId();
  const ready = chosen !== "" && words.trim() !== "" && !busy;
  const windowClass = useBoard((s) => s.widthClass);
  const widthClass = homeClass ?? windowClass;
  const { place, short } = useFitViewport(box, record, widthClass);

  // Focus and names: a box that shows a record opens on its title, and the
  // record is its description.
  useEffect(() => { title.current?.focus(); }, []);

  const close = (discard = false) => { (discard && onCancel ? onCancel : onClose)(); opener?.current?.focus(); };

  // FR-22 (responsive-home amendment 4): Escape closes the box wherever
  // focus sits in the view, the record's text included, which takes no
  // focus and so leaves it on the body. A document listener while the box
  // is open; the latest close and busy through a ref, so it is added once.
  const escape = useRef({ close, busy });
  escape.current = { close, busy };
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented || escape.current.busy) return;
      e.preventDefault();
      escape.current.close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // FR-23: the row whose Rule opened the box stays marked while it is open
  // (rule-box.css, [data-rb-opener]: --surface-selected, and on Home above
  // the scrim). A data attribute, not a class: the row's className is its
  // owner's to render. Home's Needs me row, or the Decisions record's head.
  useEffect(() => {
    const row = opener?.current?.closest<HTMLElement>(".ib-row, .dec-head");
    if (!row) return;
    row.dataset.rbOpener = "";
    return () => { delete row.dataset.rbOpener; };
  }, [opener]);

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
    <div ref={box} className={`rb ${withRecord ? "with-record" : ""}`} style={place} role="dialog" aria-labelledby={`${numId} ${titleId}`} aria-describedby={withRecord ? bodyId : undefined}
      onKeyDown={(e) => loopTab(e, box.current)}>
      <div className="rb-head">
        <span id={numId} className="rb-num">{initiative} {d.number}</span>
        <span ref={title} id={titleId} className="rb-title" tabIndex={-1}>{d.title}</span>
      </div>
      {withRecord && <RecordBody ref={record} id={bodyId} initiative={initiative} decision={d} short={short} />}
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
        <button className="ghost" onClick={() => close(true)} disabled={busy}>Cancel</button>
        <button className="primary" onClick={() => void rule()} disabled={!ready}>{busy ? "Ruling…" : "Rule"}</button>
      </div>
    </div>
  );
}

/** initiative-header FR-7 (UI2): while the box is open, Tab and Shift+Tab
 *  loop inside it, so focus never lands on a row the box covers and no
 *  second box opens under the first. Every Tab is moved here, not only the
 *  one at an edge, so WebKit, which skips buttons on Tab by default, walks
 *  the same stops as Chromium. A radio group is one stop: its checked radio,
 *  else its first, as the browser does. From the title (not a stop), Tab
 *  goes to the first stop and Shift+Tab to the last. */
function loopTab(e: KeyboardEvent, root: HTMLElement | null) {
  if (e.key !== "Tab" || e.altKey || e.ctrlKey || e.metaKey || !root) return;
  const stops = tabStops(root);
  if (stops.length === 0) return;
  e.preventDefault();
  e.stopPropagation();
  const active = document.activeElement;
  const radio = (el: Element | null): el is HTMLInputElement => el instanceof HTMLInputElement && el.type === "radio";
  const at = radio(active) ? stops.findIndex((s) => radio(s) && s.name === active.name) : stops.indexOf(active as HTMLElement);
  const next = at < 0
    ? (e.shiftKey ? stops.length - 1 : 0)
    : (at + (e.shiftKey ? -1 : 1) + stops.length) % stops.length;
  stops[next].focus();
}

/** The box's tab stops in document order: enabled, shown, not taken out of
 *  the order, one per radio group. */
function tabStops(root: HTMLElement): HTMLElement[] {
  const all = Array.from(root.querySelectorAll<HTMLElement>("button, textarea, input, select, a[href], [tabindex]"))
    .filter((el) => el.tabIndex >= 0 && !el.matches(":disabled") && el.getClientRects().length > 0);
  const out: HTMLElement[] = [];
  const groups = new Set<string>();
  for (const el of all) {
    if (el instanceof HTMLInputElement && el.type === "radio" && el.name) {
      if (groups.has(el.name)) continue;
      groups.add(el.name);
      const group = all.filter((r): r is HTMLInputElement => r instanceof HTMLInputElement && r.type === "radio" && r.name === el.name);
      out.push(group.find((r) => r.checked) ?? group[0]);
    } else out.push(el);
  }
  return out;
}

/** The room between the top bar and the window's bottom edge, less a gap. */
const GAP = 8;

/** ui-leftovers FR-2: the box fits the viewport below the top bar. It is
 *  fixed under its opener, moved up when there is no room below, and capped
 *  at the viewport minus the top bar; the record scrolls inside it, so the
 *  options, the words and the buttons stay in view. Placed again when the
 *  page scrolls, the window resizes or the record grows ("more").
 *  On Home the width class changes the place (responsive-home FR-2, FR-4):
 *  compact centres it over Home as a sheet; wide leaves it in the flow of
 *  the Needs me column, under its row, capped at the column's height, and
 *  the column scrolls to keep all of it in view (FR-12). The
 *  box stays the same element in every class, so nothing typed is lost.
 *  `short` is initiative-header FR-7 (UI4): the record area the box leaves
 *  is shorter than the record with both sections at their clamp, so the
 *  Question clamps to three lines and the Recommendation comes into view.
 *  The record's height at both clamps is measured while not short and kept,
 *  so the three-line Question does not undo the judgement. */
function useFitViewport(box: RefObject<HTMLDivElement | null>, record: RefObject<HTMLDivElement | null>, widthClass: WidthClass): { place: CSSProperties | undefined; short: boolean } {
  const [place, setPlace] = useState<CSSProperties>();
  const [short, setShort] = useState(false);
  const shortNow = useRef(false);
  const full = useRef(0);
  const opened = useRef(false);
  useLayoutEffect(() => {
    const el = box.current;
    const anchor = el?.parentElement;
    if (!el || !anchor) return;
    const home = el.closest<HTMLElement>(".board-wrap .home");
    const column = el.closest<HTMLElement>(".home-needs");
    const same = (p: CSSProperties | undefined, q: CSSProperties) => !!p && (Object.keys(q) as (keyof CSSProperties)[]).every((k) => p[k] === q[k]) && Object.keys(p).length === Object.keys(q).length;
    // The record area's room: the cap less what the rest of the box takes.
    const judge = (maxHeight: number) => {
      const r = record.current;
      if (!r) return;
      if (!shortNow.current) full.current = r.scrollHeight;
      const room = maxHeight - (el.offsetHeight - r.clientHeight);
      const s = room < full.current;
      if (s !== shortNow.current) { shortNow.current = s; setShort(s); }
    };
    const fit = () => {
      if (widthClass === "wide" && column) {
        // FR-12: capped at the column's own height (its max-height, the
        // page's view), not at what the column holds now, which the box
        // itself grows.
        const cap = parseFloat(getComputedStyle(column).maxHeight);
        const maxHeight = Math.max(0, (Number.isFinite(cap) ? cap : column.clientHeight) - GAP);
        setPlace((p) => (same(p, { maxHeight }) ? p : { maxHeight }));
        judge(maxHeight);
        return;
      }
      const a = anchor.getBoundingClientRect();
      const top0 = (document.querySelector(".topbar")?.getBoundingClientRect().bottom ?? 0) + GAP;
      const maxHeight = Math.max(0, window.innerHeight - top0 - GAP);
      const r = record.current;
      const natural = el.offsetHeight + (r ? r.scrollHeight - r.clientHeight : 0);
      const h = Math.min(natural, maxHeight);
      judge(maxHeight);
      if (widthClass === "compact" && home) {
        const w = home.parentElement!.getBoundingClientRect();
        const left = Math.max(GAP, Math.round(w.left + (w.width - el.offsetWidth) / 2));
        const top = Math.round(top0 + Math.max(0, (maxHeight - h) / 2));
        const q: CSSProperties = { position: "fixed", top, left, maxHeight };
        setPlace((p) => (same(p, q) ? p : q));
        return;
      }
      // Under its opener; moved up when there is no room below, down when the
      // opener has scrolled above the top bar.
      let top = Math.max(top0, a.bottom + 4);
      if (top + h > window.innerHeight - GAP) top = Math.max(top0, window.innerHeight - GAP - h);
      const right = Math.max(GAP, window.innerWidth - a.right);
      const q: CSSProperties = { position: "fixed", top, right, maxHeight };
      setPlace((p) => (same(p, q) ? p : q));
    };
    // FR-12: the column scrolls to keep the whole box in view, on opening
    // and whenever the box changes size ("more", an error), never on the
    // reader's own scroll of the column.
    const keep = () => {
      if (widthClass !== "wide" || !column) return;
      const b = el.getBoundingClientRect();
      const c = column.getBoundingClientRect();
      if (b.bottom > c.bottom) column.scrollTop += b.bottom - c.bottom;
      else if (b.top < c.top) column.scrollTop -= c.top - b.top;
    };
    fit();
    // The observer's first call is the observe itself: after a class change
    // it leaves the column's scroll where FR-5 put it.
    let first = true;
    const ro = new ResizeObserver(() => { fit(); if (!first) keep(); first = false; });
    ro.observe(el);
    if (record.current) for (const c of Array.from(record.current.children)) ro.observe(c);
    window.addEventListener("resize", fit);
    window.addEventListener("scroll", fit, true);
    // Opened in the Needs me column, the box scrolls into the column's view:
    // Rule and Cancel without scrolling the page (A5). A class change later
    // leaves every scroll where it is (FR-5).
    if (!opened.current) keep();
    opened.current = true;
    return () => { ro.disconnect(); window.removeEventListener("resize", fit); window.removeEventListener("scroll", fit, true); };
  }, [box, record, widthClass]);
  return { place, short };
}

/** The part of the record a ruling needs (ui-leftovers FR-1): its Question
 *  and its Recommendation, each clamped at a block boundary with "more".
 *  The Options are the radios below, so they are not repeated. The whole
 *  record is one link away, landing on it expanded in Decisions (FR-3). */
const RecordBody = forwardRef<HTMLDivElement, { id: string; initiative: string; decision: model.Decision; short: boolean }>(function RecordBody({ id, initiative, decision: d, short }, ref) {
  const openDecision = useBoard((s) => s.openDecision);
  const { question, recommendation } = recordSections(d.body);
  return (
    <div ref={ref} className="rb-record">
      <div id={id} className="rb-sections">
        {question || recommendation ? (
          <>
            <Clamped label="Question" md={question} lines={short ? SHORT_LINES : CLAMP_LINES} />
            <Clamped label="Recommendation" md={recommendation} lines={CLAMP_LINES} />
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
/** Lines the Question shows when the record area is short (UI4). */
const SHORT_LINES = 3;

/** One section of the record, rendered, then cut after the last whole block
 *  that fits in CLAMP_LINES lines: a paragraph, a heading or a list item,
 *  never half of one, and never ending on a heading. A first block longer
 *  than the budget shows whole. The cut is on the rendered blocks, not on
 *  the source's lines: the whole section renders once to be measured, then
 *  only the blocks that fit are rendered. */
function Clamped({ label, md, lines }: { label: string; md: string | null; lines: number }) {
  const [all, setAll] = useState(false);
  const html = md ? (marked.parse(md) as string) : "";
  // How many blocks fit, for this html at this clamp; either changing is
  // measured again. `over`: the short clamp (UI4) and a first block longer
  // than it, which is then cut at its third line instead of shown whole.
  const [fit, setFit] = useState<{ html: string; lines: number; keep: number; total: number; over: boolean } | null>(null);
  const measured = fit?.html === html && fit.lines === lines ? fit : null;
  const body = useRef<HTMLDivElement>(null);
  const id = useId();
  useLayoutEffect(() => {
    const el = body.current;
    if (!el || all || measured) return;
    const blocks = blocksOf(el);
    const budget = (parseFloat(getComputedStyle(el).lineHeight) || 20) * lines;
    const top = el.getBoundingClientRect().top;
    let keep = 0;
    while (keep < blocks.length && (keep === 0 || blocks[keep].getBoundingClientRect().bottom - top <= budget)) keep++;
    while (keep > 1 && keep < blocks.length && /^H\d$/.test(blocks[keep - 1].tagName)) keep--;
    const over = lines < CLAMP_LINES && blocks.length > 0 && blocks[0].getBoundingClientRect().bottom - top > budget + 1;
    setFit({ html, lines, keep, total: blocks.length, over });
  }, [html, lines, all, measured]);
  const over = !all && !!measured?.over;
  const cut = !all && !!measured && (measured.keep < measured.total || over);
  const shown = cut ? firstBlocks(html, measured!.keep) : html;
  return (
    <section className="rb-section" aria-label={label}>
      <div className="rb-label">{label}</div>
      {md
        ? <div id={id} ref={body} className={`markdown dec-text rb-body ${over ? "clamp-first" : ""}`} dangerouslySetInnerHTML={{ __html: shown }} />
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

