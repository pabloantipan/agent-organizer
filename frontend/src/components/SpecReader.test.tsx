import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { Contents, SpecOpenerView, useSpecReader } from "./SpecReader";
import { withAnchors } from "../lib/specReader";
import { marked } from "marked";
import initSrc from "./Initiatives.tsx?raw";
import headSrc from "./InitiativeHeader.tsx?raw";
import cardSrc from "./CardDrawer.tsx?raw";

// docs/specs/diagrams.md FR-7, FR-8: the openers. No DOM library here: the
// states are rendered to markup and the wiring is read from the sources.

afterEach(() => useSpecReader.setState({ initiative: null, stack: [], missing: {} }));

const opener = (p: Partial<Parameters<typeof SpecOpenerView>[0]> = {}) =>
  renderToStaticMarkup(<SpecOpenerView initiative="init-a" refText="docs/reader.md#the-scan-report" label="docs/reader.md#the-scan-report" local missing={false} {...p} />);

describe("FR-7: a spec's opener", () => {
  it("is a button named Read <path>", () => {
    expect(opener()).toBe('<button type="button" class="linkish sr-opener " aria-label="Read docs/reader.md#the-scan-report">docs/reader.md#the-scan-report</button>');
  });
  it("on another machine, the path with no press", () => {
    expect(opener({ local: false })).toBe("<span>docs/reader.md#the-scan-report</span>");
  });
});

describe("FR-8: a missing path reads missing and opens nothing", () => {
  it("has no button once the read said missing", () => {
    const html = opener({ missing: true });
    expect(html).not.toContain("<button");
    expect(html).toContain('<span class="sr-missing">missing</span>');
  });
  it("the store keys missing by initiative and path", () => {
    useSpecReader.setState({ missing: { "init-b:docs/reader.md": true } });
    const m = useSpecReader.getState().missing;
    expect(m["init-b:docs/reader.md"]).toBe(true);
    expect(m["init-a:docs/reader.md"]).toBeUndefined();
  });
});

describe("FR-7: the three openers open the reader, not the editor", () => {
  it("the Specs list in the initiative's detail", () => {
    expect(initSrc).toMatch(/<SpecOpener initiative=\{i\.id\} refText=\{f\}[^>]*exact \/>/);
    expect(initSrc).not.toMatch(/openInEditor\(`\$\{i\.path\}\/\$\{f\}`\)/);
  });
  it("the header's Specs", () => {
    expect(headSrc).toContain("<HeaderSpecs i={i} />");
    expect(headSrc).toMatch(/<SpecOpener initiative=\{i\.id\} refText=\{f\}[^>]*exact \/>/);
  });
  it("the card back's spec: link, with the reader mounted over it", () => {
    expect(cardSrc).toContain("<><CardBack /><SpecReader /></>");
    expect(cardSrc).toContain("<SpecOpener initiative={c.initiative_id} refText={c.spec}");
    expect(cardSrc).toContain("useSpecProbe(");
  });
});

describe("leftovers-38 O4 (D9): the map's Contents entry is heard as the one to read first", () => {
  const { contents } = withAnchors(marked.parse("# Spec\n\n## Problem\n\nx\n\n## Change on the map\n\ny\n", { async: false }) as string);
  const html = renderToStaticMarkup(<Contents items={contents} go={() => undefined} />);
  const buttons = [...html.matchAll(/<button[^>]*>(.*?)<\/button>/g)].map((m) => m[1]);
  /** A button's accessible name from its content: aria-hidden spans say nothing, sr-only ones are read. */
  const nameOf = (inner: string) => inner.replace(/<span[^>]*aria-hidden="true"[^>]*>.*?<\/span>/g, "").replace(/<[^>]+>/g, "");
  it("the entry's accessible name is exactly Change on the map, start here", () => {
    expect(buttons.map(nameOf)).toEqual(["Change on the map, start here", "Problem"]);
  });
  it("the ✎ stays drawn and aria-hidden, the suffix only screen-reader", () => {
    expect(buttons[0]).toBe('<span class="sr-map-mark" aria-hidden="true">✎</span>Change on the map<span class="sr-only">, start here</span>');
    expect(buttons[1]).toBe("Problem");
  });
});
