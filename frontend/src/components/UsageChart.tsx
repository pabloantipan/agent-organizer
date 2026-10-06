import { useState } from "react";
import { barLabel, compact, gridMoney, money, moneyGrid, sessionsWords, weekDays, type WeekPoint } from "../lib/usage";

const HEIGHT = 120;

/** Money per week, the view's one chart (her §3; dataviz: one measure, one
 *  axis, one hue). Up to 12 bars, oldest first; the selected week is the
 *  full step, the others a lighter step of the same hue. A hover per bar,
 *  a click selects the week, and Show as table is the same rows. */
export function UsageChart({ history, week, thisWeek, onPick, every }: { history: WeekPoint[]; week: string; thisWeek: string; onPick: (w: string) => void; every: boolean }) {
  const [table, setTable] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const grid = moneyGrid(Math.max(0, ...history.map((p) => p.money)));
  const words = (p: WeekPoint) => `${p.week === thisWeek ? "This week, " : ""}${weekDays(p)} · ${money(p.money)} · ${compact(p.tokens)} tokens · ${sessionsWords(p.sessions)}`;
  return (
    <section className="usage-sec" aria-label="money per week">
      <div className="usage-sec-head">
        <h2 className="sec-title">Money per week</h2>
        <span className="sec-sub">{history.length === 1 ? "1 week recorded" : `${history.length} weeks`}{every ? ", every initiative" : ""}</span>
        <span className="spacer" />
        <button className="ghost tiny-btn" onClick={() => setTable(!table)} aria-pressed={table}>{table ? "Show as chart" : "Show as table"}</button>
      </div>
      {table ? (
        <table className="usage-weeks num">
          <thead><tr><th scope="col">week</th><th scope="col">money</th><th scope="col">tokens</th><th scope="col">sessions</th></tr></thead>
          <tbody>
            {[...history].reverse().map((p) => (
              <tr key={p.week} className={p.week === week ? "on" : ""} aria-current={p.week === week}>
                <td><button className="link" onClick={() => onPick(p.week)}>{p.week === thisWeek ? "This week" : weekDays(p)}</button></td>
                <td>{money(p.money)}</td><td>{compact(p.tokens)}</td><td>{p.sessions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="chart">
          <div className="chart-plot" style={{ height: HEIGHT }}>
            {grid.lines.map((v) => (
              <div key={v} className="chart-grid" style={{ bottom: (v / grid.top) * HEIGHT }}><span className="chart-grid-label num">{gridMoney(v)}</span></div>
            ))}
            <div className="chart-bars">
              {history.map((p) => {
                const h = p.money > 0 ? Math.max(2, (p.money / grid.top) * HEIGHT) : 0;
                const on = p.week === week;
                return (
                  <button key={p.week} className={`chart-bar ${on ? "on" : ""}`} onClick={() => onPick(p.week)}
                    onMouseEnter={() => setHover(p.week)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(p.week)} onBlur={() => setHover(null)}
                    aria-label={words(p)} aria-pressed={on}>
                    {on && <span className="chart-label num" style={{ bottom: h + 4 }}>{money(p.money)}</span>}
                    <span className="chart-mark" style={{ height: h }} />
                    {hover === p.week && <span className="chart-tip num" role="tooltip" style={{ bottom: h + (on ? 24 : 6) }}>{words(p)}</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="chart-axis" aria-hidden="true">
            {history.map((p) => <span key={p.week} className={p.week === week ? "on" : ""}>{barLabel(p)}</span>)}
          </div>
        </div>
      )}
    </section>
  );
}
