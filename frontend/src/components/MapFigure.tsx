// One C4 level drawn as an inline, sanitized dark SVG with a real <button>
// over each node (docs/specs/leftovers-58.md FR-4, FR-5; map-and-roadmap
// Amendments 1 and 2). The level's mermaid block is drawn by RenderDiagram,
// as DiagramFigure draws a block (one render per block while the app runs,
// a failure forgotten), sanitized by lib/mapSvg and inlined, so a lens can
// set classes on its node elements. The SVG is the picture and is
// aria-hidden; the buttons are the controls: one roving set in reading
// order, each named `<label>, <kind>, <status>`, laid over its node's box
// as percentages of the viewBox, so they follow the figure at any scale.
// The lens (Map view, panel, level switch, status styling, map.css) mounts
// this and owns everything around it.
import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type FocusEvent } from "react";
import { RenderDiagram } from "../../wailsjs/go/main/App";
import {
  boxPercent, cornerRadius, drawnNodes, mapFigureName, newMapId, nodeName, readingOrder, rovingStep, sanitizeMapTree, serialize,
  smallestTextSize, floorScale, viewBoxOf, withNodeClasses, type Box, type Corner, type MapNode,
} from "../lib/mapSvg";

export type MapState = { state: "drawing" } | { state: "drawn"; svg: string } | { state: "failed"; reason: string };

export type MapFigureProps = {
  /** The initiative id, for the figure's name. */
  initiative: string;
  /** The level's word (`context`, `containers`, `modules`), for the name. */
  level: string;
  /** The level's mermaid block, as Service.Map returns it. */
  source: string;
  /** map.json's nodes of this level; a drawn node not listed gets no button. */
  nodes: MapNode[];
  /** The lens: node id to class names set on that node's element. */
  classes?: Record<string, readonly string[]>;
  /** A node's button pressed (click, Enter, Space). */
  onPick?: (id: string) => void;
  /** The node whose button has focus, null when focus leaves the set. */
  onFocusNode?: (id: string | null) => void;
  /** The node the roving set stops on (e.g. the one whose panel is open). */
  current?: string | null;
  /** The picked node: its button takes the selected mark (fill and accent
   *  edge) and `aria-current`; focus keeps the ring (leftovers-67 FR-6). */
  picked?: string | null;
  /** `width` (default): fit the column, never past the drawn size.
   *  `natural`: the drawn size, for a frame that scrolls (D8). */
  fit?: "width" | "natural";
};

export const DRAWING_MAP = "Drawing the map…";

/** One render per block while the app runs; a failure is forgotten, so the
 *  next open asks again (DiagramFigure's rule, kept apart from its cache). */
const drawn = new Map<string, Promise<string>>();
function draw(source: string): Promise<string> {
  let p = drawn.get(source);
  if (!p) {
    p = RenderDiagram(source);
    drawn.set(source, p);
    p.catch(() => drawn.delete(source));
  }
  return p;
}

const reasonOf = (e: unknown) => (e instanceof Error ? e.message : String(e ?? "")).trim() || "the render failed";

/** The figure for one level: draws it, then shows it with its buttons. */
export function MapFigure(props: MapFigureProps) {
  const { source } = props;
  const [st, setSt] = useState<MapState>({ state: "drawing" });
  useEffect(() => {
    let live = true;
    setSt({ state: "drawing" });
    draw(source).then(
      (svg) => live && setSt({ state: "drawn", svg }),
      (e) => live && setSt({ state: "failed", reason: reasonOf(e) }),
    );
    return () => { live = false; };
  }, [source]);
  return <MapFigureView {...props} st={st} />;
}

/** A button's own look: none, so the node it sits over shows; its place
 *  comes from the node's box and its corner from the node's shape
 *  (`cornerRadius`, leftovers-69 FR-4), so the picked edge and the ring
 *  follow a pill's radius. Focus draws the app's ring (global.css). */
const BUTTON: CSSProperties = {
  position: "absolute", margin: 0, padding: 0, border: 0, borderRadius: 4, background: "transparent", cursor: "pointer", font: "inherit", color: "inherit",
};
const LAYER: CSSProperties = { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 };

type Stop = { node: MapNode; box: Box; corner: Corner | null };

/** The frame of a fitted figure (leftovers-67 FR-1, V1): it fills the
 *  column up to the drawn size, but never narrower than the floor scale
 *  (its smallest text at 11 px); past that it keeps the floor's width and
 *  the scroller around it scrolls. A floor above 1 draws the figure larger
 *  than drawn. Its height follows its width, so the scale is one number. */
export function frameFit(vb: { width: number; height: number }, floor: number): CSSProperties {
  const px = (n: number) => `${Math.round(n * 100) / 100}px`;
  return {
    position: "relative", width: "100%",
    ...(floor > 0 ? { minWidth: px(vb.width * floor) } : {}),
    maxWidth: px(vb.width * Math.max(1, floor)),
    aspectRatio: `${vb.width} / ${vb.height}`,
  };
}

/** What the figure shows in each state; pure, so vitest renders it. */
export function MapFigureView({ st, initiative, level, nodes, classes, onPick, onFocusNode, current, picked = null, fit = "width" }: MapFigureProps & { st: MapState }) {
  const name = mapFigureName(initiative, level);
  const svg = st.state === "drawn" ? st.svg : "";
  const idRef = useRef<string>("");
  if (!idRef.current) idRef.current = newMapId();

  // FR-4: sanitized once per drawing; a drawing it cannot read is a failure.
  const read = useMemo(() => {
    if (!svg) return null;
    try {
      const tree = sanitizeMapTree(svg, idRef.current);
      const vb = viewBoxOf(tree);
      if (!vb) return { error: "the drawing has no viewBox" };
      return { tree, vb, drawn: drawnNodes(tree), floor: floorScale(smallestTextSize(tree)) };
    } catch (e) {
      return { error: `the drawing could not be read (${reasonOf(e)})` };
    }
  }, [svg]);

  // FR-5: a stop per listed node that is drawn, in reading order.
  const stops = useMemo<Stop[]>(() => {
    if (!read || "error" in read) return [];
    const byId = new Map(nodes.map((n) => [n.id, n]));
    return readingOrder(read.drawn.filter((d) => byId.has(d.id))).map((d) => ({ node: byId.get(d.id)!, box: d.box, corner: d.corner }));
  }, [read, nodes]);

  // The lens: classes on the node elements, the layout untouched (M6).
  const markup = useMemo(() => (read && !("error" in read) ? serialize(withNodeClasses(read.tree, classes)) : ""), [read, classes]);

  // The roving stop: `current` when it is drawn, else where focus last was.
  const indexOf = (id: string | null | undefined) => (id ? stops.findIndex((s) => s.node.id === id) : -1);
  const [at, setAt] = useState(() => Math.max(0, indexOf(current)));
  useEffect(() => {
    const k = indexOf(current);
    if (k >= 0) setAt(k);
  }, [current, stops]);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  if (st.state !== "drawn" || !read || "error" in read) {
    const failed = st.state === "failed" ? st.reason : read && "error" in read ? read.error : "";
    return (
      <div className="map-figure">
        <p className={`map-figure-state ${failed ? "failed" : ""}`} role={failed ? "status" : undefined}>
          {failed ? `Map not drawn: ${failed}` : DRAWING_MAP}
        </p>
      </div>
    );
  }

  const { vb, floor } = read;
  const stop = Math.min(at, Math.max(0, stops.length - 1));
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const next = rovingStep(stops.length, stop, e.key);
    if (next === null) return;
    e.preventDefault();
    setAt(next);
    buttons.current[next]?.focus();
  };
  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onFocusNode?.(null);
  };
  const frame: CSSProperties = fit === "natural" ? { position: "relative", width: `${vb.width}px`, height: `${vb.height}px` } : frameFit(vb, floor);

  return (
    <figure className="map-figure" aria-label={name} style={{ margin: 0 }}>
      <div className="map-figure-frame" style={frame} data-floor={floor ? floor.toFixed(4) : undefined}>
        <div className="map-figure-svg" style={LAYER} dangerouslySetInnerHTML={{ __html: markup }} />
        <div className="map-figure-nodes" style={LAYER} onKeyDown={onKeyDown} onBlur={onBlur}>
          {stops.map((s, k) => (
            <button
              key={s.node.id}
              ref={(el) => { buttons.current[k] = el; }}
              type="button"
              className={s.node.id === picked ? "map-node map-node-picked" : "map-node"}
              data-node={s.node.id}
              aria-current={s.node.id === picked ? "true" : undefined}
              aria-label={nodeName(s.node)}
              tabIndex={k === stop ? 0 : -1}
              style={{ ...BUTTON, borderRadius: cornerRadius(s.box, s.corner), ...boxPercent(s.box, vb) }}
              onFocus={() => { setAt(k); onFocusNode?.(s.node.id); }}
              onClick={() => onPick?.(s.node.id)}
            />
          ))}
        </div>
      </div>
    </figure>
  );
}
