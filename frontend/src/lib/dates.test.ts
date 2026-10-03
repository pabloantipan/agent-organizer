import { describe, expect, it } from "vitest";
import { hasTime, parseISO, toISO } from "./dates";

describe("parseISO", () => {
  it("reads a date-only string as local midnight", () => {
    const d = parseISO("2026-10-05")!;
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()]).toEqual([2026, 9, 5, 0, 0]);
  });
  it("reads an RFC 3339 time with an offset to the instant", () => {
    expect(parseISO("2026-10-02T09:12:30-03:00")!.getTime()).toBe(Date.UTC(2026, 9, 2, 12, 12, 30));
    expect(parseISO("2026-10-02T12:12:30Z")!.getTime()).toBe(Date.UTC(2026, 9, 2, 12, 12, 30));
  });
  it("refuses what is neither", () => {
    for (const s of ["", null, undefined, "2026-10", "yesterday", "2026-13-45T99:00:00Z", "2026-10-02T09:12"]) expect(parseISO(s)).toBeNull();
  });
  it("keeps toISO's day for a date-only string", () => {
    expect(toISO(parseISO("2026-01-31")!)).toBe("2026-01-31");
  });
});

describe("hasTime", () => {
  it("is false for a date-only string and true for an RFC 3339 time", () => {
    expect(hasTime("2026-10-05")).toBe(false);
    expect(hasTime("2026-10-02T09:12:30-03:00")).toBe(true);
    expect(hasTime("2026-10-02T12:12:30Z")).toBe(true);
  });
  it("is false for nothing and for what parseISO refuses", () => {
    expect(hasTime(undefined)).toBe(false);
    expect(hasTime("2026-10-02T09:12")).toBe(false);
  });
});
