import type { merge, model } from "../../wailsjs/go/models";
import type { CardRuns } from "../hooks/useWails";
import { ageLabel, isStale } from "../lib";
import { useBoard } from "../stores/board.store";

/** FR-9's test on a next action: the card is in review when it starts with `review:`. */
export const inReview = (next: string | undefined) => /^review:/i.test((next ?? "").trim());

/** A2: the checkboxes under a `## Gate` heading, the same reading as the
 *  wave's gate rows (`gateRows` in internal/service/waves.go). */
export function gateOf(body: string | undefined): { passed: number; total: number; has: boolean } {
  let inGate = false, has = false, passed = 0, total = 0;
  for (const raw of (body ?? "").split("\n")) {
    const t = raw.trim();
    if (t.startsWith("#")) {
      inGate = t.replace(/^#+/, "").trim().toLowerCase() === "gate";
      has = has || inGate;
      continue;
    }
    const m = inGate && /^[-*+] +\[( |x|X)\]/.exec(t);
    if (m) { total++; if (m[1] !== " ") passed++; }
  }
  return { passed, total, has };
}

export const gateLabel = (g: { passed: number; total: number; has: boolean }) =>
  g.has ? `gate ${g.passed}/${g.total}` : "gate —";

/** Input tokens as a card foot reads them: 940, 212k, 1.4M. */
export function tokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
}

/** Time since a start, as 9m, 1h12m or 3d; empty for Go's zero time. */
export function elapsed(at: unknown): string {
  const t = typeof at === "string" ? Date.parse(at) : NaN;
  if (Number.isNaN(t) || t <= 0) return "";
  const m = Math.max(0, Math.floor((Date.now() - t) / 60_000));
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h${String(m % 60).padStart(2, "0")}m`;
  return `${Math.floor(h / 24)}d`;
}

/** Who is on a card: the joined agent's name, state, context fill, time
 *  since start and input tokens (FR-8), or "nobody on it". */
export function AgentLine({ name, join }: { name?: string; join?: model.CardJoin | null }) {
  if (!join) return <span className="wk-agent nobody"><span className="wk-dot" aria-hidden />nobody on it</span>;
  const pct = Math.max(0, Math.min(100, Math.round(join.used_percent ?? 0)));
  const level = pct > 65 ? "hot" : pct > 50 ? "warm" : "";
  const since = elapsed(join.started_at);
  return (
    <span className="wk-agent" title={`${name ?? "agent"} is ${join.state}`}>
      <span className={`wk-dot ${join.state}`} aria-hidden />
      <span className="wk-agent-name">{name ?? "agent"}</span>
      <span className="wk-agent-state">{join.state}</span>
      <span className={`wk-bar ${level}`} aria-hidden><i style={{ width: `${pct}%` }} /></span>
      <span className="wk-num">{pct}%</span>
      {since && <span className="wk-num">{since}</span>}
      <span className="wk-num">{tokens(join.input_tokens ?? 0)} tok</span>
    </span>
  );
}

export function CardItem({ card, compact = false, agent, runs, wave }: {
  card: merge.BoardCard;
  compact?: boolean;
  /** The live agent the agents feed joined to this card (`Agent.card`). */
  agent?: model.Agent;
  /** FR-10: this card's input tokens over archived and live sessions. */
  runs?: CardRuns;
  /** The card's wave number, when its seat is `wave<N>-…`. */
  wave?: number;
}) {
  const select = useBoard((s) => s.select);
  // The machine is noise when there is only one; a remote card always says where it lives.
  const machines = useBoard((s) => s.view?.board.machines?.length ?? 1);
  const open = !card.archived && card.status !== "done";
  const gate = gateOf(card.body);
  return (
    <article
      className={`wk-card ${open ? "" : "done"}`}
      role="button"
      tabIndex={0}
      aria-label={card.title || card.slug}
      onClick={() => select(card)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && select(card)}
    >
      <div className="wk-title">{card.title || card.slug}</div>
      {open && card.next && <div className="wk-next">{card.next}</div>}
      {open && <AgentLine name={agent ? agent.session || agent.name : undefined} join={agent?.card} />}
      {open && (card.thread_state ?? []).length > 0 && (
        <div className="wk-threads">
          {card.thread_state.map((t) =>
            t.missing ? (
              <span key={t.id} className="wk-badge" title={t.id}>thread closed or unknown</span>
            ) : (
              <span
                key={t.id}
                className={`wk-badge mono ${t.status === "escalated" || t.blocked_on?.length ? "blocked" : "tone"}`}
                title={
                  t.blocked_on?.length
                    ? t.blocked_on.map((b) => `${b.seat} ${b.reason}`).join(", ")
                    : `${t.messages} message${t.messages === 1 ? "" : "s"}, ${t.since_decision} since the last decision`
                }
              >
                {t.subject || t.id.slice(0, 8)} · {t.since_decision}/12
                {t.blocked_on?.length ? ` · ${t.blocked_on[0].seat} ${t.blocked_on[0].reason}` : ""}
              </span>
            ),
          )}
        </div>
      )}
      <div className="wk-foot">
        {wave !== undefined && <span className="wk-badge">wave {wave}</span>}
        {(gate.has || wave !== undefined) && <span className="wk-num">{gateLabel(gate)}</span>}
        {(machines > 1 || !card.local) && <span className={`wk-badge mono ${card.local ? "live" : "remote"}`}>{card.machine}</span>}
        {card.branch && <span className="wk-mono">{card.branch}</span>}
        {runs && runs.input_tokens > 0 && (
          <span className="wk-num" title="input tokens over archived and live sessions">
            {tokens(runs.input_tokens)} tok · {runs.runs?.length ?? 0} session{runs.runs?.length === 1 ? "" : "s"}
          </span>
        )}
        <span className={`wk-num ${isStale(card.updated) && open ? "stale" : ""}`}>{ageLabel(card.updated)}</span>
        {!compact && card.client && <span className="wk-badge tone">{card.client}</span>}
      </div>
    </article>
  );
}
