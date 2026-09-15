import type { merge } from "../../wailsjs/go/models";
import { ageLabel, isStale } from "../lib";
import { useBoard } from "../stores/board.store";

export function CardItem({ card, compact = false }: { card: merge.BoardCard; compact?: boolean }) {
  const select = useBoard((s) => s.select);
  return (
    <article
      className={`card ${card.status}`}
      role="button"
      tabIndex={0}
      aria-label={card.title || card.slug}
      onClick={() => select(card)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && select(card)}
    >
      <div className="title">{card.title || card.slug}</div>
      {card.next && <div className="next-line">{card.next}</div>}
      {(card.thread_state ?? []).length > 0 && (
        <div className="card-threads">
          {card.thread_state.map((t) =>
            t.missing ? (
              <span key={t.id} className="badge thread missing" title={t.id}>thread closed or unknown</span>
            ) : (
              <span
                key={t.id}
                className={`badge thread ${t.status}${t.blocked_on?.length ? " blocked" : ""}`}
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
      <div className="foot">
        {card.archived && <span className="badge done">done</span>}
        <span className={`badge machine ${card.local ? "local" : "remote"}`}>{card.machine}</span>
        {card.branch && <span className="mono">{card.branch}</span>}
        <span className={isStale(card.updated) ? "stale" : ""}>{ageLabel(card.updated)}</span>
        {!compact && card.client && <span className="badge client">{card.client}</span>}
      </div>
    </article>
  );
}
