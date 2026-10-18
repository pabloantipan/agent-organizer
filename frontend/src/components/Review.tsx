import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { review as rv, service } from "../../wailsjs/go/models";
import { MakeReview, ReviewAddressee, ReviewMap, ReviewMarks, ReviewStatus, StopReview } from "../../wailsjs/go/main/App";
import { ClipboardSetText, EventsOn } from "../../wailsjs/runtime/runtime";
import { useBoard } from "../stores/board.store";
import { openBox, openBoxes } from "../lib/boxStack";
import { busyButton } from "../lib/busy";
import { speaker } from "../lib/liveRegion";
import {
  afterASecond, allReviewed, countsLine, coverage, coverageLine, filesOf, firstLine, flagLook, groupName, inTextField, isAffected, lastToReview, MARK_GLYPH, makeOrigin, makingLabel, movedLine,
  askFailedLine, nextToReview, nothingToReview, partialLines, rowName, saidAfter, screenState, secondsSince, worklist, WORDS, type Addressee, type Group, type Row, type Via,
} from "../lib/review";
import { ReviewSymbol } from "./ReviewSymbol";
import "../styles/review.css";

/** The Review screen (docs/ux/specs/review-view.md §2-§5, review-map v2
 *  FR-18): one card's change, its header (counts, coverage, Next to
 *  review, the partial lines) over the worklist and the symbol. Opened from
 *  the card back's Review the change; `← Card` and Escape go back to it.
 *  The symbol's panel is ReviewSymbol, mounted in SymbolPane. */
export function Review() {
  const { review, closeReview, setReviewPlace, openSlack } = useBoard();
  const initiative = review?.initiative ?? "";
  const card = review?.card ?? "";
  const symbol = review?.symbol ?? "";
  const [status, setStatus] = useState<service.ReviewStatus | null>(null);
  const [make, setMake] = useState<service.ReviewMake | null>(null);
  const [map, setMap] = useState<rv.RevMap | null>(null);
  const [marks, setMarks] = useState<rv.Marks | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Who a Question or Blocked asks (FR-25), read once per card.
  const [to, setTo] = useState<Addressee | null>(null);
  useEffect(() => {
    let live = true;
    ReviewAddressee(initiative, card).then((a) => { if (live) setTo(a); }, (e) => { if (live) setTo({ seat: "", why: firstLine(String(e)) }); });
    return () => { live = false; };
  }, [initiative, card]);

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

  // All reviewed, and an ask that posted: the live region says each once
  // (§4; FR-29, FR-38), both in one message when one press does both.
  const [said, setSaid] = useState("");
  const sayer = useMemo(() => speaker(setSaid), []);
  useEffect(() => () => sayer.stop(), [sayer]);
  const wasDone = useRef<boolean | null>(null);
  const asked = useRef("");
  const failed = useRef("");
  useEffect(() => {
    if (!cov) return;
    const m = saidAfter({ asked: asked.current, failed: failed.current, wasDone: wasDone.current, done, cov });
    asked.current = "";
    failed.current = "";
    if (m) sayer.say(m);
    wasDone.current = done;
  }, [cov, done, sayer]);
  const seat = to?.seat ?? "";
  const onAsked = useCallback((r: service.ReviewAsk) => {
    if (r.error) failed.current = askFailedLine(r.to?.seat || seat, r.error);
    else if (r.asked) asked.current = r.to?.seat ?? "";
    setMarks(r.marks);
  }, [seat]);

  // Opening a symbol moves focus to its title (§5).
  const title = useRef<HTMLHeadingElement>(null);
  const focusTitle = useRef(false);
  const [active, setActive] = useState("");
  const [opened, setOpened] = useState(0);
  // An affected symbol opens read-only from a changed one (§3.3); `from`
  // is the changed one `← back` returns to, and where N walks from.
  const [from, setFrom] = useState("");
  // The list an affected symbol was opened from, which names its line (FR-40).
  const [via, setVia] = useState<Via | undefined>(undefined);
  const open = useCallback((id: string, list?: Via) => {
    const n = map?.nodes?.find((x) => x.id === id);
    const affected = !!n && isAffected(n);
    setFrom(affected ? (symbol && !map?.nodes?.find((x) => x.id === symbol && isAffected(x)) ? symbol : from) : "");
    setVia(affected ? list : undefined);
    focusTitle.current = true;
    if (!affected) setActive(id);
    setOpened((k) => k + 1);
    setReviewPlace({ symbol: id });
  }, [setReviewPlace, map, symbol, from]);
  // The worklist's row for it scrolls into view, nearest (§5).
  useEffect(() => {
    if (!focusTitle.current || !symbol) return;
    focusTitle.current = false;
    title.current?.focus();
    document.querySelector<HTMLElement>(`[data-row="${CSS.escape(symbol)}"]`)?.scrollIntoView({ block: "nearest" });
  }, [symbol, opened]);

  const step = useCallback((dir: 1 | -1) => {
    const to = nextToReview(groups, from || symbol, dir);
    if (to) open(to);
  }, [groups, symbol, from, open]);

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

  const pressedAt = useRef<number | undefined>(undefined);
  const makeIt = async () => {
    pressedAt.current = Date.now();
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

  // No flash (FR-23): the counter and Stop show only once the make has run
  // 1 s; a make that ends sooner never draws them. Focus stays put.
  const [progress, setProgress] = useState(false);
  const [origin, setOrigin] = useState(0);
  const makeKey = making && make ? make.started : "";
  useEffect(() => {
    setProgress(false);
    if (!makeKey || !make) return;
    const from = makeOrigin(make, Date.now(), pressedAt.current);
    pressedAt.current = undefined;
    setOrigin(from);
    return afterASecond(from, () => setProgress(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [makeKey]);

  // Focus on open (FR-20): the screen's first target once it has drawn,
  // the worklist's stop with a map, Make the map with none, else ← Card;
  // never the page body. Back from Conversations (← Review, FR-29) the
  // place still names a symbol: focus goes to its title, as on opening it.
  const focusedOpen = useRef(false);
  useEffect(() => {
    if (focusedOpen.current || state === "loading" || (shown && !map)) return;
    focusedOpen.current = true;
    const returned = symbol && map?.nodes?.some((n) => n.id === symbol) ? title.current : null;
    (returned ?? firstTarget(document))?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, shown, map]);

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
      onBack={closeReview} onStep={step} onOpen={open} onMake={makeIt} onStop={stop} makeBtn={makeBtn} title={title} said={said} progress={progress} origin={origin}
      panel={{ initiative, card, head: review?.head ?? "", from, via, to, onBack: () => open(from), onMarks: setMarks, onAsked, onOpenThread: (thread) => openSlack(initiative, null, thread), onNext: () => step(1) }} />
  );
}

/** The worklist's current row (FR-35, U6): the shown symbol's, or, while
 *  an affected one is shown, the changed one's it was opened from. */
export const currentRow = (symbol: string, from?: string) => from || symbol;

/** FR-20's first target, in that order (a selector list would take
 *  document order, and ← Card comes first in it). */
export const firstTarget = (root: ParentNode) =>
  root.querySelector<HTMLElement>(".rv-tree [tabindex='0']") ?? root.querySelector<HTMLElement>(".review-empty button") ?? root.querySelector<HTMLElement>(".review-back");

export type ReviewViewProps = {
  status: service.ReviewStatus | null; make: service.ReviewMake | null; map: rv.RevMap | null; marks: rv.Marks | null; error: string | null;
  symbol: string; active: string; setActive: (k: string) => void;
  onBack: () => void; onStep: (dir: 1 | -1) => void; onOpen: (id: string, via?: Via) => void; onMake: () => void; onStop: () => void;
  makeBtn: React.RefObject<HTMLButtonElement | null>; title: React.RefObject<HTMLHeadingElement | null>; said: string;
  /** FR-23: the make has run 1 s, so its counter and Stop show. */
  progress?: boolean;
  /** Where the 1 s and the counter count from (makeOrigin). */
  origin?: number;
  /** What the symbol's panel needs beyond the map; none draws the title only. */
  panel?: PanelProps;
};

type PanelProps = {
  initiative: string; card: string; head: string; from: string; via?: Via; to?: Addressee | null;
  onBack: () => void; onMarks: (m: rv.Marks) => void; onAsked?: (r: service.ReviewAsk) => void; onOpenThread?: (thread: string) => void; onNext: () => void;
};

/** What the screen draws for a status, a make, a map and its marks: every
 *  §4 state, pure, so vitest renders each one. */
export function ReviewView({ status, make, map, marks, error, symbol, active, setActive, onBack, onStep, onOpen, onMake, onStop, makeBtn, title, said, progress = false, origin = 0, panel }: ReviewViewProps) {
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
            <MakeButton btn={makeBtn} label={WORDS.makeAgain} making={making} progress={progress} origin={origin} onMake={onMake} onStop={onStop} />
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
              <MakeButton btn={makeBtn} label={state === "failed" ? WORDS.tryAgain : WORDS.makeMap} primary={state !== "failed"} making={making} progress={progress} origin={origin} onMake={onMake} onStop={onStop}>
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
            <Worklist groups={groups} active={active || symbol} setActive={setActive} shown={currentRow(symbol, panel?.from)} onOpen={onOpen} />
          ))}
        </div>
        <SymbolPane map={map} node={node} row={row} marks={marks} last={lastToReview(groups, symbol)} title={title} onOpen={onOpen} panel={panel} />
      </div>
      <div className="sr-only" aria-live="polite">{said}</div>
    </div>
  );
}

/** Make the map, and while it runs the same button as `Making the map · 2 s`
 *  with Stop beside it: a counter, no spinner, and focus stays on the busy
 *  button (§4, the busy rule). */
function MakeButton({ btn, label, primary, making, progress, origin, onMake, onStop, children }: { btn: React.RefObject<HTMLButtonElement | null>; label: string; primary?: boolean; making: boolean; progress: boolean; origin: number; onMake: () => void; onStop: () => void; children?: React.ReactNode }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!making || !progress) return;
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [making, progress]);
  return (
    <span className="review-make">
      <button ref={btn} className={primary ? "primary" : undefined} {...busyButton({ busy: making, onPress: onMake })}>{making ? (progress ? makingLabel(secondsSince(origin, now)) : WORDS.makingShort) : label}</button>
      {making && progress && <button onClick={onStop}>{WORDS.stop}</button>}
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
                  <li key={r.id} role="treeitem" aria-level={2} aria-label={rowName(r)} aria-describedby={r.path ? `rv-path-${r.id}` : undefined} aria-selected={r.id === shown} aria-current={r.id === shown ? "true" : undefined} data-row={r.id}
                    tabIndex={current === r.id ? 0 : -1} ref={ref(r.id)}
                    className={`rv-row ${r.id === shown ? "on" : ""} ${r.node ? "" : "declared"}`}
                    onFocus={(e) => { e.stopPropagation(); setActive(r.id); }}
                    onClick={(e) => { e.stopPropagation(); setActive(r.id); if (r.node) onOpen(r.id); }}>
                    <span className={`rv-mark ${r.mark}`} aria-hidden="true">{MARK_GLYPH[r.mark]}</span>
                    <span className="rv-name mono">{r.name}</span>
                    {r.change && <span className="rv-change">{r.change}</span>}
                    {r.asked && r.mark && !r.changedSince && <span className={`rv-asked ${r.mark}`} aria-hidden="true">asked</span>}
                    {r.node ? r.node.flags?.map((f, k) => <span key={f} className={`rv-flag ${flagLook(f)}`}>{r.flags[k]}</span>) : <span className={`rv-flag ${flagLook("declared_not_changed")}`}>declared, not changed</span>}
                    {r.changedSince && <span className="rv-since">{WORDS.changedSince}</span>}
                    {r.path && <span id={`rv-path-${r.id}`} className="sr-only">{r.path}</span>}
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

/** Where the symbol's panel mounts (design §3.3): ReviewSymbol, whose h2
 *  takes focus when a symbol opens, then the diff and the facts, beside
 *  each other from 1440, the facts under the diff below (§3.4). With no
 *  symbol chosen it is empty; with no panel props (vitest of the screen's
 *  states) it draws the title only. */
function SymbolPane({ map, node, row, marks, last, title, onOpen, panel }: { map: rv.RevMap | null; node: rv.Node | null; row: Row | null; marks: rv.Marks | null; last: boolean; title: React.RefObject<HTMLHeadingElement | null>; onOpen: (id: string, via?: Via) => void; panel?: PanelProps }) {
  if (!node || !map) return <section className="review-symbol empty" aria-label="Symbol" />;
  const from = panel?.from ? map.nodes?.find((n) => n.id === panel.from) ?? null : null;
  return (
    <section className="review-symbol" aria-label="Symbol">
      {panel ? (
        <ReviewSymbol key={node.id} initiative={panel.initiative} card={panel.card} head={panel.head} map={map} node={node} row={row} marks={marks} from={from} via={panel.via}
          to={panel.to ?? null} last={last} title={title} onOpen={onOpen} onBack={panel.onBack} onMarks={panel.onMarks} onAsked={panel.onAsked ?? ((r) => panel.onMarks(r.marks))}
          onOpenThread={panel.onOpenThread ?? (() => undefined)} onNext={panel.onNext} />
      ) : (
        <h2 ref={title} tabIndex={-1} className="review-symbol-title"><span className="mono">{row?.name ?? node.id}</span> <span className="rv-change">{node.change}</span></h2>
      )}
    </section>
  );
}
