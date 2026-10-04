import { describe, expect, it } from "vitest";
import { dateWords, hasTime, parseISO, toISO } from "./dates";

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

describe("dateWords", () => {
  const now = new Date(2026, 9, 4);
  it("reads a day and a short month, without the year when it is this year", () => {
    expect(dateWords("2026-09-24", now)).toBe("24 Sep");
    expect(dateWords("2026-01-05", now)).toBe("5 Jan");
    expect(dateWords(new Date(2026, 11, 31), now)).toBe("31 Dec");
  });
  it("adds the year when it is not this year", () => {
    expect(dateWords("2025-09-24", now)).toBe("24 Sep 2025");
    expect(dateWords("2027-02-01", now)).toBe("1 Feb 2027");
  });
  it("reads an RFC 3339 time as its local day", () => {
    expect(dateWords(toISO(new Date(2026, 9, 2)) + "T09:12:30-03:00", now)).toMatch(/^[12] Oct$/);
  });
  it("shows what it cannot read as it was, and nothing as nothing", () => {
    expect(dateWords("someday", now)).toBe("someday");
    expect(dateWords("", now)).toBe("");
    expect(dateWords(undefined, now)).toBe("");
  });
});
