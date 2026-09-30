import { describe, expect, it } from "vitest";
import { railCollapsedFor, roomyOf, widthClassOf } from "./width";

describe("widthClassOf", () => {
  it("puts each boundary in the class above it", () => {
    expect(widthClassOf(1024)).toBe("compact");
    expect(widthClassOf(1279)).toBe("compact");
    expect(widthClassOf(1280)).toBe("regular");
    expect(widthClassOf(1512)).toBe("regular");
    expect(widthClassOf(1919)).toBe("regular");
    expect(widthClassOf(1920)).toBe("wide");
    expect(widthClassOf(3440)).toBe("wide");
  });
});

describe("roomyOf", () => {
  it("is the top of regular only, from 1720", () => {
    expect(roomyOf(1719)).toBe(false);
    expect(roomyOf(1720)).toBe(true);
    expect(roomyOf(1919)).toBe(true);
    expect(roomyOf(1920)).toBe(false);
  });
});

describe("railCollapsedFor", () => {
  it("starts as the strip in compact when nothing is stored", () => {
    expect(railCollapsedFor(null, "compact")).toBe(true);
    expect(railCollapsedFor(null, "regular")).toBe(false);
    expect(railCollapsedFor(null, "wide")).toBe(false);
  });

  it("keeps the lead's stored choice in every class", () => {
    for (const cls of ["compact", "regular", "wide"] as const) {
      expect(railCollapsedFor("0", cls)).toBe(false);
      expect(railCollapsedFor("1", cls)).toBe(true);
    }
  });
});
