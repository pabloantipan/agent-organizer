import type { ContextStatus } from "../hooks/useWails";

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

/** The discuss watcher state of a persona: alive, stale, never; deaf when
 *  messages sit undelivered past the stale window. */
export function WatcherBadge({ watcher, deaf, capped, undelivered }: { watcher?: string; deaf?: boolean; capped?: boolean; undelivered?: number }) {
  if (!watcher) return null;
  const label = capped ? "capped" : deaf ? "deaf" : watcher;
  const title = capped
    ? `alive and posting, but its session hit the mailbox's drain ceiling: ${undelivered} message${undelivered === 1 ? "" : "s"} wait for a new session. Restart the seat (probe -r keeps the conversation).`
    : deaf
    ? `${undelivered} message${undelivered === 1 ? "" : "s"} nobody picked up: the watcher is ${watcher}`
    : watcher === "alive" ? "the wake watcher polled recently" : watcher === "stale" ? "the watcher stopped polling" : "this persona was never started";
  return (
    <span className={`badge watcher ${capped ? "capped" : deaf ? "deaf" : watcher}`} title={title}>
      {label}{(capped || !deaf) && (undelivered ?? 0) > 0 ? ` · ${undelivered} waiting` : ""}
    </span>
  );
}
