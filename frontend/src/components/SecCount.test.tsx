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

describe("leftovers-71 V2 (FR-2): no component writes a title's count by hand", () => {
  const dir = new URL("./", import.meta.url).pathname;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".tsx") && !f.includes(".test.") && f !== "SecCount.tsx");
  it("finds no ` · <span className=\"…sec-count\">` and no `sec-count\">…</span> ·` outside SecCount", () => {
    const hand: string[] = [];
    for (const f of files) {
      const src = fs.readFileSync(dir + f, "utf8");
      src.split("\n").forEach((line, k) => {
        if (/ · <span className="[^"]*\bsec-count\b/.test(line) || /\bsec-count\b[^>]*>[^<]*<\/span> ·/.test(line)) hand.push(`${f}:${k + 1}`);
      });
    }
    expect(files.length).toBeGreaterThan(10);
    expect(hand).toEqual([]);
  });
});
