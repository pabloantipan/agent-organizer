import { Bot, Calendar, ChartGantt, Kanban, ListTree, Lock, LogOut, MessagesSquare, RefreshCw, RefreshCcwDot, Settings, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../hooks/useWails";
import { useBoard, type Tab } from "../stores/board.store";
import { since } from "../lib";
import { queueOf } from "../lib/queue";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "board", label: "Board", icon: <Kanban size={14} /> },
  { id: "agents", label: "Agents", icon: <Bot size={14} /> },
  { id: "slack", label: "Slack", icon: <MessagesSquare size={14} /> },
  { id: "roadmap", label: "Roadmap", icon: <ChartGantt size={14} /> },
  { id: "calendar", label: "Calendar", icon: <Calendar size={14} /> },
  { id: "initiatives", label: "Initiatives", icon: <ListTree size={14} /> },
  { id: "settings", label: "Settings", icon: <Settings size={14} /> },
];

export function TopBar() {
  const { tab, setTab, view, loading, syncing, refresh, sync, error, lastMessage, account, syncNote, setAccount, setLock, setOfflineChoice, agents } = useBoard();
  // The human's queue plus seats not picking up, across every cell; one
  // definition shared with the Slack tab so the numbers agree.
  const needsMe = (agents?.groups ?? []).filter((g) => g.cell).reduce((n, g) => { const q = queueOf(g, view); return n + q.total + q.deaf; }, 0);
  const [menu, setMenu] = useState(false);
  const machines = view?.board.machines ?? [];
  const [version, setVersion] = useState("");
  useEffect(() => { api.version().then(setVersion, () => undefined); }, []);
  return (
    <header className="topbar">
      <span className="brand" title={version ? `organizer ${version}` : "organizer"}>organizer{version && <span className="brand-version">{version}</span>}</span>
      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={t.id === tab ? "active" : ""} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}{t.id === "slack" && needsMe > 0 && <span className="tab-badge" title="things asked of you (threads and cards), plus seats not picking up">{needsMe}</span>}
          </button>
        ))}
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
      <button className="ghost" onClick={refresh} disabled={loading} title="Rescan local disk">
        <RefreshCw size={14} className={loading ? "spin" : ""} /> {loading ? "scanning…" : "Rescan"}
      </button>
      <button className="primary" onClick={sync} disabled={syncing} title="Push this machine, pull all">
        <RefreshCcwDot size={14} className={syncing ? "spin" : ""} /> {syncing ? "syncing…" : "Sync"}
      </button>
      <span className="account">
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
            <button className="ghost" onClick={() => { setTab("settings"); setMenu(false); }}><Settings size={13} /> Settings</button>
          </div>
        )}
      </span>
    </header>
  );
}
