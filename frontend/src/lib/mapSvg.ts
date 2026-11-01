// The C4 map's picture (docs/specs/leftovers-58.md FR-4, FR-5 and Amendment
// 1; map-and-roadmap Amendments 1 and 2). A level is drawn by RenderDiagram
// as mmdc's dark SVG and inlined, so a lens can put classes on its node
// elements; inlined, the SVG is part of the page, so it is sanitized first:
// no script, no foreignObject, no event attribute, no external reference,
// no focusable element, its stylesheet scoped to its own root. mmdc draws a
// node's label as HTML inside a foreignObject; each one is replaced by an
// SVG <text> of its plain text, centred in the same box (Amendment 1).
//
// No DOM here: the SVG is read by a small XML reader into a tree and written
// back by this file's own serializer, which escapes every text and attribute
// value. It runs the same in vitest (Node, no DOM library) and in the
// WKWebView, and anything it does not understand is dropped, never passed
// through. The node boxes (FR-5) are computed from the same tree: each node
// element's transforms and shapes, in the SVG's viewBox units.

// ---------------------------------------------------------------- the tree

export type El = { tag: string; attrs: [string, string][]; children: Child[] };
export type Child = El | string;

const ENTITY: Record<string, string> = { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'", nbsp: " " };

function decode(s: string): string {
  return s.replace(/&(#x[0-9a-fA-F]+|#\d+|[A-Za-z]+);/g, (m, e: string) => {
    if (e[0] === "#") {
      const n = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : "";
    }
    return ENTITY[e] ?? m;
  });
}

const escText = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (s: string) => escText(s).replace(/"/g, "&quot;");

const NAME = /^[A-Za-z_][\w:.-]*$/;

/** The SVG text as a tree: elements, attributes and decoded text. Comments,
 *  processing instructions, doctypes are skipped; CDATA is text. Throws on
 *  markup it cannot read (an unclosed tag, a mismatched end tag). */
export function parseXml(src: string): El {
  const root: El = { tag: "#root", attrs: [], children: [] };
  const stack: El[] = [root];
  let i = 0;
  while (i < src.length) {
    const lt = src.indexOf("<", i);
    if (lt < 0) { stack[stack.length - 1].children.push(decode(src.slice(i))); break; }
    if (lt > i) stack[stack.length - 1].children.push(decode(src.slice(i, lt)));
    if (src.startsWith("<!--", lt)) { const e = src.indexOf("-->", lt + 4); if (e < 0) throw new Error("unclosed comment"); i = e + 3; continue; }
    if (src.startsWith("<![CDATA[", lt)) { const e = src.indexOf("]]>", lt); if (e < 0) throw new Error("unclosed CDATA"); stack[stack.length - 1].children.push(src.slice(lt + 9, e)); i = e + 3; continue; }
    if (src[lt + 1] === "?" || src[lt + 1] === "!") { const e = src.indexOf(">", lt); if (e < 0) throw new Error("unclosed declaration"); i = e + 1; continue; }
    if (src[lt + 1] === "/") {
      const e = src.indexOf(">", lt);
      if (e < 0) throw new Error("unclosed end tag");
      const name = src.slice(lt + 2, e).trim();
      const top = stack.pop();
      if (!top || top.tag !== name || stack.length === 0) throw new Error(`unexpected </${name}>`);
      i = e + 1;
      continue;
    }
    const m = /^<([A-Za-z_][\w:.-]*)/.exec(src.slice(lt, lt + 200));
    if (!m) throw new Error("bad tag");
    const el: El = { tag: m[1], attrs: [], children: [] };
    let j = lt + m[0].length;
    const attr = /\s*([^\s=/>]+)\s*=\s*("([^"]*)"|'([^']*)')|\s*(\/?>)/y;
    for (;;) {
      attr.lastIndex = j;
      const a = attr.exec(src);
      if (!a) throw new Error(`bad attribute in <${el.tag}>`);
      j = attr.lastIndex;
      if (a[5]) {
        stack[stack.length - 1].children.push(el);
        if (a[5] === ">") stack.push(el);
        break;
      }
      el.attrs.push([a[1], decode(a[3] ?? a[4] ?? "")]);
    }
    i = j;
  }
  if (stack.length !== 1) throw new Error(`unclosed <${stack[stack.length - 1].tag}>`);
  return root;
}

/** The tree written back as markup; every value escaped. */
export function serialize(n: Child): string {
  if (typeof n === "string") return escText(n);
  if (n.tag === "#root") return n.children.map(serialize).join("");
  const attrs = n.attrs.map(([k, v]) => ` ${k}="${escAttr(v)}"`).join("");
  return n.children.length ? `<${n.tag}${attrs}>${n.children.map(serialize).join("")}</${n.tag}>` : `<${n.tag}${attrs}/>`;
}

const attrOf = (el: El, name: string) => el.attrs.find(([k]) => k === name)?.[1];
function setAttr(el: El, name: string, value: string) {
  const a = el.attrs.find(([k]) => k === name);
  if (a) a[1] = value; else el.attrs.push([name, value]);
}
const textOf = (n: Child): string => (typeof n === "string" ? n : n.children.map(textOf).join(""));

// ------------------------------------------------------------ the sanitizer

/** The SVG elements a mermaid drawing is made of. Anything else is dropped
 *  with what it holds (script, foreignObject once its label is taken,
 *  image, iframe, animate, set), except `a` and `switch`, which are
 *  unwrapped: their children stay, the element goes. */
const KEEP = new Set([
  "svg", "g", "defs", "style", "marker", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon",
  "text", "tspan", "title", "desc", "clipPath", "linearGradient", "radialGradient", "stop", "pattern", "mask", "symbol", "use",
]);
const UNWRAP = new Set(["a", "switch"]);

/** A reference that stays inside the drawing: `#id`, nothing else. */
const local = (v: string) => v.trim().startsWith("#");

// CSS. Inlined, the drawing's CSS is the page's CSS, so it is read the way
// the browser's tokenizer reads it (CSS Syntax 3), not by pattern: strings
// end at their quote or at a newline (a bad string), a backslash escapes the
// next character outside a string too, comments separate tokens, and ( [ {
// nest. The rule is default-deny for loads: a declaration (in a sheet or a
// style attribute) or a presentation attribute whose value, with every CSS
// escape decoded and lowercased, calls any function that can fetch (`url(`,
// `image-set(`, `-webkit-image-set(`, `image(`, `cross-fade(`, `element(`,
// `src(`, `paint(`) is dropped, unless every such call is `url(#fragment)`.
// Any at-rule but @media, @supports and @keyframes is dropped (so @import,
// @font-face, @namespace), and a sheet that still holds a fetching call
// after all that is dropped whole.

const WS = /[ \t\n\r\f]/;

/** The index just past the string that opens at `i` (a quote): at its
 *  closing quote, else at a newline (a bad string, which the browser ends
 *  there), else at the end. `bad` says which. */
function stringEnd(css: string, i: number): { end: number; bad: boolean } {
  const q = css[i];
  for (let j = i + 1; j < css.length; j++) {
    const c = css[j];
    if (c === "\\") { j++; continue; } // an escape, or an escaped newline (a continuation)
    if (c === q) return { end: j + 1, bad: false };
    if (c === "\n" || c === "\r" || c === "\f") return { end: j, bad: true };
  }
  return { end: css.length, bad: false };
}

/** Walks `css` from `from` the way the tokenizer does, calling `at` for each
 *  character outside strings and escapes with the nesting depth of ( [ {
 *  before it; `at` returning true stops the walk there. Returns the index
 *  stopped at (or the end) and whether a bad string was crossed. */
function walkCss(css: string, from: number, at: (c: string, i: number, depth: number) => boolean): { stop: number; bad: boolean } {
  let depth = 0, bad = false;
  for (let i = from; i < css.length; i++) {
    const c = css[i];
    if (c === '"' || c === "'") { const s = stringEnd(css, i); bad ||= s.bad; i = s.end - 1; continue; }
    if (c === "\\") { if (css[i + 1] !== "\n") i++; continue; }
    if (at(c, i, depth)) return { stop: i, bad };
    if (c === "(" || c === "[" || c === "{") depth++;
    else if ((c === ")" || c === "]" || c === "}") && depth > 0) depth--;
  }
  return { stop: css.length, bad };
}

/** Comments out, each a space (a comment separates tokens: `u/**\/rl(` is
 *  not `url(`); a comment inside a string is the string's text. */
function stripComments(css: string): string {
  let out = "";
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === '"' || c === "'") { const e = stringEnd(css, i).end; out += css.slice(i, e); i = e - 1; continue; }
    if (c === "\\") { out += css.slice(i, i + 2); i++; continue; }
    if (c === "/" && css[i + 1] === "*") { const e = css.indexOf("*/", i + 2); out += " "; i = e < 0 ? css.length : e + 1; continue; }
    out += c;
  }
  return out;
}

/** `css` split at each top-level `sep` (outside strings, escapes and ( [ {). */
function splitTop(css: string, sep: string): { parts: string[]; bad: boolean } {
  const parts: string[] = [];
  let last = 0;
  const { bad } = walkCss(css, 0, (c, i, depth) => {
    if (c === sep && depth === 0) { parts.push(css.slice(last, i)); last = i + 1; }
    return false;
  });
  parts.push(css.slice(last));
  return { parts, bad };
}

/** A CSS text with its escapes decoded (`\75 ` → `u`, `\r` → `r`). */
export const decodeCss = (s: string) =>
  s.replace(/\\(?:([0-9a-fA-F]{1,6})[ \t\n\r\f]?|(\r\n|[\n\r\f])|([\s\S]))/g, (_, hex: string, nl: string, ch: string) => {
    if (hex) { const n = parseInt(hex, 16); return n > 0 && n <= 0x10ffff && (n < 0xd800 || n > 0xdfff) ? String.fromCodePoint(n) : "�"; }
    return nl ? "" : ch;
  });

/** Whether a CSS value (or a whole sheet) can make the page fetch: any
 *  fetching function after decoding, a local `url(#…)` excepted. */
export function fetches(css: string): boolean {
  const v = decodeCss(stripComments(css)).toLowerCase().replace(/url\(\s*(['"]?)#[^'"()\s\\]*\1\s*\)/g, "");
  return /(url|image-set|image|cross-fade|element|src|paint)\s*\(/.test(v) || v.includes("@import");
}

/** A declaration block with every declaration that could load, or that the
 *  browser could read differently from here (a bad string, a brace outside
 *  a string, an escaped property name), dropped. */
function cleanDecls(body: string): string {
  const { parts } = splitTop(body, ";");
  return parts.map((d) => d.trim()).filter((d) => {
    if (!d) return false;
    const m = /^(--[\w-]+|-?[A-Za-z_][\w-]*)\s*:([\s\S]*)$/.exec(d);
    if (!m) return false;
    const scan = walkCss(m[2], 0, (c) => c === "{" || c === "}");
    return !scan.bad && scan.stop === m[2].length && !fetches(m[2]);
  }).join(";");
}

/** A style attribute's value, cleaned as a declaration block. */
const cleanStyle = (v: string) => cleanDecls(stripComments(v));

/** One attribute kept, rewritten, or dropped (null). */
function cleanAttr(tag: string, k: string, v: string, from: string, to: string): string | null {
  const key = k.toLowerCase();
  if (!NAME.test(k) || key.startsWith("on")) return null;
  if (key === "tabindex" || key === "focusable" || key === "autofocus") return null;
  if (key === "href" || key === "xlink:href" || key.endsWith(":href") || key === "src" || key === "action" || key === "formaction") {
    return tag === "use" && local(v) ? v : null;
  }
  if (/^\s*(javascript|data|vbscript):/i.test(v)) return null;
  let out = v;
  if (from) {
    if (key === "id" && (v === from || v.startsWith(from + "_") || v.startsWith(from + "-"))) out = to + v.slice(from.length);
    else out = out.split("#" + from).join("#" + to);
  }
  if (key === "style") return cleanStyle(out);
  return fetches(out) ? null : out;
}

/** A selector list with each selector under `#scope`, unless it already is.
 *  Split at top-level commas, so a comma in :is() or a string stays put. */
function scopeSelectors(sel: string, scope: string): string {
  return splitTop(sel, ",").parts.map((s) => s.trim()).filter(Boolean)
    .map((s) => (s === scope || s.startsWith(scope + " ") || s.startsWith(scope + ".") || s.startsWith(scope + ":") || s.startsWith(scope + ">") ? s : `${scope} ${s}`))
    .join(",");
}

/** The rules of a sheet (or of an @media, @supports or @keyframes body),
 *  read the browser's way: a top-level `;` before any `{` ends a statement
 *  (dropped: @import, @charset, @namespace, stray text); a `{` opens a block
 *  that ends at its matching `}`. `scope` null is a keyframes body, whose
 *  selectors (from, to, %) stay as they are. */
function cleanRules(css: string, scope: string | null): string {
  let out = "";
  let i = 0;
  while (i < css.length) {
    const head = walkCss(css, i, (c, _, depth) => depth === 0 && (c === "{" || c === ";"));
    if (head.stop >= css.length) break;
    if (css[head.stop] === ";") { i = head.stop + 1; continue; }
    const open = head.stop;
    const close = walkCss(css, open + 1, (c, _, depth) => c === "}" && depth === 0);
    const prelude = css.slice(i, open).trim();
    const body = css.slice(open + 1, close.stop);
    i = close.stop + 1;
    if (head.bad || close.bad) continue; // read differently by the browser: dropped
    if (prelude.startsWith("@")) {
      if (scope === null) continue;
      const at = decodeCss(prelude.slice(1).split(/[\s(]/)[0]).toLowerCase();
      if (at === "keyframes" || at === "-webkit-keyframes") out += `${prelude}{${cleanRules(body, null)}}`;
      else if (at === "media" || at === "supports") out += `${prelude}{${cleanRules(body, scope)}}`;
    } else if (prelude) {
      out += `${scope === null ? prelude : scopeSelectors(prelude, scope)}{${cleanDecls(body)}}`;
    }
  }
  return out;
}

/** mmdc's stylesheet scoped to the drawing's root, with nothing that loads.
 *  mermaid's own rules are `#<root id> …`; the dark style's appended rules
 *  (`.node rect`, `.cluster rect`, `marker path`) are not, and inlined they
 *  would restyle the page. Every rule is put under `#scope`; @media and
 *  @supports are scoped inside, @keyframes kept; declarations are cleaned
 *  (see above); a sheet that still fetches is dropped whole. */
export function scopeCss(css: string, scope: string): string {
  const out = cleanRules(stripComments(css), scope);
  return fetches(out) ? "" : out;
}

/** A foreignObject's label as SVG text: its plain text, one line per `<br>`,
 *  centred in the foreignObject's box. Null when it holds no text (an empty
 *  edge label). */
function labelText(fo: El): El | null {
  const lines: string[] = [""];
  const walk = (n: Child) => {
    if (typeof n === "string") { lines[lines.length - 1] += n; return; }
    if (n.tag.toLowerCase() === "br") { lines.push(""); return; }
    n.children.forEach(walk);
  };
  fo.children.forEach(walk);
  const text = lines.map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
  if (!text.length) return null;
  const num = (k: string) => Number(attrOf(fo, k) ?? 0) || 0;
  const cx = num("x") + num("width") / 2;
  const cy = num("y") + num("height") / 2;
  const fmt = (n: number) => String(Math.round(n * 1000) / 1000);
  const attrs: [string, string][] = [["x", fmt(cx)], ["y", fmt(cy)], ["text-anchor", "middle"], ["dominant-baseline", "central"], ["class", "nodeLabel map-label"]];
  if (text.length === 1) return { tag: "text", attrs, children: [text[0]] };
  // Several lines: the block's middle on the box's middle, 1.2em apart.
  const first = -((text.length - 1) * 1.2) / 2;
  return {
    tag: "text", attrs,
    children: text.map((t, k) => ({ tag: "tspan", attrs: [["x", fmt(cx)], ["dy", `${k === 0 ? first : 1.2}em`]], children: [t] })),
  };
}

function cleanChildren(el: El, from: string, to: string): Child[] {
  const out: Child[] = [];
  for (const c of el.children) {
    if (typeof c === "string") { out.push(c); continue; }
    if (c.tag === "foreignObject") { const t = labelText(c); if (t) out.push(t); continue; }
    if (UNWRAP.has(c.tag)) { out.push(...cleanChildren(c, from, to)); continue; }
    if (!KEEP.has(c.tag)) continue;
    out.push(cleanEl(c, from, to));
  }
  return out;
}

function cleanEl(el: El, from: string, to: string): El {
  const attrs: [string, string][] = [];
  for (const [k, v] of el.attrs) {
    const kept = cleanAttr(el.tag, k, v, from, to);
    if (kept !== null) attrs.push([k, kept]);
  }
  if (el.tag === "style") {
    const css = from ? textOf(el).split("#" + from).join("#" + to) : textOf(el);
    return { tag: "style", attrs, children: [scopeCss(css, "#" + to)] };
  }
  return { tag: el.tag, attrs, children: cleanChildren(el, from, to) };
}

/** FR-4: the figure's one name. */
export const mapFigureName = (initiative: string, level: string) => `${initiative} base map, ${level}`;

let drawings = 0;
/** A fresh root id for one inlined drawing, so two never share ids or rules. */
export const newMapId = () => `map-svg-${++drawings}`;

/** FR-4: the drawing as a tree that is safe to inline. The root is renamed
 *  `id` (its markers and its stylesheet follow), loses its role and names,
 *  fills its box (`width` and `height` 100%: the figure sizes the box from
 *  the viewBox), and is `aria-hidden`: the buttons
 *  over it are the interface and the lens's panel its text. Throws when the
 *  text is not one <svg>. */
export function sanitizeMapTree(svg: string, id: string): El {
  const doc = parseXml(svg);
  const roots = doc.children.filter((c): c is El => typeof c !== "string");
  if (roots.length !== 1 || roots[0].tag !== "svg") throw new Error("not an SVG drawing");
  const from = attrOf(roots[0], "id") ?? "";
  const root = cleanEl(roots[0], from, id);
  root.attrs = root.attrs.filter(([k]) => !/^(role|aria-[\w-]+|width|height|id)$/.test(k));
  root.attrs.unshift(["id", id]);
  root.attrs.push(["width", "100%"], ["height", "100%"], ["aria-hidden", "true"], ["focusable", "false"]);
  return root;
}

/** FR-4 as markup: `sanitizeMapTree` written back. */
export const sanitizeMapSvg = (svg: string, id: string) => serialize(sanitizeMapTree(svg, id));

// ----------------------------------------------------------- the node boxes

export type Box = { x: number; y: number; width: number; height: number };
export type DrawnNode = { id: string; elementId: string; box: Box };

/** A node element's id: `flowchart-<id>-<n>`, or with a `<svg id>-` prefix
 *  as another mermaid build writes it (map.schema.json, levels[].svg). A
 *  node id is `[A-Za-z0-9_]+`, so the split is unambiguous. */
const NODE_ID = /^(?:.*-)?flowchart-([A-Za-z0-9_]+)-(\d+)$/;
export const nodeIdOf = (elementId: string): string | null => NODE_ID.exec(elementId)?.[1] ?? null;

type M = [number, number, number, number, number, number]; // a b c d e f
const I: M = [1, 0, 0, 1, 0, 0];
const mul = (p: M, q: M): M => [
  p[0] * q[0] + p[2] * q[1], p[1] * q[0] + p[3] * q[1],
  p[0] * q[2] + p[2] * q[3], p[1] * q[2] + p[3] * q[3],
  p[0] * q[4] + p[2] * q[5] + p[4], p[1] * q[4] + p[3] * q[5] + p[5],
];
const apply = (m: M, x: number, y: number): [number, number] => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

const nums = (s: string) => (s.match(/-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) ?? []).map(Number);

/** An SVG transform attribute as a matrix. */
export function transformOf(t: string | undefined): M {
  let m = I;
  if (!t) return m;
  for (const f of t.matchAll(/(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g)) {
    const a = nums(f[2]);
    let q: M = I;
    switch (f[1]) {
      case "matrix": if (a.length === 6) q = a as M; break;
      case "translate": q = [1, 0, 0, 1, a[0] ?? 0, a[1] ?? 0]; break;
      case "scale": q = [a[0] ?? 1, 0, 0, a[1] ?? a[0] ?? 1, 0, 0]; break;
      case "rotate": {
        const r = ((a[0] ?? 0) * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
        const [cx, cy] = [a[1] ?? 0, a[2] ?? 0];
        q = mul(mul([1, 0, 0, 1, cx, cy], [c, s, -s, c, 0, 0]), [1, 0, 0, 1, -cx, -cy]);
        break;
      }
      case "skewX": q = [1, 0, Math.tan(((a[0] ?? 0) * Math.PI) / 180), 1, 0, 0]; break;
      case "skewY": q = [1, Math.tan(((a[0] ?? 0) * Math.PI) / 180), 0, 1, 0, 0]; break;
    }
    m = mul(m, q);
  }
  return m;
}

/** Points on an arc, from the SVG endpoint form (SVG 1.1 F.6.5), sampled. */
function arcPoints(x1: number, y1: number, rx: number, ry: number, phi: number, large: boolean, sweep: boolean, x2: number, y2: number): [number, number][] {
  rx = Math.abs(rx); ry = Math.abs(ry);
  if (!rx || !ry) return [[x2, y2]];
  const p = (phi * Math.PI) / 180, cp = Math.cos(p), sp = Math.sin(p);
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
  const x1p = cp * dx + sp * dy, y1p = -sp * dx + cp * dy;
  const lam = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lam > 1) { rx *= Math.sqrt(lam); ry *= Math.sqrt(lam); }
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  const co = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, num / den));
  const cxp = (co * rx * y1p) / ry, cyp = (-co * ry * x1p) / rx;
  const cx = cp * cxp - sp * cyp + (x1 + x2) / 2, cy = sp * cxp + cp * cyp + (y1 + y2) / 2;
  const ang = (ux: number, uy: number, vx: number, vy: number) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!sweep && dt > 0) dt -= 2 * Math.PI;
  if (sweep && dt < 0) dt += 2 * Math.PI;
  const out: [number, number][] = [];
  for (let k = 1; k <= 24; k++) {
    const t = t1 + (dt * k) / 24;
    out.push([cx + rx * Math.cos(t) * cp - ry * Math.sin(t) * sp, cy + rx * Math.cos(t) * sp + ry * Math.sin(t) * cp]);
  }
  return out;
}

/** The points that bound a path: every end point, every control point
 *  (a curve lies inside its control polygon), and sampled arcs. */
export function pathPoints(d: string): [number, number][] {
  const out: [number, number][] = [];
  let x = 0, y = 0, sx = 0, sy = 0;
  for (const seg of d.matchAll(/([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g)) {
    const cmd = seg[1], a = nums(seg[2]), rel = cmd === cmd.toLowerCase();
    const ox = () => (rel ? x : 0), oy = () => (rel ? y : 0);
    switch (cmd.toUpperCase()) {
      case "Z": x = sx; y = sy; break;
      case "M": case "L": case "T":
        for (let k = 0; k + 1 < a.length; k += 2) {
          x = a[k] + ox(); y = a[k + 1] + oy(); out.push([x, y]);
          if (k === 0 && cmd.toUpperCase() === "M") { sx = x; sy = y; }
        }
        break;
      case "H": for (const v of a) { x = v + ox(); out.push([x, y]); } break;
      case "V": for (const v of a) { y = v + oy(); out.push([x, y]); } break;
      case "C": case "S": case "Q": {
        const n = cmd.toUpperCase() === "C" ? 6 : 4;
        for (let k = 0; k + n - 1 < a.length; k += n) {
          const bx = ox(), by = oy();
          for (let j = 0; j < n; j += 2) out.push([a[k + j] + bx, a[k + j + 1] + by]);
          x = a[k + n - 2] + bx; y = a[k + n - 1] + by;
        }
        break;
      }
      case "A":
        for (let k = 0; k + 6 < a.length; k += 7) {
          const x2 = a[k + 5] + ox(), y2 = a[k + 6] + oy();
          out.push(...arcPoints(x, y, a[k], a[k + 1], a[k + 2], !!a[k + 3], !!a[k + 4], x2, y2));
          x = x2; y = y2;
        }
        break;
    }
  }
  return out;
}

/** The shape points of one element in its own units, before its transform. */
function shapePoints(el: El): [number, number][] {
  const n = (k: string) => Number(attrOf(el, k) ?? 0) || 0;
  switch (el.tag) {
    case "rect": {
      const w = n("width"), h = n("height");
      return w > 0 && h > 0 ? [[n("x"), n("y")], [n("x") + w, n("y") + h]] : [];
    }
    case "circle": return n("r") > 0 ? [[n("cx") - n("r"), n("cy") - n("r")], [n("cx") + n("r"), n("cy") + n("r")]] : [];
    case "ellipse": return n("rx") > 0 && n("ry") > 0 ? [[n("cx") - n("rx"), n("cy") - n("ry")], [n("cx") + n("rx"), n("cy") + n("ry")]] : [];
    case "line": return [[n("x1"), n("y1")], [n("x2"), n("y2")]];
    case "polygon": case "polyline": {
      const p = nums(attrOf(el, "points") ?? "");
      const out: [number, number][] = [];
      for (let k = 0; k + 1 < p.length; k += 2) out.push([p[k], p[k + 1]]);
      return out;
    }
    case "path": return pathPoints(attrOf(el, "d") ?? "");
    default: return [];
  }
}

/** The box of everything an element draws (text excepted: a label sits
 *  inside its shape), in the units of the matrix `m` maps to. */
function boxOf(el: El, m: M): Box | null {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const visit = (e: El, mm: M) => {
    const here = mul(mm, transformOf(attrOf(e, "transform")));
    for (const [px, py] of shapePoints(e)) {
      const [qx, qy] = apply(here, px, py);
      x0 = Math.min(x0, qx); y0 = Math.min(y0, qy); x1 = Math.max(x1, qx); y1 = Math.max(y1, qy);
    }
    for (const c of e.children) if (typeof c !== "string" && c.tag !== "text" && c.tag !== "marker" && c.tag !== "defs") visit(c, here);
  };
  visit(el, m);
  return x1 > x0 && y1 > y0 ? { x: x0, y: y0, width: x1 - x0, height: y1 - y0 } : null;
}

export type ViewBox = Box;

/** The drawing's viewBox (its user units), from the root. */
export function viewBoxOf(root: El): ViewBox | null {
  const v = nums(attrOf(root, "viewBox") ?? "");
  return v.length === 4 && v[2] > 0 && v[3] > 0 ? { x: v[0], y: v[1], width: v[2], height: v[3] } : null;
}

/** FR-5: each drawn node, found by its element id, with its box in the
 *  drawing's viewBox units (the root's own transform, if any, included), in
 *  document order. An element drawn twice under one node id counts once,
 *  the first; a node element with nothing to measure is left out. */
export function drawnNodes(root: El): DrawnNode[] {
  const out: DrawnNode[] = [];
  const seen = new Set<string>();
  const walk = (e: El, m: M) => {
    const here = mul(m, transformOf(attrOf(e, "transform")));
    const elementId = attrOf(e, "id");
    const id = elementId ? nodeIdOf(elementId) : null;
    if (id && elementId && /(^|\s)node(\s|$)/.test(attrOf(e, "class") ?? "")) {
      if (!seen.has(id)) {
        const box = boxOf(e, m);
        if (box) { seen.add(id); out.push({ id, elementId, box }); }
      }
      return;
    }
    for (const c of e.children) if (typeof c !== "string") walk(c, here);
  };
  for (const c of root.children) if (typeof c !== "string") walk(c, I);
  return out;
}

/** Reading order (map-and-roadmap, Accessibility): top to bottom, then left
 *  to right within a row. Nodes whose centres sit within half a node's
 *  height of the row's first node share its row. */
export function readingOrder<T extends { box: Box }>(nodes: T[]): T[] {
  const cy = (n: T) => n.box.y + n.box.height / 2;
  const byY = [...nodes].sort((a, b) => cy(a) - cy(b));
  const rows: T[][] = [];
  for (const n of byY) {
    const row = rows[rows.length - 1];
    if (row && cy(n) - cy(row[0]) <= Math.min(row[0].box.height, n.box.height) / 2) row.push(n);
    else rows.push([n]);
  }
  return rows.flatMap((r) => r.sort((a, b) => a.box.x - b.box.x));
}

/** The roving set's next stop for a key, or null when the key is not one
 *  the set moves on. Arrows step in reading order and stop at the ends;
 *  Home and End jump. */
export function rovingStep(count: number, at: number, key: string): number | null {
  if (count === 0) return null;
  switch (key) {
    case "ArrowRight": case "ArrowDown": return Math.min(count - 1, at + 1);
    case "ArrowLeft": case "ArrowUp": return Math.max(0, at - 1);
    case "Home": return 0;
    case "End": return count - 1;
    default: return null;
  }
}

// ------------------------------------------------------------- the buttons

export type Evidence = { kind: string; ref: string };
/** A node of map.json as the figure needs it (c4-map/1, nodes[]). */
export type MapNode = { id: string; label: string; kind: string | null; status: string | null; grounding: Evidence[] };

/** FR-5, M1 and M4: a node's button name, `<label>, <kind>, <status>`, with
 *  `not grounded` when its grounding is empty. A null kind or status (a
 *  node with no grounding row) reads `kind unknown` / `status unknown`. */
export function nodeName(n: MapNode): string {
  const parts = [n.label, n.kind ?? "kind unknown", n.status ?? "status unknown"];
  if (!n.grounding.length) parts.push("not grounded");
  return parts.join(", ");
}

/** A class name a lens may set: a CSS identifier, nothing else. */
const CLASS = /^-?[A-Za-z_][\w-]*$/;

/** A lens on the tree: `classes` (node id to class names) added to each
 *  node element's class, the tree itself unchanged (a copy where it
 *  changes), so nothing is laid out again and no node moves (M6). */
export function withNodeClasses(root: El, classes: Record<string, readonly string[]> | undefined): El {
  if (!classes || !Object.keys(classes).length) return root;
  const visit = (e: El): El => {
    const elementId = attrOf(e, "id");
    const id = elementId ? nodeIdOf(elementId) : null;
    const add = id ? (classes[id] ?? []).filter((c) => CLASS.test(c)) : [];
    const children = e.children.map((c) => (typeof c === "string" ? c : visit(c)));
    const changed = add.length > 0 || children.some((c, k) => c !== e.children[k]);
    if (!changed) return e;
    const out: El = { tag: e.tag, attrs: e.attrs.map(([k, v]) => [k, v] as [string, string]), children };
    if (add.length) setAttr(out, "class", [attrOf(out, "class") ?? "", ...add].join(" ").trim());
    return out;
  };
  return visit(root);
}

/** A box as percentages of the viewBox: the button layer's geometry, so it
 *  follows the figure at any scale with no measuring. */
export function boxPercent(b: Box, vb: ViewBox) {
  const p = (n: number) => `${Math.round(n * 10000) / 10000}%`;
  return {
    left: p(((b.x - vb.x) / vb.width) * 100),
    top: p(((b.y - vb.y) / vb.height) * 100),
    width: p((b.width / vb.width) * 100),
    height: p((b.height / vb.height) * 100),
  };
}
