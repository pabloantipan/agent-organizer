import { useEffect, useRef } from "react";
import { MemoryStick } from "lucide-react";
import { EventsOn } from "../../wailsjs/runtime/runtime";
import { useBoard } from "../stores/board.store";
import { buttonName, buttonText, memoryState } from "../lib/memory";
import { MemoryPopover } from "./MemoryPopover";
import "../styles/memory.css";

/** Memory on this Mac in the top bar (docs/ux/specs/ram-indicator.md §1):
 *  the glyph and the free memory, quiet at normal, the magenta tone with the
 *  word at high, a filled chip at critical. It is a button, never a badge:
 *  it carries no count (Needs me is the one badge, FR-14). Pressing it opens
 *  the popover; the warning's click opens it too (§3, the "memory:open"
 *  event). */
export function MemoryButton() {
  const { agents, widthClass, memoryOpen, setMemoryOpen } = useBoard();
  const btn = useRef<HTMLButtonElement>(null);
  const state = memoryState(agents);
  const m = agents?.memory ?? null;
  const name = buttonName(state, m);

  useEffect(() => EventsOn("memory:open", () => useBoard.getState().setMemoryOpen(true)), []);

  // Closing hands focus back to the button (Focus and names: Closing).
  const close = (refocus: boolean) => {
    setMemoryOpen(false);
    if (refocus) btn.current?.focus();
  };

  return (
    <span className="memory">
      <button
        ref={btn}
        type="button"
        className={`ghost memory-btn ${state}`}
        aria-label={name}
        title={name}
        aria-haspopup="dialog"
        aria-expanded={memoryOpen}
        onClick={() => setMemoryOpen(!memoryOpen)}
      >
        <MemoryStick size={16} strokeWidth={1.5} aria-hidden="true" />
        <span className="memory-text num">{buttonText(state, m, widthClass === "compact")}</span>
      </button>
      {memoryOpen && <MemoryPopover opener={btn} onClose={close} />}
    </span>
  );
}
