/** The word an agent's state shows, and its accessible name reads (WCAG
 *  2.5.3), wherever an agent or a session has a row: AgentList, Crew and the
 *  roles drawer (leftovers-11 FR-3; one map since leftovers-13 FR-4). A
 *  running agent that is not working is idle; a state outside the map shows
 *  as itself. */
export const STATE_WORDS: Readonly<Record<string, string>> = { working: "working", running: "idle", shell: "shell", exited: "exited" };

export const stateWord = (state: string) => STATE_WORDS[state] ?? state;
