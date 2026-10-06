import { CircleHelp, Inbox, Lock, LogOut, RefreshCw, RefreshCcwDot, Settings, UserRound } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../hooks/useWails";
import { useBoard } from "../stores/board.store";
import { since } from "../lib";
import { needsMeRows } from "../lib/queue";
import { HelpView } from "./HelpView";
import { FloatAvailable, FloatCompact } from "../../wailsjs/go/main/App";

export function TopBar() {
  const { screen, selectedInitiative, goHome, openSettings, view, loading, syncing, refresh, sync, error, lastMessage, account, lock, authMode, syncNote, setAccount, setLock, setOfflineChoice, agents } = useBoard();
  // With auth off there is no identity: no account menu, no Sign in, no email,
  // and no Sync button either, since sync is a skip nobody can act on.
  const identity = authMode === "firebase";
  // The one badge (FR-15): the rows of Needs me on Home, so the count is
  // always the rows.
  const needsMe = needsMeRows(view, agents).length;
  const [menu, setMenu] = useState(false);
  const machines = view?.board.machines ?? [];
  const [version, setVersion] = useState("");
  useEffect(() => { api.version().then(setVersion, () => undefined); }, []);
  // Compact to icon (floating-icon §4) only where the icon runs: macOS, past
  // its startup check.
  const [floats, setFloats] = useState(false);
  useEffect(() => { FloatAvailable().then(setFloats, () => undefined); }, []);
  // The Help (A2) is the factory's, not an initiative's: it lies over
  // whatever screen is open, under this bar, and closing it returns there.
  // Each open reads help_doc again.
  const bar = useRef<HTMLElement>(null);
  const [helpTop, setHelpTop] = useState<number | null>(null);
  const toggleHelp = () => setHelpTop(helpTop === null ? bar.current?.getBoundingClientRect().bottom ?? 0 : null);
  const closeHelp = useCallback(() => setHelpTop(null), []);
  return (
    <header className="topbar" ref={bar}>
      <span className="brand" title={version ? `Deltagos ${version}` : "Deltagos"}>Deltagos{version && <span className="brand-version">{version}</span>}</span>
      <nav className="crumbs" aria-label="where you are">
        {screen === "home" ? <b>Home</b> : <button className="crumb" onClick={() => { closeHelp(); goHome(); }}>Home</button>}
        {screen === "initiative" && selectedInitiative && <><span className="crumb-sep">/</span><b className="mono">{selectedInitiative}</b></>}
        {screen === "settings" && <><span className="crumb-sep">/</span><b>Settings</b></>}
        {helpTop !== null && <><span className="crumb-sep">/</span><b>Help</b></>}
      </nav>
      <span className="spacer" />
      {error && <span className="meta err">{error}</span>}
      {!error && syncNote && <span className="meta warn" title="Sync is paused; showing the last pull">{syncNote}</span>}
      {!error && !syncNote && lastMessage && <span className="meta">{lastMessage}</span>}
      {!error && !lastMessage && view && (
        <span className="meta">
          {machines.length} machine{machines.length === 1 ? "" : "s"} · remote {since(view.pulled_at)}
        </span>
      )}
      <button className={`needs-me ${screen === "home" ? "on" : ""}`} onClick={() => { closeHelp(); goHome(); }} title="everything waiting on you">
        <Inbox size={14} /> Needs me{needsMe > 0 && <span className="badge-count num">{needsMe}</span>}
      </button>
      <button className="ghost" onClick={refresh} disabled={loading} title="Rescan local disk">
        <RefreshCw size={14} className={loading ? "spin" : ""} /> {loading ? "scanning…" : "Rescan"}
      </button>
      {identity && (
        <button className="primary" onClick={sync} disabled={syncing} title="Push this machine, pull all">
          <RefreshCcwDot size={14} className={syncing ? "spin" : ""} /> {syncing ? "syncing…" : "Sync"}
        </button>
      )}
      {!identity && lock?.enabled && (
        <button className="ghost" onClick={async () => setLock(await api.lockNow())} title="Lock this window">
          <Lock size={14} /> Lock
        </button>
      )}
      {identity && <span className="account">
        <button className="ghost" onClick={() => setMenu(!menu)} title={account?.signed_in ? account.email : "not signed in"}>
          <UserRound size={14} /> {account?.signed_in ? account.email : "sign in"}
        </button>
        {menu && (
          <div className="menu" onMouseLeave={() => setMenu(false)}>
            {account?.signed_in ? (
              <>
                <div className="menu-head mono">{account.email}</div>
                <button className="ghost" onClick={async () => { await api.signOut(); setAccount(await api.getAccount()); setOfflineChoice(false); setMenu(false); }}><LogOut size={13} /> Sign out</button>
              </>
            ) : (
              <button className="ghost" onClick={() => { setOfflineChoice(false); setMenu(false); }}><UserRound size={13} /> Sign in</button>
            )}
            <button className="ghost" onClick={async () => { setLock(await api.lockNow()); setMenu(false); }}><Lock size={13} /> Lock now</button>
          </div>
        )}
      </span>}
      {floats && <button className="ghost gear" onClick={() => { closeHelp(); void FloatCompact(); }} title="Compact to icon (the icon floats on every desktop)" aria-label="Compact to icon"><CompactIcon /></button>}
      <button className={`ghost gear ${helpTop !== null ? "on" : ""}`} onClick={toggleHelp} title="Help: how we build, from help_doc" aria-label="Help" aria-pressed={helpTop !== null}><CircleHelp size={14} /></button>
      <button className={`ghost gear ${screen === "settings" && helpTop === null ? "on" : ""}`} onClick={() => { closeHelp(); openSettings(); }} title="Settings" aria-label="Settings"><Settings size={14} /></button>
      {helpTop !== null && <HelpView top={helpTop} onClose={closeHelp} />}
    </header>
  );
}

/** The three bars shrinking into a corner (floating-icon §4): an arrow
 *  toward the bottom-right corner, where the bars stand small. */
function CompactIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 2l5 5M7 3.5V7H3.5" />
      <path d="M9 13v-2.5M11 13V9.5M13 13v-1.5" />
    </svg>
  );
}
