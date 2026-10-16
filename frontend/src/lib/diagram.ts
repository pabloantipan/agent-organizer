// A fenced mermaid block in a record, a card or the Help draws as a figure
// (docs/specs/diagrams.md FR-2 to FR-4; diagrams-in-app §2). These are the
// pure halves: where the blocks are in marked's HTML, what the figure's text
// line says, and what its frame is called. The figure is
// components/DiagramFigure.tsx.

/** marked's HTML for a ```mermaid fence. */
const FENCE = /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g;

/** The words over a block while it draws (FR-2): no spinner. */
export const DRAWING = "Drawing the diagram…";

/** marked's HTML with each mermaid block in a slot that already reads as
 *  the drawing state, the source as code under DRAWING, so the body is never
 *  an empty box before the figure mounts into the slot. */
export function slotDiagrams(html: string): string {
  return html.replace(FENCE, (_, code: string) =>
    `<div class="diagram-slot"><p class="diagram-state">${DRAWING}</p><pre><code class="language-mermaid">${code}</code></pre></div>`);
}

/** Whether the HTML holds a mermaid block. */
export const hasDiagram = (html: string) => html.includes('<code class="language-mermaid">');

/** The mermaid blocks of a markdown text, in order, as written. */
export function mermaidBlocks(md: string): string[] {
  const out: string[] = [];
  const re = /^ {0,3}(`{3,}|~{3,})[ \t]*mermaid[ \t]*\n([\s\S]*?)^ {0,3}\1[ \t]*$/gm;
  for (const m of md.matchAll(re)) out.push(m[2]);
  return out;
}

export type ChangeClasses = { added: string[]; changed: string[]; removed: string[] };

/** A `class a,b name` line: its ids and its class. */
const CLASS_LINE = /^\s*class\s+([^\s;]+)\s+([A-Za-z_][\w-]*)\s*;?\s*$/;

/** The node ids of a block's `class a,b name` lines for each named class, in
 *  order of first mention; any other class is not listed. */
function classIds<K extends string>(source: string, names: readonly K[]): Record<K, string[]> {
  const out = Object.fromEntries(names.map((n) => [n, [] as string[]])) as Record<K, string[]>;
  for (const line of source.split("\n")) {
    const m = line.match(CLASS_LINE);
    if (!m || !(names as readonly string[]).includes(m[2])) continue;
    const ids = out[m[2] as K];
    for (const id of m[1].split(",").map((s) => s.trim()).filter(Boolean)) {
      if (!ids.includes(id)) ids.push(id);
    }
  }
  return out;
}

/** The node ids of a block's `class a,b name` lines per change class, in
 *  order of first mention; `context` and any other class are not listed. */
export const changeClasses = (source: string): ChangeClasses => classIds(source, ["added", "changed", "removed"] as const);

/** A node's shape opening its label: `id["…"]`, `id(…)`, `id[("…")]`,
 *  `id{…}`, `id>…]` and the rest of mermaid's shapes. An id never ends in
 *  `-`, so `a-->b` is an edge, not a shape. */
const NODE = /([A-Za-z_](?:[\w-]*\w)?)\s*(?:\[\[|\[\(|\(\[|\(\(\(|\(\(|\{\{|\[\/|\[\\|\[|\(|\{|>)\s*(?:"([^"]*)"|([^\]\)\}"]*))/g;

/** The drawn marks of the change classes (diagrams-in-app D2, Amendment 1). */
const GLYPHS = /[\u271A\u270E\u2715\uFE0F]/g;

/** Each node's label as a reader hears it, by id, from its first shape:
 *  no glyph, no markup, spaces folded. Class and style lines are skipped. */
export function nodeLabels(source: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const line of source.split("\n")) {
    if (/^\s*(class|classDef|style|linkStyle|click|%%)\b/.test(line)) continue;
    for (const m of line.matchAll(NODE)) {
      if (out.has(m[1])) continue;
      const label = (m[2] ?? m[3] ?? "").replace(/<[^>]*>/g, " ").replace(GLYPHS, "").replace(/^[/\\]+|[/\\]+$/g, "").replace(/\s+/g, " ").trim();
      if (label) out.set(m[1], label);
    }
  }
  return out;
}

/** FR-3, D5 amended: `Added: Payments. Changed: BFF. Removed: none. Around
 *  it: PWA.`, each class's nodes by label (the id when a node has none),
 *  `context` under Around it, `none` for an empty class. */
export function classLine(source: string): string {
  const c = classIds(source, ["added", "changed", "removed", "context"] as const);
  const labels = nodeLabels(source);
  const say = (ids: string[]) => (ids.length ? ids.map((id) => labels.get(id) ?? id).join(", ") : "none");
  return `Added: ${say(c.added)}. Changed: ${say(c.changed)}. Removed: ${say(c.removed)}. Around it: ${say(c.context)}.`;
}

/** FR-4: the frame's name, `<nearest heading>, diagram`. */
export const diagramName = (heading: string) => `${heading.trim() || "Figure"}, diagram`;

/** The figure's image: the SVG as a data URL, so it keeps its own styles
 *  and nothing in it runs or reaches the page. */
export const svgSource = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
