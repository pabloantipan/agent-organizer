import { describe, expect, it } from "vitest";
import { agentTarget } from "./agentFocus";

const groups = [
  { id: "camp", cell: { agents: ["po_andrea"] }, crew: [{ name: "po_andrea", agent: { session: "camp-probe-andrea", pid: 10, persona: "po_andrea" } }],
    agents: [{ session: "camp-probe-andrea", pid: 10, persona: "po_andrea" }, { session: "camp-probe-sup", pid: 11, persona: "sup1" }, { session: "", pid: 12 }] },
  { id: "organizer", agents: [{ session: "organizer-probe-a", pid: 20 }] },
];

describe("agentTarget", () => {
  it("finds a crew seat's agent by its seat", () => {
    expect(agentTarget(groups, "camp-probe-andrea#10")).toEqual({ group: "camp", seat: "po_andrea" });
  });
  it("finds any other agent by its place in the list, roster seats left out", () => {
    expect(agentTarget(groups, "camp-probe-sup#11")).toEqual({ group: "camp", index: 0 });
    expect(agentTarget(groups, "#12")).toEqual({ group: "camp", index: 1 });
    expect(agentTarget(groups, "organizer-probe-a#20")).toEqual({ group: "organizer", index: 0 });
  });
  it("is null for an agent that is gone", () => {
    expect(agentTarget(groups, "x#1")).toBeNull();
  });
});
