import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { FileXCorner, MessageSquare, PencilRuler, SquareTerminal, Trash2, UserRoundX, Users } from "lucide-react";
import { Retire } from "./Retire";
import { api, type AgentGroup, type Seat } from "../hooks/useWails";
import type { model } from "../../wailsjs/go/models";
import { ContextBar, WatcherBadge } from "./ContextBar";
import { HealthWhy, MemoryCell } from "./AgentList";
import { healthState } from "../lib/health";
import { missingPersonas, personaMissing } from "../lib/queue";
import { useBoard } from "../stores/board.store";
import { escapeCloses, useConfirmFocus } from "../lib/focus";
import { stateWord } from "../lib/stateWords";
import { useLiveRegion, type Say } from "../lib/liveRegion";
import { busyButton, busyLabel } from "../lib/busy";
import { RetrySeat, SeenLaunch, StopStarting } from "../../wailsjs/go/main/App";
import { ClipboardSetText } from "../../wailsjs/runtime/runtime";
import type { main, service } from "../../wailsjs/go/models";
import "../styles/launch.css";

export type Launch = service.InitiativeLaunch;
export type SeatStart = service.SeatLaunch;
/** What one press of Bring crew up did (leftovers-33 FR-1). */
export type CrewResult = Pick<main.CrewResult, "lines" | "running">;

/** Whole seconds since a seat's try began (launch-progress §1): counted here
 *  from `started_at`, never sent per second by the service. */
export const elapsed = (s: Pick<SeatStart, "started_at">, now: number) =>
  s.started_at ? Math.max(0, Math.floor((now - Date.parse(String(s.started_at))) / 1000)) : 0;

/** The row an Agents landing put focus on (leftovers-30 FR-3, launch-progress
 *  L13): centred on landing; while it keeps focus and the lead has not
 *  scrolled, each feed update brings it back with `block: "nearest"`, since
 *  the feed reflows the list and Safari 15 has no `overflow-anchor`. A blur,
 *  a scroll the view did not make (a scroller's offset other than the one
 *  its own scrollIntoView left), or the row leaving the page lets it go. */
let held: { el: HTMLElement; tops: Map<EventTarget, number>; release: () => void } | null = null;

const topOf = (t: EventTarget) => (t === document ? document.scrollingElement?.scrollTop ?? 0 : (t as Element).scrollTop);

function scrollHeld(block: ScrollLogicalPosition) {
  const h = held;
  if (!h) return;
  if (!h.el.isConnected || document.activeElement !== h.el) { h.release(); return; }
  h.el.scrollIntoView({ block });
  const tops = new Map<EventTarget, number>([[document, topOf(document)]]);
  for (let p = h.el.parentElement; p; p = p.parentElement) tops.set(p, p.scrollTop);
  h.tops = tops;
}

/** Holds `el`, which has focus already, and centres it. Called after the
 *  screen's own scroll to the top, so that scroll is not read as the lead's. */
export function holdInView(el: HTMLElement) {
  held?.release();
  const onScroll = (e: Event) => { if (e.target && held?.tops.get(e.target) !== topOf(e.target)) held?.release(); };
  const h = {
    el,
    tops: new Map<EventTarget, number>(),
    release: () => {
      el.classList.remove("landed-held");
      document.removeEventListener("scroll", onScroll, true);
      el.removeEventListener("blur", h.release);
      if (held === h) held = null;
    },
  };
  held = h;
  // The scroll margin (leftovers-31 FR-1, L15): centring and each nearest
  // pull leave the whole focus ring, plus air, inside the scroller.
  el.classList.add("landed-held");
  document.addEventListener("scroll", onScroll, true);
  el.addEventListener("blur", h.release);
  scrollHeld("center");
}

/** A feed update: the held row back into view, if it is still held. */
export const keepHeldInView = () => scrollHeld("nearest");

/** Leaving Agents lets the row go. */
export const releaseHeld = () => held?.release();

/** A seat's start as launch-progress §1 draws it: a word with a shape, never
 *  a colour alone. `count` is the seconds part, drawn aria-hidden. */
export function seatWord(s: Pick<SeatStart, "state" | "started_at">, now: number): { tone: string; shape: string; word: string; count: string } {
  switch (s.state) {
    case "starting": return { tone: "starting", shape: "…", word: "starting", count: ` · ${elapsed(s, now)} s` };
    case "retrying": return { tone: "retrying", shape: "↻", word: "trying again", count: ` · ${elapsed(s, now)} s` };
    case "running": return { tone: "running", shape: "✓", word: "running", count: "" };
    case "failed": return { tone: "failed", shape: "✕", word: "didn't start", count: "" };
    case "skipped": return { tone: "waiting", shape: "", word: "off", count: "" };
    default: return { tone: "waiting", shape: "", word: "waiting", count: "" };
  }
}

type Listed = Pick<Launch, "running" | "failed" | "seats"> & Partial<Pick<Launch, "done">>;

const unsettled = (state: string) => state === "queued" || state === "starting" || state === "retrying";

/** The list's heading (launch-progress §1, Amendment 1 §1-§2): `Starting
 *  crew · n of m running` while a listed seat waits, starts or tries again,
 *  then the result. One seat is `Starting 1 seat`, then `Seat up`. Nothing
 *  running and a failure is `not up` (the amendment names no words for it). */
export function launchHeading(l: Listed): string {
  const seats = l.seats ?? [];
  const m = seats.length;
  const one = m === 1;
  if (seats.some((s) => unsettled(s.state))) return `${one ? "Starting 1 seat" : "Starting crew"} · ${l.running} of ${m} running`;
  const skipped = seats.filter((s) => s.state === "skipped").length;
  const failed = l.failed > 0 ? `, ${l.failed} didn't start` : "";
  const counts = `${l.running} of ${m} running${failed}`;
  if (skipped > 0) return `Stopped · ${counts}, ${skipped} not started`;
  const what = one ? "Seat" : "Crew";
  return `${l.running === 0 && l.failed > 0 ? `${what} not up` : `${what} up`} · ${counts}`;
}

/** The start's total, said once when no listed seat is left to start: the
 *  heading's words (Amendment 1 §1). */
export const launchTotal = (l: Listed) => launchHeading(l);

/** The seats this press starts (Amendment 1 §2), in launch order, with the
 *  counts over them alone. The service queues every roster seat (a live one
 *  starts nothing), so the view keeps the ones that were off at the press;
 *  a hidden seat that fails is listed anyway, since a failure is never
 *  hidden. No record of the press, or one naming none of the start's seats
 *  (a CLI start, an app restart), lists all. */
export function listedOf(l: Launch, pressed?: ReadonlySet<string>): Launch {
  const all = l.seats ?? [];
  const ours = !!pressed && all.some((s) => pressed.has(s.seat));
  const seats = ours ? all.filter((s) => pressed.has(s.seat) || s.state === "failed") : all;
  return {
    ...l,
    seats,
    running: seats.filter((s) => s.state === "running").length,
    failed: seats.filter((s) => s.state === "failed").length,
    done: !seats.some((s) => unsettled(s.state)),
  } as Launch;
}

/** The seats the last Bring up press of an initiative starts: the off ones.
 *  Module state, so leaving Agents and coming back (L7) lists the same
 *  seats. */
const pressed = new Map<string, Set<string>>();

const ended = (state: string) => state === "running" || state === "failed";

/** What the live region says for a feed update (L2): each seat's result
 *  once and the total once, nothing per second. `said` holds what was said
 *  already (`seat:state`, `total`); a seat that starts again (Try again)
 *  leaves it, so its next result is said. Returns the new lines and set. */
export function announce(said: ReadonlySet<string>, l: Pick<Launch, "seats" | "done" | "running" | "failed">): { lines: string[]; said: Set<string> } {
  const next = new Set(said);
  const lines: string[] = [];
  for (const s of l.seats ?? []) {
    if (!ended(s.state)) { next.delete(`${s.seat}:running`); next.delete(`${s.seat}:failed`); continue; }
    const key = `${s.seat}:${s.state}`;
    if (next.has(key)) continue;
    next.add(key);
    lines.push(`${s.seat} ${s.state === "running" ? "running" : "didn't start"}`);
  }
  if (!l.done) next.delete("total");
  else if (!next.has("total")) { next.add("total"); lines.push(launchTotal(l)); }
  return { lines, said: next };
}

/** What has been said already, so a remount (leaving Agents and coming back,
 *  L7) says nothing it said before. */
export const saidOf = (l: Pick<Launch, "seats" | "done" | "running" | "failed"> | undefined) => (l ? announce(new Set(), l).said : new Set<string>());

/** The live region's text for one launch: the newest results, once. Said
 *  through the live-region helper, so a repeated line is said again (FR-2). */
export function useAnnouncer(l: Launch | undefined): [string, Say] {
  const said = useRef<Set<string>>(saidOf(l));
  const [msg, say] = useLiveRegion();
  useEffect(() => {
    if (!l) { said.current = new Set(); return; }
    const r = announce(said.current, l);
    said.current = r.said;
    if (r.lines.length > 0) say(r.lines.join(". "));
  }, [l, say]);
  return [msg, say];
}

/** Now, ticking once a second while `on`: the seconds are text, nothing
 *  spins (WCAG 2.2.2). */
export function useNow(on: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!on) return;
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [on]);
  return now;
}

const starting = (l: Launch | undefined) => !!l?.seats?.some((s) => s.state === "starting" || s.state === "retrying");

/** How long a list with every listed seat up stays (launch-progress §1, L14). */
export const LIST_KEEP_MS = 5000;

/** How long a Start that queued seats stays busy waiting for the feed to
 *  draw the list: two agents feed periods (10 s each). */
export const LIST_WAIT_MS = 20000;

/** What the live region says when Start finds every seat running
 *  (leftovers-31 FR-3, L18). */
export const ALL_RUNNING = "Every seat is already running";

/** The Attach of a seat row, or of the first seat row that has one. */
export const attachIn = (box: ParentNode | null | undefined, seat?: string) =>
  box?.querySelector<HTMLElement>(`.crew-seats > li${seat ? `[data-seat="${CSS.escape(seat)}"]` : ""} button[aria-label^="Attach "]`) ?? null;

/** Where focus goes when a list or the confirm leaves the crew block with
 *  focus inside it (leftovers-32 FR-4, launch-progress L22): the Attach of
 *  the first listed seat that has one (`listed`, the seats the list showed;
 *  no list, every seat row), else `Bring n up`, else `Retire…`, which every
 *  crew block has. Never the body. One function for the self-close, Close
 *  the list, the race and the dead confirm. */
export function focusAfter(box: ParentNode | null | undefined, listed?: readonly string[] | null): HTMLElement | null {
  if (!box) return null;
  const attach = listed ? listed.map((s) => attachIn(box, s)).find((el) => !!el) ?? null : attachIn(box);
  return attach ?? box.querySelector<HTMLElement>('button[data-crew="launch"]:not([disabled])') ?? box.querySelector<HTMLElement>('button[data-crew="retire"]');
}

/** The sessions of the seats a press found running (leftovers-33 FR-1), by
 *  seat. */
export const runningOf = (r: Pick<CrewResult, "running"> | null | undefined) =>
  new Map((r?.running ?? []).map((s) => [s.seat, s.session] as const));

/** Start in the confirm (FR-3, L18): the race is read from what the press
 *  finds. CreateCrew returns a launch line per seat it queued; none means
 *  the last off seat came up elsewhere since the confirm opened. Then the
 *  confirm closes (`none`, handed the sessions of the seats the press found
 *  running, whose caller shows the press's answer at once, leftovers-32
 *  FR-1 and leftovers-33 FR-2, and moves focus by `focusAfter` once the
 *  confirm is gone), the live region says so, and no list comes. */
export function startCrew(id: string, h: {
  create: (id: string) => Promise<CrewResult>;
  queued: () => void;
  none: (running: Map<string, string>) => void;
  say: (m: string) => void;
  failed: (e: unknown) => void;
}): Promise<void> {
  return h.create(id).then(
    (r) => {
      if ((r?.lines?.length ?? 0) > 0) { h.queued(); return; }
      h.none(runningOf(r));
      h.say(ALL_RUNNING);
    },
    h.failed,
  );
}

/** The initiative's start on the agents feed, if any. */
export const launchOf = (launches: Launch[] | undefined, id: string) => (launches ?? []).find((l) => l.initiative === id);

/** A settled start with a failure stays until the lead acts (launch-progress
 *  §1); Close is one way to act. Module state, so the list stays closed
 *  across navigation until the start changes. */
const closed = new Map<string, { pressed?: Set<string>; shape: string }>();
const shapeOf = (l: Launch) => (l.seats ?? []).map((s) => `${s.seat}:${s.state}:${s.started_at ?? ""}`).join("|");
/** Close keeps the press it closed with, so a new press does not list the
 *  closed start's seats again until the new start reaches the feed. */
const closeList = (id: string, l: Launch) => {
  const p = pressed.get(id);
  closed.set(id, { pressed: p, shape: shapeOf(listedOf(l, p)) });
};
const listClosed = (id: string, l: Launch) => {
  const c = closed.get(id);
  return !!c && shapeOf(listedOf(l, c.pressed)) === c.shape;
};

/** Try again and Copy the command of a seat that did not start (§2). */
export function FailedActions({ initiative, seat, retryRef, onCopied, onError }: { initiative: string; seat: SeatStart; retryRef?: React.Ref<HTMLButtonElement>; onCopied: () => void; onError: (m: string) => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => ClipboardSetText(seat.launch_line).then(
    (ok) => { if (!ok) { onError("the clipboard refused the command"); return; } setCopied(true); onCopied(); window.setTimeout(() => setCopied(false), 2000); },
    (e) => onError(String(e)),
  );
  return (
    <span className="ls-acts">
      <button ref={retryRef} className="tiny-btn" aria-label={`Try again, ${seat.seat}`} onClick={() => RetrySeat(initiative, seat.seat).catch((e) => onError(String(e)))}>Try again</button>
      <button className="tiny-btn ghost" aria-label={`Copy the command, ${seat.seat}`} title={seat.launch_line} onClick={copy}>{copied ? "Copied" : "Copy the command"}</button>
    </span>
  );
}

/** Bring crew up's progress in place of the crew rows (launch-progress §1,
 *  FR-6): the heading takes focus after the press, since the button is
 *  gone; one line per seat in launch order; Stop starting while any seat
 *  waits or starts. */
function LaunchList({ initiative, launch, focusHead, say, onClose }: { initiative: string; launch: Launch; focusHead: React.MutableRefObject<boolean>; say: (m: string) => void; onClose: () => void }) {
  const head = useRef<HTMLHeadingElement>(null);
  const now = useNow(starting(launch));
  const [error, setError] = useState<string | null>(null);
  // In the commit that draws the list, which is the one that takes the busy
  // Start away: focus goes from Start to the heading with no body between
  // (leftovers-34 FR-2, L27).
  useLayoutEffect(() => {
    if (!focusHead.current) return;
    focusHead.current = false;
    head.current?.focus();
  }, [focusHead]);
  // A button that goes while it has focus (Stop starting once nothing
  // waits, Try again once its seat starts again) hands focus back to the
  // heading, never to the body.
  const inside = useRef(false);
  useEffect(() => {
    if (inside.current && (document.activeElement === document.body || !document.activeElement)) head.current?.focus();
  });
  const failed = launch.done && launch.failed > 0;
  return (
    <div className="launch" onFocus={() => { inside.current = true; }} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) inside.current = false; }}>
      <div className="crew-head">
        <h3 ref={head} tabIndex={-1} className="launch-head">{launchHeading(launch)}</h3>
        <span className="spacer" />
        {error && <span className="meta ls-err">{error}</span>}
        {!launch.done && <button className="tiny-btn ghost" onClick={() => StopStarting(initiative).catch((e) => setError(String(e)))} title="the seat in flight finishes; the waiting ones stay off">Stop starting</button>}
        {failed && <button className="tiny-btn ghost" onClick={() => { SeenLaunch(initiative).catch(() => undefined); onClose(); }} title="back to the crew rows; nothing is killed or retried, Bring up starts the off seats again">Close the list</button>}
      </div>
      <ul className="launch-seats">
        {(launch.seats ?? []).map((s, i) => {
          const w = seatWord(s, now);
          return (
            <li key={`${s.seat}-${i}`} className={`ls ${w.tone}`} data-launch-seat={s.seat}>
              <span className="ls-shape" aria-hidden="true">{w.shape}</span>
              <span className="ident ls-name">{s.seat}</span>
              <span className="ls-word">{w.word}{w.count && <span aria-hidden="true">{w.count}</span>}</span>
              {s.state === "failed" && (
                <>
                  {/* One line in words; probe's whole output is the hover
                      and organizer.log, never on screen (§2). */}
                  <span className="ls-why" title={s.output || s.reason}>· {s.reason}</span>
                  <FailedActions initiative={initiative} seat={s} onCopied={() => say(`command for ${s.seat} copied`)} onError={setError} />
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** What a cell in definition waits on (decision 0030): no seat has had a
 *  session or a run, so the roster is still being written. */
export const IN_DEFINITION_WAITS = "no seat has run yet; waits on its first launch";

/** A drafted roster waits on its accept record, not on a launch
 *  (discovery-in-a-cell FR-3e). */
export const DRAFT_WAITS = "draft roster; nothing launches until its accept record is ruled";

/** What a cell in definition waits on, as the Crew header says it: a
 *  draft's accept record, linked to Decisions with the record expanded
 *  (lead-side-fixes FR-6), or its first launch. The record is the service's
 *  (`accept_record`, FR-9); the rule is not repeated here. A missing persona
 *  file is what it waits on instead of a launch (ui-leftovers FR-9); that
 *  reason is said once, beside Bring crew up, so it shows here only when
 *  the button is not drawn (`said`). */
function DefinitionWaits({ id, cell, missing, said }: { id: string; cell: model.Cell; missing: string[]; said: boolean }) {
  const openDecision = useBoard((s) => s.openDecision);
  if (cell.state !== "in_definition") return null;
  if (!cell.draft && missing.length > 0) return said ? null : <span className="meta">{personaMissing(missing)}</span>;
  if (!cell.draft) return <span className="meta">{IN_DEFINITION_WAITS}</span>;
  const record = cell.accept_record;
  const drafted = cell.drafted ? `drafted ${cell.drafted}; ` : "";
  if (!record) return <span className="meta" title={DRAFT_WAITS}>{drafted}no accept record yet</span>;
  return (
    <span className="meta" title={DRAFT_WAITS}>
      {drafted}waits on{" "}
      <button className="linkish meta" onClick={() => openDecision(id, record.number)} title="Open in Decisions">
        <span className="num">{record.number}</span> {record.slug}
      </button>
    </span>
  );
}

/** Why a cell in definition waits, in one line: a draft's accept record, a
 *  missing persona file (ui-leftovers FR-9), or its first launch. */
export const definitionWaits = (cell: model.Cell, missing: string[]) =>
  cell.draft ? DRAFT_WAITS : missing.length > 0 ? personaMissing(missing) : `${IN_DEFINITION_WAITS} (Bring crew up)`;

/** The cell's derived state as a lozenge, word and icon, or nothing. One
 *  source for Crew, the Agents tab and Home's signals. */
export function CellStateLz({ cell, missing = [], label = "in definition", fold }: { cell?: model.Cell | null; missing?: string[]; label?: string; fold?: number }) {
  if (cell?.state !== "in_definition") return null;
  // The words sit in a text span that takes the ellipsis (responsive-home
  // FR-25, as FR-14): the lozenge is a flex box, which clips mid-word.
  // `fold` is how soon Home's signals fold it into "+N" (FR-20, 0076).
  return (
    <span className="lz tone" title={`${cell.project}: ${definitionWaits(cell, missing)}`} data-fold={fold}>
      <PencilRuler size={12} strokeWidth={2} aria-hidden="true" /><span className="lz-t">{label}</span>
    </span>
  );
}

/** Why Bring crew up cannot run, before the click (discovery-in-a-cell
 *  FR-6): the seats with no persona file, and a draft's accept record. Null
 *  when it can. CreateCrew still refuses both, for the CLI and a stale view. */
export function crewBlocked(seats: Seat[], cell: model.Cell): string | null {
  const why: string[] = [];
  const missing = missingPersonas(seats);
  if (missing.length > 0) why.push(personaMissing(missing));
  if (cell.draft) {
    const record = cell.accept_record;
    why.push(record ? `draft roster: nothing launches until ${record.number} is ruled` : "draft roster: no accept record yet");
  }
  return why.length > 0 ? why.join("; ") : null;
}

/** The persona cell of an initiative: one row per seat of agents/cell.json,
 *  joined to whatever process runs for it, its discuss watcher and its
 *  context fill. "Bring crew up" starts one probe per seat, detached, one
 *  after another, and the block shows each seat starting (FR-6). */
export function Crew({ group, launch, readOnly = false, onMessage }: { group: AgentGroup; launch?: Launch; readOnly?: boolean; onMessage?: (seat: string) => void }) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  // Start queued seats and the list is not drawn yet: Start stays, busy and
  // with focus, until the list's heading takes it (leftovers-34 FR-2, L27).
  const [awaitList, setAwaitList] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [confirmKill, setConfirmKill] = useState<string | null>(null);
  const [retiring, setRetiring] = useState(false);
  const reasonId = useId();
  const { opener: crewUp, commit: openBtn } = useConfirmFocus(asking);
  const box = useRef<HTMLDivElement>(null);
  const { agentsLanding, clearAgentsLanding } = useBoard();
  // Only a crew start speaks here; New agent says its own seat (§3).
  const listed = launch?.kind === "crew" ? listedOf(launch, pressed.get(group.id)) : undefined;
  const [said, say] = useAnnouncer(listed);
  const focusHead = useRef(false);
  const [, setClosedAt] = useState(0);
  // Focus was in the list when it closed: it goes to focusAfter's target,
  // never to the body (FR-4). `listedSeats` is the seats the list showed.
  const listHadFocus = useRef(false);
  const listedSeats = useRef<string[]>([]);
  // The press's answer (leftovers-32 FR-1, L19): Start queued nothing, so
  // the seats this view showed off read running until the next feed, which
  // carries a new group, says otherwise. The ones the press named carry
  // their session, so they draw Attach at once (leftovers-33 FR-2, L23).
  const [assumed, setAssumed] = useState<{ group: AgentGroup; seats: Set<string>; sessions: Map<string, string> } | null>(null);
  const liveNow = assumed?.group === group ? assumed.seats : null;
  const sessionsNow = assumed?.group === group ? assumed.sessions : null;
  // A failure shown here is seen (FR-7): its Needs me row goes.
  const unseen = !!launch && launch.failed > 0 && !launch.seen;
  useEffect(() => { if (unseen) SeenLaunch(group.id).catch(() => undefined); }, [unseen, group.id]);
  // A settled list in which no listed seat failed closes after 5 s, one seat
  // (`Seat up`) or a crew (`Crew up`) alike (leftovers-30 FR-4, L14), counted
  // from when this view saw it settle, whatever else the service's start
  // still runs. A failure is never closed by time.
  const shown = !!launch && !!listed && !listClosed(group.id, launch);
  const upShape = shown && listed && listed.done && listed.failed === 0 && (listed.seats?.length ?? 0) > 0 ? shapeOf(listed) : "";
  const launchNow = useRef(launch);
  launchNow.current = launch;
  const groupNow = useRef(group);
  useEffect(() => {
    if (!upShape) return;
    const t = window.setTimeout(() => { if (launchNow.current) { closeList(group.id, launchNow.current); setClosedAt(Date.now()); } }, LIST_KEEP_MS);
    return () => window.clearTimeout(t);
  }, [upShape, group.id]);
  // A Needs me verb lands here (ui-leftovers FR-5): Launch on Bring crew up,
  // Open on the seat whose persona file is missing.
  useEffect(() => {
    if (!agentsLanding) return;
    // A failed start's Agents (FR-7) lands on the list's heading.
    const el = agentsLanding === "launch"
      ? box.current?.querySelector<HTMLElement>(".launch-head")
      : agentsLanding === "crew-up"
      ? crewUp.current
      : box.current?.querySelector<HTMLElement>(`[data-seat="${CSS.escape(agentsLanding.replace(/^seat:/, ""))}"]`);
    if (!el) return;
    el.focus({ preventScroll: true });
    // Centred and kept in view (FR-3), after the screen's scroll to the top
    // (a parent's effect). A task, not a frame: a window that draws no frame
    // (hidden, or the harness's offscreen one) never runs requestAnimationFrame.
    window.setTimeout(() => { if (document.activeElement === el) holdInView(el); }, 0);
    clearAgentsLanding();
  }, [agentsLanding, clearAgentsLanding, crewUp, group.crew, launch]);
  // The confirm left (the race, or a feed with no seat off) with focus in
  // it: focus goes by focusAfter once it is gone, in the same commit (a
  // layout effect), so focus is never on the body between the confirm
  // leaving and its target taking it. useConfirmFocus's effect, which runs
  // later, finds no launch button to hand it back to: none is drawn with
  // no seat off.
  const refocus = useRef(false);
  useLayoutEffect(() => {
    if (!refocus.current || asking) return;
    refocus.current = false;
    focusAfter(box.current)?.focus();
  });
  const confirmBox = useRef<HTMLSpanElement>(null);
  // A list that never comes (no feed carries the start) does not hold Start
  // busy for good: after two feed periods the confirm closes as a race does.
  useEffect(() => {
    if (!awaitList) return;
    const t = window.setTimeout(() => {
      if (confirmBox.current?.contains(document.activeElement)) refocus.current = true;
      setAwaitList(false);
      setAsking(false);
    }, LIST_WAIT_MS);
    return () => window.clearTimeout(t);
  }, [awaitList]);
  const seats = group.crew ?? [];
  const off = seats.filter((s) => isOff(s) && !liveNow?.has(s.name)).length;
  // A confirm whose press can no longer act closes (FR-3, L21); its words
  // stay as they were.
  // It says why first (leftovers-33 FR-3, L24): the confirm, and focus in
  // it, stay until the live region carries the words, then it closes and
  // focus goes by focusAfter. Focus never drops to the body meanwhile.
  // Focus first, then the words (leftovers-34 FR-3, L24 amended), as the
  // race does: the confirm closes, focus goes by focusAfter in that commit,
  // and the live region is set after it. A pressed Start is the press's to
  // answer, not the feed's.
  const dead = asking && !busy && !awaitList && seats.length > 0 && off === 0;
  useEffect(() => {
    if (!dead) return;
    const inside = !!confirmBox.current && confirmBox.current.contains(document.activeElement);
    if (inside) refocus.current = true;
    setAsking(false);
    say(ALL_RUNNING);
  }, [dead, say]);
  const cell = group.cell;
  if (!cell) return null;
  const blocked = seats.length === 0 ? "no seats: the roster is empty between waves" : crewBlocked(seats, cell);
  const live = seats.filter((s) => liveNow?.has(s.name) || (s.agent && (s.agent.state === "working" || s.agent.state === "running"))).length;
  const flash = (m: string) => { setNote(m); window.setTimeout(() => setNote(null), 5000); };
  groupNow.current = group;

  const bringUp = () => {
    setBusy(true);
    // The list replaces the button; focus goes to its heading (L3).
    focusHead.current = true;
    // The list holds the seats this press starts (Amendment 1 §2).
    const before = pressed.get(group.id);
    pressed.set(group.id, new Set(seats.filter(isOff).map((s) => s.name)));
    const unpress = () => { focusHead.current = false; if (before) pressed.set(group.id, before); else pressed.delete(group.id); };
    startCrew(group.id, {
      create: api.createCrew,
      queued: () => setAwaitList(true),
      none: (running) => {
        unpress();
        // Every seat shown off reads running (FR-1); the ones the result
        // names carry their session (leftovers-33 FR-2).
        setAssumed({ group: groupNow.current, seats: new Set(seats.filter(isOff).map((s) => s.name)), sessions: running });
        refocus.current = true;
        setAsking(false);
      },
      say,
      failed: (e) => { unpress(); flash(String(e)); },
    }).finally(() => setBusy(false));
  };
  const showList = shown;
  // The list is drawn: the confirm it replaced is done.
  if (showList && (asking || awaitList)) { setAsking(false); setAwaitList(false); }

  if (!showList && listHadFocus.current) {
    listHadFocus.current = false;
    const was = listedSeats.current;
    window.setTimeout(() => {
      if (document.activeElement && document.activeElement !== document.body) return;
      focusAfter(box.current, was)?.focus();
    }, 0);
  }
  if (showList) listedSeats.current = (listed?.seats ?? []).map((s) => s.seat);

  if (showList) {
    return (
      <div className="crew" ref={box} onFocus={() => { listHadFocus.current = true; }} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) listHadFocus.current = false; }}>
        <span className="sr-only" role="status" aria-live="polite">{said}</span>
        <div className="crew-head">
          <Users size={14} />
          <span className="ident">{cell.project}</span>
        </div>
        <LaunchList initiative={group.id} launch={listed} focusHead={focusHead} say={say} onClose={() => { const was = listedSeats.current; listHadFocus.current = false; closeList(group.id, launch!); setClosedAt(Date.now()); window.setTimeout(() => focusAfter(box.current, was)?.focus(), 0); }} />
      </div>
    );
  }

  return (
    <div className="crew" ref={box}>
      <span className="sr-only" role="status" aria-live="polite">{said}</span>
      <div className="crew-head">
        <Users size={14} />
        <span className="ident">{cell.project}</span>
        <CellStateLz cell={cell} missing={missingPersonas(seats)} />
        <DefinitionWaits id={group.id} cell={cell} missing={missingPersonas(seats)} said={!readOnly && !asking} />
        <span className="meta">{seats.length} seats · {live} live · {off} off{cell.reconciler ? ` · reconciler ${cell.reconciler}` : ""}</span>
        {group.discuss && <span className="badge watcher stale" title="crew health comes from the discuss API">{group.discuss}</span>}
        <span className="spacer" />
        {note && <span className="meta">{note}</span>}
        {!readOnly && !asking && <button data-crew="retire" className={`tiny-btn ${(group.retirable?.length ?? 0) > 0 ? "" : "ghost"}`} onClick={() => setRetiring(true)} title={(group.retirable?.length ?? 0) > 0 ? `wave done with ${group.retirable.join(", ")}: organizer retire ${group.id} --retirable` : `organizer retire ${group.id}: end a wave`}><UserRoundX size={13} /> {(group.retirable?.length ?? 0) > 0 ? `${group.retirable.length} retirable` : "Retire…"}</button>}
        {/* Closing the report lands on the crew block's Retire…, else
            focusAfter's target, never the body (leftovers-34 F5). */}
        {retiring && <Retire group={group} onClose={() => { setRetiring(false); window.setTimeout(() => (box.current?.querySelector<HTMLElement>('button[data-crew="retire"]') ?? focusAfter(box.current))?.focus(), 0); }} />}
        {/* The reason is text beside the button, not only its hover: a
            disabled button takes no focus and no WebKit mouse events
            (lead-side-fixes FR-4). */}
        {!readOnly && !asking && blocked && <span id={reasonId} className="meta">{blocked}</span>}
        {/* With no seat off there is no launch button (FR-2, L17): the meta's
            `0 off` is the answer. An empty roster keeps Bring crew up,
            disabled, with its reason. */}
        {!readOnly && !asking && (off > 0 || seats.length === 0) && (
          <span title={blocked ?? `organizer crew ${group.id}`}>
            <button ref={crewUp} data-crew="launch" className="tiny-btn primary" onClick={() => setAsking(true)} disabled={busy || !!blocked} aria-describedby={blocked ? reasonId : undefined}>
              <Users size={13} /> {off === seats.length ? "Bring crew up" : `Bring ${off} up`}
            </button>
          </span>
        )}
        {asking && (
          <span ref={confirmBox} className="confirm-inline" onKeyDown={escapeCloses(() => setAsking(false))}>
            <span className="meta">starts the off seats one after another, detached, each with its discuss identity; running seats stay as they are</span>
            <button ref={openBtn} className="tiny-btn primary" {...busyButton({ busy: busy || awaitList, onPress: bringUp })}>{busyLabel(busy || awaitList, "Start", "Starting…")}</button>
            <button className="tiny-btn ghost" onClick={() => setAsking(false)}>Cancel</button>
          </span>
        )}
      </div>
      <ul className="agents crew-seats">
        {seats.map((s) => <SeatRow key={s.name} seat={s} assumedLive={!!liveNow?.has(s.name) && isOff(s)} assumedSession={sessionsNow?.get(s.name)} readOnly={readOnly} confirm={confirmKill} setConfirm={setConfirmKill} flash={flash} onMessage={onMessage} />)}
      </ul>
    </div>
  );
}

const isOff = (s: Seat) => !s.agent || s.agent.state === "exited";

/** One seat of the crew block. `assumedLive` is a seat the press found
 *  running while the feed still shows it off (leftovers-32 FR-1): it reads
 *  the word a feed-running, not-working row draws (`stateWord`, `idle`), so
 *  the next feed changes no word unless the seat works (leftovers-34 FR-1,
 *  L26); with
 *  `assumedSession`, the session the press named, it draws Attach at once,
 *  else `—` and no Attach until the feed (leftovers-33 FR-2, L23). */
export function SeatRow({ seat, assumedLive = false, assumedSession, readOnly, confirm, setConfirm, flash, onMessage }: { seat: Seat; assumedLive?: boolean; assumedSession?: string; readOnly: boolean; confirm: string | null; setConfirm: (s: string | null) => void; flash: (m: string) => void; onMessage?: (seat: string) => void }) {
  const a = assumedLive ? undefined : seat.agent;
  const state = assumedLive ? "running" : a?.state ?? "off";
  const word = stateWord(state);
  const session = assumedLive ? assumedSession ?? "" : a?.session || "";
  const asking = confirm === seat.name;
  const health = healthState({ watcher: seat.watcher, deaf: seat.deaf, capped: seat.capped });
  const { opener: killBtn, commit: killCommit } = useConfirmFocus(asking);
  return (
    <li className={state} data-seat={seat.name} tabIndex={-1} aria-label={`${session || seat.session} (${seat.name}, ${word})`}>
      <span className={`a-state ${state}`}><i />{word}</span>
      <span className="a-name"><span className="ident">{seat.name}</span></span>
      {seat.no_persona && (
        <span className="lz warning" title={`agents/${seat.name}.md is missing; the drafting session writes it, or write it by the persona-agents skill`}>
          <FileXCorner size={12} strokeWidth={2} aria-hidden="true" />no persona file
        </span>
      )}
      <WatcherBadge watcher={seat.watcher} deaf={seat.deaf} capped={seat.capped} undelivered={seat.undelivered} />
      {(seat.owes?.length ?? 0) > 0 && <span className="badge owes" title={seat.owes.map((o) => o.subject || o.id).join("\n")}>owes {seat.owes.length}</span>}
      <ContextBar c={a?.context} />
      <span className="meta mono a-proc">{a && a.pid > 0 ? `${a.tty} · up ${a.uptime}` : a?.created ? `session ${a.created}` : a ? "layout only" : seat.session}</span>
      <span className="a-tail">
      {!readOnly && <span className="a-actions">
        {onMessage && !asking && <button className="tiny-btn" onClick={() => onMessage(seat.name)} title={`write to ${seat.name}`} aria-label={`Message ${seat.name}`}><MessageSquare size={13} /> Message</button>}
        {asking && session && (
          <span className="confirm-inline" onKeyDown={escapeCloses(() => setConfirm(null))}>
            <span className="meta">remove session, layout and profile? conversation stays resumable</span>
            <button ref={killCommit} className="tiny-btn danger" aria-label={`Kill ${seat.name}`} onClick={() => api.killAgent(session).then(() => flash(`killed ${session}`), (e) => flash(String(e))).finally(() => setConfirm(null))}>Kill</button>
            <button className="tiny-btn ghost" onClick={() => setConfirm(null)}>Cancel</button>
          </span>
        )}
        {!asking && session && (
          <>
            <button className="tiny-btn" onClick={() => api.attachSession(session)} title={`probe ${session}`} aria-label={`Attach ${seat.name}`}><SquareTerminal size={13} /> Attach</button>
            <button ref={killBtn} className="tiny-btn ghost" onClick={() => setConfirm(seat.name)} title={`probe -k ${session}`} aria-label={`Kill ${seat.name}`}><Trash2 size={13} /> Kill</button>
          </>
        )}
      </span>}
      <MemoryCell a={a} />
      </span>
      {health && health !== "alive" && <HealthWhy state={health} />}
    </li>
  );
}
