import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DiagramView } from "./DiagramFigure";
import cardSrc from "./CardDrawer.tsx?raw";
import roleSrc from "./RoleDrawer.tsx?raw";
import ruleSrc from "./RuleDecisionBox.tsx?raw";
import decSrc from "./DecisionsView.tsx?raw";
import helpSrc from "./HelpView.tsx?raw";

// G2's view half and FR-3 (docs/specs/diagrams.md): what a figure shows in
// each state. No DOM library here: the states are rendered to markup.

const src = "flowchart LR\n  a --> b --> c\n  class a,b added\n  class c changed\n";
const view = (st: Parameters<typeof DiagramView>[0]["st"]) =>
  renderToStaticMarkup(<DiagramView source={src} heading="Change on the map" st={st} />);
const code = '<pre><code class="language-mermaid">flowchart LR\n  a --&gt; b --&gt; c\n';

describe("G2: a figure that cannot draw shows the source under the reason", () => {
  for (const reason of ["mmdc not found (npm install -g @mermaid-js/mermaid-cli)", "dark style missing: ~/.mermaid/mermaid-styles-dark.css", "Error: Parse error on line 2:"]) {
    it(reason, () => {
      const html = view({ state: "failed", reason });
      expect(html).toContain(`Diagram not drawn: ${reason}</p>${code}`);
      expect(html).not.toContain("<img");
      expect(html).toContain("Added: a, b. Changed: c. Removed: none.");
    });
  }
  it("while drawing, the source under Drawing the diagram…", () => {
    const html = view({ state: "drawing" });
    expect(html).toContain(`Drawing the diagram…</p>${code}`);
    expect(html).not.toContain("<img");
  });
});

describe("FR-3, FR-4: a drawn figure", () => {
  const html = view({ state: "drawn", svg: "<svg/>" });
  it("is an image named after its heading, described by the class line", () => {
    expect(html).toMatch(/<img src="data:image\/svg\+xml;charset=utf-8,%3Csvg%2F%3E" alt="Change on the map, diagram" aria-describedby="([^"]+)-classes"\/>/);
    const id = html.match(/aria-describedby="([^"]+)"/)![1];
    expect(html).toContain(`<p id="${id}" class="diagram-classes">Added: a, b. Changed: c. Removed: none.</p>`);
  });
  it("has a Source disclosure, closed, then the text line under it", () => {
    expect(html).toMatch(/<button type="button" class="link diagram-source" aria-expanded="false" aria-controls="[^"]+">Source<\/button><p id="[^"]+" class="diagram-classes">/);
    expect(html).not.toContain("<pre>");
  });
  it("sits in a frame of its own, which scrolls (diagram.css)", () => {
    expect(html).toContain('<div class="diagram-frame"><img');
  });
});

describe("FR-2: the five markdown sites slot their blocks and mount the figures", () => {
  const cases: Array<[string, string]> = [["CardDrawer", cardSrc], ["RoleDrawer", roleSrc], ["RuleDecisionBox", ruleSrc], ["DecisionsView", decSrc], ["HelpView", helpSrc]];
  for (const [name, s] of cases) {
    it(name, () => {
      expect(s).toMatch(/slotDiagrams\(marked\.parse\(/);
      expect(s).toMatch(/useDiagrams\(\w+, \w+, /);
      expect(s).toContain("{figures}");
      expect(s.match(/marked\.parse\(/g)).toHaveLength(s.match(/slotDiagrams\(marked\.parse\(/g)!.length);
    });
  }
});
