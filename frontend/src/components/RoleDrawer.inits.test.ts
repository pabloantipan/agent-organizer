import { describe, expect, it } from "vitest";
// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readFileSync } from "node:fs";

// E7 (leftovers-24 FR-11, tab-reaches-links T12). The ring sits on the
// padding edge (offset 0), 2px from the text, and the end margin keeps the
// following comma 2px clear of it (measured in the harness's WKWebView).
const rolesCss = readFileSync(new URL("../styles/roles.css", import.meta.url), "utf8") as string;

describe("E7: the drawer's initiative link ring clears the comma", () => {
  it("has 2px inline padding and room at its end for the ring", () => {
    expect(rolesCss).toMatch(/\.rd-init \{[^}]*padding-inline: 2px;[^}]*margin-inline-end: 4px;/);
  });

  it("draws the 2px ring on the padding edge", () => {
    expect(rolesCss).toMatch(/\.rd-init:focus-visible \{ outline: 2px solid var\(--focus-ring\); outline-offset: 0;/);
  });
});
