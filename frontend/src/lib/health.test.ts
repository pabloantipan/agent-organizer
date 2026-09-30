import { describe, expect, it } from "vitest";
import { peopleLabel } from "./health";

describe("peopleLabel", () => {
  it("names People, then the counts the toggle shows", () => {
    expect(peopleLabel({ seats: 3, live: 2, capped: 0, deaf: 1 })).toBe("People, 3 seats, 2 live, 1 deaf");
  });
  it("leaves out counts at zero and says one seat", () => {
    expect(peopleLabel({ seats: 1, live: 0, capped: 0, deaf: 0 })).toBe("People, 1 seat");
  });
  it("keeps capped apart from deaf, capped first as on the face", () => {
    expect(peopleLabel({ seats: 4, live: 3, capped: 1, deaf: 1 })).toBe("People, 4 seats, 3 live, 1 capped, 1 deaf");
  });
});
