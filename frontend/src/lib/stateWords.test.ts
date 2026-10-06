import { describe, expect, it } from "vitest";
import { STATE_WORDS, stateWord } from "./stateWords";

describe("stateWord", () => {
  it("names each state the scan reports", () => {
    expect(stateWord("working")).toBe("working");
    expect(stateWord("running")).toBe("idle");
    expect(stateWord("shell")).toBe("shell");
    expect(stateWord("exited")).toBe("exited");
  });
  it("shows a state outside the map as itself", () => {
    expect(stateWord("paused")).toBe("paused");
    expect(stateWord("")).toBe("");
  });
  it("keeps one word per state", () => {
    expect(Object.keys(STATE_WORDS).sort()).toEqual(["exited", "running", "shell", "working"]);
  });
});
