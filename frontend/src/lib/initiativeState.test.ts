import { describe, expect, it } from "vitest";
import type { AgentGroup, AgentsView, BoardView } from "../hooks/useWails";
import type { merge, model, service } from "../../wailsjs/go/models";
import { initiativeStates } from "./initiativeState";

// Fixtures are plain objects: the generated classes carry methods the
// functions under test never call, so each builder casts once.
const initiative = (id: string, decisions: Partial<model.Decision>[] = []) =>
  ({ id, local: true, status: "active", decisions }) as unknown as merge.BoardInitiative;

const board = (...initiatives: merge.BoardInitiative[]) =>
  ({ board: { initiatives, columns: { now: [], blocked: [], next: [] } }, order: { resolved: {} } }) as unknown as BoardView;

const group = (id: string, g: Partial<AgentGroup> = {}) =>
  ({ id, cell: { human: "pablo", state: "running" }, threads: [], crew: [], agents: [], waves: [], ...g }) as unknown as AgentGroup;

const agents = (...groups: AgentGroup[]) => ({ groups }) as unknown as AgentsView;

const building = { building: [{ slug: "x" }] } as unknown as service.Wave;
const onCard = (state: string) => ({ card: "x", state }) as unknown as model.Agent;
const proposed = (number: string, owner: string) => ({ number, status: "proposed", owner, raised: "2026-09-01" });

const stateOf = (view: BoardView, a: AgentsView, id = "a") => initiativeStates(view, a).get(id);

describe("initiativeStates", () => {
  it("you: the initiative has a row in Needs me", () => {
    expect(stateOf(board(initiative("a", [proposed("0001", "pablo")])), agents(group("a")))).toBe("you");
  });

  it("you outranks executing", () => {
    const view = board(initiative("a", [proposed("0001", "pablo")]));
    expect(stateOf(view, agents(group("a", { waves: [building] })))).toBe("you");
  });

  it("executing: a wave has a card building", () => {
    expect(stateOf(board(initiative("a")), agents(group("a", { waves: [building] })))).toBe("executing");
  });

  it("executing: a working or running agent is joined to a card", () => {
    expect(stateOf(board(initiative("a")), agents(group("a", { agents: [onCard("working")] })))).toBe("executing");
    expect(stateOf(board(initiative("a")), agents(group("a", { agents: [onCard("running")] })))).toBe("executing");
  });

  it("not executing: an exited agent on a card, or an empty wave", () => {
    const g = group("a", { agents: [onCard("exited")], waves: [{ building: [] } as unknown as service.Wave] });
    expect(stateOf(board(initiative("a")), agents(g))).toBe("quiet");
  });

  it("business: a proposed record owned by neither the lead nor the FSE", () => {
    expect(stateOf(board(initiative("a", [proposed("0002", "business")])), agents(group("a")))).toBe("business");
  });

  it("executing outranks business", () => {
    const view = board(initiative("a", [proposed("0002", "business")]));
    expect(stateOf(view, agents(group("a", { waves: [building] })))).toBe("executing");
  });

  it("quiet: nothing waits and nothing runs; an FSE-owned record waits on nobody here", () => {
    expect(stateOf(board(initiative("a")), agents(group("a")))).toBe("quiet");
    expect(stateOf(board(initiative("a", [proposed("0003", "fse")])), agents(group("a")))).toBe("quiet");
  });
});
