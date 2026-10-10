// Vitest blanks CSS modules, even with ?raw, so the stylesheet is read from
// disk; the frontend has no Node types (vitest runs in Node).
// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AgentList } from "../components/AgentList";
import { Crew } from "../components/Crew";
import type { Agent, AgentGroup } from "../hooks/useWails";

// U1 (leftovers-15 FR-4): every Agents row's Memory cell sits in one fixed,
// right-aligned track. No DOM library is a dependency here (no layout in
// jsdom either), so this proves the two halves the x rests on: in every
// row the cell is the last cell of the first line (only the health line,
// which takes its own line, may follow), and the stylesheet gives that
// cell a fixed width, no shrink, right alignment, and the row's right edge.
// Rows of one list share a width, so their cells share an x.

const GB = 1024 ** 3;
const agent = (over: Partial<Agent>): Agent => ({
  name: "n", short: "", session: "", pid: 0, state: "running", family: "", persona: "", cell: "", kind: "probe",
  watcher: "", deaf: false, capped: false, no_identity: false, undelivered: 0, tty: "s001", uptime: "1h", created: "",
  dir: "/r", context: undefined, mem_bytes: 0, ...over,
} as unknown as Agent);

const rows = (html: string) => [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map((m) => m[1]);

/** What follows the Memory cell inside a row, which must be nothing or the health line. */
function afterMemory(row: string): string {
  const m = /<span class="a-mem num"[^>]*>[^<]*<\/span>/.exec(row);
  expect(m, row).not.toBeNull();
  return row.slice(m!.index + m![0].length);
}

describe("U1: the Memory cell's fixed track", () => {
  it("is the last cell of every Agents row, whatever badges and actions come before it", () => {
    const agents = [
      agent({ name: "a", session: "s-a", pid: 11, state: "working", persona: "fse", mem_bytes: 1.4 * GB, context: { used_percent: 40 } as Agent["context"] }),
      agent({ name: "b", session: "", pid: 12, mem_bytes: 0.2 * GB }),
      agent({ name: "c", session: "s-c", pid: 0, state: "exited", dir: "/r/sub/dir" }),
      agent({ name: "d", session: "s-d", pid: 13, deaf: true, undelivered: 3, watcher: "stale" }),
    ];
    const list = (readOnly: boolean) => rows(renderToStaticMarkup(<AgentList agents={agents} root="/r" readOnly={readOnly} onMessage={() => undefined} />));
    for (const readOnly of [false, true]) {
      const rs = list(readOnly);
      expect(rs).toHaveLength(4);
      for (const r of rs) expect(afterMemory(r)).toMatch(/^(<span class="meta a-health">[^<]*<\/span>)?$/);
    }
  });

  it("is the last cell of every crew seat row", () => {
    const group = {
      id: "init-a", cell: { project: "p", state: "running" }, retirable: [],
      crew: [
        { name: "po_ana", session: "p-probe-ana", agent: agent({ session: "p-probe-ana", pid: 21, mem_bytes: 0.6 * GB }), owes: [] },
        { name: "dev_bruno", session: "p-probe-bruno", agent: null, deaf: true, owes: [{ id: "t1", subject: "x" }] },
      ],
    } as unknown as AgentGroup;
    const rs = rows(renderToStaticMarkup(<Crew group={group} onMessage={() => undefined} />));
    expect(rs).toHaveLength(2);
    for (const r of rs) expect(afterMemory(r)).toMatch(/^(<span class="meta a-health">[^<]*<\/span>)?$/);
  });

  it("has a fixed, right-aligned track at the row's right edge in the stylesheet", () => {
    const css: string = readFileSync(new URL("../styles/initiatives.css", import.meta.url), "utf8");
    const rule = (sel: string) => {
      const m = new RegExp(`(^|\\n)${sel.replace(/[.+>]/g, (c) => `\\${c}`)}\\s*\\{([^}]*)\\}`).exec(css);
      expect(m, sel).not.toBeNull();
      return m![2];
    };
    const mem = rule(".a-mem");
    expect(mem).toMatch(/flex:\s*0 0 64px/);
    expect(mem).toMatch(/width:\s*64px/);
    expect(mem).toMatch(/text-align:\s*right/);
    expect(mem).toMatch(/margin-left:\s*auto/);
    expect(rule(".a-actions + .a-mem")).toMatch(/margin-left:\s*0/);
    expect(rule(".agents li > .a-health")).toMatch(/flex:\s*1 0 100%/);
  });
});
