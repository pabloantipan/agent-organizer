import { CircleHelp, Inbox, Lock, LogOut, RefreshCw, RefreshCcwDot, Settings, UserRound } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../hooks/useWails";
import { useBoard, type Screen } from "../stores/board.store";
import { since } from "../lib";
import { needsMeRows } from "../lib/queue";
import { HelpView } from "./HelpView";
import { MemoryButton } from "./MemoryButton";
import { FloatAvailable, FloatCompact } from "../../wailsjs/go/main/App";

export function TopBar() {
  const { screen, selectedInitiative, goHome, openSettings, openUsage, openInitiatives, widthClass, view, loading, syncing, refresh, sync, error, lastMessage, account, lock, authMode, syncNote, setAccount, setLock, setOfflineChoice, agents } = useBoard();
  // With auth off there is no identity: no account menu, no Sign in, no email,
  // and no Sync button either, since sync is a skip nobody can act on.
  const identity = authMode === "firebase";
  // The one badge (FR-15): the rows of Needs me on Home, so the count is
  // always the rows.
  const needsMe = needsMeRows(view, agents).length;
  const [menu, setMenu] = useState(false);
  const machines = view?.board.machines ?? [];
  const machinesLine = view ? `${machines.length} machine${machines.length === 1 ? "" : "s"} · remote ${since(view.pulled_at)}` : "";
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
  const help = helpTop !== null;
  const go = (to: () => void) => () => { closeHelp(); to(); };
  // The sync line is firebase's alone (FR-4): with auth off `remote 24d ago`
  // reads as a fault. At compact the idle line folds into the brand's hover;
  // errors and sync notes never fold.
  const status = error ? <span className="meta err">{error}</span>
    : identity && syncNote ? <span className="meta warn" title="Sync is paused; showing the last pull">{syncNote}</span>
    : lastMessage ? <span className="meta">{lastMessage}</span>
    : identity && machinesLine && widthClass !== "compact" ? <span className="meta">{machinesLine}</span>
    : null;
  return (
    <header className="topbar" ref={bar}>
      {/* The bar by kind (leftovers-17 FR-3): brand · where you are · this
          Mac · your work · the app, 16 px between groups and no rules. The
          version is in the brand's hover at every width (FR-5). */}
      <span className="brand" title={[version ? `Deltagos ${version}` : "Deltagos", identity && widthClass === "compact" && machinesLine].filter(Boolean).join("\n")}>Deltagos</span>
      <Where screen={screen} selectedInitiative={selectedInitiative} help={help} go={go} goHome={goHome} openInitiatives={openInitiatives} openUsage={openUsage} />
      <span className="tb-group tb-mac">
        <MemoryButton />
        {status}
      </span>
      <span className="tb-group tb-work">
        <button className={`needs-me ${screen === "home" ? "on" : ""}`} onClick={go(goHome)} title="everything waiting on you">
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
      </span>
      <span className="tb-group tb-app">
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
        <AppControls floats={floats} help={help} settings={screen === "settings"} onCompact={() => { closeHelp(); void FloatCompact(); }} onHelp={toggleHelp} onSettings={go(openSettings)} />
      </span>
      {help && <HelpView top={helpTop} onClose={closeHelp} />}
    </header>
  );
}

type WhereProps = { screen: Screen; selectedInitiative: string | null; help: boolean; go: (to: () => void) => () => void; goHome: () => void; openInitiatives: () => void; openUsage: () => void };

/** Where you are (initiatives-view Amendment 2, I19): Home, Initiatives and
 *  Usage as one nav named Places, then the crumb inside a place. An
 *  initiative, its Agents and Settings sit under Home, as their crumbs
 *  always did; Help lies over whatever place is open and adds `/ Help`. */
export function Where({ screen, selectedInitiative, help, go, goHome, openInitiatives, openUsage }: WhereProps) {
  const place = placeOf(screen);
  const crumb = screen === "initiative" ? selectedInitiative ?? "Agents" : screen === "settings" ? "Settings" : null;
  return (
    <span className="tb-group tb-where">
      <nav className="places" aria-label="Places">
        <PlaceTab label="Home" current={place === "home"} onClick={go(goHome)} title="Needs me and every initiative" />
        <PlaceTab label="Initiatives" current={place === "initiatives"} onClick={go(openInitiatives)} title="Every initiative as a card: awake, asleep and archived" />
        <PlaceTab label="Usage" current={place === "usage"} onClick={go(openUsage)} title="Tokens and money, week by week" />
      </nav>
      {(crumb || help) && (
        <span className="crumbs">
          {crumb && <><span className="crumb-sep">/</span><b className={screen === "initiative" && selectedInitiative ? "mono crumb-id" : undefined} title={crumb}>{crumb}</b></>}
          {help && <><span className="crumb-sep">/</span><b>Help</b></>}
        </span>
      )}
    </span>
  );
}

/** The app's own controls, icons only: Compact to icon (only where the
 *  icon runs), Help, Settings. */
export function AppControls({ floats, help, settings, onCompact, onHelp, onSettings }: { floats: boolean; help: boolean; settings: boolean; onCompact: () => void; onHelp: () => void; onSettings: () => void }) {
  return (
    <>
      {floats && <button className="ghost gear" onClick={onCompact} title="Compact to icon (the icon floats on every desktop)" aria-label="Compact to icon"><CompactIcon /></button>}
      <button className={`ghost gear ${help ? "on" : ""}`} onClick={onHelp} title="Help: how we build, from help_doc" aria-label="Help" aria-pressed={help}><CircleHelp size={14} /></button>
      <button className={`ghost gear ${settings && !help ? "on" : ""}`} onClick={onSettings} title="Settings" aria-label="Settings"><Settings size={14} /></button>
    </>
  );
}

export type Place = "home" | "initiatives" | "usage";

/** The place a screen lives in: an initiative, its Agents and Settings are
 *  under Home, the way their crumbs read before the places were a nav. */
export function placeOf(screen: Screen): Place {
  return screen === "initiatives" ? "initiatives" : screen === "usage" ? "usage" : "home";
}

/** One place as a quiet text tab; the current one is `aria-current="page"`
 *  with the accent underline (I19). */
function PlaceTab({ label, current, onClick, title }: { label: string; current: boolean; onClick: () => void; title: string }) {
  return (
    <button type="button" className={`place-tab ${current ? "on" : ""}`} aria-current={current ? "page" : undefined} onClick={onClick} title={title}>{label}</button>
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
