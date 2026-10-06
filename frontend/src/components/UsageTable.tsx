import { Fragment, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useBoard } from "../stores/board.store";
import {
  CUTS, KIND_NAMES, compact, money, reasonsWords, roleWords, rowDetail, shareWords, usageColumns,
  type Cut, type Kinds, type UsageRow, type UsageSession,
} from "../lib/usage";

const CUT_WORDS: Record<Cut, string> = { initiative: "By initiative", role: "By role", task: "By task", model: "By model" };
const KINDS = Object.keys(KIND_NAMES) as (keyof Kinds)[];

/** Where it went (her §4): one table under a segmented control, sorted by
 *  money with Not attributed last, muted, its reasons in the hover. By
 *  task, a wave's row opens to its sessions. What does not fit gives way
 *  in the design system's order: the four kinds, then sessions, into the
 *  row's hover and accessible name. */
export function UsageTable({ rows, cut, setCut, sessions }: { rows: UsageRow[]; cut: Cut; setCut: (c: Cut) => void; sessions: UsageSession[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1400);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const { view, select } = useBoard();
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const cols = usageColumns(width);
  const byId = new Map(sessions.map((s) => [s.id, s]));
  const cardOf = (initiative?: string, slug?: string) => {
    if (!initiative || !slug) return undefined;
    return Object.values(view?.board.columns ?? {}).flat().find((c) => c.initiative_id === initiative && c.slug === slug && c.local);
  };
  const toggle = (key: string) => setOpen((s) => { const n = new Set(s); if (n.has(key)) n.delete(key); else n.add(key); return n; });
  return (
    <section className="usage-sec" aria-label="where it went">
      <div className="seg" role="tablist" aria-label="cut the week">
        {CUTS.map((c) => (
          <button key={c} role="tab" aria-selected={cut === c} className={cut === c ? "on" : ""} onClick={() => setCut(c)}>{CUT_WORDS[c]}</button>
        ))}
      </div>
      <div className="usage-table-wrap" ref={wrap}>
        <table className="usage-table">
          <thead>
            <tr>
              <th scope="col" className="c-name">name</th>
              <th scope="col" className="c-num">money</th>
              <th scope="col" className="c-share">share</th>
              <th scope="col" className="c-num">tokens</th>
              {cols.kinds && KINDS.map((k) => <th key={k} scope="col" className="c-num">{KIND_NAMES[k]}</th>)}
              {cols.sessions && <th scope="col" className="c-num">sessions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const detail = rowDetail(r, cols);
              const why = r.not_attributed ? reasonsWords(r.reasons) : "";
              const hover = [why, detail].filter(Boolean).join(" · ");
              const name = cut === "role" && !r.not_attributed ? roleWords(r.name) : r.name;
              const wave = cut === "task" && !r.not_attributed && (r.members?.length ?? 0) > 0;
              const isOpen = open.has(r.key);
              const card = cut === "task" && (r.cards?.length ?? 0) === 1 ? cardOf(r.initiative, r.cards![0]) : undefined;
              return (
                <Fragment key={r.key || "~na"}>
                  <tr className={r.not_attributed ? "na" : ""} title={hover || undefined}>
                    <th scope="row" className="c-name">
                      <span className="name-cell">
                        {wave && (
                          <button className="ghost icon disclose" onClick={() => toggle(r.key)} aria-expanded={isOpen}
                            aria-label={`${isOpen ? "Hide" : "Show"} the ${r.members!.length} sessions of ${name}`}>
                            {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          </button>
                        )}
                        {card ? (
                          <button className="link name-text" onClick={() => select(card)} title={[`Open the card ${r.initiative}/${card.slug}`, hover].filter(Boolean).join(" · ")}
                            aria-label={hover ? `${name}: ${hover}` : undefined}>{name}</button>
                        ) : (
                          <span className={`name-text ${(cut === "model" || cut === "initiative") && !r.not_attributed ? "mono" : ""}`} tabIndex={hover ? 0 : undefined}
                            aria-label={hover ? `${name}: ${hover}` : undefined}>{name}</span>
                        )}
                        {cut === "task" && !r.not_attributed && r.initiative && <span className="name-meta mono">{r.initiative}{(r.cards?.length ?? 0) > 1 ? ` · ${r.cards!.length} cards` : ""}</span>}
                      </span>
                    </th>
                    <td className="c-num">{money(r.money)}{r.without_cost > 0 && <span className="no-cost" title={`excludes ${r.without_cost} session${r.without_cost === 1 ? "" : "s"} with no cost`}>*</span>}</td>
                    <td className="c-share" title={shareWords(r.share)}>
                      <span className="share-bar" aria-label={shareWords(r.share)} role="img"><span style={{ width: `${Math.min(100, r.share * 100)}%` }} /></span>
                    </td>
                    <td className="c-num">{compact(r.tokens)}</td>
                    {cols.kinds && KINDS.map((k) => <td key={k} className="c-num">{compact(r[k])}</td>)}
                    {cols.sessions && <td className="c-num">{r.sessions}</td>}
                  </tr>
                  {wave && isOpen && r.members!.map((m) => {
                    const s = byId.get(m.id);
                    return (
                      <tr key={m.id} className="member">
                        <th scope="row" className="c-name"><span className="name-cell"><span className="name-text mono">{m.name || m.id.slice(0, 8)}</span><span className="name-meta">{roleWords(m.role)}{s?.running ? " · running" : ""}</span></span></th>
                        <td className="c-num" title={s && s.money == null ? "no cost recorded" : undefined}>{money(s?.money)}</td>
                        <td className="c-share" />
                        <td className="c-num">{s ? compact(s.tokens) : "—"}</td>
                        {cols.kinds && KINDS.map((k) => <td key={k} className="c-num">{s ? compact(s[k]) : "—"}</td>)}
                        {cols.sessions && <td className="c-num" />}
                      </tr>
                    );
                  })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {rows.some((r) => r.without_cost > 0) && <div className="usage-foot">* excludes sessions with no cost recorded</div>}
      </div>
    </section>
  );
}
