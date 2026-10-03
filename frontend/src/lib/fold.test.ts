import { describe, expect, it } from "vitest";
import { HEADER_KEY, storedHeaderOpen, storeFolded, storeHeaderOpen } from "./fold";

const memory = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
};

describe("the header's stored fold (initiative-header FR-11, FR-19)", () => {
  it("reads folded when nothing is stored", () => {
    expect(storedHeaderOpen(memory())).toBe(false);
  });

  it("a landing stores folded and it reads back folded, over an open Details", () => {
    const s = memory();
    expect(storeHeaderOpen(true, s)).toBe(true);
    expect(storedHeaderOpen(s)).toBe(true);
    expect(storeFolded(s)).toBe(false);
    expect(s.m.get(HEADER_KEY)).toBe("0");
    expect(storedHeaderOpen(s)).toBe(false);
  });

  it("only Details stores open again", () => {
    const s = memory();
    storeFolded(s);
    storeHeaderOpen(true, s);
    expect(storedHeaderOpen(s)).toBe(true);
  });

  it("a storage that throws reads folded and drops the write", () => {
    const broken = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
    expect(storedHeaderOpen(broken)).toBe(false);
    expect(storeFolded(broken)).toBe(false);
    expect(storeHeaderOpen(true, broken)).toBe(true);
  });

  it("no storage at all reads folded", () => {
    expect(storedHeaderOpen(undefined)).toBe(false);
  });
});
