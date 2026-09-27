import { Inbox, Lock, LogOut, RefreshCw, RefreshCcwDot, Settings, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../hooks/useWails";
import { useBoard } from "../stores/board.store";
import { since } from "../lib";
import { needsMeRows } from "../lib/queue";

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
  return (
    <header className="topbar">
      <span className="brand" title={version ? `organizer ${version}` : "organizer"}>organizer{version && <span className="brand-version">{version}</span>}</span>
      <nav className="crumbs" aria-label="where you are">
        {screen === "home" ? <b>Home</b> : <button className="crumb" onClick={goHome}>Home</button>}
        {screen === "initiative" && selectedInitiative && <><span className="crumb-sep">/</span><b className="mono">{selectedInitiative}</b></>}
        {screen === "settings" && <><span className="crumb-sep">/</span><b>Settings</b></>}
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
      <button className={`needs-me ${screen === "home" ? "on" : ""}`} onClick={goHome} title="things waiting on you: decisions, threads, cards and seats">
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
      <button className={`ghost gear ${screen === "settings" ? "on" : ""}`} onClick={openSettings} title="Settings" aria-label="Settings"><Settings size={14} /></button>
    </header>
  );
}
