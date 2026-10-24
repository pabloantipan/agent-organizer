// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readdirSync, readFileSync } from "node:fs";

// The stylesheets as data, for the state-layer tests (leftovers-52 FR-1 to
// FR-3, S1 to S3). Vitest runs in Node with no DOM library, so this reads
// every .css under styles/ but review.css as text and answers two questions
// a browser would: which rules reach an element (by selector, here), and
// which value of a property wins there (specificity, then order). Only the
// selector features the stylesheets use are modelled; anything else does
// not match, so a rule this cannot read is never taken to reach a control.

export type Compound = { tag: string | null; classes: string[]; attrs: string[]; pseudos: string[]; nots: Compound[]; pe: string | null };
export type Rule = { file: string; order: number; sels: string[]; raws: string[]; parts: Compound[][]; decls: Map<string, string>; media: string | null };

/** The classes and attributes that say a control carries a state mark (the spec's premise). */
export const PREMISE = /\.(active|on|current|selected|open)\b|aria-(current|selected|pressed|expanded)=/;
export const STATE_CLASSES = ["active", "on", "current", "selected", "open"];
const stateAttr = (a: string) =>
  /^aria-(current|selected)(=|$)/.test(a) && !/="false"$/.test(a) || a === 'aria-pressed="true"' || a === 'aria-expanded="true"';
export const isStateCompound = (c: Compound) => c.classes.some((k) => STATE_CLASSES.includes(k)) || c.attrs.some(stateAttr);
export const unmark = (c: Compound): Compound => ({ ...c, classes: c.classes.filter((k) => !STATE_CLASSES.includes(k)), attrs: c.attrs.filter((a) => !stateAttr(a)) });

const dir = new URL("../styles/", import.meta.url);
/** global.css first, as main.tsx loads it before every other stylesheet; review.css is not read (0159). */
export const SHEETS = ["global.css", ...(readdirSync(dir) as string[]).filter((f) => f.endsWith(".css") && f !== "global.css" && f !== "review.css").sort()];
export const read = (f: string) => readFileSync(new URL(f, dir), "utf8") as string;

/** Splits at `sep` outside (), [] and quotes. */
const splitTop = (s: string, sep: string) => {
  const out: string[] = []; let depth = 0, q = "", cur = "";
  for (const ch of s) {
    if (q) { if (ch === q) q = ""; cur += ch; continue; }
    if (ch === '"' || ch === "'") q = ch;
    else if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    else if (ch === sep && depth === 0) { out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
};

/** An attribute as `name="value"`: a bare value (`[aria-pressed=true]`) is the same selector as a quoted one. */
const quoted = (a: string) => a.replace(/^([\w-]+[~|^$*]?=)([^"].*)$/, '$1"$2"');

/**
 * A selector with every :is() and :where() outside :not() unfolded into its
 * alternatives (`.a:is(.b, .c) x` is `.a.b x` and `.a.c x`), so a state
 * class written inside one is read like any other. :where() adds no
 * specificity in a browser; unfolded here it counts as written, which no
 * rule of these stylesheets depends on.
 */
export const unfold = (sel: string): string[] => {
  const m = /:(is|where)\(/.exec(sel.replace(/:not\((?:[^()]|\([^()]*\))*\)/g, (x) => " ".repeat(x.length)));
  if (!m) return [sel];
  let depth = 1, j = m.index + m[0].length;
  for (; j < sel.length && depth; j++) { if (sel[j] === "(") depth++; else if (sel[j] === ")") depth--; }
  const before = sel.slice(0, m.index), after = sel.slice(j);
  // A tag must lead its compound: `.x:is(button)` is `button.x`.
  const start = Math.max(before.search(/[^\s>+~]*$/), 0);
  return splitTop(sel.slice(m.index + m[0].length, j - 1), ",").flatMap((alt) => {
    const tag = /^([a-zA-Z][\w-]*|\*)/.exec(alt)?.[0] ?? "";
    return unfold(before.slice(0, start) + tag + before.slice(start) + alt.slice(tag.length) + after);
  });
};

export const parseCompound = (s: string): Compound => {
  const c: Compound = { tag: null, classes: [], attrs: [], pseudos: [], nots: [], pe: null };
  const re = /^([a-zA-Z][\w-]*|\*)|\.([\w-]+)|\[([^\]]+)\]|::([\w-]+)|:([\w-]+)(\((?:[^()]|\([^()]*\))*\))?/g;
  for (const m of s.matchAll(re)) {
    if (m[1]) c.tag = m[1] === "*" ? null : m[1].toLowerCase();
    else if (m[2]) c.classes.push(m[2]);
    else if (m[3]) c.attrs.push(quoted(m[3].replace(/\s+/g, "").replace(/'/g, '"')));
    else if (m[4]) c.pe = m[4];
    else if (m[5] === "not" && m[6]) c.nots.push(...splitTop(m[6].slice(1, -1), ",").map(parseCompound));
    else if (m[5]) c.pseudos.push(m[5] + (m[6] ?? ""));
  }
  return c;
};
/** A selector as its compounds, subject last; combinators are read as descent. */
export const parseSelector = (s: string) => splitTop(s.replace(/\s*([>+~])\s*/g, " "), " ").filter((x) => !/^[>+~]$/.test(x)).map(parseCompound);

const parseDecls = (body: string) => {
  const m = new Map<string, string>();
  for (const d of splitTop(body, ";")) {
    const i = d.indexOf(":"); if (i < 0) continue;
    m.set(d.slice(0, i).trim().toLowerCase(), d.slice(i + 1).replace(/!important/, "").trim());
  }
  return m;
};

export const parseSheet = (file: string, text: string, out: Rule[], media: string | null = null) => {
  text = text.replace(/\/\*[^]*?\*\//g, "");
  let i = 0;
  while (i < text.length) {
    const open = text.indexOf("{", i); if (open < 0) break;
    let head = text.slice(i, open); head = head.slice(head.lastIndexOf(";") + 1).trim();
    let depth = 1, j = open + 1;
    for (; j < text.length && depth; j++) { if (text[j] === "{") depth++; else if (text[j] === "}") depth--; }
    const body = text.slice(open + 1, j - 1);
    if (head.startsWith("@media")) parseSheet(file, body, out, head);
    else if (/^@(supports|container|layer|document)\b/.test(head)) parseSheet(file, body, out, media);
    else if (!head.startsWith("@")) {
      const raws = splitTop(head, ",").flatMap((raw) => unfold(raw).map(() => raw));
      const sels = splitTop(head, ",").flatMap(unfold);
      out.push({ file, order: out.length, sels, raws, parts: sels.map(parseSelector), decls: parseDecls(body), media });
    }
    i = j;
  }
  return out;
};

export const RULES: Rule[] = (() => { const out: Rule[] = []; for (const f of SHEETS) parseSheet(f, read(f), out); return out; })();

/** A media block a window at rest is under: everything but reduced motion asked for. */
export const mediaOn = (m: string | null) => !m || !/prefers-reduced-motion:\s*reduce/.test(m);

export const specificity = (parts: Compound[]): number => {
  let a = 0, b = 0, c = 0;
  const add = (x: Compound) => { b += x.classes.length + x.attrs.length + x.pseudos.length; c += (x.tag ? 1 : 0) + (x.pe ? 1 : 0); for (const n of x.nots) add(n); };
  for (const p of parts) add(p);
  return a * 10000 + b * 100 + c;
};

/** The classes the components put on a <button> (static words of className), so a selector naming only a class still knows the element is a button. */
export const BUTTON_CLASSES: Set<string> = (() => {
  const cdir = new URL("./", import.meta.url);
  const set = new Set<string>();
  for (const f of readdirSync(cdir) as string[]) {
    if (!f.endsWith(".tsx") || f.includes(".test.")) continue;
    const src = readFileSync(new URL(f, cdir), "utf8") as string;
    for (const m of src.matchAll(/<button\b(?:[^>]|=>)*?className=(?:"([^"]*)"|\{`([^`]*)`\}|\{"([^"]*)"\})/g)) {
      for (const w of (m[1] ?? m[2] ?? m[3] ?? "").replace(/\$\{[^}]*\}/g, " ").split(/\s+/)) if (/^[\w-]+$/.test(w)) set.add(w);
    }
  }
  return set;
})();

/** Every word the components' sources hold: a selector naming a class no component writes matches nothing on screen. */
export const COMPONENT_WORDS: Set<string> = (() => {
  const cdir = new URL("./", import.meta.url);
  const set = new Set<string>();
  for (const f of readdirSync(cdir) as string[]) {
    if (!/\.tsx?$/.test(f) || f.includes(".test.") || f.includes(".kit.")) continue;
    for (const w of (readFileSync(new URL(f, cdir), "utf8") as string).match(/[\w-]+/g) ?? []) set.add(w);
  }
  return set;
})();
export const dead = (parts: Compound[]) => parts.some((c) => c.classes.some((k) => !COMPONENT_WORDS.has(k)));

/** An element as a selector describes it: its compounds, subject last, and whether the pointer is over it. */
export type Target = { parts: Compound[]; hover: boolean };

const simpleIn = (n: Compound, c: Compound) =>
  (!n.tag || n.tag === c.tag) && n.classes.every((k) => c.classes.includes(k)) && n.attrs.every((a) => c.attrs.includes(a) || c.attrs.some((x) => x.split("=")[0] === a));

/** Whether rule selector `b` can apply to the element `t` names, read by containment. */
export const reaches = (b: Compound[], t: Target) => {
  const bc = b[b.length - 1], mc = t.parts[t.parts.length - 1];
  if (bc.pe !== mc.pe) return false;
  const isButton = mc.tag === "button" || (!mc.tag && mc.classes.some((k) => BUTTON_CLASSES.has(k)));
  if (bc.tag && bc.tag !== mc.tag && !(bc.tag === "button" && isButton)) return false;
  if (!bc.classes.every((k) => mc.classes.includes(k))) return false;
  if (!bc.attrs.every((a) => mc.attrs.includes(a) || mc.attrs.some((x) => x.split("=")[0] === a))) return false;
  const okPseudo = (p: string) => (p === "hover" && t.hover) || mc.pseudos.includes(p);
  if (!bc.pseudos.every(okPseudo)) return false;
  if (bc.nots.some((n) => simpleIn(n, mc))) return false;
  const allClasses = new Set(t.parts.flatMap((p) => p.classes));
  const allAttrs = t.parts.flatMap((p) => p.attrs);
  for (const anc of b.slice(0, -1)) {
    if (!anc.classes.every((k) => allClasses.has(k))) return false;
    if (!anc.attrs.every((a) => allAttrs.includes(a))) return false;
    if (!anc.pseudos.every((p) => p === "hover" && t.hover)) return false;
  }
  return true;
};

/** Every value of `prop` that wins on `t`: the reaching rules at the highest specificity (more than one only on a tie, which the caller treats as either). */
export const winners = (t: Target, prop: string, rules = RULES) => {
  let best = -1; let vals: { v: string; rule: Rule; sel: string }[] = [];
  for (const r of rules) {
    if (!mediaOn(r.media) || !r.decls.has(prop)) continue;
    r.parts.forEach((p, i) => {
      if (!reaches(p, t)) return;
      const s = specificity(p);
      if (s > best) { best = s; vals = []; }
      if (s === best) vals.push({ v: r.decls.get(prop)!, rule: r, sel: r.sels[i] });
    });
  }
  // Same specificity: the later rule wins; keep every one of them only when they differ by file (order across stylesheets is the bundle's).
  if (vals.length > 1 && new Set(vals.map((x) => x.rule.file)).size === 1) vals = [vals[vals.length - 1]];
  return vals;
};

/** Whether a transition value runs on `prop` (shorthands included). */
export const transitions = (value: string, prop: string) =>
  splitTop(value, ",").some((item) => {
    const p = item.split(/\s+/)[0];
    if (p === "none") return false;
    if (p === "all" || p === prop) return true;
    if (p === "background") return prop.startsWith("background");
    if (p === "border") return prop.startsWith("border");
    if (p === "border-color") return /^border(-\w+)?-color$/.test(prop);
    if (p === "outline") return prop.startsWith("outline");
    return false;
  });

export const FILL = ["background", "background-color", "background-image"];
export const LINE = ["box-shadow"];
export const EDGE_INK = ["border", "border-color", "border-style", "border-top-color", "border-right-color", "border-bottom-color", "border-left-color", "outline", "outline-color", "color"];
export const PAINT = [...FILL, ...LINE, ...EDGE_INK];

/** The one ease hover takes (design system, Elevation and motion; leftovers-52 FR-2). */
export const EASE = "background-color var(--dur-fast) var(--ease-out)";

/** A state-marked selector of some rule, with the element it paints and that element with no mark. */
export type Mark = { file: string; sel: string; raw: string; rule: Rule; parts: Compound[]; plain: Compound[] };
export const MARKS: Mark[] = RULES.flatMap((r) => r.parts.flatMap((parts, i) =>
  parts.some(isStateCompound) ? [{ file: r.file, sel: r.sels[i], raw: r.raws[i], rule: r, parts, plain: parts.map(unmark) }] : []));

/** What the parser leaves out of MARKS on purpose: a state inside :not() (the element without it) and an aria state written "false". */
export const unmarkedOnPurpose = (raw: string) =>
  raw.replace(/:not\((?:[^()]|\([^()]*\))*\)/g, "").replace(/aria-[\w-]+=\s*(["']?)false\1/g, "");

/**
 * The premise's own grep over the stylesheets, as a check on MARKS: every
 * selector whose raw text it matches (less what is left out on purpose) must
 * be one MARKS classified, and every match in a sheet's text must sit in a
 * selector the parser read. A spelling the parser does not foresee fails
 * here instead of passing unread.
 */
export const unclassified = (files = SHEETS, rules = RULES) => {
  const out: string[] = [];
  for (const r of rules) if (files.includes(r.file)) new Set(r.raws).forEach((raw) => {
    if (PREMISE.test(unmarkedOnPurpose(raw)) && !MARKS.some((m) => m.rule === r && m.raw === raw)) out.push(`${r.file}: ${raw}`);
  });
  const g = new RegExp(PREMISE.source, "g");
  for (const f of files) {
    const inText = (read(f).replace(/\/\*[^]*?\*\//g, "").match(g) ?? []).length;
    const inRules = rules.filter((r) => r.file === f).reduce((n, r) => n + [...new Set(r.raws)].reduce((k, raw) => k + (raw.match(g) ?? []).length, 0), 0);
    if (inText !== inRules) out.push(`${f}: ${inText} premise matches in the text, ${inRules} in the selectors read`);
  }
  return out;
};

/** A control: some hover rule paints the unmarked element's background, so hover has something to ease. */
export const isControl = (plain: Compound[]) =>
  RULES.some((r) => mediaOn(r.media) && FILL.some((p) => r.decls.has(p)) && r.parts.some((p) => p.some((c) => c.pseudos.includes("hover")) && reaches(p, { parts: plain, hover: true })));

/** The class every state-marked control carries, and the one for a control whose ::before is taken. */
export const LAYER = "sl", LAYER_SHADOW = "sl-shadow";
export const onLayer = (parts: Compound[]) => { const c = parts[parts.length - 1].classes; return c.includes(LAYER) || c.includes(LAYER_SHADOW); };
