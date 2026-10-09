import { useBoard } from "../stores/board.store";
import { gb, memoryState, PANEL_TOP, panelLine, sessionRows } from "../lib/memory";
import "../styles/memory.css";

/** The floating icon panel's memory line (docs/ux/specs/ram-indicator.md
 *  §2), under the search field, at high and critical only: `Memory high ·
 *  3.1 GB free` (critical in the chip), then the three biggest sessions,
 *  name, memory and `Agents ›`. Choosing one is a pick, as choosing an
 *  initiative is: Deltagos full on this desktop, at that Agents row (one
 *  outside every initiative in the unassigned group). Nothing at normal. */
export function MemoryFloatLine({ onPick }: { onPick: (initiative: string, agentId: string) => void }) {
  const agents = useBoard((s) => s.agents);
  const state = memoryState(agents);
  const line = panelLine(state, agents?.memory);
  if (!line) return null;
  const rows = sessionRows(agents).slice(0, PANEL_TOP);
  return (
    <div className="fl-memory" role="group" aria-label={line}>
      <span className={`fl-memory-line ${state}`}>{line}</span>
      {rows.map((r) => {
        return (
          <button key={`${r.initiative}/${r.name}`} type="button" className="fl-memory-row" aria-label={`Agents ${r.name}, ${r.initiative || "outside every initiative"}, ${gb(r.bytes)} GB`} onClick={() => onPick(r.initiative, r.agentId)}>
            <span className="ms-name mono">{r.name}</span>
            <span className="ms-mem num">{gb(r.bytes)} GB</span>
            <span className="ms-go">Agents ›</span>
          </button>
        );
      })}
    </div>
  );
}
