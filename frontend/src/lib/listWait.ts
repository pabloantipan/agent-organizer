/** How long a press that sent something waits for the agents feed to list
 *  it: two feed periods (10 s each). Crew's Start holds busy this long for
 *  its list (launch-progress §1), Conversations' Start and Branch for the
 *  new thread (leftovers-35 FR-3); one constant, never a copy. */
export const LIST_WAIT_MS = 20000;
