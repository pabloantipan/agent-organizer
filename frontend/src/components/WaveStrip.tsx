import type { service } from "../../wailsjs/go/models";
import { AgentLine, gateLabel, tokens } from "./CardItem";

const GROUP_LABEL: Record<string, string> = {
  building: "building",
  in_review: "in review",
  queued: "queued",
  done: "done",
};

/** A wave is running while it has a card building, in review or queued. */
export const running = (w: service.Wave) =>
  (w.building?.length ?? 0) + (w.in_review?.length ?? 0) + (w.queued?.length ?? 0) > 0;

/** One wave of FR-9 (W1, W2): its number, its supervisor, its gate rows
 *  passed out of total, its cards per group, the input tokens its live
 *  agents hold, and a tile per card coloured by its group. A tile opens the
 *  card's back, as a card click does. */
export function WaveStrip({ wave, onOpen }: { wave: service.Wave; onOpen: (slug: string) => void }) {
  const cards = [...(wave.building ?? []), ...(wave.in_review ?? []), ...(wave.queued ?? []), ...(wave.done ?? [])];
  const count = (n: number, word: string, cls: string) => (
    <span className={`wk-badge ${n > 0 ? cls : ""}`}><span className="wk-num">{n}</span> {word}</span>
  );
  return (
    <section className="wk-wave" aria-label={wave.label}>
      <header className="wk-wave-head">
        <span className={`wk-dot ${(wave.building?.length ?? 0) > 0 ? "working" : ""}`} aria-hidden />
        <span className="wk-wave-name">{wave.label}</span>
        {wave.supervisor
          ? <span className="wk-badge mono">supervisor {wave.supervisor}</span>
          : <span className="wk-badge">no supervisor</span>}
        <span className="wk-spacer" />
        <span className="wk-meta">
          {wave.has_gate
            ? <>gate rows <b className="wk-num">{wave.gate_passed}/{wave.gate_total}</b></>
            : "gate —"}
        </span>
        {count(wave.building?.length ?? 0, "building", "now")}
        {count(wave.in_review?.length ?? 0, "in review", "review")}
        {count(wave.queued?.length ?? 0, "queued", "next")}
        <span className="wk-num wk-meta" title="input tokens held by the wave's live agents">{tokens(wave.input_tokens ?? 0)} tokens</span>
      </header>
      <div className="wk-tiles">
        {cards.map((c) => (
          <button key={c.slug} className={`wk-tile ${c.group}`} onClick={() => onOpen(c.slug)} title={c.title || c.slug}>
            <span className="wk-tile-top">
              <span className="wk-tile-slug">{c.slug}</span>
              <span className={`wk-badge ${c.group}`}>{GROUP_LABEL[c.group] ?? c.group}</span>
            </span>
            <span className="wk-tile-meta">
              <span className="wk-mono">{c.seat}</span>
              <span className="wk-num">{gateLabel({ passed: c.gate_passed, total: c.gate_total, has: c.has_gate })}</span>
            </span>
            {c.group !== "done" && <AgentLine name={c.agent ? c.seat : undefined} join={c.agent} />}
          </button>
        ))}
      </div>
    </section>
  );
}
