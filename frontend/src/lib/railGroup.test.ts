import { describe, expect, it } from "vitest";
import { clientGroups, NO_CLIENT, NO_CLIENT_LONG, railGroupLabel, renameGroup, savedGroups, SEED_NO_CLIENT, takenBy, takenLine } from "./railGroup";

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

// leftovers-78 V1 (FR-1, AR43): the seed's label takes the groups it stands
// among: beside a group called `No client` (trimmed, any case) it reads
// `Initiatives with no client`, otherwise `No client`.
describe("leftovers-78 V1 (FR-1, AR43): the seed gives way to a client called No client", () => {
  const seed = { name: "", seed: SEED_NO_CLIENT, initiatives: ["a"] };
  it("reads No client alone", () => {
    expect(railGroupLabel(seed, [seed])).toBe("No client");
    expect(railGroupLabel(seed)).toBe("No client");
  });
  it("reads Initiatives with no client beside a client group ` no CLIENT `", () => {
    const among = [seed, { name: " no CLIENT ", initiatives: ["b"] }];
    expect(NO_CLIENT_LONG).toBe("Initiatives with no client");
    expect(railGroupLabel(seed, among)).toBe("Initiatives with no client");
    expect(railGroupLabel(among[1], among)).toBe(" no CLIENT ");
  });
  it("reads No client beside a group named misc", () => {
    expect(railGroupLabel(seed, [seed, { name: "misc", initiatives: ["b"] }])).toBe("No client");
  });
  it("reads a renamed seed by its name beside No client", () => {
    expect(railGroupLabel({ ...seed, name: "misc" }, [seed, { name: "No client" }])).toBe("misc");
  });
});

// leftovers-78 V2 (FR-2, AR43): Rename refuses a name another group shows
// (trimmed, any case), naming that group; nothing is written.
describe("leftovers-78 V2 (FR-2, AR43): Rename refuses a name another group shows", () => {
  it("refuses ` ACME ` for misc while acme exists", () => {
    const groups = [{ name: "misc", initiatives: ["a"] }, { name: "acme", initiatives: ["b"] }];
    expect(takenBy(groups, 0, " ACME ")).toBe("acme");
    expect(takenLine("acme", "misc")).toBe("A group is already called acme. Type another name, or press Escape to keep misc.");
    expect(renameGroup(groups, 0, " ACME ")).toBeNull();
  });
  it("refuses `no client` for the seed while a client group No client exists", () => {
    const groups = [{ name: "", seed: SEED_NO_CLIENT, initiatives: ["a"] }, { name: "No client", initiatives: ["b"] }];
    expect(takenBy(groups, 0, "no client")).toBe("No client");
    expect(takenLine(takenBy(groups, 0, "no client")!, "No client")).toBe("A group is already called No client. Type another name, or press Escape to keep No client.");
    expect(renameGroup(groups, 0, "no client")).toBeNull();
  });
  it("refuses `no client` for a person's group while the seed reads No client, and the seed's long label too", () => {
    const groups = [{ name: "misc", initiatives: ["a"] }, { name: "", seed: SEED_NO_CLIENT, initiatives: ["b"] }];
    expect(takenBy(groups, 0, "NO CLIENT")).toBe("No client");
    const beside = [{ name: "misc", initiatives: ["a"] }, { name: "", seed: SEED_NO_CLIENT, initiatives: ["b"] }, { name: "No client", initiatives: ["c"] }];
    expect(takenBy(beside, 0, "initiatives with no client")).toBe("Initiatives with no client");
  });
  it("lets a group take its own name in another case", () => {
    const groups = [{ name: "acme", initiatives: ["a"] }, { name: "misc", initiatives: ["b"] }];
    expect(takenBy(groups, 0, "ACME")).toBeNull();
    expect(renameGroup(groups, 0, "ACME")).toEqual([{ name: "ACME", initiatives: ["a"] }, groups[1]]);
  });
});

// leftovers-78 V3 (FR-3, AR44): the seed renamed `misc`, then ` No Client `:
// the name is misc, then empty, the app's label again.
describe("leftovers-78 V3 (FR-3, AR44): renaming the seed to No client clears its name", () => {
  it("stores misc, then an empty name", () => {
    const start = [{ name: "acme", initiatives: ["a"] }, { name: "", seed: SEED_NO_CLIENT, initiatives: ["b"] }];
    const misc = renameGroup(start, 1, "misc")!;
    expect(misc[1]).toEqual({ name: "misc", seed: SEED_NO_CLIENT, initiatives: ["b"] });
    const back = renameGroup(misc, 1, " No Client ")!;
    expect(back[1]).toEqual({ name: "", seed: SEED_NO_CLIENT, initiatives: ["b"] });
    expect(railGroupLabel(back[1], back)).toBe("No client");
  });
  it("stores No client as written on a person's group when nothing shows it", () => {
    expect(renameGroup([{ name: "misc", initiatives: ["a"] }], 0, "No client")).toEqual([{ name: "No client", initiatives: ["a"] }]);
  });
});

// leftovers-78 V4 (FR-5): a stored seed holding a plus a legacy `other`
// holding b and a (both no client) save as one seed holding a, b.
describe("leftovers-78 V4 (FR-5): one seeded group is ever saved", () => {
  const clientOf = (id: string) => ({ a: "", b: "", c: "  ", k: "acme" } as Record<string, string>)[id];
  it("merges a legacy other into the stored seed, appended in order, none twice", () => {
    const groups = [{ name: "", seed: SEED_NO_CLIENT, initiatives: ["a"] }, { name: "other", initiatives: ["b", "a"] }];
    expect(savedGroups(groups, clientOf)).toEqual([{ name: "", seed: SEED_NO_CLIENT, initiatives: ["a", "b"] }]);
  });
  it("merges into a stored seed standing after the legacy group, keeping its name", () => {
    const groups = [{ name: "Other", initiatives: ["b"] }, { name: "acme", initiatives: ["k"] }, { name: "misc", seed: SEED_NO_CLIENT, initiatives: ["a"] }];
    expect(savedGroups(groups, clientOf)).toEqual([{ name: "acme", initiatives: ["k"] }, { name: "misc", seed: SEED_NO_CLIENT, initiatives: ["a", "b"] }]);
  });
  it("makes the first legacy group the seed when none is stored, merging a second", () => {
    const groups = [{ name: "other", initiatives: ["a"] }, { name: "Other", initiatives: ["b", "a"] }];
    expect(savedGroups(groups, clientOf)).toEqual([{ name: "", seed: SEED_NO_CLIENT, initiatives: ["a", "b"] }]);
  });
  it("counts a client of spaces as no client", () => {
    expect(savedGroups([{ name: "other", initiatives: ["c"] }], clientOf)).toEqual([{ name: "", seed: SEED_NO_CLIENT, initiatives: ["c"] }]);
  });
});

// leftovers-78 FR-4 (AR45): Group by client puts a client blank or of spaces
// in the seed and trims a padded one; no group has a blank header.
describe("leftovers-78 FR-4 (AR45): a blank client is no client", () => {
  it("seeds the blank and spaced clients into the seed", () => {
    const groups = clientGroups([{ id: "a", client: "  " }, { id: "b", client: "" }, { id: "c", client: " acme " }, { id: "d", client: "acme" }]);
    expect(groups).toEqual([{ name: "", seed: SEED_NO_CLIENT, initiatives: ["a", "b"] }, { name: "acme", initiatives: ["c", "d"] }]);
    expect(groups.map((g) => railGroupLabel(g, groups).trim()).every(Boolean)).toBe(true);
  });
});

// leftovers-79 V2 (FR-2, AR47): the refusal line says how to leave, the
// group's current name last.
describe("leftovers-79 V2 (FR-2, AR47): the refusal line says the way out", () => {
  it("reads the full sentence for label No client, current name misc", () => {
    expect(takenLine("No client", "misc")).toBe("A group is already called No client. Type another name, or press Escape to keep misc.");
  });
  it("names the taken group's label and the current name as the rail shows them", () => {
    const groups = [{ name: "misc", initiatives: ["a"] }, { name: "", seed: SEED_NO_CLIENT, initiatives: ["b"] }];
    expect(takenLine(takenBy(groups, 0, " no CLIENT ")!, railGroupLabel(groups[0], groups))).toBe("A group is already called No client. Type another name, or press Escape to keep misc.");
  });
});
