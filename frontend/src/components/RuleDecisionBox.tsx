import { useEffect, useId, useRef, useState } from "react";
import type { model } from "../../wailsjs/go/models";
import { api } from "../hooks/useWails";
import { useBoard } from "../stores/board.store";
import "../styles/rule-box.css";

/** The owner's ruling of a proposed record, from its Needs me row (FR-22).
 *  One option and the words, then RuleDecision (FR-13) writes the record and
 *  commits it; the rescan that follows drops the row from the queue. A refusal
 *  is the service's own sentence, shown here with what was typed kept. */
export function RuleDecisionBox({ initiative, decision: d, onClose }: { initiative: string; decision: model.Decision; onClose: () => void }) {
  const { refresh } = useBoard();
  const options = d.options ?? [];
  const [chosen, setChosen] = useState("");
  const [words, setWords] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const first = useRef<HTMLInputElement>(null);
  const name = useId();
  const ready = chosen !== "" && words.trim() !== "" && !busy;

  useEffect(() => { first.current?.focus(); }, []);

  const rule = async () => {
    if (!ready) return;
    setBusy(true);
    setError(null);
    try {
      await api.ruleDecision(initiative, d.number, chosen, words);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
      return;
    }
    await refresh();
  };

  return (
    <div className="rb" role="dialog" aria-label={`Rule ${initiative} ${d.number}`}
      onKeyDown={(e) => { if (e.key === "Escape" && !busy) onClose(); }}>
      <div className="rb-head">
        <span className="rb-num">{d.number}</span>
        <span className="rb-title">{d.title}</span>
      </div>
      {options.length === 0 ? (
        <div className="rb-error">This record lists no options, so it cannot be ruled here. Add `options:` to the record.</div>
      ) : (
        <fieldset className="rb-options" disabled={busy}>
          <legend className="rb-label">Chosen option</legend>
          {options.map((o, i) => (
            <label key={o} className={`rb-option ${chosen === o ? "on" : ""}`}>
              <input ref={i === 0 ? first : undefined} type="radio" name={name} value={o}
                checked={chosen === o} onChange={() => setChosen(o)} />
              <span>{o}</span>
            </label>
          ))}
        </fieldset>
      )}
      <label className="rb-words">
        <span className="rb-label">Your words</span>
        <textarea rows={4} value={words} disabled={busy} placeholder="Why this option, in your words. They go under ## Ruling."
          onChange={(e) => setWords(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void rule(); }} />
      </label>
      {error && <div className="rb-error" role="alert">{error}</div>}
      <div className="rb-foot">
        <span className="rb-sign">signed {d.owner || "—"} · commits one file</span>
        <button className="ghost" onClick={onClose} disabled={busy}>Cancel</button>
        <button className="primary" onClick={() => void rule()} disabled={!ready}>{busy ? "Ruling…" : "Rule"}</button>
      </div>
    </div>
  );
}
