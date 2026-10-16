// A mermaid block drawn as a dark figure (docs/specs/diagrams.md FR-2 to
// FR-4; diagrams-in-app §2). The markdown sites pass marked's HTML through
// slotDiagrams, so each block already reads as the drawing state in the
// body's own HTML, and useDiagrams mounts one DiagramFigure into each slot:
// it asks RenderDiagram for the SVG (the service draws it with mmdc, cached)
// and shows the figure, or the source under the reason it was not drawn.
// Never an empty box.
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { RenderDiagram } from "../../wailsjs/go/main/App";
import { classLine, diagramName, DRAWING, svgSource } from "../lib/diagram";
import { overflowsX, scrollStop, sideEdges, watchEdges } from "../lib/useScrollEdges";
import "../styles/diagram.css";

export type DiagramState = { state: "drawing" } | { state: "drawn"; svg: string } | { state: "failed"; reason: string };

/** One render per block while the app runs; a failure is forgotten, so the
 *  next open asks again (mmdc installed meanwhile). */
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

/** The reason a binding's rejection carries, as words. */
const reasonOf = (e: unknown) => (e instanceof Error ? e.message : String(e ?? "")).trim() || "the render failed";

/** The figure for one block: draws it and shows what state it is in. */
export function DiagramFigure({ source, heading }: { source: string; heading: string }) {
  const [st, setSt] = useState<DiagramState>({ state: "drawing" });
  useEffect(() => {
    let live = true;
    setSt({ state: "drawing" });
    draw(source).then(
      (svg) => live && setSt({ state: "drawn", svg }),
      (e) => live && setSt({ state: "failed", reason: reasonOf(e) }),
    );
    return () => { live = false; };
  }, [source]);
  return <DiagramView source={source} heading={heading} st={st} />;
}

/** The drawn SVG with its root hidden from assistive tech: the figure is
 *  one image named by its alt, and the text line says what the labels say
 *  (leftovers-38 FR-6, diagrams-in-app D10). WebKit otherwise exposes the
 *  SVG's labels inside the <img>, in drawing order and with their glyphs.
 *  The root's own role and names go, so nothing in it asks to be read. */
export function silentSvg(svg: string): string {
  return svg.replace(/<svg\b([^>]*?)(\/?)>/, (_, attrs: string, close: string) =>
    `<svg${attrs.replace(/\s(?:aria-[\w-]+|role)="[^"]*"/g, "")} aria-hidden="true"${close}>`);
}

/** What a figure shows in each state; pure, so vitest renders it. */
export function DiagramView({ source, heading, st }: { source: string; heading: string; st: DiagramState }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const frame = useRef<HTMLDivElement>(null);
  const name = diagramName(heading);
  const drawnSvg = st.state === "drawn" ? st.svg : "";
  // FR-4: a figure wider than its column scrolls in its own frame, a stop
  // named after the heading while it does, with the side edges of any
  // other wide block in a markdown body.
  useLayoutEffect(() => {
    const el = frame.current;
    if (!el) return;
    return watchEdges(el, () => {
      const e = sideEdges(el);
      el.classList.toggle("edge-left", e.left);
      el.classList.toggle("edge-right", e.right);
      scrollStop(el, overflowsX(el), { label: name });
    });
  }, [drawnSvg, name]);

  const line = <p id={`${id}-classes`} className="diagram-classes">{classLine(source)}</p>;
  if (st.state !== "drawn") {
    return (
      <div className="diagram">
        <p className={`diagram-state ${st.state === "failed" ? "failed" : ""}`} role={st.state === "failed" ? "status" : undefined}>
          {st.state === "failed" ? `Diagram not drawn: ${st.reason}` : DRAWING}
        </p>
        <pre><code className="language-mermaid">{source}</code></pre>
        {line}
      </div>
    );
  }
  return (
    <figure className="diagram">
      <div ref={frame} className="diagram-frame">
        <img src={svgSource(silentSvg(st.svg))} alt={name} aria-describedby={`${id}-classes`} />
      </div>
      <button type="button" className="link diagram-source" aria-expanded={open} aria-controls={`${id}-source`} onClick={() => setOpen(!open)}>Source</button>
      {open && <pre id={`${id}-source`}><code className="language-mermaid">{source}</code></pre>}
      {line}
    </figure>
  );
}

/** The heading over an element inside a body: the last h1-h6 before it. */
export function nearestHeading(root: HTMLElement, el: HTMLElement): string {
  let found = "";
  for (const h of Array.from(root.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6"))) {
    if (h.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) found = h.textContent ?? "";
    else break;
  }
  return found.trim();
}

type Slot = { el: HTMLElement; source: string; heading: string };

/** Each slot's source, read once before the slot is emptied for its figure:
 *  an effect that runs again (StrictMode, a refresh with the same HTML)
 *  finds the slot empty. */
const sources = new WeakMap<HTMLElement, string>();

/** Mounts a DiagramFigure into each slot of a markdown body. `content` is
 *  what the body shows (its HTML), so a body set again is picked up;
 *  `fallback` names the figure when no heading stands over it. Call it
 *  after any effect that writes the body's HTML; render what it returns
 *  anywhere in the component. */
export function useDiagrams(root: RefObject<HTMLElement | null>, content: unknown, fallback: string): ReactNode {
  const [slots, setSlots] = useState<Slot[]>([]);
  useLayoutEffect(() => {
    const r = root.current;
    const found: Slot[] = [];
    r?.querySelectorAll<HTMLElement>(".diagram-slot").forEach((el) => {
      const prev = slots.find((s) => s.el === el);
      if (prev) { found.push(prev); return; }
      let source = sources.get(el);
      if (source === undefined) {
        source = el.querySelector("code")?.textContent ?? "";
        sources.set(el, source);
      }
      el.replaceChildren();
      found.push({ el, source, heading: nearestHeading(r, el) || fallback });
    });
    if (found.length !== slots.length || found.some((s, i) => s !== slots[i])) setSlots(found);
  }, [root, content, fallback]);
  return slots.map((s, i) => createPortal(<DiagramFigure source={s.source} heading={s.heading} />, s.el, `diagram-${i}`));
}
