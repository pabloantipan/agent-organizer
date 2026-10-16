import { describe, expect, it } from "vitest";
import { marked } from "marked";
import { joinPath, linkTarget, pathRef, sectionId, slug, specRef, withAnchors, type ReaderIndex } from "./specReader";
import { slotDiagrams } from "./diagram";

// docs/specs/diagrams.md FR-7, FR-8: the reader's pure halves.

describe("specRef: what a card's spec: names", () => {
  it("the first word, without prose or section", () => {
    expect(specRef("docs/specs/diagrams.md (FR-6 to FR-8; diagrams-in-app D1-D8)")).toEqual({ path: "docs/specs/diagrams.md", section: "" });
    expect(specRef("docs/reader.md#the-scan-report")).toEqual({ path: "docs/reader.md", section: "the-scan-report" });
    expect(specRef("./a/../docs/x.md#s,")).toEqual({ path: "docs/x.md", section: "s" });
  });
  it("nothing outside the root", () => {
    for (const r of ["", "   ", "/etc/passwd", "../out.md", "#only"]) expect(specRef(r)).toBeNull();
  });
  it("pathRef keeps a listed path whole", () => {
    expect(pathRef("specs/with space.md")).toEqual({ path: "specs/with space.md", section: "" });
  });
});

describe("joinPath", () => {
  it("folds . and .. and refuses climbing out", () => {
    expect(joinPath("docs", "../working-on/decisions/0012-x.md")).toBe("working-on/decisions/0012-x.md");
    expect(joinPath("docs", "../../x.md")).toBeNull();
    expect(joinPath("", "./x.md")).toBe("x.md");
  });
});

describe("FR-7 Contents: the ## headings, Change on the map first and marked", () => {
  const md = "# Title\n\n## Problem\n\n## Goals\n\n## Change on the map\n\n```mermaid\nflowchart LR\n  a --> b\n```\n\n## Rabbit holes\n\n## Goals\n";
  const { html, contents } = withAnchors(slotDiagrams(marked.parse(md) as string));
  it("lists the map first, the rest in the document's order", () => {
    expect(contents.map((c) => c.text)).toEqual(["Change on the map", "Problem", "Goals", "Rabbit holes", "Goals"]);
    expect(contents.map((c) => c.map)).toEqual([true, false, false, false, false]);
  });
  it("gives every heading an id, repeats numbered, and keeps the body's order", () => {
    expect(contents.map((c) => c.id)).toEqual(["change-on-the-map", "problem", "goals", "rabbit-holes", "goals-1"]);
    expect(html).toContain('<h1 id="title" tabindex="-1">Title</h1>');
    expect(html.indexOf('id="problem"')).toBeLessThan(html.indexOf('id="change-on-the-map"'));
    expect(html).toContain('<div class="diagram-slot">');
  });
  it("a heading with code or entities slugs on its text", () => {
    const r = withAnchors(marked.parse("## The `scan` & report\n") as string);
    expect(r.contents[0]).toEqual({ id: "the-scan--report", text: "The scan & report", map: false });
  });
});

describe("FR-7: a #section lands on its heading", () => {
  const ids = ["problem", "the-scan-report", "change-on-the-map"];
  it("by id, by slug of its words, or not at all", () => {
    expect(sectionId(ids, "the-scan-report")).toBe("the-scan-report");
    expect(sectionId(ids, "Change%20on%20the%20map")).toBe("change-on-the-map");
    expect(sectionId(ids, "nope")).toBeNull();
    expect(sectionId(ids, "")).toBeNull();
    expect(slug("Change on the map")).toBe("change-on-the-map");
  });
});

describe("FR-8: where a link inside goes", () => {
  const idx: ReaderIndex = {
    records: new Map([["working-on/decisions/0012-draw-the-change-on-the-map.md", "0012"]]),
    specs: new Set(["specs/01-shape.md", "docs/reader.md"]),
  };
  const from = "docs/reader.md";
  it("a record and a spec open in the drawer", () => {
    expect(linkTarget(from, "../working-on/decisions/0012-draw-the-change-on-the-map.md", idx)).toEqual({ kind: "record", number: "0012", path: "working-on/decisions/0012-draw-the-change-on-the-map.md", section: "" });
    expect(linkTarget(from, "../specs/01-shape.md#gate", idx)).toEqual({ kind: "spec", path: "specs/01-shape.md", section: "gate" });
  });
  it("a record the initiative does not hold reads missing", () => {
    expect(linkTarget(from, "../working-on/decisions/0099-never-written.md", idx)).toEqual({ kind: "missing", path: "working-on/decisions/0099-never-written.md" });
  });
  it("a code path goes to the editor, an outside link to the browser, # stays", () => {
    expect(linkTarget(from, "../repo-one/main.go", idx)).toEqual({ kind: "file", path: "repo-one/main.go" });
    expect(linkTarget(from, "https://example.test/x", idx)).toEqual({ kind: "outside", url: "https://example.test/x" });
    expect(linkTarget(from, "#goals", idx)).toEqual({ kind: "here", section: "goals" });
  });
  it("nothing outside the root or of another scheme", () => {
    expect(linkTarget(from, "../../etc/passwd", idx)).toEqual({ kind: "none" });
    expect(linkTarget(from, "/etc/passwd", idx)).toEqual({ kind: "none" });
    expect(linkTarget(from, "javascript:alert(1)", idx)).toEqual({ kind: "none" });
    expect(linkTarget(from, "", idx)).toEqual({ kind: "none" });
  });
  it("from a record, relative to its folder", () => {
    expect(linkTarget("working-on/decisions/0012-draw-the-change-on-the-map.md", "../../docs/reader.md", idx)).toEqual({ kind: "spec", path: "docs/reader.md", section: "" });
  });
});
