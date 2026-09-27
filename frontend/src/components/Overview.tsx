import type { merge } from "../../wailsjs/go/models";

type BoardInitiative = merge.BoardInitiative;

/** Overview of one initiative. A stub: the redesign-overview card replaces
 *  the body (gates, exits, work summary, the FSE panel), not the signature. */
export function Overview({ initiative }: { initiative: BoardInitiative }) {
  return <div className="ov-stub mono">{initiative.id}</div>;
}
