import { Bot, Calendar, ChartGantt, Kanban, ListTree, RefreshCw, RefreshCcwDot, Settings } from "lucide-react";
import { useBoard, type Tab } from "../stores/board.store";
import { since } from "../lib";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "board", label: "Board", icon: <Kanban size={14} /> },
  { id: "agents", label: "Agents", icon: <Bot size={14} /> },
  { id: "roadmap", label: "Roadmap", icon: <ChartGantt size={14} /> },
  { id: "calendar", label: "Calendar", icon: <Calendar size={14} /> },
  { id: "initiatives", label: "Initiatives", icon: <ListTree size={14} /> },
  { id: "settings", label: "Settings", icon: <Settings size={14} /> },
];

export function TopBar() {
  const { tab, setTab, view, loading, syncing, refresh, sync, error, lastMessage } = useBoard();
  const machines = view?.board.machines ?? [];
  return (
    <header className="topbar">
      <span className="brand">organizer</span>
      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={t.id === tab ? "active" : ""} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </nav>
      <span className="spacer" />
      {error && <span className="meta err">{error}</span>}
      {!error && lastMessage && <span className="meta">{lastMessage}</span>}
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
    </header>
  );
}
