import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SecCount } from "./SecCount";

const fs: { readFileSync(p: string, enc: "utf8"): string; readdirSync(p: string): string[] } = await import("node:" + "fs");

// leftovers-71 V2 (FR-2; run-report Amendment 7, AR34; design system, "A count
// after a title"): `.sec-title` is a flex row with a gap, so a bare text node
// and the count's span were two flex items and the gap stood in for a space.
// SecCount draws `<title> · N` as one flex item: one space each side of the dot.
describe("leftovers-71 V2 (FR-2, AR34): SecCount draws <title> · N with one space each side", () => {
  it("draws the title, one space, the dot, one space, the count, in one element", () => {
    const html = renderToStaticMarkup(<SecCount title="Needs me" n={3} />);
    expect(html).toBe('<span>Needs me · <span class="num sec-count">3</span></span>');
    expect(html.replace(/<[^>]*>/g, "")).toBe("Needs me · 3");
  });
  it("draws zero and two digits the same way", () => {
    expect(renderToStaticMarkup(<SecCount title="Waiting on others" n={0} />).replace(/<[^>]*>/g, "")).toBe("Waiting on others · 0");
    expect(renderToStaticMarkup(<SecCount title="Not accepted" n={12} />).replace(/<[^>]*>/g, "")).toBe("Not accepted · 12");
  });
  it("with a name after a numbered title (Overview's stage), keeps the title's words: Stage 2 · Build", () => {
    const html = renderToStaticMarkup(<SecCount title="Stage" n={2} name="Build" />);
    expect(html).toBe('<span>Stage <span class="num sec-count">2</span> · Build</span>');
    expect(html.replace(/<[^>]*>/g, "")).toBe("Stage 2 · Build");
  });
});

// The scan (leftovers-71 V2, Amendments 2 and its addendum): in every non-test
// file under components/, no `<title> · <span className="num…` (with or without
// sec-count), and inside any `.sec-title` element, across lines, no dot (`·`,
// `{" · "}`, `&middot;`, `·`) beside a count span (`num` or `sec-count`),
// before it or after it. SecCount itself is the one place that draws one.
const DOT = String.raw`(?:·|&middot;|\\u00b7)`;
const SPAN = String.raw`<span className="[^"]*\b(?:num|sec-count)\b[^"]*"`;
const BETWEEN = String.raw`[\s{}"'\x60]*`;
const lineOf = (src: string, at: number) => src.slice(0, at).split("\n").length;
function handCounts(name: string, src: string): string[] {
  const hits = new Set<number>();
  const open = /<(h[1-6]|div|span|p|header)\b[^>]*className=\{?[`"][^`"]*\bsec-title\b[^>]*>/g;
  for (const m of src.matchAll(open)) {
    const start = m.index! + m[0].length;
    const end = src.indexOf(`</${m[1]}>`, start);
    const body = src.slice(start, end < 0 ? undefined : end);
    const before = new RegExp(DOT + BETWEEN + SPAN);
    const after = new RegExp(SPAN + String.raw`[^>]*>[^<]*</span>` + BETWEEN + DOT);
    if (before.test(body) || after.test(body)) hits.add(lineOf(src, m.index!));
  }
  return [...hits].sort((a, b) => a - b).map((l) => `${name}:${l}`);
}

describe("leftovers-71 V2 (FR-2): no component writes a title's count by hand", () => {
  const dir = new URL("./", import.meta.url).pathname;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".tsx") && !f.includes(".test.") && f !== "SecCount.tsx").sort();
  it("the scan catches every hand-written form, on one line or across lines", () => {
    const t = (body: string) => handCounts("x", `<h2 className="sec-title">${body}</h2>`);
    expect(t(`Needs me · <span className="num sec-count">{n}</span>`)).toEqual(["x:1"]);
    expect(t(`Awake · <span className="num">{n}</span>`)).toEqual(["x:1"]);
    expect(t(`Needs me{" · "}<span className="num sec-count">{n}</span>`)).toEqual(["x:1"]);
    expect(t(`Needs me{' · '}<span className="num sec-count">{n}</span>`)).toEqual(["x:1"]);
    expect(t(`Needs me &middot; <span className="sec-count">{n}</span>`)).toEqual(["x:1"]);
    expect(t(`Needs me{"\\u00b7"} <span className="sec-count">{n}</span>`)).toEqual(["x:1"]);
    expect(t(`\n  Needs me ·\n  <span className="num sec-count">{n}</span>\n`)).toEqual(["x:1"]);
    expect(t(`Stage <span className="sec-count">{k}</span> · {s.title}`)).toEqual(["x:1"]);
    expect(handCounts("x", `<h2\n  className="sec-title ib-group">\n  <button>Archived ·\n <span className="num">{n}</span></button></h2>`)).toEqual(["x:1"]);
    expect(t(`<SecCount title="Needs me" n={n} /><span className="sec-sub">a · b</span>`)).toEqual([]);
    expect(t(`Gates <span className="num">{n}</span>`)).toEqual([]);
  });
  it("finds none outside SecCount", () => {
    const hand = files.flatMap((f) => handCounts(f, fs.readFileSync(dir + f, "utf8")));
    expect(files.length).toBeGreaterThan(10);
    expect(hand).toEqual([]);
  });
});

// leftovers-72 V2 (FR-2; run-report Amendment 8, AR36; design system, "A count
// after a title ... wherever a title carries one"): lf71's scan looked inside
// `.sec-title` only. Widened to every non-test file here: a count span
// (`<span className="num…`, `<b className="num…`, `className={cx("num…` or
// any element of class `rail-group-n`) after a word, with no dot or with a dot
// written by hand, and ending the run: a count followed by a dot is a numbered
// name (`stage 2 · Build`, SecCount's `name`), one followed by a word is prose
// (`and 3 more`, `all 4 done`); neither is a title's count. A `rail-group-n`
// written by hand is one whatever stands before it (the rail's group name is an
// element). Allowed by name, as the spec lists them: Overview's Exit fraction
// (met of total, not a count) and the initiative header's target date.
const COUNT = /<(span|b)\s+className=(?:"(?:num\b[^"]*|[^"]*\brail-group-n\b[^"]*)"|\{cx\(\s*"num\b[^"]*"[^)]*\)\})[^>]*>/g;
const ALLOWED = [
  { file: "Overview.tsx", word: "Exit", why: "a fraction, met of total" },
  { file: "InitiativeHeader.tsx", word: "target", why: "a date, not a count" },
];
function titleCounts(name: string, src: string): { at: string; word: string }[] {
  const out: { at: string; word: string }[] = [];
  for (const m of src.matchAll(COUNT)) {
    const close = src.indexOf(`</${m[1]}>`, m.index!);
    const after = src.slice(close + m[1].length + 3, close + 120).replace(/^\s+/, "");
    if (/^(?:·|&middot;|\\u00b7|\{\s*["'`]\s*·)/.test(after)) continue;
    if (/^(?:\{[A-Za-z]|[A-Za-z])/.test(after)) continue;
    const before = src.slice(Math.max(0, m.index! - 200), m.index!).replace(/\s+$/, "").replace(/(?:·|&middot;|\{\s*["'`]\s*·\s*["'`]\s*\})$/, "").replace(/\s+$/, "");
    const word = /([A-Za-z]+)$/.exec(before)?.[1];
    if (word) out.push({ at: `${name}:${lineOf(src, m.index!)}`, word });
    else if (/\brail-group-n\b/.test(m[0])) out.push({ at: `${name}:${lineOf(src, m.index!)}`, word: "" });
  }
  return out;
}

describe("leftovers-72 V2 (FR-2, AR36): no title in any component writes its count by hand", () => {
  it("draws a place's own count class and element class, and an element as the title (the rail's group)", () => {
    const html = renderToStaticMarkup(<SecCount className="rail-group-title" countClass="rail-group-n" n={4} title={<span className="rail-group-name">Roles</span>} />);
    expect(html).toBe('<span class="rail-group-title"><span class="rail-group-name">Roles</span> · <span class="num rail-group-n">4</span></span>');
    expect(html.replace(/<[^>]*>/g, "")).toBe("Roles · 4");
  });
  const dir = new URL("./", import.meta.url).pathname;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".tsx") && !f.includes(".test.") && f !== "SecCount.tsx").sort();
  it("the widened scan catches every hand-written title count and passes numbered names, prose and SecCount", () => {
    const at = (src: string) => titleCounts("x", src).map((h) => h.word);
    expect(at(`<div className="gl-label">Gates <span className="num">{n}</span></div>`)).toEqual(["Gates"]);
    expect(at(`<h4 className="rr-sub">Ruled while you were away <span className="num">{n}</span></h4>`)).toEqual(["away"]);
    expect(at(`<button>{chev} Sessions · <span className="num">{n}</span>\n</button>`)).toEqual(["Sessions"]);
    expect(at(`<button>Sessions{" · "}<b className="num">{n}</b></button>`)).toEqual(["Sessions"]);
    expect(at(`<p>Total <span className={cx("num", x)}>{n}</span></p>`)).toEqual(["Total"]);
    expect(at(`<span className="rail-group-name">Roles</span>\n<span className="rail-group-n">{n}</span>`)).toEqual([""]);
    expect(at(`<span className="sec-sub">stage <span className="num">{k}</span> · {s.title}</span>`)).toEqual([]);
    expect(at(`<li>and <span className="num">{n}</span> more</li>`)).toEqual([]);
    expect(at(`<>all <span className="num">{n}</span> done</>`)).toEqual([]);
    expect(at(`<li><b className="num">{n}</b> {label}</li>`)).toEqual([]);
    expect(at(`<div className="gl-label"><SecCount title="Gates" n={n} /></div>`)).toEqual([]);
    expect(at(`<SecCount title={name} n={n} countClass="rail-group-n" />`)).toEqual([]);
  });
  it("finds none outside SecCount but the Exit fraction and the target date", () => {
    const hits = files.flatMap((f) => titleCounts(f, fs.readFileSync(dir + f, "utf8")).map((h) => ({ ...h, file: f })));
    const left = hits.filter((h) => !ALLOWED.some((a) => a.file === h.file && a.word === h.word)).map((h) => h.at);
    expect(files.length).toBeGreaterThan(10);
    expect(left).toEqual([]);
    // The allowances still name something, so they cannot outlive their place.
    for (const a of ALLOWED) expect(hits.some((h) => h.file === a.file && h.word === a.word)).toBe(true);
  });
});
