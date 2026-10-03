import { describe, expect, it } from "vitest";
import { railCollapsedFor, roomyOf, signalsThatFit, widthClassOf } from "./width";

describe("widthClassOf", () => {
  it("puts each boundary in the class above it", () => {
    expect(widthClassOf(1024)).toBe("compact");
    expect(widthClassOf(1280)).toBe("compact");
    expect(widthClassOf(1439)).toBe("compact");
    expect(widthClassOf(1440)).toBe("regular");
    expect(widthClassOf(1512)).toBe("regular");
    expect(widthClassOf(1720)).toBe("regular");
    expect(widthClassOf(1919)).toBe("regular");
    expect(widthClassOf(1920)).toBe("regular");
    expect(widthClassOf(2199)).toBe("regular");
    expect(widthClassOf(2200)).toBe("wide");
    expect(widthClassOf(3440)).toBe("wide");
  });
});

describe("roomyOf", () => {
  it("is the top of regular only, from 1720", () => {
    expect(roomyOf(1719)).toBe(false);
    expect(roomyOf(1720)).toBe(true);
    expect(roomyOf(1920)).toBe(true);
    expect(roomyOf(2199)).toBe(true);
    expect(roomyOf(2200)).toBe(false);
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

describe("signalsThatFit", () => {
  it("shows every signal that fits on the line", () => {
    expect(signalsThatFit([60, 50, 40], 4, 158, 24)).toBe(3);
    expect(signalsThatFit([], 4, 10, 24)).toBe(0);
  });

  it("leaves room for the +N after the ones it shows", () => {
    // "+N" (24) + 4 + 60 + 4 + 50 = 142: two fit in 142, one in 140
    expect(signalsThatFit([60, 50, 40], 4, 140, 24)).toBe(1);
    expect(signalsThatFit([60, 50, 40], 4, 142, 24)).toBe(2);
  });

  it("keeps one signal when not even one fits with the +N", () => {
    expect(signalsThatFit([200, 50], 4, 100, 24)).toBe(1);
  });
});
