// Roadmap's Map (docs/specs/leftovers-58.md FR-6 to FR-9; map-and-roadmap
// Amendments 1 and 2): the initiative's C4 base map as App.Map reads it,
// one level at a time through MapFigure, containers (L2) first. A lens is
// classes on the drawn nodes and never moves one (M6): status (`ruled`
// dashed, `retiring` muted), drift (an ungrounded node dotted) and the
// picked node. The right side is MapPanel, the map as text. Levels follow
// the generator's: the system opens its containers, a container with a
// module map opens it, and one trail above the figure walks back.
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Map as ReadMap } from "../../wailsjs/go/main/App";
import type { merge, service } from "../../wailsjs/go/models";
import { MapFigure } from "./MapFigure";
import { MapPanel, ruledBy, type Drill } from "./MapPanel";
import "../styles/map.css";

type Node = service.C4Node;

export const NO_MAP = ["No base map yet.", "Daedalus makes one with c4-map gen; the FSE cuts the card."] as const;
export const NO_L3 = "No module map for this container.";
export const READING_MAP = "Reading the map…";

/** What the view holds: reading, the reader's result, or its Go error. */
export type MapRead = { state: "reading" } | { state: "error"; reason: string } | service.MapResult;

/** One level of the map: `containers`, `context`, or `modules` of one container. */
export type Place = { level: string; container?: string };

const placeKey = (p: Place) => `${p.level}:${p.container ?? ""}`;
const samePlace = (a: Place, b: Place) => placeKey(a) === placeKey(b);

/** The place a level source answers to. */
const placeOf = (l: { level: string; container?: string }): Place => (l.level === "modules" ? { level: "modules", container: l.container ?? "" } : { level: l.level });

/** The first level shown: containers (L2), else the first the map has. */
export function firstPlace(r: service.MapResult): Place | null {
  const ls = r.levels ?? [];
  const l2 = ls.find((l) => l.level === "containers");
  return l2 ? placeOf(l2) : ls[0] ? placeOf(ls[0]) : null;
}

/** The mermaid block of a place, or null when the map has none. */
export function sourceAt(r: service.MapResult, p: Place): string | null {
  return (r.levels ?? []).find((l) => samePlace(placeOf(l), p))?.source ?? null;
}

/** The nodes a place draws: its level's, and at L3 its container's. */
export function nodesAt(index: service.C4Map, p: Place): Node[] {
  return (index.nodes ?? []).filter((n) => n.level === p.level && (p.level !== "modules" || (n.parent ?? "") === p.container));
}

/** The node a container place opens from, for its name. */
const labelOf = (index: service.C4Map, id: string) => (index.nodes ?? []).find((n) => n.id === id && n.level === "containers")?.label ?? id;

/** The level's name, as the panel and the trail say it. */
export function placeName(index: service.C4Map, p: Place): string {
  if (p.level === "modules") return `Modules of ${labelOf(index, p.container ?? "")}`;
  if (p.level === "context") return "Context";
  if (p.level === "containers") return "Containers";
  return p.level;
}

/** Where opening a node goes (FR-6): the system to its containers, a
 *  container to its module map or the line saying it has none. */
export function drillOf(r: service.MapResult, p: Place, n: Node): { to: Place; label: string } | { none: string } | null {
  const index = r.index;
  if (!index) return null;
  if (p.level === "context" && n.id === index.system && sourceAt(r, { level: "containers" }) !== null) {
    return { to: { level: "containers" }, label: `Open ${n.label}'s containers` };
  }
  if (p.level === "containers" && n.kind === "container") {
    const to = { level: "modules", container: n.id };
    return sourceAt(r, to) !== null ? { to, label: `Open ${n.label}'s modules` } : { none: NO_L3 };
  }
  return null;
}

/** The trail above the figure: context, containers, then the container. */
export function trailOf(r: service.MapResult, p: Place): { label: string; place: Place }[] {
  const index = r.index;
  if (!index) return [];
  const out: { label: string; place: Place }[] = [];
  if (sourceAt(r, { level: "context" }) !== null) out.push({ label: "Context", place: { level: "context" } });
  if (p.level !== "context" && sourceAt(r, { level: "containers" }) !== null) out.push({ label: "Containers", place: { level: "containers" } });
  if (p.level === "modules") out.push({ label: labelOf(index, p.container ?? ""), place: p });
  return out;
}

/** The lens (FR-7): status and drift as classes, plus the picked node. */
export function lensClasses(nodes: Node[], picked: string | null): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const n of nodes) {
    const cs: string[] = [];
    if (n.status === "ruled") cs.push("map-ruled");
    else if (n.status === "retiring") cs.push("map-retiring");
    if (!(n.grounding ?? []).length) cs.push("map-ungrounded");
    if (n.id === picked) cs.push("map-picked");
    if (cs.length) out[n.id] = cs;
  }
  return out;
}

/** The words drawn under a node on the figure: `ruled NNNN`, `retiring`,
 *  `not grounded`. The panel says the same and carries the record link. */
export function tagOf(n: Node): string | null {
  const words: string[] = [];
  if (n.status === "ruled") { const r = ruledBy(n); words.push(r ? `ruled ${r}` : "ruled"); }
  if (n.status === "retiring") words.push("retiring");
  if (!(n.grounding ?? []).length) words.push("not grounded");
  return words.length ? words.join(" · ") : null;
}

/** The Map mode: reads the map and shows it. */
export function MapView({ initiative, head }: { initiative: merge.BoardInitiative; head?: ReactNode }) {
  const [read, setRead] = useState<MapRead>({ state: "reading" });
  useEffect(() => {
    let live = true;
    setRead({ state: "reading" });
    ReadMap(initiative.id).then(
      (r) => live && setRead(r),
      (e) => live && setRead({ state: "error", reason: (e instanceof Error ? e.message : String(e ?? "")).trim() || "the map could not be read" }),
    );
    return () => { live = false; };
  }, [initiative.id]);
  return <MapBody initiative={initiative} read={read} head={head} />;
}

/** What Map shows for a read; pure but for its own place, so vitest renders it. */
export function MapBody({ initiative, read, head }: { initiative: merge.BoardInitiative; read: MapRead; head?: ReactNode }) {
  const r = read.state === "drawn" ? (read as service.MapResult) : null;
  const start = useMemo(() => (r ? firstPlace(r) : null), [r]);
  const [place, setPlace] = useState<Place | null>(start);
  const [pickedAt, setPickedAt] = useState<Record<string, string | null>>({});
  useEffect(() => { setPlace(start); setPickedAt({}); }, [start ? placeKey(start) : "", read]);
  const wrap = useRef<HTMLDivElement>(null);

  const state = (lines: ReactNode, failed = false) => (
    <div className="map-view">
      {head}
      <div className={`map-state ${failed ? "failed" : ""}`} role={failed ? "status" : undefined}>{lines}</div>
    </div>
  );
  if (read.state === "reading") return state(<p>{READING_MAP}</p>);
  if (read.state === "error") return state(<p>Map not drawn: {(read as { reason: string }).reason}</p>, true);
  if (read.state === "empty") return state(<><p className="map-state-head">{NO_MAP[0]}</p><p>{NO_MAP[1]}</p></>);
  if (read.state === "refused") return state(<p>{(read as service.MapResult).refused}</p>, true);
  const at = place ?? start;
  if (!r || !r.index || !at) return state(<p>Map not drawn: map.json has no levels</p>, true);

  const index = r.index;
  const nodes = nodesAt(index, at);
  const source = sourceAt(r, at) ?? "";
  const pickedId = pickedAt[placeKey(at)] ?? null;
  const picked = nodes.find((n) => n.id === pickedId) ?? null;
  const pick = (id: string | null) => setPickedAt((m) => ({ ...m, [placeKey(at)]: id }));
  const go = (to: Place) => setPlace(to);
  const d = picked ? drillOf(r, at, picked) : null;
  const drill: Drill = d ? ("none" in d ? d : { label: d.label, go: () => go(d.to) }) : null;
  const trail = trailOf(r, at);
  const name = placeName(index, at);

  return (
    <div className="map-view">
      {head}
      {trail.length > 1 && (
        <nav className="map-trail" aria-label="Map level">
          <ol>
            {trail.map((t, k) => (
              <li key={placeKey(t.place)}>
                {k > 0 && <span className="map-trail-sep" aria-hidden>›</span>}
                {samePlace(t.place, at)
                  ? <span aria-current="page" className="map-trail-here">{t.label}</span>
                  : <button type="button" className="linkish map-trail-go" onClick={() => go(t.place)}>{t.label}</button>}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="map-lens">
        <div className="map-stage">
          <div className="map-scroll" ref={wrap}>
            <MapFigure
              key={placeKey(at)}
              initiative={initiative.id}
              level={at.level}
              source={source}
              nodes={nodes.map((n) => ({ id: n.id, label: n.label, kind: n.kind ?? null, status: n.status ?? null, grounding: n.grounding ?? [] }))}
              classes={lensClasses(nodes, pickedId)}
              onPick={(id) => pick(id)}
              current={pickedId}
            />
            <MapTags host={wrap} nodes={nodes} />
          </div>
          <ul className="map-legend" aria-label="Legend">
            <li><span className="map-key map-key-exists" aria-hidden /> exists</li>
            <li><span className="map-key map-key-ruled" aria-hidden /> ruled</li>
            <li><span className="map-key map-key-retiring" aria-hidden /> retiring</li>
            <li><span className="map-key map-key-ungrounded" aria-hidden /> not grounded</li>
          </ul>
        </div>
        <MapPanel initiative={initiative} index={index} nodes={nodes} levelName={name} picked={picked} pick={pick} drill={drill} />
      </div>
    </div>
  );
}

type Tag = { id: string; text: string; left: string; top: string; width: string };

/** The status words under the nodes that have them, laid in the figure's
 *  own frame at its buttons' boxes (percentages), so they follow its scale
 *  and move nothing. Visual only: the panel says the same and links. */
function MapTags({ host, nodes }: { host: React.RefObject<HTMLDivElement | null>; nodes: Node[] }) {
  const [frame, setFrame] = useState<{ el: HTMLElement; tags: Tag[] } | null>(null);
  const words = useMemo(() => new Map(nodes.map((n) => [n.id, tagOf(n)] as const).filter(([, t]) => !!t) as [string, string][]), [nodes]);
  useLayoutEffect(() => {
    const h = host.current;
    if (!h) return;
    const read = () => {
      const el = h.querySelector<HTMLElement>(".map-figure-frame");
      if (!el) { setFrame((f) => (f ? null : f)); return; }
      const tags: Tag[] = [];
      el.querySelectorAll<HTMLButtonElement>("button.map-node").forEach((b) => {
        const id = b.dataset.node ?? "";
        const text = words.get(id);
        if (!text) return;
        const s = b.style;
        tags.push({ id, text, left: s.left, top: `calc(${s.top} + ${s.height})`, width: s.width });
      });
      setFrame((f) => (f && f.el === el && JSON.stringify(f.tags) === JSON.stringify(tags) ? f : { el, tags }));
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(h, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [host, words]);
  if (!frame || !frame.tags.length || !frame.el.isConnected) return null;
  return createPortal(
    <div className="map-tags" aria-hidden="true">
      {frame.tags.map((t) => (
        <span key={t.id} className="map-tag" data-node={t.id} style={{ left: t.left, top: t.top, width: t.width }}>{t.text}</span>
      ))}
    </div>,
    frame.el,
  );
}
