import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AgentList } from "../components/AgentList";
import type { Agent } from "../hooks/useWails";
import { agentRow, agentTarget } from "./agentFocus";

// R5 (leftovers-35 FR-4): a memory session's Agents › finds its row by the
// agent's key, carried on the row as data-agent, not by its place in a
// list. Vitest runs in Node with no DOM library, so the DOM side is the
// rows AgentList really renders, read back into stand-in elements that
// answer the one selector shape a lookup can ask: by data-agent (a lookup
// by place would need querySelectorAll, which the stand-in does not have).

const agent = (over: Partial<Agent>): Agent => ({
  name: "n", short: "", session: "", pid: 0, state: "running", family: "", persona: "", cell: "", kind: "probe",
  watcher: "", deaf: false, capped: false, no_identity: false, undelivered: 0, tty: "s001", uptime: "1h", created: "",
  dir: "/r", context: undefined, mem_bytes: 0, ...over,
} as unknown as Agent);

type Row = { agent: string; label: string };

/** A section over the rendered list: each <li> with its data-agent and name. */
function section(html: string) {
  const rows: Row[] = [...html.matchAll(/<li\b([^>]*)>/g)].map((m) => ({
    agent: m[1].match(/data-agent="([^"]*)"/)?.[1] ?? "",
    label: m[1].match(/aria-label="([^"]*)"/)?.[1] ?? "",
  }));
  return {
    rows,
    querySelector: (q: string) => {
      const k = q.match(/^ul\.agents:not\(\.crew-seats\) > li\[data-agent="([^"]*)"\]$/)?.[1];
      return (k === undefined ? null : rows.find((r) => r.agent === k) ?? null) as never;
    },
  };
}

describe("R5: Agents › lands on the row whose key matches (leftovers-35 FR-4)", () => {
  const fox = agent({ session: "organizer-probe-fox", pid: 41, short: "fox" });
  const owl = agent({ session: "organizer-probe-owl", pid: 42, short: "owl" });
  // The feed carries fox then owl; the list draws owl then fox.
  const groups = [{ id: "organizer", agents: [fox, owl] }];
  const s = section(renderToStaticMarkup(<AgentList agents={[owl, fox]} root="/r" />));

  it("every row carries its agent's key", () => {
    expect(s.rows.map((r) => r.agent)).toEqual(["organizer-probe-owl#42", "organizer-probe-fox#41"]);
  });

  it("Agents › on the feed's second agent focuses its row, not the row at its index", () => {
    const t = agentTarget(groups, "organizer-probe-owl#42")!;
    const row = agentRow(s, t, (x) => x) as unknown as Row;
    expect(row.agent).toBe("organizer-probe-owl#42");
    expect(row).toBe(s.rows[0]);
    expect(row).not.toBe(s.rows[1]); // where the feed's index 1 would land
    expect(row.label).toMatch(/owl/);
  });

  it("an agent that is not drawn lands nowhere", () => {
    expect(agentRow(s, { group: "organizer", key: "gone#1" }, (x) => x)).toBeNull();
  });
});
