import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WatcherBadge } from "./ContextBar";
import { AgentList } from "./AgentList";
import { Crew } from "./Crew";
import type { Agent, AgentGroup } from "../hooks/useWails";

// V4 (leftovers-30 FR-6, rb-ui R1, launch-progress L12): the watcher badge
// counts the mail waiting for deaf and capped, as the person badge does, on
// an Agents row and in the crew block.
const text = (html: string) => html.replace(/<[^>]+>/g, "");

describe("V4: WatcherBadge draws · n waiting for deaf and capped", () => {
  it("draws it on the badge itself", () => {
    expect(text(renderToStaticMarkup(<WatcherBadge watcher="alive" deaf undelivered={3} />))).toBe("deaf · 3 waiting");
    expect(text(renderToStaticMarkup(<WatcherBadge watcher="alive" deaf capped undelivered={3} />))).toBe("capped · 3 waiting");
    expect(text(renderToStaticMarkup(<WatcherBadge watcher="alive" deaf undelivered={0} />))).toBe("deaf");
  });

  const seat = (name: string, deaf: boolean, capped: boolean) => ({ name, watcher: "alive", deaf, capped, undelivered: 3 });
  it("draws it on an Agents row", () => {
    const agents = [seat("dev_bruno", true, false), seat("po_ana", true, true)].map((s, i) =>
      ({ ...s, pid: 100 + i, state: "running", kind: "plain", session: `p-probe-${s.name}`, persona: s.name, dir: "/r", tty: "s001", uptime: "1m" }) as unknown as Agent);
    const html = text(renderToStaticMarkup(<AgentList agents={agents} root="/r" />));
    expect(html).toContain("deaf · 3 waiting");
    expect(html).toContain("capped · 3 waiting");
  });

  it("draws it in the crew block", () => {
    const group = { id: "init-a", cell: { project: "p", state: "running", agents: ["dev_bruno", "po_ana"] }, retirable: [], agents: [],
      crew: [seat("dev_bruno", true, false), seat("po_ana", true, true)] } as unknown as AgentGroup;
    const html = text(renderToStaticMarkup(<Crew group={group} />));
    expect(html).toContain("deaf · 3 waiting");
    expect(html).toContain("capped · 3 waiting");
  });
});
