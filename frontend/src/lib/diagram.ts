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

/** The node ids of a block's `class a,b name` lines per change class, in
 *  order of first mention; `context` and any other class are not listed. */
export function changeClasses(source: string): ChangeClasses {
  const out: ChangeClasses = { added: [], changed: [], removed: [] };
  for (const line of source.split("\n")) {
    const m = line.match(/^\s*class\s+([^\s;]+)\s+([A-Za-z_][\w-]*)\s*;?\s*$/);
    if (!m) continue;
    const name = m[2] as keyof ChangeClasses;
    if (!(name in out)) continue;
    for (const id of m[1].split(",").map((s) => s.trim()).filter(Boolean)) {
      if (!out[name].includes(id)) out[name].push(id);
    }
  }
  return out;
}

/** FR-3, D5: `Added: a, b. Changed: c. Removed: none.` */
export function classLine(source: string): string {
  const c = changeClasses(source);
  const ids = (xs: string[]) => (xs.length ? xs.join(", ") : "none");
  return `Added: ${ids(c.added)}. Changed: ${ids(c.changed)}. Removed: ${ids(c.removed)}.`;
}

/** FR-4: the frame's name, `<nearest heading>, diagram`. */
export const diagramName = (heading: string) => `${heading.trim() || "Figure"}, diagram`;

/** The figure's image: the SVG as a data URL, so it keeps its own styles
 *  and nothing in it runs or reaches the page. */
export const svgSource = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
