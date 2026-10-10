import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { AgentList } from "../components/AgentList";
import { Crew } from "../components/Crew";
import type { Agent, AgentGroup, AgentsView } from "../hooks/useWails";
import { useBoard } from "../stores/board.store";

// M1 (leftovers-16 FR-4, initiatives-view I16): an empty Memory cell has
// three words only, on an Agents row and on a crew seat: an off seat
// `Memory: not running`, a failed reading `Memory: could not be read`,
// before the first reading `Memory: reading…`. "Unknown" is never shown.

const GB = 1024 ** 3;
const agent = (over: Partial<Agent>): Agent => ({
  name: "n", short: "", session: "", pid: 0, state: "running", family: "", persona: "", cell: "", kind: "probe",
  watcher: "", deaf: false, capped: false, no_identity: false, undelivered: 0, tty: "s001", uptime: "1h", created: "",
  dir: "/r", context: undefined, mem_bytes: 0, ...over,
} as unknown as Agent);

const READ = { memory: { pressure: "normal", by_initiative: [] } } as unknown as AgentsView;
const FAILED = { memory: null, memory_reason: "vm_stat failed" } as unknown as AgentsView;
const feeds: [string, AgentsView | null][] = [["no reading yet", null], ["a failed reading", FAILED], ["a reading", READ]];

/** Every Memory cell in the markup: its text, title and accessible name. */
const cells = (html: string) =>
  [...html.matchAll(/<span class="a-mem num" title="([^"]*)" aria-label="([^"]*)">([^<]*)<\/span>/g)].map((m) => ({ title: m[1], name: m[2], text: m[3] }));

const off = agent({ name: "off", session: "s-off", pid: 0, state: "exited" });
const running = agent({ name: "on", session: "s-on", pid: 7, state: "running", mem_bytes: 1.4 * GB });
const list = () => renderToStaticMarkup(<AgentList agents={[off, running]} root="/r" readOnly={false} onMessage={() => undefined} />);
const crew = () => renderToStaticMarkup(<Crew group={{
  id: "init-a", cell: { project: "p", state: "running" }, retirable: [],
  crew: [
    { name: "po_ana", session: "p-probe-ana", agent: running, owes: [] },
    { name: "dev_bruno", session: "p-probe-bruno", agent: null, owes: [] },
    { name: "dev_carla", session: "p-probe-carla", agent: off, owes: [] },
  ],
} as unknown as AgentGroup} onMessage={() => undefined} />);

const expected = (feed: string) => (feed === "a reading" ? "Memory 1.4 GB" : feed === "a failed reading" ? "Memory: could not be read" : "Memory: reading…");

// A static render reads the store's server snapshot, which is its initial
// state object, so the reading under test is put there and taken back.
const withFeed = (agents: AgentsView | null) => { useBoard.getInitialState().agents = agents; };
afterEach(() => withFeed(null));

describe("M1: the Memory cell's three words", () => {
  for (const [label, feed] of feeds) {
    it(`an Agents row and a crew seat, with ${label}`, () => {
      withFeed(feed);
      const rows = cells(list());
      expect(rows).toHaveLength(2);
      expect(rows[0]).toEqual({ text: "—", name: "Memory: not running", title: "Memory: not running" });
      expect(rows[1].name).toBe(expected(label));
      const seats = cells(crew());
      expect(seats).toHaveLength(3);
      expect(seats[0].name).toBe(expected(label));
      for (const s of seats.slice(1)) expect(s).toEqual({ text: "—", name: "Memory: not running", title: "Memory: not running" });
      for (const c of [...rows, ...seats]) {
        if (c.text === "—") {
          expect(["Memory: not running", "Memory: could not be read", "Memory: reading…"]).toContain(c.name);
          expect(c.title).toBe(c.name);
        }
      }
      expect(list() + crew()).not.toMatch(/unknown/i);
    });
  }

  it("a running row with no figure yet reads Memory: reading…", () => {
    withFeed(READ);
    const rows = cells(renderToStaticMarkup(<AgentList agents={[agent({ pid: 9, mem_bytes: 0 })]} root="/r" readOnly onMessage={() => undefined} />));
    expect(rows).toEqual([{ text: "—", name: "Memory: reading…", title: "Memory: reading…" }]);
  });
});
