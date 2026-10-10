import { describe, expect, it } from "vitest";
import { foldCountName, foldLabel, stripFolds } from "./folds";

describe("the strip's folds (leftovers-16 F1)", () => {
  it("names each fold by its word and count, asleep first", () => {
    const f = stripFolds(["a", "b"], ["c"]);
    expect(f.map((x) => [x.fold, x.n, x.name])).toEqual([
      ["asleep", 2, "Asleep, 2 initiatives"],
      ["archived", 1, "Archived, 1 initiative"],
    ]);
    expect(f[0].title).toBe("Asleep, 2 initiatives: a, b. Wake one from Initiatives");
    expect(f[1].title).toBe("Archived, 1 initiative: c");
  });

  it("drops a fold that holds none", () => {
    expect(stripFolds([], ["c", "d"]).map((x) => x.name)).toEqual(["Archived, 2 initiatives"]);
    expect(stripFolds(["a"], []).map((x) => x.name)).toEqual(["Asleep, 1 initiative"]);
    expect(stripFolds([], [])).toEqual([]);
  });

  it("says the fold's word with or without its count", () => {
    expect(foldCountName("asleep", 11)).toBe("Asleep, 11 initiatives");
    expect(foldLabel("archived", 3)).toBe("Archived (3)");
    expect(foldLabel("asleep")).toBe("Asleep");
  });
});
