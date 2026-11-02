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
