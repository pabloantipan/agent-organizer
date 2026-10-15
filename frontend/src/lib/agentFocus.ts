/** Where a memory session's `Agents ›` lands (docs/ux/specs/ram-indicator.md
 *  §1): the Agents row of the agent with this id (`<session>#<pid>`, the key
 *  AgentList gives its rows and carries as `data-agent`). A crew seat's
 *  agent is drawn in the crew block, found by its seat; any other is a row
 *  of the group's AgentList (roster seats left out), found by its key, never
 *  by its place in a list (leftovers-35 FR-4); one outside every initiative
 *  in the unassigned group (group ""). */
export type AgentTarget = { group: string; seat: string } | { group: string; key: string };

type A = { session: string; pid: number; persona?: string };
type G = { id: string; agents?: A[] | null; cell?: { agents?: string[] | null } | null; crew?: { name: string; agent?: A | null }[] | null };

/** An agent's key: what AgentList keys its row by and writes as `data-agent`. */
export const agentKey = (a: A) => `${a.session}#${a.pid}`;

export function agentTarget(groups: G[] | null | undefined, agentId: string, unassigned?: A[] | null): AgentTarget | null {
  for (const g of groups ?? []) {
    const seat = (g.crew ?? []).find((s) => s.agent && agentKey(s.agent) === agentId);
    if (g.cell && seat) return { group: g.id, seat: seat.name };
    const listed = (g.agents ?? []).filter((a) => !a.persona || !g.cell?.agents?.includes(a.persona));
    if (listed.some((a) => agentKey(a) === agentId)) return { group: g.id, key: agentId };
  }
  // Outside every initiative: the unassigned group, group "".
  return (unassigned ?? []).some((a) => agentKey(a) === agentId) ? { group: "", key: agentId } : null;
}

/** The row a target names inside its group's section: a crew seat by its
 *  seat, any other agent by its key. Null when it is not drawn. */
export function agentRow(section: Pick<ParentNode, "querySelector">, t: AgentTarget, escape: (s: string) => string = CSS.escape): HTMLElement | null {
  return "seat" in t
    ? section.querySelector<HTMLElement>(`.crew-seats > li[data-seat="${escape(t.seat)}"]`)
    : section.querySelector<HTMLElement>(`ul.agents:not(.crew-seats) > li[data-agent="${escape(t.key)}"]`);
}
