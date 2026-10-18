import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { review as rv, service } from "../../wailsjs/go/models";
import { MakeReview, ReviewMap, ReviewMarks, ReviewStatus, StopReview } from "../../wailsjs/go/main/App";
import { ClipboardSetText, EventsOn } from "../../wailsjs/runtime/runtime";
import { useBoard } from "../stores/board.store";
import { openBox, openBoxes } from "../lib/boxStack";
import { busyButton } from "../lib/busy";
import { speaker } from "../lib/liveRegion";
import {
  allReviewed, countsLine, coverage, coverageLine, elapsedOf, filesOf, groupName, inTextField, MARK_GLYPH, makingLabel, movedLine,
  nextToReview, nothingToReview, partialLines, rowName, screenState, worklist, WORDS, type Group, type Row,
} from "../lib/review";
import "../styles/review.css";

/** The Review screen (docs/ux/specs/review-view.md §2-§5, review-map v2
 *  FR-18): one card's change, its header (counts, coverage, Next to
 *  review, the partial lines) over the worklist and the symbol. Opened from
 *  the card back's Review the change; `← Card` and Escape go back to it.
 *  The symbol's panel is rv-symbol's: it mounts in SymbolPane. */
export function Review() {
  const { review, closeReview, setReviewPlace } = useBoard();
  const initiative = review?.initiative ?? "";
  const card = review?.card ?? "";
  const symbol = review?.symbol ?? "";
  const [status, setStatus] = useState<service.ReviewStatus | null>(null);
  const [make, setMake] = useState<service.ReviewMake | null>(null);
  const [map, setMap] = useState<rv.RevMap | null>(null);
  const [marks, setMarks] = useState<rv.Marks | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const st = await ReviewStatus(initiative, card);
      setStatus(st);
      setMake(st.make ?? null);
      if (st.state === "map" || st.state === "moved") {
        const [m, mk] = await Promise.all([ReviewMap(initiative, card, st.map_head), ReviewMarks(initiative, card, st.map_head)]);
        setMap(m);
        setMarks(mk);
        setReviewPlace({ head: st.map_head });
      } else {
        setMap(null);
        setMarks(null);
      }
    } catch (e) {
      setError(String(e));
    }
  }, [initiative, card, setReviewPlace]);

  useEffect(() => { void load(); }, [load]);
  // The make's end (rv-data: the event review:make with the ReviewMake).
  useEffect(() => EventsOn("review:make", (m: service.ReviewMake) => {
    if (m?.initiative !== initiative || m?.card !== card) return;
    setMake(m);
    void load();
  }), [initiative, card, load]);

  // ← Card, and Escape when focus is not in a text field (§2). Escape goes
  // to the topmost box, so Help over the screen closes first.
  const back = useRef(closeReview);
  back.current = closeReview;
  useEffect(() => openBox(() => { if (!inTextField(document.activeElement)) back.current(); }), []);

  const state = screenState(status, make);
  const groups = useMemo(() => (map ? worklist(map, marks) : []), [map, marks]);
  const cov = useMemo(() => (map ? coverage(map, marks) : null), [map, marks]);
  const done = !!cov && allReviewed(cov);

  // All reviewed: the live region says it once (§4).
  const [said, setSaid] = useState("");
  const sayer = useMemo(() => speaker(setSaid), []);
  useEffect(() => () => sayer.stop(), [sayer]);
  const wasDone = useRef<boolean | null>(null);
  useEffect(() => {
    if (!cov) return;
    if (wasDone.current === false && done) sayer.say(coverageLine(cov));
    wasDone.current = done;
  }, [cov, done, sayer]);

  // Opening a symbol moves focus to its title (§5).
  const title = useRef<HTMLHeadingElement>(null);
  const focusTitle = useRef(false);
  const [active, setActive] = useState("");
  const [opened, setOpened] = useState(0);
  const open = useCallback((id: string) => {
    focusTitle.current = true;
    setActive(id);
    setOpened((n) => n + 1);
    setReviewPlace({ symbol: id });
  }, [setReviewPlace]);
  // The worklist's row for it scrolls into view, nearest (§5).
  useEffect(() => {
    if (!focusTitle.current || !symbol) return;
    focusTitle.current = false;
    title.current?.focus();
    document.querySelector<HTMLElement>(`[data-row="${CSS.escape(symbol)}"]`)?.scrollIntoView({ block: "nearest" });
  }, [symbol, opened]);

  const step = useCallback((dir: 1 | -1) => {
    const to = nextToReview(groups, symbol, dir);
    if (to) open(to);
  }, [groups, symbol, open]);

  // N and Shift+N whenever focus is not in a text field (§5), and no box is
  // open over the screen.
  const stepRef = useRef(step);
  stepRef.current = step;
  const doneRef = useRef(done);
  doneRef.current = done;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.key.toLowerCase() !== "n") return;
      if (inTextField(document.activeElement) || openBoxes() > 1 || doneRef.current) return;
      e.preventDefault();
      stepRef.current(e.shiftKey ? -1 : 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const makeIt = async () => {
    setError(null);
    try { setMake(await MakeReview(initiative, card)); } catch (e) { setError(String(e)); }
  };
  const stop = async () => {
    try { setMake(await StopReview(initiative, card)); } catch (e) { setError(String(e)); }
    makeBtn.current?.focus();
    void load();
  };
  const makeBtn = useRef<HTMLButtonElement>(null);
  const making = make?.state === "making";
  const shown = state === "map" || state === "moved";

  // A make that ends with a map hands focus to the worklist (the result,
  // not the wait, moves focus); a failure keeps it on Try again.
  // The map loads after the make's end, so the hand-off waits for it.
  const wasMaking = useRef(false);
  const handoff = useRef(false);
  useEffect(() => {
    if (wasMaking.current && !making && make?.state === "done") handoff.current = true;
    wasMaking.current = making;
    if (!handoff.current || !shown || !map) return;
    handoff.current = false;
    document.querySelector<HTMLElement>(".rv-tree [tabindex='0'], .review-empty button")?.focus();
  }, [making, shown, make, map]);

  return (
    <ReviewView status={status} make={make} map={map} marks={marks} error={error} symbol={symbol} active={active} setActive={setActive}
      onBack={closeReview} onStep={step} onOpen={open} onMake={makeIt} onStop={stop} makeBtn={makeBtn} title={title} said={said} />
  );
}

export type ReviewViewProps = {
  status: service.ReviewStatus | null; make: service.ReviewMake | null; map: rv.RevMap | null; marks: rv.Marks | null; error: string | null;
  symbol: string; active: string; setActive: (k: string) => void;
  onBack: () => void; onStep: (dir: 1 | -1) => void; onOpen: (id: string) => void; onMake: () => void; onStop: () => void;
  makeBtn: React.RefObject<HTMLButtonElement | null>; title: React.RefObject<HTMLHeadingElement | null>; said: string;
};

/** What the screen draws for a status, a make, a map and its marks: every
 *  §4 state, pure, so vitest renders each one. */
export function ReviewView({ status, make, map, marks, error, symbol, active, setActive, onBack, onStep, onOpen, onMake, onStop, makeBtn, title, said }: ReviewViewProps) {
  const state = screenState(status, make);
  const groups = map ? worklist(map, marks) : [];
  const cov = map ? coverage(map, marks) : null;
  const done = !!cov && allReviewed(cov);
  const making = make?.state === "making";
  const failed = make?.state === "failed";
  const shown = state === "map" || state === "moved";
  const node = map?.nodes?.find((n) => n.id === symbol) ?? null;
  const row = groups.flatMap((g) => g.rows).find((r) => r.id === symbol) ?? null;

  return (
    <div className="review-screen">
      <div className="review-bar">
        <button className="ghost review-back" onClick={onBack}>{WORDS.back}</button>
      </div>
      <header className="review-head">
        {map && <div className="review-counts mono">{countsLine(map)}</div>}
        {cov && (
          <div className="review-cover">
            <span className="review-coverage">{coverageLine(cov)}</span>
            {!done && <button className="primary" onClick={() => onStep(1)} aria-keyshortcuts="N Shift+N" aria-label={WORDS.nextToReview}>{WORDS.nextToReview} <kbd>N</kbd></button>}
          </div>
        )}
        {state === "moved" && status && (
          <div className="review-moved">
            <span>{movedLine(status.map_head, status.head)}</span>
            <MakeButton btn={makeBtn} label={WORDS.makeAgain} making={making} make={make} onMake={onMake} onStop={onStop} />
          </div>
        )}
        {shown && failed && make && <div className="review-failed"><p className="review-reason">{make.error}</p><CopyCommand command={make.command} /></div>}
        {map && partialLines(map).map((l) => <div key={l} className="review-partial">⚠ {l}</div>)}
        {error && <div className="review-error">{error}</div>}
      </header>
      <div className="review-body">
        <div className="review-list">
          {state === "loading" && <div className="meta">Loading…</div>}
          {state === "missing" && status && <div className="review-empty"><p>{status.reason}</p></div>}
          {(state === "none" || state === "making" || state === "failed") && (
            <div className="review-empty">
              {state === "failed" && make ? <p className="review-reason">{make.error}</p> : <p>{WORDS.noMap}</p>}
              <MakeButton btn={makeBtn} label={state === "failed" ? WORDS.tryAgain : WORDS.makeMap} primary={state !== "failed"} making={making} make={make} onMake={onMake} onStop={onStop}>
                {state === "failed" && make && <CopyCommand command={make.command} />}
              </MakeButton>
            </div>
          )}
          {shown && map && (nothingToReview(map) ? (
            <div className="review-empty">
              <p>{WORDS.nothing}</p>
              <ul className="plain mono">{filesOf(map).map((f) => <li key={f}>{f}</li>)}</ul>
            </div>
          ) : (
            <Worklist groups={groups} active={active || symbol} setActive={setActive} shown={symbol} onOpen={onOpen} />
          ))}
        </div>
        <SymbolPane node={node} row={row} title={title} />
      </div>
      <div className="sr-only" aria-live="polite">{said}</div>
    </div>
  );
}

/** Make the map, and while it runs the same button as `Making the map · 2 s`
 *  with Stop beside it: a counter, no spinner, and focus stays on the busy
 *  button (§4, the busy rule). */
function MakeButton({ btn, label, primary, making, make, onMake, onStop, children }: { btn: React.RefObject<HTMLButtonElement | null>; label: string; primary?: boolean; making: boolean; make: service.ReviewMake | null; onMake: () => void; onStop: () => void; children?: React.ReactNode }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!making) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [making]);
  return (
    <span className="review-make">
      <button ref={btn} className={primary ? "primary" : undefined} {...busyButton({ busy: making, onPress: onMake })}>{making ? makingLabel(elapsedOf(make, now)) : label}</button>
      {making && <button onClick={onStop}>{WORDS.stop}</button>}
      {children}
    </span>
  );
}

/** Copy the command of a failed make (§4): the clipboard, never a file. */
export const copyCommand = (command: string, write: (t: string) => Promise<boolean> = ClipboardSetText) => write(command).then((ok) => ok, () => false);

export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  const [refused, setRefused] = useState(false);
  const copy = () => copyCommand(command).then((ok) => {
    setRefused(!ok);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  });
  return (
    <>
      <button className="ghost" title={command} onClick={copy}>{copied ? "Copied" : WORDS.copyCommand}</button>
      {refused && <span className="meta">the clipboard refused the command</span>}
    </>
  );
}

type Item = { key: string; group: Group; row: Row | null };

/** The worklist (§3.2, §5): groups and rows as one tree, one Tab stop
 *  (roving): ↑ ↓ move, ← → fold a group, Enter opens. */
function Worklist({ groups, active, setActive, shown, onOpen }: { groups: Group[]; active: string; setActive: (k: string) => void; shown: string; onOpen: (id: string) => void }) {
  const [folded, setFolded] = useState<Record<string, boolean>>({});
  const isFolded = (g: Group) => folded[g.key] ?? g.collapsed;
  const items: Item[] = groups.flatMap((g) => [{ key: `group:${g.key}`, group: g, row: null }, ...(isFolded(g) ? [] : g.rows.map((r) => ({ key: r.id, group: g, row: r })))]);
  const current = items.some((i) => i.key === active) ? active : items.find((i) => i.row?.id === shown)?.key ?? items[0]?.key ?? "";
  const refs = useRef(new Map<string, HTMLElement>());
  const focusTo = useRef<string | null>(null);
  useEffect(() => {
    if (!focusTo.current) return;
    refs.current.get(focusTo.current)?.focus();
    focusTo.current = null;
  });
  const go = (k: string) => { focusTo.current = k; setActive(k); };
  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = items.findIndex((x) => x.key === current);
    const it = items[i];
    if (!it) return;
    const fold = (v: boolean) => setFolded((f) => ({ ...f, [it.group.key]: v }));
    switch (e.key) {
      case "ArrowDown": if (i < items.length - 1) go(items[i + 1].key); break;
      case "ArrowUp": if (i > 0) go(items[i - 1].key); break;
      case "Home": go(items[0].key); break;
      case "End": go(items[items.length - 1].key); break;
      case "ArrowLeft":
        if (it.row) go(`group:${it.group.key}`);
        else fold(true);
        break;
      case "ArrowRight":
        if (!it.row && isFolded(it.group)) fold(false);
        else if (!it.row && it.group.rows[0]) go(it.group.rows[0].id);
        break;
      case "Enter": case " ":
        if (it.row?.node) onOpen(it.row.id);
        else if (!it.row) fold(!isFolded(it.group));
        break;
      default: return;
    }
    e.preventDefault();
  };
  const ref = (k: string) => (el: HTMLElement | null) => { if (el) refs.current.set(k, el); else refs.current.delete(k); };
  return (
    <ul className="rv-tree" role="tree" aria-label="Changed symbols" onKeyDown={onKeyDown}>
      {groups.map((g) => {
        const gk = `group:${g.key}`;
        const open = !isFolded(g);
        return (
          <li key={gk} role="treeitem" aria-level={1} aria-expanded={open} aria-label={groupName(g)} tabIndex={current === gk ? 0 : -1} ref={ref(gk)}
            className={`rv-group ${g.kind}`} onFocus={(e) => { if (e.target === e.currentTarget) setActive(gk); }}>
            <div className="rv-ghead" onClick={() => { setActive(gk); setFolded((f) => ({ ...f, [g.key]: open })); }}>
              <span className="rv-fold" aria-hidden="true">{open ? "▾" : "▸"}</span>
              <span className={g.kind === "package" ? "mono rv-gtitle" : "rv-gtitle"}>{g.title}</span>
              {g.kind !== "must" && <span className="rv-gcount">({g.rows.length})</span>}
            </div>
            {open && (
              <ul role="group">
                {g.rows.map((r) => (
                  <li key={r.id} role="treeitem" aria-level={2} aria-label={rowName(r)} aria-selected={r.id === shown} data-row={r.id}
                    tabIndex={current === r.id ? 0 : -1} ref={ref(r.id)}
                    className={`rv-row ${r.id === shown ? "on" : ""} ${r.node ? "" : "declared"}`}
                    onFocus={(e) => { e.stopPropagation(); setActive(r.id); }}
                    onClick={(e) => { e.stopPropagation(); setActive(r.id); if (r.node) onOpen(r.id); }}>
                    <span className={`rv-mark ${r.mark}`} aria-hidden="true">{MARK_GLYPH[r.mark]}</span>
                    <span className="rv-name mono">{r.name}</span>
                    {r.change && <span className="rv-change">{r.change}</span>}
                    {r.node ? r.node.flags?.map((f, k) => <span key={f} className={`rv-flag ${f}`}>{r.flags[k]}</span>) : <span className="rv-flag declared_not_changed">declared, not changed</span>}
                    {r.changedSince && <span className="rv-since">{WORDS.changedSince}</span>}
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Where the symbol's panel mounts (rv-symbol, design §3.3): the title, an
 *  h2 that takes focus when a symbol opens, then the diff and the facts,
 *  beside each other from 1440, the facts under the diff below (§3.4).
 *  With no symbol chosen it is empty. */
function SymbolPane({ node, row, title }: { node: rv.Node | null; row: Row | null; title: React.RefObject<HTMLHeadingElement | null> }) {
  if (!node) return <section className="review-symbol empty" aria-label="Symbol" />;
  const range = node.range_head ?? node.range_base;
  return (
    <section className="review-symbol" aria-label="Symbol">
      <h2 ref={title} tabIndex={-1} className="review-symbol-title">
        <span className="mono">{row?.name ?? node.id}</span> <span className="rv-change">{node.change}</span>
      </h2>
      <div className="meta mono">{node.file}{range ? ` ${range[0]}-${range[1]}` : ""}</div>
      <div className="review-symbol-body">
        <div className="review-diff" />
        <div className="review-facts" />
      </div>
    </section>
  );
}
