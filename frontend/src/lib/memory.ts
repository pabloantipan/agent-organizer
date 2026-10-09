/** The memory reading's words (docs/ux/specs/ram-indicator.md, Aglaea's
 *  design; docs/specs/ram-indicator.md FR-5): what the top-bar button, its
 *  popover, the floating icon's panel line and their names say for each
 *  state. Pure, so every state of her table is tested here. */

/** The reading as the feed carries it (`AgentsView.memory`), loosely typed so
 *  tests need no generated classes. */
export type MemoryReading = {
  pressure: string;
  since?: unknown;
  since_opened?: boolean;
  was_critical_until?: unknown;
  total_bytes: number;
  free_bytes: number;
  top?: { name: string; initiative: string; bytes: number; agent_id: string }[] | null;
  agents_bytes?: number;
};

/** Her States table's rows that the reading decides. "none" is the first
 *  10 s after launch (no sample yet), "failed" a sample that could not read. */
export type MemoryState = "none" | "failed" | "normal" | "high" | "critical";

export function memoryState(agents: { memory?: MemoryReading | null; memory_reason?: string } | null | undefined): MemoryState {
  if (!agents) return "none";
  const m = agents.memory;
  if (!m) return agents.memory_reason ? "failed" : "none";
  if (m.pressure === "critical" || m.pressure === "high") return m.pressure;
  return "normal";
}

const GiB = 1024 ** 3;

/** Bytes as GB to one decimal, Activity Monitor's GB (2^30, so 24 GB of
 *  hw.memsize reads 24), a trailing .0 dropped: 12, 3.1, 0.4. */
export function gb(bytes: number): string {
  const v = Math.round((Math.max(0, bytes) / GiB) * 10) / 10;
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

/** What the top-bar button shows (her §1 table and the 1024 row): the text
 *  after the glyph, and whether it is the chip. Compact is the short form:
 *  the word moves into the name and the hover. */
export function buttonText(state: MemoryState, m: MemoryReading | null | undefined, compact: boolean): string {
  if (state === "none" || state === "failed" || !m) return "—";
  const free = gb(m.free_bytes);
  if (state === "critical") return compact ? `critical · ${free} GB` : `Memory critical · ${free} GB free`;
  if (state === "high") return compact ? `${free} GB` : `${free} GB free · high`;
  return compact ? `${free} GB` : `${free} GB free`;
}

/** The button's accessible name and its hover title, the same words:
 *  `Memory: high, 3.1 GB free of 32 GB`; `memory unknown` when the read
 *  failed (her States table). */
export function buttonName(state: MemoryState, m: MemoryReading | null | undefined): string {
  if (state === "failed") return "memory unknown";
  if (state === "none" || !m) return "Memory: reading…";
  return `Memory: ${state}, ${gb(m.free_bytes)} GB free of ${gb(m.total_bytes)} GB`;
}

const ms = (t: unknown): number | null => {
  if (!t) return null;
  const n = typeof t === "string" ? Date.parse(t) : t instanceof Date ? t.getTime() : NaN;
  return Number.isNaN(n) ? null : n;
};

/** A level's length in her words: `1 min` under two minutes, `4 min`,
 *  `2 h`, `2 h 5 min`. */
export function duration(msLong: number): string {
  const min = Math.max(1, Math.floor(msLong / 60000));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), rest = min % 60;
  return rest ? `${h} h ${rest} min` : `${h} h`;
}

/** The popover's pressure line: `normal` at normal; `high, for 4 min`;
 *  `critical, since Deltagos opened` when the level began before the first
 *  sample this app took, so its true length is unknown. */
export function pressureLine(m: MemoryReading, now: number): string {
  if (m.pressure !== "high" && m.pressure !== "critical") return "normal";
  if (m.since_opened) return `${m.pressure}, since Deltagos opened`;
  const s = ms(m.since);
  return s === null ? m.pressure : `${m.pressure}, for ${duration(now - s)}`;
}

/** `Was critical until 14:32`, the half hour after a critical spell ends
 *  (the service drops it after 30 min); null otherwise. Local 24 h time. */
export function wasCriticalLine(m: MemoryReading): string | null {
  const t = ms(m.was_critical_until);
  if (t === null || m.pressure === "critical") return null;
  const d = new Date(t);
  return `Was critical until ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** `Free 3.1 GB of 32 GB`'s value. */
export const freeLine = (m: MemoryReading) => `${gb(m.free_bytes)} GB of ${gb(m.total_bytes)} GB`;

/** `Agents use 18.6 GB of the 28.9 GB in use`'s value: in use is total less
 *  free. */
export const agentsLine = (m: MemoryReading) => `use ${gb(m.agents_bytes ?? 0)} GB of the ${gb(Math.max(0, m.total_bytes - m.free_bytes))} GB in use`;

/** The panel's memory line (her §2) at high and critical; nothing at normal
 *  or without a reading. */
export function panelLine(state: MemoryState, m: MemoryReading | null | undefined): string | null {
  if (!m || (state !== "high" && state !== "critical")) return null;
  return `Memory ${state} · ${gb(m.free_bytes)} GB free`;
}

/** One agent session as the popover lists it. */
export type SessionRow = { name: string; initiative: string; bytes: number; agentId: string; state: string };

type FeedAgent = { session: string; pid: number; state: string; mem_bytes?: number };
type FeedGroup = { id: string; agents?: FeedAgent[] | null };
type Feed = { memory?: MemoryReading | null; groups?: FeedGroup[] | null; unassigned?: FeedAgent[] | null };

/** Every agent session this Mac runs, biggest first: the reading's five
 *  (`Memory.top`, the service's cut) and after them the rest, grouped the
 *  same way from each agent's `mem_bytes` (initiative and session name,
 *  else `pid <n>`; a process with no pid counts nowhere). The state is the
 *  session's first agent's, found by the agent id the row's `Agents ›`
 *  lands on (`<session>#<pid>`). */
export function sessionRows(feed: Feed | null | undefined): SessionRow[] {
  if (!feed?.memory) return [];
  const byId = new Map<string, FeedAgent>();
  const rest = new Map<string, SessionRow>();
  const add = (initiative: string, list: FeedAgent[] | null | undefined) => {
    for (const a of list ?? []) {
      if (a.pid <= 0) continue;
      const agentId = `${a.session}#${a.pid}`;
      byId.set(agentId, a);
      const name = a.session || `pid ${a.pid}`;
      const key = `${initiative}\u0000${name}`;
      const row = rest.get(key);
      if (row) row.bytes += a.mem_bytes ?? 0;
      else rest.set(key, { name, initiative, bytes: a.mem_bytes ?? 0, agentId, state: a.state });
    }
  };
  for (const g of feed.groups ?? []) add(g.id, g.agents);
  add("", feed.unassigned);
  const top = (feed.memory.top ?? []).map((t) => {
    rest.delete(`${t.initiative}\u0000${t.name}`);
    return { name: t.name, initiative: t.initiative, bytes: t.bytes, agentId: t.agent_id, state: byId.get(t.agent_id)?.state ?? "running" };
  });
  return [...top, ...[...rest.values()].sort((a, b) => b.bytes - a.bytes)];
}

/** How many sessions the popover lists before `… N more`, and the panel. */
export const POPOVER_TOP = 5;
export const PANEL_TOP = 3;
