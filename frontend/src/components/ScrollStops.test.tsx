import { describe, expect, it } from "vitest";
import cardSrc from "./CardDrawer.tsx?raw";
import roleSrc from "./RoleDrawer.tsx?raw";
import ruleSrc from "./RuleDecisionBox.tsx?raw";
import floatSrc from "./FloatList.tsx?raw";
import headerSrc from "./InitiativeHeader.tsx?raw";
import helpSrc from "./HelpView.tsx?raw";
// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readFileSync } from "node:fs";

// S4 (leftovers-26 FR-2, FR-3; tab-reaches-links A3 §1). Each region the
// edge hooks watch hands useScrollEdges its name, so the one measurement
// makes it a stop while it scrolls (scrollStop, tested in lib). No DOM
// library here: the wiring is read from the source, the words from
// regionName (useScrollEdges.test.ts).
describe("S4: every scroll region is named where it is watched", () => {
  const cases: Array<[string, string, RegExp]> = [
    ["CardDrawer", cardSrc, /useScrollEdges\(scroller, open, regionName\.cardBody\(/],
    ["RoleDrawer", roleSrc, /useScrollEdges\(scroller, open, regionName\.roleBody\(role\?\.name/],
    ["RuleDecisionBox", ruleSrc, /useScrollEdges\(record, withRecord, regionName\.record\(d\.number, d\.title\)\)/],
    ["FloatList", floatSrc, /useScrollEdges\(scroller, open, regionName\.floatList\)/],
    ["InitiativeHeader", headerSrc, /useScrollEdges\(openRef, headerOpen, regionName\.headerOpen\(i\.id\)\)/],
    ["HelpView", helpSrc, /useScrollEdges\(body, !!html, \{ labelledBy: titleId \}\)/],
  ];
  for (const [name, src, call] of cases) it(name, () => expect(src).toMatch(call));

  it("Help is labelled by its visible heading, and its code blocks are no stop until they scroll", () => {
    expect(helpSrc).toContain('<h1 id={titleId} className="help-title">Help</h1>');
    expect(helpSrc).not.toContain('setAttribute("tabindex"');
  });

  it("the header's open area is the id its Details button controls", () => {
    expect(headerSrc).toContain("aria-controls={`ihead-open-${i.id}`}");
    expect(headerSrc).toContain("id={`ihead-open-${i.id}`}");
  });

  it("each region's ring sits inside its box", () => {
    const css = (f: string) => readFileSync(new URL(`../styles/${f}`, import.meta.url), "utf8") as string;
    expect(css("global.css")).toContain(".modal.card-back > .modal-body:focus-visible { outline-offset: -2px; }");
    expect(css("global.css")).toContain(".markdown pre:focus-visible, .markdown table:focus-visible { outline-offset: -2px; }");
    expect(css("help.css")).toContain(".help-doc:focus-visible { outline-offset: -2px; }");
    expect(css("rule-box.css")).toContain(".rb .rb-record:focus-visible { outline-offset: -2px; }");
    expect(css("shell.css")).toContain(".ihead-open:focus-visible { outline-offset: -2px; }");
  });
});
