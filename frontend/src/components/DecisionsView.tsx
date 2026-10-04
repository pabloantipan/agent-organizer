import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { marked } from "marked";
import type { merge, model } from "../../wailsjs/go/models";
import { DAY, daysBetween, parseISO, shortDate, today } from "../lib/dates";
import { addLocalDays } from "../lib/axis";
import { ownerPhrase } from "../lib/decisions";
import { RULED_LIMIT, countWords, decisionMatches, emptyRuledWords, lineName, rulerWords, ruledShown, shownSections, statusWord, summaryOf, timelineName, turnaroundWords, waitedWords, type DecSections } from "../lib/decisionsPage";
import { readOnlyOf } from "../lib/queue";
import { useMarkdownEdges } from "../lib/useScrollEdges";
import { useBoard } from "../stores/board.store";
import { RuleDecisionBox } from "./RuleDecisionBox";
import { EdgePointer, TimeFrame, ZoomControl, useTimeZoom } from "./TimeZoom";
import "../styles/decisions.css";

type Row = { d: model.Decision; initiative: string; machine: string; key: string };

const sectionOf = (d: model.Decision): keyof DecSections => (d.status === "proposed" ? "rule" : "ruled");

/** The decisions tab, the operator's main view (docs/ux/specs/decisions-view.md):
 *  working-on/decisions/ records across initiatives, or the one selected in
 *  the rail. A summary line in words, a find field, then To rule, Ruled and
 *  the Timeline as sections whose headings fold them and stick while their
 *  rows scroll, open or closed as this machine last left them. Any proposed
 *  record can be ruled from its expanded row with Needs me's box, whoever owns
 *  it, and the ruling is signed by the ruler (FR-12, FR-14, 0045); everything
 *  else is read-only. Needs me still lists only the lead's records (0034). */
export function DecisionsView() {
  const { view, selectedInitiative, select, decisionFocus, decisionSeq, decSections, setDecSection } = useBoard();
  const [expanded, setExpanded] = useState<string | null>(decisionFocus);
  const [ruling, setRuling] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showAllRuled, setShowAllRuled] = useState(false);
  const [showClosed, setShowClosed] = useState(false);
  // Sections a landing opened for this visit (§6, row 8) and hand toggles
  // made during the current find (row 6): neither is stored.
  const [visit, setVisit] = useState<Partial<DecSections>>({});
  const [findHand, setFindHand] = useState<Partial<DecSections>>({});
  // The record a landing is on its way to, and a count so the same record
  // lands again (the chip pressed twice, FR-2).
  const landing = useRef<string | null>(null);
  const [landSeq, setLandSeq] = useState(0);
  const findRef = useRef<HTMLInputElement | null>(null);
  // "Show the other N" hands focus to the first record it revealed, "Show
  // only the newest ten" keeps it and is brought into view (row 3).
  const moreRef = useRef<HTMLButtonElement | null>(null);
  const [moreFocus, setMoreFocus] = useState<{ to: "first" | "toggle"; seq: number } | null>(null);
  const ruleBtn = useRef<HTMLButtonElement | null>(null);
  const now = today();
  const filtering = query.trim() !== "";

  const rows = useMemo<Row[]>(() => {
    if (!view) return [];
    // An initiative on two machines reports its records twice; the local
    // scan is the fresher, so it wins.
    const seen = new Set<string>();
    const inits = [...(view.board.initiatives ?? [])].sort((a, b) => Number(b.local) - Number(a.local));
    const out: Row[] = [];
    for (const i of inits) {
      if (selectedInitiative && i.id !== selectedInitiative) continue;
      if (seen.has(i.id)) continue;
      seen.add(i.id);
      for (const d of i.decisions ?? []) out.push({ d, initiative: i.id, machine: i.machine, key: `${i.id}/${d.number}` });
    }
    return out;
  }, [view, selectedInitiative]);

  const open = rows.filter((r) => r.d.status === "proposed").sort((a, b) => a.d.raised.localeCompare(b.d.raised) || a.d.number.localeCompare(b.d.number));
  const ruled = rows.filter((r) => r.d.status === "ruled").sort((a, b) => (b.d.ruled ?? "").localeCompare(a.d.ruled ?? "") || b.d.number.localeCompare(a.d.number));
  const closed = rows.filter((r) => r.d.status === "superseded" || r.d.status === "withdrawn");
  // Ruled's list: the ruled newest first, then superseded and withdrawn under
  // their small heading, inside the same limit (§4).
  const past = [...ruled, ...closed];
  const hit = (r: Row) => decisionMatches(r.d, query);
  // Timeline rows: superseded and withdrawn only when asked for.
  const shown = [...rows].filter((r) => showClosed || (r.d.status !== "superseded" && r.d.status !== "withdrawn")).sort((a, b) => a.d.raised.localeCompare(b.d.raised) || a.d.number.localeCompare(b.d.number));
  const openHits = open.filter(hit);
  const pastHits = past.filter(hit);
  const shownHits = shown.filter(hit);
  // What shows open: while a find is on, every section with a hit (row 6);
  // a landing's section for this visit (row 8); else the stored layout,
  // which holds only what was toggled by hand.
  const sections = shownSections(decSections, visit, filtering ? { rule: openHits.length > 0, ruled: pastHits.length > 0, timeline: shownHits.length > 0 } : null, findHand);
  // A find stores nothing, toggles included (leftovers-6 FR-5, row 9):
  // while one is on, opening and closing are for the visit, and clearing it
  // restores the stored layout.
  const handToggle = (id: keyof DecSections) => {
    const next = !sections[id];
    if (filtering) { setFindHand((h) => ({ ...h, [id]: next })); return; }
    setDecSection(id, next);
    setVisit((v) => { const rest = { ...v }; delete rest[id]; return rest; });
  };
  useEffect(() => { if (!filtering) setFindHand({}); }, [filtering]);
  // Leaving the initiative ends the visit.
  useEffect(() => { setVisit({}); }, [selectedInitiative]);

  // A landing (§6): the section that hides the record opens, Ruled shows all
  // when the record is beyond its ten, a find that hides it is cleared; then
  // the record is expanded, scrolled to below the sticky heading and its line
  // focused. Other sections keep their state.
  const land = (key: string) => {
    const r = rows.find((x) => x.key === key);
    if (r) {
      if (!hit(r)) setQuery("");
      const sec = sectionOf(r.d);
      if (!decSections[sec]) setVisit((v) => ({ ...v, [sec]: true }));
      // A landing opens its section whatever the find did (row 10): a
      // section closed by hand during the find opens again for it.
      setFindHand((h) => { const rest = { ...h }; delete rest[sec]; return rest; });
      if (sec === "ruled" && past.indexOf(r) >= 10) setShowAllRuled(true);
    }
    setExpanded(key);
    setRuling(null);
    landing.current = key;
    setLandSeq((n) => n + 1);
  };

  // openDecision lands here (lead-side-fixes FR-6); decisionSeq lands again
  // when the chip is pressed again on Decisions (FR-2).
  useEffect(() => {
    if (decisionFocus) land(decisionFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decisionFocus, decisionSeq, rows.length > 0]);

  // The scroll waits for the render that opened the section and expanded the
  // record. The record's line goes just under its section's sticky heading,
  // so its Rule and the question's first lines show even when the record is
  // taller than the view (header-fold U8, Amendment 1 §8); the section's
  // heading is the scroll's top instead when the line sits in the view's top
  // half below it (U9). The scroller is set directly: scrollIntoView also
  // scrolls the clipped ancestors, which pushed the header above the window.
  useEffect(() => {
    const key = landing.current;
    if (!key || expanded !== key) return;
    const el = document.querySelector<HTMLElement>(`[data-dec="${CSS.escape(key)}"]`);
    if (!el) return;
    landing.current = null;
    const wrap = el.closest<HTMLElement>(".board-wrap");
    const section = el.closest<HTMLElement>(".dec-section");
    if (wrap && section) {
      const base = wrap.getBoundingClientRect().top - wrap.scrollTop;
      const at = (n: Element) => n.getBoundingClientRect().top - base;
      const sh = section.querySelector<HTMLElement>(".dec-sh");
      // Where the stuck heading's top sits from the scroller's top: its
      // sticky top is from the padding edge, which the scroller's padding
      // moves down.
      const off = (sh ? parseFloat(getComputedStyle(sh).top) || 0 : 0) + (parseFloat(getComputedStyle(wrap).paddingTop) || 0);
      const room = off + (sh?.offsetHeight ?? 0);
      const secTop = at(section);
      const top = at(el) - secTop <= wrap.clientHeight / 2 ? secTop - off - 8 : at(el) - room - 4;
      wrap.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
    // Focus and names, navigating (ui-leftovers FR-5): focus lands on the
    // record's row, never on the page body.
    el.querySelector<HTMLButtonElement>("button.dec-line")?.focus({ preventScroll: true });
  }, [expanded, landSeq, sections.rule, sections.ruled, sections.timeline, showAllRuled, query]);

  // Amendment 1 §8: an expanded record taller than the view keeps its head
  // (line and Rule) stuck under the section heading until its end. `tall`
  // is measured, so a short record never sticks; `boxMax` caps the rule box
  // in the room under the stuck head.
  const [tall, setTall] = useState<{ key: string; boxMax: number } | null>(null);
  useLayoutEffect(() => {
    if (!expanded) { setTall(null); return; }
    const el = document.querySelector<HTMLElement>(`[data-dec="${CSS.escape(expanded)}"]`);
    const wrap = el?.closest<HTMLElement>(".board-wrap");
    if (!el || !wrap) { setTall(null); return; }
    const measure = () => {
      const sh = el.closest(".dec-section")?.querySelector<HTMLElement>(".dec-sh");
      const stick = sh ? (parseFloat(getComputedStyle(sh).top) || 0) + sh.offsetHeight : 0;
      const head = el.querySelector<HTMLElement>(".dec-head");
      const pad = parseFloat(getComputedStyle(wrap).paddingTop) || 0;
      const view = wrap.clientHeight - pad - stick;
      const isTall = el.offsetHeight > view;
      const boxMax = Math.max(160, Math.round(view - (head?.offsetHeight ?? 0) - 12));
      setTall((t) => (isTall ? (t && t.key === expanded && t.boxMax === boxMax ? t : { key: expanded, boxMax }) : null));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [expanded, ruling, sections.rule, sections.ruled, sections.timeline, view]);

  // The Timeline's axis sticks under its heading (row 4), whose height grows
  // when its tools wrap: measured, so the axis sits right under it.
  const [tlHead, setTlHead] = useState<HTMLElement | null>(null);
  const [tlHeadH, setTlHeadH] = useState(0);
  useLayoutEffect(() => {
    if (!tlHead) return;
    setTlHeadH(tlHead.offsetHeight);
    const ro = new ResizeObserver(() => setTlHeadH(tlHead.offsetHeight));
    ro.observe(tlHead);
    return () => ro.disconnect();
  }, [tlHead]);

  useEffect(() => {
    if (!moreFocus) return;
    setMoreFocus(null);
    const target = moreFocus.to === "toggle"
      ? moreRef.current
      : document.querySelectorAll<HTMLButtonElement>(".dec-ruled .dec button.dec-line")[RULED_LIMIT] ?? null;
    if (!target) return;
    target.focus({ preventScroll: true });
    revealInWrap(target);
  }, [moreFocus]);

  // `/` puts the cursor in the find field when it is not in a text box (§2).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.closest("input, textarea, select, [contenteditable='true']"))) return;
      e.preventDefault();
      findRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Timeline: one row per decision, raised → ruled, open ones running to the
  // end of today. Records carry whole days, so the zoom stops at Days (A12);
  // each date covers its day.
  const marks = [now, ...shown.flatMap((r) => [parseISO(r.d.raised), parseISO(r.d.ruled)]).filter((d): d is Date => !!d)].map((d) => d.getTime());
  const dataFrom = Math.min(...marks);
  const dataTo = addLocalDays(Math.max(...marks), 1);
  const span = Math.max((dataTo - dataFrom) / DAY, 14);
  const fit = { from: addLocalDays(dataFrom, -Math.max(1, Math.round(span * 0.04))), to: addLocalDays(dataTo, Math.max(2, Math.round(span * 0.08))) };
  const z = useTimeZoom({ fit, data: { from: dataFrom, to: Math.max(dataTo, Date.now()) }, hours: false, reset: selectedInitiative });

  if (!view) return <div className="empty">Loading…</div>;

  const cardOf = (initiative: string, slug: string): merge.BoardCard | undefined =>
    Object.values(view.board.columns ?? {}).flat().find((c) => c.initiative_id === initiative && c.slug === slug);

  const age = (d: model.Decision) => { const r = parseISO(d.raised); return r ? daysBetween(r, now) : 0; };
  const all = !selectedInitiative;

  // §7: the developer's note left the page; the h1 stays on All initiatives.
  const head = !selectedInitiative ? <div className="board-head"><h1>All initiatives</h1></div> : null;
  if (rows.length === 0) {
    return (
      <div>
        {head}
        <div className="empty">No decision records{selectedInitiative ? " in this initiative" : ""} yet. The working-on skill says how to raise one.</div>
      </div>
    );
  }

  const toggle = (key: string) => { setExpanded(expanded === key ? null : key); setRuling(null); };

  // A render function, not a component: a component declared here would be a
  // new type on every store update (the agents feed, every 10 s) and remount,
  // dropping what was typed into the rule box.
  const record = (r: Row) => {
    const d = r.d;
    const isOpen = expanded === r.key;
    const ruledOn = shortDate(parseISO(d.ruled) ?? now);
    const t = turnaroundWords(d.raised, d.ruled);
    // FR-12, 0045: every proposed record offers Rule, whoever owns it.
    // FR-13: a record of an initiative that is not active offers none.
    const canRule = d.status === "proposed" && !readOnlyOf(view, r.initiative);
    const isRuling = canRule && ruling === r.key;
    const focused = decisionFocus === r.key;
    const stuck = isOpen && tall?.key === r.key;
    const style: CSSProperties = { ...(focused ? { background: "var(--surface-selected)" } : {}), ...(stuck ? { "--dec-box-max": `${tall!.boxMax}px` } as CSSProperties : {}) };
    // The highlight is Home's focused row (shell.css .ib-row.focused).
    return (
      <div key={r.key} data-dec={r.key} className={`dec ${d.status} ${isOpen ? "expanded" : ""} ${focused ? "focused" : ""}`} style={style}>
        <div className={`dec-head ${stuck ? "stuck" : ""}`}>
          {/* §9: the name says each visible fact once ("waiting" once). */}
          <button className="dec-line" aria-expanded={isOpen} aria-label={lineName(d, now, all ? r.initiative : undefined, ruledOn)} onClick={() => toggle(r.key)} title={isOpen ? "collapse" : "show the record"}>
            <span className="dec-num mono">{d.number}</span>
            <span className="dec-title">{d.title}</span>
            {all && <span className="badge">{r.initiative}</span>}
            <span className={`badge dec-status ${d.status}`}>{statusWord(d.status)}</span>
            <span className="dec-meta">
              {d.status === "proposed"
                ? <>{ownerPhrase(d.owner)} · <b>{waitedWords(age(d))}</b></>
                : d.status === "ruled"
                  ? <>{d.chosen ? <>“{d.chosen}” · </> : null}{rulerWords(d.ruled_by)} · {ruledOn}{t && <> · {t}</>}</>
                  : d.superseded_by ? <>by {d.superseded_by}</> : null}
            </span>
          </button>
          {isOpen && canRule && (
            <div className="dec-actions">
              <span className="rb-anchor">
                <button ref={isRuling ? ruleBtn : undefined} className="primary" aria-label={`Rule ${d.number} ${d.title}`} aria-expanded={isRuling} onClick={() => setRuling(isRuling ? null : r.key)}>Rule</button>
                {isRuling && <RuleDecisionBox initiative={r.initiative} decision={d} opener={ruleBtn} afterRule={() => focusAfterRule(open.indexOf(r))} onClose={() => setRuling(null)} />}
              </span>
            </div>
          )}
        </div>
        {isOpen && (
          <div className="dec-body">
            <div className="dec-facts">
              <span>raised {d.raised} by {d.raised_by || "—"}</span>
              {d.options?.length ? <span>options: {d.options.join(" · ")}</span> : null}
              {(d.supersedes ?? []).length > 0 && <span>supersedes {d.supersedes.join(", ")}</span>}
              {(d.cards ?? []).map((slug) => {
                const c = cardOf(r.initiative, slug);
                return c
                  ? <button key={slug} className="link mono" onClick={() => select(c)}>{slug}</button>
                  : <span key={slug} className="mono dim">{slug}</span>;
              })}
            </div>
            <RecordBody body={d.body || ""} />
            <div className="dec-path mono">{d.path}</div>
          </div>
        )}
      </div>
    );
  };

  // A section heading (§3): an h2 whose button is the disclosure, named by
  // its words and count, the sort order its description. `extra` sits at the
  // heading's right (the Timeline's controls); `fixed` is a heading that
  // cannot close (an empty To rule).
  const heading = (id: keyof DecSections, words: string, count: string | null, order: string | null, extra?: ReactNode, fixed?: boolean, ref?: (el: HTMLDivElement | null) => void) => {
    const isOpen = fixed || sections[id];
    const label = count === null ? words : `${words} · ${count}`;
    const desc = order ? `dec-${id}-order` : undefined;
    return (
      <div className="dec-sh" ref={ref}>
        <h2 id={`dec-${id}-h`} tabIndex={-1}>
          {fixed
            ? <span className="dec-sh-static"><span className="dec-chev" aria-hidden="true" />{label}</span>
            : (
              <button className="dec-sh-btn" aria-expanded={isOpen} aria-describedby={desc} onClick={() => handToggle(id)}>
                <span className="dec-chev" aria-hidden="true">{isOpen ? "▾" : "▸"}</span>{label}
              </button>
            )}
        </h2>
        {order && <span id={desc} className="sr-only">{order}</span>}
        {extra}
      </div>
    );
  };

  const anyHit = openHits.length + pastHits.length + closed.filter(hit).length > 0;
  const summary = summaryOf(open.map((r) => r.d), ruled.map((r) => r.d), now);
  const oldest = open[0];
  const limited = ruledShown(pastHits, showAllRuled, filtering);
  const pastShown = limited.shown;
  const noMatch = <div className="meta dec-nomatch">no match</div>;
  const x = z.scale.x;
  const endOfDay = (d: Date) => addLocalDays(d.getTime(), 1);

  return (
    <div className="decisions">
      {head}

      <div className="dec-find">
        <input
          ref={findRef}
          type="text"
          className="dec-find-input"
          // A number or words to match, not prose: no spelling or completion
          // bubble, which in WKWebView took the first Escape (L8).
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
          placeholder="Find a decision: number or words"
          aria-label="Find a decision: number or words"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Escape" && query) { e.preventDefault(); e.stopPropagation(); setQuery(""); } }}
        />
        {filtering && !anyHit && (
          <div className="dec-find-none">
            <span>No decision matches “{query.trim()}”.</span>
            <button className="ghost small" onClick={() => { setQuery(""); findRef.current?.focus(); }}>Clear</button>
          </div>
        )}
      </div>

      <p className="dec-summary">
        {summary.lead}
        {summary.number && oldest && <> (<button className="link dec-summary-link" onClick={() => land(oldest.key)} aria-label={`${summary.number}, the oldest waiting: show it`}>{summary.number}</button>)</>}
        {summary.week && <> · {summary.week}</>}
      </p>

      <section className="dec-section dec-rule">
        {heading("rule", "To rule", open.length === 0 ? "0" : countWords(openHits.length, open.length, filtering), "oldest first", undefined, open.length === 0)}
        {(open.length === 0 || sections.rule) && (
          open.length === 0
            ? <div className="meta dec-empty">Nothing to rule.</div>
            : openHits.length === 0 ? noMatch : openHits.map(record)
        )}
      </section>

      <section className="dec-section dec-ruled">
        {heading("ruled", "Ruled", countWords(pastHits.length, past.length, filtering), "newest first")}
        {sections.ruled && (pastHits.length === 0 ? <div className={`meta ${filtering ? "dec-nomatch" : "dec-empty"}`}>{emptyRuledWords(filtering)}</div> : (
          <>
            {pastShown.filter((r) => r.d.status === "ruled").map(record)}
            {pastShown.some((r) => r.d.status !== "ruled") && (
              <>
                <h3 className="meta">Superseded or withdrawn</h3>
                {pastShown.filter((r) => r.d.status !== "ruled").map(record)}
              </>
            )}
            {!filtering && past.length > 10 && (
              <button ref={moreRef} className="dec-more" onClick={() => { setMoreFocus({ to: showAllRuled ? "toggle" : "first", seq: Date.now() }); setShowAllRuled(!showAllRuled); }}>
                {showAllRuled ? "Show only the newest ten" : `Show the other ${limited.hidden}`}
              </button>
            )}
          </>
        ))}
      </section>

      <section className="dec-section dec-tl" style={tlHeadH ? { "--dec-tl-sh": `${tlHeadH}px` } as CSSProperties : undefined}>
        {heading("timeline", "Timeline", timelineCountOf(shownHits.length, shown.length, showClosed ? 0 : closed.length, showClosed ? 0 : closed.filter(hit).length, filtering), "raised to ruled; open ones run to today",
          sections.timeline ? (
            <div className="dec-sh-tools">
              {closed.length > 0 && (
                <button className="ghost small" onClick={() => setShowClosed(!showClosed)}>{showClosed ? "hide" : "show"} {closed.length} superseded or withdrawn</button>
              )}
              <ZoomControl z={z} />
            </div>
          ) : undefined, false, setTlHead)}
        {sections.timeline && (shownHits.length === 0 ? noMatch : (
          <>
            <div className="gantt-body dec-timeline tz-host">
              <TimeFrame z={z} label="Decisions timeline" extents={shownHits.map((r) => {
                const raised = parseISO(r.d.raised) ?? now;
                const until = r.d.status === "proposed" ? now : parseISO(r.d.ruled) ?? raised;
                return { from: raised.getTime(), to: endOfDay(until < raised ? raised : until) };
              })}>
                {shownHits.map((r) => {
                  const d = r.d;
                  const raised = parseISO(d.raised) ?? now;
                  const ruledAt = parseISO(d.ruled);
                  let until = d.status === "proposed" ? now : ruledAt ?? raised;
                  if (until < raised) until = raised;
                  const dot = daysBetween(raised, until) < 1 && d.status !== "proposed";
                  const from = raised.getTime();
                  const to = endOfDay(until);
                  // §5: one line; the status is in the name and the title.
                  const name = timelineName(d, all ? r.initiative : undefined);
                  return (
                    <div key={r.key} className={`g-row tz-row dec-row ${d.status}`}>
                      <button className="g-label link tz-label" onClick={() => land(r.key)} title={name} aria-label={name}>
                        <span className="g-title"><span className="mono dim">{d.number}</span> {d.title}</span>
                      </button>
                      <div className="g-lane tz-lane" title={name}>
                        {dot
                          ? <div className={`dec-dot ${d.status}`} style={{ left: (x(from) + x(to)) / 2 }} />
                          : <div className={`dec-bar ${d.status}`} style={{ left: x(from), width: Math.max(x(to) - x(from), 4) }} />}
                        <EdgePointer z={z} from={from} to={to} />
                      </div>
                    </div>
                  );
                })}
              </TimeFrame>
            </div>
            <div className="dec-legend meta">
              <span><i className="dec-key proposed" /> waiting (dashed, runs to today)</span>
              <span><i className="dec-key ruled" /> ruled</span>
              <span><i className="dec-key superseded" /> superseded or withdrawn</span>
              <span>a dot is raised and ruled the same day</span>
            </div>
          </>
        ))}
      </section>
    </div>
  );
}

/** The Timeline's heading count while a find is on (row 9, leftovers-6
 *  FR-5): `1 of 73`, then the superseded and withdrawn it leaves out, saying
 *  how many of those match: `· 1 more among 3 hidden`, or `· 3 hidden` when
 *  none does. No count without a find (§3). */
function timelineCountOf(matched: number, total: number, hidden: number, hiddenHits: number, filtering: boolean): string | null {
  if (!filtering) return null;
  const rest = hidden === 0 ? "" : hiddenHits > 0 ? ` · ${hiddenHits} more among ${hidden} hidden` : ` · ${hidden} hidden`;
  return `${matched} of ${total}${rest}`;
}

/** After a ruling (row 2, leftovers-6 FR-2; design system, Focus and names,
 *  closing): the ruled record has left To rule, so focus goes to the waiting
 *  record that took its place (the next, else the one before), else to the
 *  To rule heading, and is brought into view under the sticky headings. */
function focusAfterRule(index: number) {
  const lines = document.querySelectorAll<HTMLButtonElement>(".dec-rule .dec button.dec-line");
  const target = lines[Math.max(0, index)] ?? lines[lines.length - 1] ?? document.getElementById("dec-rule-h");
  if (!target) return;
  target.focus({ preventScroll: true });
  revealInWrap(target);
}

/** Scrolls the page's scroller (.board-wrap) so `el` is whole in view and not
 *  under the stuck section heading; nothing when it already is. The scroller
 *  is set directly, as the landing does. */
function revealInWrap(el: HTMLElement) {
  const wrap = el.closest<HTMLElement>(".board-wrap");
  if (!wrap) { el.scrollIntoView({ block: "nearest" }); return; }
  const w = wrap.getBoundingClientRect();
  const sh = el.closest(".dec-section")?.querySelector<HTMLElement>(".dec-sh");
  const shBottom = sh && sh !== el.closest(".dec-sh") ? sh.getBoundingClientRect().bottom : w.top;
  const b = el.getBoundingClientRect();
  const top = Math.max(w.top, shBottom) + 4;
  if (b.top < top) wrap.scrollTop -= top - b.top;
  else if (b.bottom > w.bottom - 4) wrap.scrollTop += b.bottom - (w.bottom - 4);
}

/** A record's body (FR-9 as amended, mal-ui U1). The periodic refresh
 *  re-rendered it and React set its innerHTML again with the same HTML, so
 *  a code block scrolled sideways went back to its start every few seconds.
 *  The body's DOM is written only when its HTML changes, and then each code
 *  block and table keeps the offset it was scrolled to. */
function RecordBody({ body }: { body: string }) {
  const el = useRef<HTMLDivElement>(null);
  const last = useRef<string | null>(null);
  useMarkdownEdges(el);
  const html = useMemo(() => marked.parse(body) as string, [body]);
  useLayoutEffect(() => {
    const e = el.current;
    if (!e || last.current === html) return;
    const wide = () => Array.from(e.querySelectorAll<HTMLElement>("pre, table"));
    const offsets = wide().map((w) => w.scrollLeft);
    e.innerHTML = html;
    last.current = html;
    wide().forEach((w, i) => { if (offsets[i]) w.scrollLeft = offsets[i]; });
  }, [html]);
  return <div ref={el} className="markdown dec-text" />;
}
