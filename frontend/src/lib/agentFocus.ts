/** Where a memory session's `Agents ›` lands (docs/ux/specs/ram-indicator.md
 *  §1): the Agents row of the agent with this id (`<session>#<pid>`, the key
 *  AgentList gives its rows). A crew seat's agent is drawn in the crew block,
 *  found by its seat; any other is a row of the group's AgentList, found by
 *  its place in the list AgentsView hands it (roster seats left out); one
 *  outside every initiative by its place in the unassigned group (group ""). */
export type AgentTarget = { group: string; seat: string } | { group: string; index: number };

type A = { session: string; pid: number; persona?: string };
type G = { id: string; agents?: A[] | null; cell?: { agents?: string[] | null } | null; crew?: { name: string; agent?: A | null }[] | null };

const idOf = (a: A) => `${a.session}#${a.pid}`;

export function agentTarget(groups: G[] | null | undefined, agentId: string, unassigned?: A[] | null): AgentTarget | null {
  for (const g of groups ?? []) {
    const seat = (g.crew ?? []).find((s) => s.agent && idOf(s.agent) === agentId);
    if (g.cell && seat) return { group: g.id, seat: seat.name };
    const listed = (g.agents ?? []).filter((a) => !a.persona || !g.cell?.agents?.includes(a.persona));
    const index = listed.findIndex((a) => idOf(a) === agentId);
    if (index >= 0) return { group: g.id, index };
  }
  // Outside every initiative: the unassigned group, group "".
  const index = (unassigned ?? []).findIndex((a) => idOf(a) === agentId);
  return index >= 0 ? { group: "", index } : null;
}
