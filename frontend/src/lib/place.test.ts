import { describe, expect, it } from "vitest";
import { markOf, placeOf, syncStale, STALE_MS } from "./place";

describe("placeOf (I22)", () => {
  it("puts an initiative under Initiatives and Settings under no place", () => {
    expect(placeOf("home")).toBe("home");
    expect(placeOf("initiatives")).toBe("initiatives");
    expect(placeOf("initiative")).toBe("initiatives");
    expect(placeOf("usage")).toBe("usage");
    expect(placeOf("settings")).toBeNull();
  });

  it("puts Help under no place, over any screen", () => {
    for (const s of ["home", "initiatives", "initiative", "usage", "settings"] as const) expect(placeOf(s, true)).toBeNull();
  });

  it("marks Initiatives the parent on an initiative and the current place on its own screen", () => {
    expect(markOf("initiatives", "initiative")).toBe("parent");
    expect(markOf("initiatives", "initiatives")).toBe("current");
    expect(markOf("home", "initiative")).toBeNull();
    expect(markOf("initiatives", "initiative", true)).toBeNull();
    expect(markOf("home", "settings")).toBeNull();
  });
});

describe("syncStale (Amendment 3 §2)", () => {
  const now = Date.parse("2026-10-10T12:00:00Z");
  it("is stale only past a day", () => {
    expect(syncStale(new Date(now - STALE_MS - 1000).toISOString(), now)).toBe(true);
    expect(syncStale(new Date(now - STALE_MS + 60000).toISOString(), now)).toBe(false);
  });
  it("does not call an unknown pull stale", () => {
    expect(syncStale(null, now)).toBe(false);
    expect(syncStale("0001-01-01T00:00:00Z", now)).toBe(false);
    expect(syncStale("garbage", now)).toBe(false);
  });
});
