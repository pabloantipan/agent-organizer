import { useEffect, useId, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { MemoryNotifications } from "../../wailsjs/go/main/App";
import { useBoard } from "../stores/board.store";
import { stateWord } from "../lib/stateWords";
import { agentsLine, freeLine, gb, memoryState, POPOVER_TOP, pressureLine, cardSeats, sessionHover, sessionRows, wasCriticalLine, type SessionRow } from "../lib/memory";

/** The memory popover (docs/ux/specs/ram-indicator.md §1 and States): this
 *  Mac's pressure, free memory and the agents' share, then the biggest agent
 *  sessions, each with `Agents ›` to its row. It shows and links; nothing in
 *  it stops, kills or signals a session (FR-7, M6). Focus goes into it on
 *  open, Tab stays inside, Escape and a click outside close it. */
export function MemoryPopover({ opener, onClose }: { opener: RefObject<HTMLButtonElement | null>; onClose: (refocus: boolean) => void }) {
  const { agents, view, openAgentRow } = useBoard();
  const box = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [more, setMore] = useState(false);
  const [notify, setNotify] = useState<string | null>(null);
  const state = memoryState(agents);
  const m = agents?.memory ?? null;
  const machine = view?.board.machine;

  useLayoutEffect(() => { box.current?.focus(); }, []);
  // Asked at each open: he may have switched them in System Settings.
  useEffect(() => { MemoryNotifications().then(setNotify, () => undefined); }, [state]);
  useEffect(() => {
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (box.current?.contains(t) || opener.current?.contains(t)) return;
      onClose(false);
    };
    document.addEventListener("pointerdown", down);
    return () => document.removeEventListener("pointerdown", down);
  }, [onClose, opener]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onClose(true);
    } else if (e.key === "Tab") {
      const els = Array.from(box.current?.querySelectorAll<HTMLElement>("button") ?? []);
      if (!els.length) { e.preventDefault(); return; }
      const i = els.indexOf(document.activeElement as HTMLElement);
      e.preventDefault();
      els[e.shiftKey ? (i <= 0 ? els.length - 1 : i - 1) : (i === els.length - 1 ? 0 : i + 1)].focus();
    }
  };

  // … N more unmounts on press: focus goes to the first row it revealed
  // (Focus and names: a control that unmounts hands focus on).
  useEffect(() => {
    if (!more) return;
    const next = Array.from(box.current?.querySelectorAll<HTMLElement>(".memory-session") ?? []).slice(POPOVER_TOP).map((li) => li.querySelector<HTMLElement>("button")).find(Boolean);
    (next ?? box.current)?.focus();
  }, [more]);

  const rows = sessionRows(agents, cardSeats(view?.board.columns));
  const shown = more ? rows : rows.slice(0, POPOVER_TOP);
  const was = m && wasCriticalLine(m);

  return (
    <div ref={box} className="memory-pop" role="dialog" aria-labelledby={titleId} tabIndex={-1} onKeyDown={onKey}>
      <div id={titleId} className="memory-pop-title">Memory · this Mac{machine ? ` (${machine})` : ""}</div>
      {state === "none" && <p className="memory-pop-note">Reading memory…</p>}
      {state === "failed" && <p className="memory-pop-note">Memory could not be read on this Mac.</p>}
      {m && (
        <>
          <dl className="memory-facts">
            <dt>Pressure</dt><dd className={`memory-pressure ${state}`}>{pressureLine(m, Date.now())}</dd>
            <dt>Free</dt><dd className="num">{freeLine(m)}</dd>
            <dt>Agents</dt><dd className="num">{agentsLine(m)}</dd>
          </dl>
          {was && <p className="memory-pop-note">{was}</p>}
          {notify === "off" && <p className="memory-pop-note">Notifications are off for Deltagos in System Settings.</p>}
          <div className="memory-pop-rule" />
          {rows.length === 0
            ? <p className="memory-pop-note">No agent sessions running. Other apps hold the memory.</p>
            : (
              <>
                <div className="memory-pop-head">Biggest agent sessions</div>
                {/* One name width for every row, the longest name's, so the
                    columns line up and the initiative gives way first. */}
                <ul className="memory-sessions" style={{ ["--ms-name-w" as string]: `${Math.max(...shown.map((r) => r.name.length))}ch` }}>
                  {shown.map((r) => <SessionLine key={r.agentId} r={r} go={openAgentRow} />)}
                </ul>
                {!more && rows.length > POPOVER_TOP && (
                  <button type="button" className="ghost tiny-btn memory-more" onClick={() => setMore(true)}>… {rows.length - POPOVER_TOP} more</button>
                )}
              </>
            )}
          <div className="memory-pop-rule" />
          <p className="memory-pop-foot">Stop a session from its Agents row. Deltagos never stops one by itself.</p>
        </>
      )}
    </div>
  );
}

/** One session: name (mono), initiative or —, state, memory, Agents ›. The
 *  initiative column gives way first when the window is narrow (1024 row);
 *  its text stays in the row's name. A session outside every initiative
 *  lands on the unassigned group of every initiative's Agents. */
function SessionLine({ r, go }: { r: SessionRow; go: (initiative: string, agentId: string) => void }) {
  const where = r.initiative || "outside every initiative";
  return (
    <li className="memory-session" aria-label={`${r.name}, ${where}, ${stateWord(r.state)}, ${gb(r.bytes)} GB`}>
      <span className="ms-name mono" title={sessionHover(r.name, r.agentId)}>{r.name}</span>
      <span className="ms-init mono" title={where}>{r.initiative || "—"}</span>
      <span className={`ms-state ${r.state}`}>{stateWord(r.state)}</span>
      <span className="ms-mem num">{gb(r.bytes)} GB</span>
      <button type="button" className="ghost tiny-btn ms-go" aria-label={`Agents ${r.name}`} title={r.initiative ? `${r.initiative} Agents, this session's row` : "Agents, outside every initiative, this session's row"} onClick={() => go(r.initiative, r.agentId)}>Agents ›</button>
    </li>
  );
}
