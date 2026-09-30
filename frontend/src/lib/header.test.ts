import { describe, expect, it } from "vitest";
import type { model } from "../../wailsjs/go/models";
import { firstWaiting, phaseRuns, stagePosition, waitingChip } from "./header";

const st = (id: string, phase = "", extra: Partial<model.Stage> = {}) => ({ id, title: id, phase, ...extra }) as unknown as model.Stage;
const rec = (number: string, owner: string, raised: string, status = "proposed") => ({ number, owner, raised, status }) as unknown as model.Decision;
const shape = (r: ReturnType<typeof phaseRuns>) => r.runs.map((x) => `${x.phase}:${x.stages.map((s) => s.n).join(",")}`);

describe("phaseRuns", () => {
  it("names one phase once, in the label, with one run and no word", () => {
    const r = phaseRuns([st("a", "building"), st("b", "building"), st("c", "building")]);
    expect(r.single).toBe("building");
    expect(shape(r)).toEqual([":1,2,3"]);
  });

  it("splits mixed phases into runs in order", () => {
    const r = phaseRuns([st("a", "discovery"), st("b", "discovery"), st("c", "building"), st("d", "building")]);
    expect(r.single).toBeNull();
    expect(shape(r)).toEqual(["discovery:1,2", "building:3,4"]);
  });

  it("puts a stage with no phase in its neighbours' run", () => {
    const r = phaseRuns([st("a"), st("b", "discovery"), st("c"), st("d", "building"), st("e")]);
    expect(shape(r)).toEqual(["discovery:1,2,3", "building:4,5"]);
  });

  it("has no phase word at all when no stage has one", () => {
    const r = phaseRuns([st("a"), st("b"), st("c")]);
    expect(r.single).toBe("");
    expect(shape(r)).toEqual([":1,2,3"]);
  });

  it("counts a phase that returns as a new run", () => {
    const r = phaseRuns([st("a", "discovery"), st("b", "building"), st("c", "discovery")]);
    expect(shape(r)).toEqual(["discovery:1", "building:2", "discovery:3"]);
  });
});

describe("stagePosition", () => {
  it("says the current stage of all", () => {
    expect(stagePosition([st("a", "", { done: "2026-09-01" }), st("b", "", { current: true }), st("c")]).label).toBe("stage 2 of 3");
  });
  it("says all done when none is current", () => {
    expect(stagePosition([st("a", "", { done: "2026-09-01" })])).toEqual({ current: -1, label: "all 1 stages done" });
  });
});

describe("waitingChip", () => {
  it("is not drawn at zero", () => {
    expect(waitingChip([rec("0001", "pablo", "2026-09-01", "ruled")], "pablo")).toBeNull();
    expect(waitingChip(undefined, "pablo")).toBeNull();
  });
  it("says on you when every waiting record is the lead's or has no owner", () => {
    expect(waitingChip([rec("0001", "Pablo ", "2026-09-01"), rec("0002", "", "2026-09-02")], "pablo")).toBe("2 waiting on you");
  });
  it("says waiting when someone else owns one", () => {
    expect(waitingChip([rec("0001", "pablo", "2026-09-01"), rec("0002", "ana", "2026-09-02")], "pablo")).toBe("2 waiting");
  });
});

describe("firstWaiting", () => {
  it("is the oldest waiting record, the lower number on a tie", () => {
    expect(firstWaiting([rec("0005", "a", "2026-09-03"), rec("0004", "a", "2026-09-03"), rec("0001", "a", "2026-09-01", "ruled")])).toBe("0004");
    expect(firstWaiting([])).toBeNull();
  });
});
