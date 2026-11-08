import { describe, expect, it } from "vitest";
import { clientGroups, groupName } from "./groupName";

// leftovers-74 V2 (FR-2, AR40): the seeded no-client group is the app's
// label and reads `Other`; a stored `other` (what the old seed wrote) reads
// `Other` too; any other name shows exactly as stored.
describe("leftovers-74 V2 (FR-2, AR40): the app's own group label reads Other", () => {
  it("reads a stored `other` as `Other`", () => {
    expect(groupName("other")).toBe("Other");
  });
  it("shows misc, Acme, Other and every other name exactly as stored", () => {
    for (const n of ["misc", "Acme", "Other", "OTHER", "others", " other", "acme", "ungrouped", ""]) expect(groupName(n)).toBe(n);
  });
  it("seeds a no-client initiative into `Other`, clients as written, in first-seen order", () => {
    const entries = [{ id: "a", client: "acme" }, { id: "b", client: "" }, { id: "c", client: "Acme" }, { id: "d", client: "acme" }, { id: "e", client: "" }];
    expect(clientGroups(entries)).toEqual([
      { name: "acme", initiatives: ["a", "d"] },
      { name: "Other", initiatives: ["b", "e"] },
      { name: "Acme", initiatives: ["c"] },
    ]);
  });
  it("seeds no `Other` group when every initiative has a client, and none from nothing", () => {
    expect(clientGroups([{ id: "a", client: "acme" }])).toEqual([{ name: "acme", initiatives: ["a"] }]);
    expect(clientGroups([])).toEqual([]);
  });
});
