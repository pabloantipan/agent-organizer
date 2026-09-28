import type { ContextStatus } from "../hooks/useWails";
import { HEALTH, healthState, healthTitle } from "../lib/health";

const k = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`);

/** Context window fill of one agent, as its own statusline last reported it.
 *  Nothing rendered when the statusline hook has not fired for the process. */
export function ContextBar({ c }: { c?: ContextStatus | null }) {
  if (!c) return null;
  if (!c.window_size) return <span className="ctx meta" title="no API response yet">ctx ?</span>;
  const pct = Math.max(0, Math.min(100, Math.round(c.used_percent)));
  const level = pct >= 85 ? "hot" : pct >= 60 ? "warm" : "";
  const title = `${k(c.input_tokens)} / ${k(c.window_size)} tokens${c.model ? ` · ${c.model}` : ""}${c.cost_usd ? ` · $${c.cost_usd.toFixed(2)}` : ""}`;
  return (
    <span className={`ctx ${level}`} title={title}>
      <span className="ctx-track"><i style={{ width: `${pct}%` }} /></span>
      <b>{pct}%</b>
    </span>
  );
}

/** The discuss health of a seat as a word, never colour alone: alive, stale,
 *  never, deaf, capped. The word, the why and what to do come from lib/health. */
export function WatcherBadge({ watcher, deaf, capped, undelivered }: { watcher?: string; deaf?: boolean; capped?: boolean; undelivered?: number }) {
  if (!watcher) return null;
  const state = healthState({ watcher, deaf, capped });
  if (!state) return null;
  const waiting = undelivered ?? 0;
  return (
    <span className={`badge watcher ${state.replace(" ", "-")}`} title={healthTitle(state, waiting)}>
      {HEALTH[state].label}{state !== "deaf" && waiting > 0 ? ` · ${waiting} waiting` : ""}
    </span>
  );
}
