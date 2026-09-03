import { useEffect, useState } from "react";
import { api } from "../hooks/useWails";
import { useBoard } from "../stores/board.store";

/** Set, change or clear the local passcode. */
export function PasscodeBlock() {
  const { lock, setLock } = useBoard();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { api.getLock().then(setLock, () => undefined); }, [setLock]);
  const run = async (p: Promise<any>, ok: string) => {
    setMsg(null);
    try { setLock(await p); setMsg(ok); setCurrent(""); setNext(""); }
    catch (e) { setMsg(String(e).replace(/^Error:\s*/, "")); }
  };
  return (
    <div className="settings-block">
      <div className="section-label">Security</div>
      <p className="meta">{lock?.enabled ? "A passcode is required to open the app on this machine." : "No passcode. Anyone who opens this Mac session opens the app."}</p>
      <div className="row">
        {lock?.enabled && <input type="password" placeholder="current passcode" value={current} onChange={(e) => setCurrent(e.target.value)} />}
        <input type="password" placeholder={lock?.enabled ? "new passcode (6+ chars)" : "passcode (6+ chars)"} value={next} onChange={(e) => setNext(e.target.value)} />
        <button className="primary" disabled={!next || (lock?.enabled && !current)} onClick={() => run(api.setPasscode(current, next, false), lock?.enabled ? "passcode changed" : "passcode set")}>{lock?.enabled ? "Change" : "Set passcode"}</button>
        {lock?.enabled && <button disabled={!current} onClick={() => run(api.clearPasscode(current), "passcode removed")}>Remove</button>}
      </div>
      {msg && <div className="meta">{msg}</div>}
    </div>
  );
}
