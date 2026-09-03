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
