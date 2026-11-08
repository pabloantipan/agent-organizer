// leftovers-73 V1 (FR-1, FR-2; run-report Amendment 9, AR35 amended, AR37;
// design system, comma lists): a link in a comma list (a track's `left`) is
// inline text: its ring is drawn inset, so it crosses no name, the next
// item's included, and it takes no 24 px minimum, only its 4 px padding, so a
// one-letter slug reads `a, b`. The progress rows' and the waits line's card
// links keep AR28's 24 px.
(globalThis as { process?: { env: Record<string, string> } }).process!.env.TZ = "UTC";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { service } from "../../wailsjs/go/models";
import sample from "./runreport.fixtures/expected.json?raw";

vi.mock("../stores/board.store", () => ({ useBoard: () => ({}) }));
vi.mock("../../wailsjs/go/main/App", () => ({}));

const { RunTracks } = await import("./RunTracks");
const fs: { readFileSync(p: string, enc: "utf8"): string } = await import("node:" + "fs");
const css = fs.readFileSync(new URL("../styles/runreport.css", import.meta.url).pathname, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

const report = JSON.parse(sample) as service.FactoryReport;
const nav = { card: vi.fn(), decision: vi.fn(), wave: vi.fn() };
function listed(left: string[], toCut: string[], waits: { what: string; who: string; from: string }[] = []): string {
  const [, build] = report.tracks!.tracks!;
  const t = { ...build, done_cards: [], open_cards: left, to_cut: toCut, passed: 1, planned: 4, pct: 25, left, waits };
  const r = { ...report, tracks: { ...report.tracks!, tracks: [t] } } as unknown as service.FactoryReport;
  return renderToStaticMarkup(<RunTracks report={r} nav={nav} />);
}
/** The declarations of the one rule whose selector list is exactly `sel`. */
function rule(sel: string): Record<string, string> {
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = new RegExp(String.raw`(?:^|\n)` + esc + String.raw` \{([^}]*)\}`).exec(css);
  expect(m, `rule ${sel}`).not.toBeNull();
  return Object.fromEntries(m![1].split(";").map((d) => d.trim()).filter(Boolean).map((d) => { const i = d.indexOf(":"); return [d.slice(0, i).trim(), d.slice(i + 1).trim()]; }));
}

describe("leftovers-73 V1 (FR-1, FR-2): a comma list's links are inline text", () => {
  it("marks every link of a `left` list as inline, and only those", () => {
    const html = listed(["a", "f"], [], [{ what: "a", who: "talos", from: "a depends_on" }]);
    const frac = /<span class="rt-frac">(.*?)<\/span><\/li>/.exec(html)![1];
    expect([...frac.matchAll(/<button type="button" class="([^"]*)">/g)].map((m) => m[1])).toEqual(["rr-card rr-inline", "rr-card rr-inline"]);
    const waits = /<span class="rt-waits">(.*?)<\/span><span class="rt-frac">/.exec(html)![1];
    expect(waits).toContain('class="rr-card"');
    expect(waits).not.toContain("rr-inline");
  });
  it("reads a, f (not cut) with a link before a not-cut item", () => {
    const frac = /<span class="rt-frac">(.*?)<\/span><\/li>/.exec(listed(["a", "f"], ["f"]))![1];
    expect(frac).toContain('<button type="button" class="rr-card rr-inline">a</button><span class="rt-comma">,</span> <span class="rt-tocut">f (not cut)</span>');
    expect(frac.replace(/<[^>]+>/g, "")).toBe("1/4 · left a, f (not cut)");
  });
  it("draws the comma-list link's focus ring inset: outline-offset -2px (FR-1, AR35)", () => {
    expect(rule(".rr-card.rr-inline:focus-visible")["outline-offset"]).toBe("-2px");
  });
  it("takes no minimum width on a comma-list link, only the 4 px inline padding (FR-2, AR37)", () => {
    const inline = rule(".rr-card.rr-inline");
    expect(inline["min-width"]).toBe("0");
    expect(inline["padding-inline"] ?? rule(".rr-card")["padding-inline"]).toBe("var(--space-1)");
  });
  it("keeps the 24 px minimum on the progress rows' and the waits line's card links (AR28)", () => {
    expect(rule(".rr-card")["min-width"]).toBe("24px");
    expect(css).not.toMatch(/\.rt-waitline[^{]*\.rr-card[^{]*\{[^}]*min-width/);
    expect(css).not.toMatch(/(?:^|\n)\.rr-card(?::[\w-]+)? \{[^}]*min-width: 0/);
  });
});
