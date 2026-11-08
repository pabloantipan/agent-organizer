import { describe, expect, it } from "vitest";
import { clientGroups, NO_CLIENT, railGroupLabel, renameGroup, savedGroups, SEED_NO_CLIENT } from "./railGroup";

const fs: { readFileSync(p: string, enc: "utf8"): string; readdirSync(p: string, o: { recursive: true }): string[] } = await import("node:" + "fs");

// leftovers-77 V1 (FR-2, AR42): Group by client seeds one group per client
// as written and one seeded group, keyed by `seed`, for the initiatives with
// no client; no client name joins it, `other` and `Other` included.
describe("leftovers-77 V1 (FR-2, AR42): the seed is keyed, not named", () => {
  it("seeds acme, other, Other and the seeded group holding the two with none", () => {
    const entries = [
      { id: "a", client: "acme" }, { id: "b", client: "" }, { id: "c", client: "other" },
      { id: "d", client: "Other" }, { id: "e", client: "" },
    ];
    expect(clientGroups(entries)).toEqual([
      { name: "acme", initiatives: ["a"] },
      { name: "", seed: SEED_NO_CLIENT, initiatives: ["b", "e"] },
      { name: "other", initiatives: ["c"] },
      { name: "Other", initiatives: ["d"] },
    ]);
  });
  it("seeds no seeded group when every initiative has a client, and none from nothing", () => {
    expect(clientGroups([{ id: "a", client: "acme" }])).toEqual([{ name: "acme", initiatives: ["a"] }]);
    expect(clientGroups([])).toEqual([]);
  });
});

// leftovers-77 V2 (FR-2, FR-5, AR40): the label reads `No client` for the
// seeded group with an empty name, else the name exactly as stored.
describe("leftovers-77 V2 (FR-2, FR-5, AR40): the rail's group label", () => {
  it("reads No client for the seed with an empty name", () => {
    expect(NO_CLIENT).toBe("No client");
    expect(railGroupLabel({ name: "", seed: SEED_NO_CLIENT })).toBe("No client");
  });
  it("reads a renamed seed by its name", () => {
    expect(railGroupLabel({ name: "misc", seed: SEED_NO_CLIENT })).toBe("misc");
  });
  it("reads an unseeded other, Other and every other name as stored", () => {
    for (const n of ["other", "Other", "No client", "misc", "Acme", ""]) expect(railGroupLabel({ name: n })).toBe(n);
  });
});

// leftovers-77 V3 (FR-3, AR41): the rename field's save. Unchanged (`No
// client` on the seed with an empty name) writes nothing, so the name stays
// empty; any other text is stored as written, seed kept.
describe("leftovers-77 V3 (FR-3, AR41): saving the rename field", () => {
  const groups = [{ name: "acme", initiatives: ["a"] }, { name: "", seed: SEED_NO_CLIENT, initiatives: ["b"] }];
  it("writes nothing when the seed is saved unchanged", () => {
    expect(renameGroup(groups, 1, "No client")).toBeNull();
    expect(renameGroup(groups, 1, "  No client ")).toBeNull();
    expect(renameGroup(groups, 1, "")).toBeNull();
  });
  it("stores misc as written, keeping the seed", () => {
    expect(renameGroup(groups, 1, "misc")).toEqual([groups[0], { name: "misc", seed: SEED_NO_CLIENT, initiatives: ["b"] }]);
  });
  it("renames a person's group as before", () => {
    expect(renameGroup(groups, 0, "acme")).toBeNull();
    expect(renameGroup(groups, 0, "Acme")).toEqual([{ name: "Acme", initiatives: ["a"] }, groups[1]]);
  });
});

// leftovers-77 V4 (FR-4): a group stored before the seed, named exactly
// `other` or `Other`, whose every initiative has no client, is saved as the
// seed; any other group is saved as stored.
describe("leftovers-77 V4 (FR-4): the legacy seed is rewritten when the groups are saved", () => {
  const clientOf = (id: string) => ({ n1: "", n2: "", o: "Other", w: "other", k: "acme" } as Record<string, string>)[id];
  it("saves a stored other holding only no-client initiatives as the seed", () => {
    expect(savedGroups([{ name: "other", initiatives: ["n1", "n2"] }], clientOf)).toEqual([{ name: "", seed: SEED_NO_CLIENT, initiatives: ["n1", "n2"] }]);
    expect(savedGroups([{ name: "Other", initiatives: ["n1"] }], clientOf)).toEqual([{ name: "", seed: SEED_NO_CLIENT, initiatives: ["n1"] }]);
  });
  it("leaves a stored Other holding a client Other initiative unchanged", () => {
    expect(savedGroups([{ name: "Other", initiatives: ["o"] }], clientOf)).toEqual([{ name: "Other", initiatives: ["o"] }]);
    expect(savedGroups([{ name: "other", initiatives: ["w", "n1"] }], clientOf)).toEqual([{ name: "other", initiatives: ["w", "n1"] }]);
  });
  it("leaves every other group, a seeded one, an empty other and an unknown member as stored", () => {
    const keep = [
      { name: "misc", initiatives: ["n1"] }, { name: "OTHER", initiatives: ["n2"] }, { name: "other", initiatives: [] },
      { name: "other", initiatives: ["gone"] }, { name: "misc", seed: SEED_NO_CLIENT, initiatives: ["n1"] },
    ];
    expect(savedGroups(keep, clientOf)).toEqual(keep);
  });
  it("drops every field but name, initiatives and seed", () => {
    expect(savedGroups([{ name: "acme", initiatives: ["k"], extra: 1 } as never], clientOf)).toEqual([{ name: "acme", initiatives: ["k"] }]);
  });
});

// leftovers-77 V5 (FR-5): the label helper's name is exported once in the
// frontend sources (lib/review.ts exports a different `groupName`).
describe("leftovers-77 V5 (FR-5): one export of the label helper", () => {
  it("finds railGroupLabel exported by one module only", () => {
    const root = new URL("..", import.meta.url).pathname;
    const hits: string[] = [];
    for (const f of fs.readdirSync(root, { recursive: true })) {
      if (!/\.(ts|tsx)$/.test(f)) continue;
      if (/export\s+(function|const|let)\s+railGroupLabel\b|export\s*\{[^}]*\brailGroupLabel\b/.test(fs.readFileSync(root + f, "utf8"))) hits.push(f);
    }
    expect(hits).toEqual(["lib/railGroup.ts"]);
  });
});
