import { useEffect, useState } from "react";
import { KeyRound, LogIn, Mail, ShieldCheck, WifiOff } from "lucide-react";
import { api, type Account, type LockState } from "../hooks/useWails";
import { useBoard, type AuthMode } from "../stores/board.store";

export type GateStep = "loading" | "lock" | "signin" | "app";

/** What the gate shows, as one decision. With auth off there is no sign-in
 *  step at all and the offline choice is not consulted: the lock, if the user
 *  set one, is the only thing between the window and the board. */
export function gateStep(mode: AuthMode | null, lock: LockState | null, account: Account | null, offlineChoice: boolean): GateStep {
  if (!lock || account === null || mode === null) return "loading";
  if (lock.enabled && !lock.unlocked) return "lock";
  if (mode === "firebase" && !account.signed_in && !offlineChoice) return "signin";
  return "app";
}

/** Full-window gate: the passcode lock first, then — with auth: firebase —
 *  cloud sign-in unless the user chooses to continue offline. */
export function Gate({ children }: { children: React.ReactNode }) {
  const { account, lock, authMode, offlineChoice, loadSession } = useBoard();
  useEffect(() => { loadSession(); }, [loadSession]);
  switch (gateStep(authMode, lock, account, offlineChoice)) {
    case "loading": return <div className="gate"><div className="gate-card"><span className="meta">Starting…</span></div></div>;
    case "lock": return <LockScreen />;
    case "signin": return <SignInScreen />;
    default: return <>{children}</>;
  }
}

function LockScreen() {
  const { setLock, lock, authMode } = useBoard();
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [forgot, setForgot] = useState(false);
  const [cooldown, setCooldown] = useState(lock?.cooldown_secs ?? 0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);
  const unlock = async () => {
    setErr(null);
    try {
      const st = await api.unlock(code);
      setLock(st);
      if (!st.unlocked) {
        setCode("");
        setErr(st.cooldown_secs > 0 ? `too many attempts, wait ${st.cooldown_secs}s` : `wrong passcode, ${st.failures_left} tries left`);
        setCooldown(st.cooldown_secs);
      }
    } catch (e) { setErr(String(e).replace(/^Error:\s*/, "")); }
  };
  if (forgot) return authMode === "firebase" ? <SignInScreen resetPasscodeAfter onBack={() => setForgot(false)} /> : <ForgotPasscode onBack={() => setForgot(false)} />;
  return (
    <div className="gate">
      <form className="gate-card" onSubmit={(e) => { e.preventDefault(); unlock(); }}>
        <div className="gate-icon"><KeyRound size={22} /></div>
        <h1>Locked</h1>
        <p className="meta">Enter the passcode for this machine.</p>
        <input autoFocus type="password" placeholder="passcode" value={code} onChange={(e) => setCode(e.target.value)} disabled={cooldown > 0} />
        {err && <div className="err">{err}</div>}
        <button className="primary" type="submit" disabled={cooldown > 0 || code.length === 0}>{cooldown > 0 ? `wait ${cooldown}s` : "Unlock"}</button>
        <button type="button" className="ghost" onClick={() => setForgot(true)}>{authMode === "firebase" ? "Forgot it? Sign in to reset" : "Forgot it?"}</button>
      </form>
    </div>
  );
}

/** With auth off there is no sign-in to prove who you are, so the recovery is
 *  local: delete the passcode item from the Keychain and set a new one. */
function ForgotPasscode({ onBack }: { onBack: () => void }) {
  return (
    <div className="gate">
      <div className="gate-card">
        <div className="gate-icon"><KeyRound size={22} /></div>
        <h1>Forgot the passcode</h1>
        <p className="meta">
          This machine has no account to sign in with — the passcode is the only
          secret, and it is stored as a hash, so it cannot be read back. Remove
          it in Terminal and the app opens unlocked; set a new one in Settings.
        </p>
        <code className="mono" style={{ wordBreak: "break-all", userSelect: "all" }}>security delete-generic-password -s cl.antipan.organizer -a passcode</code>
        <div className="gate-links">
          <button type="button" className="ghost" onClick={onBack}>Back</button>
        </div>
      </div>
    </div>
  );
}

export function SignInScreen({ resetPasscodeAfter = false, onBack }: { resetPasscodeAfter?: boolean; onBack?: () => void }) {
  const { setAccount, setLock, setOfflineChoice, view } = useBoard();
  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newCode, setNewCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const hasCache = (view?.board.machines?.length ?? 0) > 0;

  const submit = async () => {
    setErr(null); setMsg(null); setBusy(true);
    try {
      if (mode === "reset") {
        await api.resetPassword(email.trim());
        setMsg("reset email sent, check your inbox");
        setMode("in");
        return;
      }
      const acc = mode === "in" ? await api.signIn(email.trim(), password) : await api.signUp(email.trim(), password);
      if (resetPasscodeAfter && newCode) {
        setLock(await api.setPasscode("", newCode, true));
      } else {
        setLock(await api.getLock());
      }
      setAccount(acc);
    } catch (e) { setErr(String(e).replace(/^Error:\s*/, "")); }
    finally { setBusy(false); }
  };

  return (
    <div className="gate">
      <form className="gate-card" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <div className="gate-icon">{mode === "reset" ? <Mail size={22} /> : <LogIn size={22} />}</div>
        <h1>{mode === "in" ? "Sign in" : mode === "up" ? "Create account" : "Reset password"}</h1>
        <p className="meta">
          {mode === "reset" ? "We email you a link to set a new password." : resetPasscodeAfter ? "Signing in proves it is you; then choose a new passcode for this machine." : "Your initiatives sync across machines under this account."}
        </p>
        <input autoFocus type="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        {mode !== "reset" && <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "up" ? "new-password" : "current-password"} />}
        {resetPasscodeAfter && mode !== "reset" && <input type="password" placeholder="new passcode for this machine (6+ chars)" value={newCode} onChange={(e) => setNewCode(e.target.value)} />}
        {err && <div className="err">{err}</div>}
        {msg && <div className="meta ok">{msg}</div>}
        <button className="primary" type="submit" disabled={busy || !email || (mode !== "reset" && !password)}>
          {busy ? "…" : mode === "in" ? "Sign in" : mode === "up" ? "Create account" : "Send reset email"}
        </button>
        <div className="gate-links">
          {mode !== "in" && <button type="button" className="ghost" onClick={() => setMode("in")}>Have an account? Sign in</button>}
          {mode === "in" && <button type="button" className="ghost" onClick={() => setMode("up")}>Create account</button>}
          {mode === "in" && <button type="button" className="ghost" onClick={() => setMode("reset")}>Forgot password</button>}
          {onBack && <button type="button" className="ghost" onClick={onBack}>Back</button>}
          {!resetPasscodeAfter && hasCache && (
            <button type="button" className="ghost" onClick={() => setOfflineChoice(true)}><WifiOff size={13} /> Continue offline</button>
          )}
          {!resetPasscodeAfter && !hasCache && (
            <button type="button" className="ghost" onClick={() => setOfflineChoice(true)}><ShieldCheck size={13} /> Use without an account</button>
          )}
        </div>
      </form>
    </div>
  );
}
