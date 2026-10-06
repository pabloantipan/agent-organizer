import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { EventsOn } from "../../wailsjs/runtime/runtime";
import { FloatDismiss, FloatListHeight, FloatPick } from "../../wailsjs/go/main/App";
import { useBoard } from "../stores/board.store";
import { filterList, floatList, focusOrder, foldSignals, HOME, homeCount, homeLabel, type FloatRow, type Signal } from "../lib/floatList";
import { useScrollEdges } from "../lib/useScrollEdges";
import "../styles/float.css";

/** The list panel the floating icon opens (docs/ux/specs/floating-icon.md
 *  §3): the Wails window, brought to this desktop at 360 wide, shows only
 *  this. A search, Home with Needs me's count, then the rail's order and
 *  groups, name and signals. A pick opens it full here; Escape (after
 *  clearing), a click outside or the icon send it home; a double-click on
 *  the icon opens it full at the view it last showed. */
export function FloatList() {
  const { view, agents, loading, openInitiative, goHome } = useBoard();
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState("bottom right");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [inactiveOpen, setInactiveOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const focused = useRef(false);

  useEffect(() => EventsOn("floaticon:list", (o?: string) => {
    setOrigin(typeof o === "string" && o ? o : "bottom right");
    setQuery("");
    setInactiveOpen(false);
    setActive(null);
    focused.current = false;
    setOpen(true);
  }), []);
  useEffect(() => EventsOn("floaticon:close", () => setOpen(false)), []);
  // A double-click on the icon grew the list into the full window: the list
  // goes and the view it covered, the last one shown, is what shows. The list
  // never changes the store's view, so nothing is restored.
  useEffect(() => EventsOn("floaticon:expand", () => setOpen(false)), []);

  const all = useMemo(() => floatList(view, agents), [view, agents]);
  const list = useMemo(() => filterList(all, query), [all, query]);
  const order = useMemo(() => focusOrder(list, query, inactiveOpen), [list, query, inactiveOpen]);
  const needs = homeCount(view, agents);
  // The first match is highlighted as he types; Home when there is no query.
  const current = active && order.includes(active) ? active : order[0] ?? null;

  useLayoutEffect(() => { if (open) input.current?.focus(); }, [open]);
  useEffect(() => { if (open) setActive(null); }, [query, open]);

  // Pick nothing: the window goes home (native).
  const close = () => { setOpen(false); void FloatDismiss().catch(() => undefined); };
  // A pick keeps the sub-view, as the rail does, and the window goes full here.
  const pick = (key: string) => {
    setOpen(false);
    if (key === HOME) goHome();
    else openInitiative(key, useBoard.getState().sub);
    void FloatPick().catch(() => undefined);
  };

  // A click outside: the window loses focus. Only after it had it, since the
  // window is made key a moment after the event.
  useEffect(() => {
    if (!open) return;
    const onFocus = () => { focused.current = true; };
    const onBlur = () => { if (focused.current) close(); };
    if (document.hasFocus()) focused.current = true;
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => { window.removeEventListener("focus", onFocus); window.removeEventListener("blur", onBlur); };
  }, [open]);

  // As tall as the rows, up to the native limit (480 or 70% of the display).
  useLayoutEffect(() => {
    if (!open) return;
    const el = panel.current, body = scroller.current, rows = body?.firstElementChild as HTMLElement | null;
    if (!el || !body || !rows) return;
    // The body stretches to the window, so its rows say what it needs.
    const report = () => {
      const pad = parseFloat(getComputedStyle(body).paddingBottom) || 0;
      const want = el.offsetHeight - body.clientHeight + rows.offsetHeight + pad;
      void FloatListHeight(Math.ceil(want)).catch(() => undefined);
    };
    report();
    const ro = new ResizeObserver(report);
    ro.observe(rows);
    return () => ro.disconnect();
  }, [open, list, inactiveOpen, view]);

  const edges = useScrollEdges(scroller, open);

  useEffect(() => {
    if (!open || !current) return;
    scroller.current?.querySelector<HTMLElement>(`[data-key="${CSS.escape(current)}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, current]);

  if (!open) return null;

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!order.length) return;
      const k = current ? order.indexOf(current) : -1;
      const n = e.key === "ArrowDown" ? Math.min(order.length - 1, k + 1) : Math.max(0, k - 1);
      setActive(order[n]);
    } else if (e.key === "Enter") {
      if (e.target instanceof HTMLButtonElement) return; // a focused button presses itself
      e.preventDefault();
      if (current) pick(current);
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (query) setQuery("");
      else close();
    } else if (e.key === "Tab") {
      // Tab stays inside the panel.
      const els = Array.from(panel.current?.querySelectorAll<HTMLElement>("input, button") ?? []).filter((x) => x.tabIndex >= 0 && !x.hasAttribute("disabled"));
      if (!els.length) return;
      const i = els.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? els.length - 1 : i - 1) : (i === els.length - 1 ? 0 : i + 1);
      e.preventDefault();
      els[next].focus();
    }
  };

  const reading = !view && loading;
  const none = !!view && all.sections.length === 0 && all.inactive.length === 0;
  const noMatch = !!query.trim() && !none && list.sections.length === 0 && list.inactive.length === 0;
  const optionId = (key: string) => `fl-${key.replace(/\W/g, "-")}`;

  const row = (r: FloatRow, folded = false) => (
    <button
      key={r.id}
      type="button"
      id={optionId(r.id)}
      data-key={r.id}
      role="option"
      aria-selected={current === r.id}
      tabIndex={-1}
      className={`fl-row ${current === r.id ? "on" : ""} ${folded ? "folded" : ""}`}
      onClick={() => pick(r.id)}
      onMouseMove={() => current !== r.id && setActive(r.id)}
      aria-label={[r.id, ...r.signals.map((s) => s.text)].join(", ")}
    >
      <span className="fl-rank num">{r.rank ?? ""}</span>
      <span className="fl-id">{r.id}</span>
      <Signals signals={r.signals} id={r.id} />
    </button>
  );

  return (
    <div className="fl-scrim">
      <div ref={panel} className={`fl ${origin.replace(" ", "-")}`} role="dialog" aria-label="Initiatives" onKeyDown={onKey}>
        <div className="fl-head">
          <Search size={14} aria-hidden="true" />
          <input
            ref={input}
            className="fl-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find an initiative"
            aria-label="Find an initiative"
            role="combobox"
            aria-expanded
            aria-controls="fl-list"
            aria-activedescendant={current ? optionId(current) : undefined}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div ref={scroller} id="fl-list" role="listbox" aria-label="Initiatives" className={`fl-body ${edges.top ? "edge-top" : ""} ${edges.bottom ? "edge-bottom" : ""}`}>
          <div className="fl-rows">
          {!query.trim() && (
            <button type="button" id={optionId(HOME)} data-key={HOME} role="option" aria-selected={current === HOME} tabIndex={-1}
              className={`fl-row fl-home ${current === HOME ? "on" : ""}`} onClick={() => pick(HOME)} onMouseMove={() => current !== HOME && setActive(HOME)}>
              <span className="fl-rank" aria-hidden="true" />
              <span className="fl-home-t">{homeLabel(needs)}</span>
            </button>
          )}
          {reading && <div className="fl-note">Reading initiatives…</div>}
          {none && <div className="fl-note">No initiatives yet. Deltagos finds them under the roots in its settings.</div>}
          {noMatch && (
            <div className="fl-note">
              No initiative matches "{query.trim()}". <button type="button" className="ghost fl-clear" onClick={() => { setQuery(""); input.current?.focus(); }}>Clear</button>
            </div>
          )}
          {list.sections.map((s) => (
            <div key={s.name || "all"} role="group" aria-label={s.name || "initiatives"}>
              {s.name && <div className="fl-group">{s.name}</div>}
              {s.rows.map((r) => row(r))}
            </div>
          ))}
          {list.inactive.length > 0 && (
            <div role="group" aria-label="Not active">
              {query.trim() ? <div className="fl-group">Not active</div> : (
                <button type="button" className="fl-group fl-fold" aria-expanded={inactiveOpen} onClick={() => setInactiveOpen(!inactiveOpen)}>
                  {inactiveOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />} Not active ({list.inactive.length})
                </button>
              )}
              {(inactiveOpen || query.trim()) && list.inactive.map((r) => row(r, true))}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Characters a row's signals have beside its rank and id: the panel is a
 *  fixed 360, so the room is the id's length away from the rest. */
const signalRoom = (id: string) => Math.max(8, Math.floor((290 - id.length * 7.4) / 6.4));

/** One line, folded by the design system's order: blocked and waiting stay
 *  whole (waiting cut to "N waiting" when it must), the rest into "+N". */
function Signals({ signals, id }: { signals: Signal[]; id: string }) {
  if (!signals.length) return <span className="fl-sig" />;
  const { shown, rest, cut } = foldSignals(signals, signalRoom(id), { gap: 3, more: 4 });
  return (
    <span className="fl-sig" title={signals.map((s) => s.text).join("\n")}>
      {shown.map((s, k) => (
        <span key={k} className={`lz ${LZ[s.kind]}`}>{cut && s.floor ? s.floor : s.text}</span>
      ))}
      {rest.length > 0 && <span className="lz fl-more">+{rest.length}</span>}
    </span>
  );
}

const LZ: Record<Signal["kind"], string> = { waiting: "waiting", blocked: "blocked", now: "now", live: "live", cell: "tone", problems: "warning" };
