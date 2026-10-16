import { describe, expect, it } from "vitest";
import { marked } from "marked";
import { changeClasses, classLine, diagramName, DRAWING, hasDiagram, mermaidBlocks, nodeLabels, slotDiagrams, svgSource } from "./diagram";

// The skill's change-classes example (mermaid-flowcharts, "Change classes";
// ✚ as diagrams-in-app Amendment 1).
const example = `flowchart LR
    pwa["PWA"] --> bff["✎ BFF"]
    bff --> payments_svc["✚ Payments"]
    payments_svc --> datastore[("Datastore")]
    bff --> legacy_pay["✕ Legacy pay"]
    class pwa,datastore context
    class bff changed
    class payments_svc added
    class legacy_pay removed
    classDef added   fill:#e6f4ea,stroke:#1e7f3c,color:#14532d,stroke-width:2px
`;

describe("D5: the text line under a figure (FR-3)", () => {
  it("added, changed and no removed; unlabelled nodes by id", () => {
    const src = "flowchart LR\n  a --> b --> c\n  class a,b added\n  class c changed\n";
    expect(classLine(src)).toBe("Added: a, b. Changed: c. Removed: none. Around it: none.");
  });
  it("the skill's example, by label, context under Around it", () => {
    expect(classLine(example)).toBe("Added: Payments. Changed: BFF. Removed: Legacy pay. Around it: PWA, Datastore.");
  });
  it("a block with no classes reads none four times", () => {
    expect(classLine("flowchart LR\n  a --> b\n")).toBe("Added: none. Changed: none. Removed: none. Around it: none.");
  });
  it("ids keep their first order and appear once; other classes and classDef lines are not read", () => {
    const c = changeClasses("class x added\nclass y,x added;\nclass z hot\nclassDef added fill:#000\n  class w removed\n");
    expect(c).toEqual({ added: ["x", "y"], changed: [], removed: ["w"] });
  });
});

describe("leftovers-38 O5 (D5 amended): the text line says labels, never glyphs", () => {
  // The skill's change-classes example with labelled nodes and one without.
  const src = `flowchart LR
    pwa["PWA"] --> bff["✎ BFF"]
    bff --> payments_svc["✚ Payments"]
    bff --> cache
    class pwa,cache context
    class bff changed
    class payments_svc added
`;
  it("Added: Payments. Changed: BFF. Removed: none. Around it: PWA, cache.", () => {
    expect(classLine(src)).toBe("Added: Payments. Changed: BFF. Removed: none. Around it: PWA, cache.");
  });
  it("no ✚ ✎ ✕ anywhere in the line", () => {
    expect(classLine(src)).not.toMatch(/[✚✎✕]/);
    expect(classLine(example)).not.toMatch(/[✚✎✕]/);
  });
  it("reads every shape's label, the first one an id gets, and no edge as a shape", () => {
    const labels = nodeLabels(`flowchart TD
  a-->b
  s(["✕ Stadium"]) --> db[("Store")]
  r{Choice} --> h{{"Hex <br/> two"}}
  t>Flag] --> p[/Para/]
  s["Later label"]
  class a,s removed
`);
    expect(Object.fromEntries(labels)).toEqual({ s: "Stadium", db: "Store", r: "Choice", h: "Hex two", t: "Flag", p: "Para" });
  });
});

describe("blocks in marked's HTML (FR-2)", () => {
  const md = "# Change\n\nText.\n\n```mermaid\n" + example + "```\n\n```go\nx := 1\n```\n";
  it("finds the mermaid blocks of a markdown text, as written", () => {
    expect(mermaidBlocks(md)).toEqual([example]);
    expect(mermaidBlocks("~~~mermaid\nflowchart TD\n  a\n~~~\n")).toEqual(["flowchart TD\n  a\n"]);
  });
  it("a slot reads as the drawing state, with the source as code, never empty", () => {
    const html = marked.parse(md) as string;
    expect(hasDiagram(html)).toBe(true);
    const slotted = slotDiagrams(html);
    expect(slotted).toContain(`<div class="diagram-slot"><p class="diagram-state">${DRAWING}</p><pre><code class="language-mermaid">flowchart LR`);
    expect(slotted).toContain("&quot;✎ BFF&quot;");
    expect(slotted).toContain('<pre><code class="language-go">x := 1');
    expect(slotted.match(/diagram-slot/g)).toHaveLength(1);
  });
  it("the frame's name and the image's source", () => {
    expect(diagramName("Change on the map")).toBe("Change on the map, diagram");
    expect(diagramName("  ")).toBe("Figure, diagram");
    expect(svgSource("<svg a='1'/>")).toBe("data:image/svg+xml;charset=utf-8,%3Csvg%20a%3D'1'%2F%3E");
  });
});
