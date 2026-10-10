import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { StripFoldButtons } from "./Rail";

// The strip's fold buttons as markup (leftovers-16 F1): lucide draws each
// glyph as an svg with its icon's class, so the moon and the box are named.
describe("the strip's folds (leftovers-16 F1)", () => {
  const html = renderToStaticMarkup(<StripFoldButtons asleep={["a", "b", "c"]} archived={["d"]} onOpen={() => undefined} />);
  const buttons = html.split("</button>").filter((b) => b.includes("<button"));

  it("draws a moon over the asleep count, then a box over the archived count", () => {
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toMatch(/lucide-moon[\s\S]*<span class="strip-rank">3<\/span>/);
    expect(buttons[1]).toMatch(/lucide-archive[\s\S]*<span class="strip-rank">1<\/span>/);
  });

  it("names each fold by its word and count, the glyph hidden from the name", () => {
    expect(buttons[0]).toContain('aria-label="Asleep, 3 initiatives"');
    expect(buttons[1]).toContain('aria-label="Archived, 1 initiative"');
    expect(buttons[0]).toContain('title="Asleep, 3 initiatives: a, b, c. Wake one from Initiatives"');
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"/);
    expect(html).toContain('width="14"');
  });

  it("shows no fold that holds none", () => {
    expect(renderToStaticMarkup(<StripFoldButtons asleep={[]} archived={[]} onOpen={() => undefined} />)).toBe("");
    expect(renderToStaticMarkup(<StripFoldButtons asleep={[]} archived={["d"]} onOpen={() => undefined} />)).not.toContain("lucide-moon");
  });
});
