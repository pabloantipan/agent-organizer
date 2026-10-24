import { CircleHelp, Inbox, Lock, LogOut, RefreshCw, RefreshCcwDot, Settings, UserRound } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../hooks/useWails";
import { useBoard, type Screen } from "../stores/board.store";
import { since } from "../lib";
import { needsMeRows } from "../lib/queue";
import { markOf, syncStale, type Place } from "../lib/place";
import { HelpView } from "./HelpView";
import { MemoryButton } from "./MemoryButton";
import { FloatAvailable, FloatCompact } from "../../wailsjs/go/main/App";

export function TopBar() {
  const { screen, selectedInitiative, review, goHome, openSettings, openUsage, openInitiatives, widthClass, view, loading, syncing, refresh, sync, error, lastMessage, account, lock, authMode, syncNote, setAccount, setLock, setOfflineChoice, agents } = useBoard();
  // With auth off there is no identity: no account menu, no Sign in, no email,
  // and no Sync button either, since sync is a skip nobody can act on.
  const identity = authMode === "firebase";
  // The one badge (FR-15): the rows of Needs me on Home, so the count is
  // always the rows.
  const needsMe = needsMeRows(view, agents).length;
  const [menu, setMenu] = useState(false);
  const machines = view?.board.machines ?? [];
  const machinesLine = view ? `${machines.length} machine${machines.length === 1 ? "" : "s"} · remote ${since(view.pulled_at)}` : "";
  // With firebase at the compact class the bar folds (initiatives-view A3
  // §2, I24): the memory button is short, the sync line goes into Sync's
  // name and hover (`Sync · stale` past a day), the account becomes an icon
  // last in the app group, and the title clamps to 12 characters.
  const fold = identity && widthClass === "compact";
  const stale = fold && syncStale(view?.pulled_at);
  const syncName = machinesLine ? `Sync. ${machinesLine.replace(" · ", ", ")}` : "Sync";
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
  // reads as a fault. At compact the idle line folds into Sync (A3 §2);
  // errors and sync notes never fold.
  const status = error ? <span className="meta err">{error}</span>
    : identity && syncNote ? <span className="meta warn" title="Sync is paused; showing the last pull">{syncNote}</span>
    : lastMessage ? <span className="meta">{lastMessage}</span>
    : identity && machinesLine && !fold ? <span className="meta">{machinesLine}</span>
    : null;
  const accountMenu = identity && (
    <span className={`account ${fold ? "icon" : ""}`}>
      {fold ? (
        <button className="ghost gear account-btn" onClick={() => setMenu(!menu)} title={account?.signed_in ? account.email : "not signed in"} aria-label={account?.signed_in ? `Account ${account.email}` : "Account, not signed in"} aria-haspopup="menu" aria-expanded={menu}>
          <UserRound size={14} />
        </button>
      ) : (
        <button className="ghost" onClick={() => setMenu(!menu)} title={account?.signed_in ? account.email : "not signed in"}>
          <UserRound size={14} /> {account?.signed_in ? account.email : "sign in"}
        </button>
      )}
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
    </span>
  );
  return (
    <header className={`topbar ${fold ? "fold" : ""}`} ref={bar}>
      {/* The bar by kind (leftovers-17 FR-3): brand · where you are · this
          Mac · your work · the app, 16 px between groups and no rules. The
          version is in the brand's hover at every width (FR-5). */}
      <span className="brand" title={version ? `Deltagos ${version}` : "Deltagos"}>Deltagos</span>
      <Where screen={screen} selectedInitiative={selectedInitiative} review={review ? { initiative: review.initiative, title: review.back.card.title || review.card } : null} go={go} goHome={goHome} openInitiatives={openInitiatives} openUsage={openUsage} />
      <span className="tb-group tb-mac">
        <MemoryButton />
        {status}
      </span>
      <span className="tb-group tb-work">
        {/* A verb that goes Home, not a place: never `.on` (A3 §1, U3). */}
        <button className="needs-me" onClick={go(goHome)} title="everything waiting on you">
          <Inbox size={14} /> Needs me{needsMe > 0 && <span className="badge-count num">{needsMe}</span>}
        </button>
        {/* Folded, Rescan keeps its glyph and its name: at 1024 the four
            folds of A3 §2 leave the bar 42 px over with Needs me's badge
            and `Sync · stale` (measured, cm-build's progress.md). */}
        <button className={`ghost ${fold ? "gear" : ""}`} onClick={refresh} disabled={loading} title="Rescan local disk" aria-label={fold ? (loading ? "Rescan, scanning" : "Rescan") : undefined}>
          <RefreshCw size={14} className={loading ? "spin" : ""} />{fold ? null : <> {loading ? "scanning…" : "Rescan"}</>}
        </button>
        {/* Quiet in every state (A4 §4, I30): the accent is for actions
            that commit in the content; stale is the signal, in magenta. */}
        {identity && (
          <button className="ghost" onClick={sync} disabled={syncing} title={fold ? `${syncName}\nPush this machine, pull all` : "Push this machine, pull all"} aria-label={fold ? syncName : undefined}>
            <RefreshCcwDot size={14} className={syncing ? "spin" : ""} /> {syncing ? "syncing…" : stale ? <>Sync · <span className="sync-stale">stale</span></> : "Sync"}
          </button>
        )}
      </span>
      <span className="tb-group tb-app">
        {!identity && lock?.enabled && (
          <button className="ghost" onClick={async () => setLock(await api.lockNow())} title="Lock this window">
            <Lock size={14} /> Lock
          </button>
        )}
        {!fold && accountMenu}
        <AppControls floats={floats} help={help} settings={screen === "settings"} onCompact={() => { closeHelp(); void FloatCompact(); }} onHelp={toggleHelp} onSettings={go(openSettings)} />
        {fold && accountMenu}
      </span>
      {help && <HelpView top={helpTop} onClose={closeHelp} />}
    </header>
  );
}

type WhereProps = { screen: Screen; selectedInitiative: string | null; review?: { initiative: string; title: string } | null; go: (to: () => void) => () => void; goHome: () => void; openInitiatives: () => void; openUsage: () => void };

/** Where you are (initiatives-view Amendment 3, I22, I23): Home,
 *  Initiatives and Usage as one nav named Places, then, inside an
 *  initiative, its id as the screen's title, after the places with the
 *  group gap and no slash. One mark per screen: the place, or on an
 *  initiative the title, with Initiatives as its parent (`placeOf`).
 *  Settings marks its own icon and shows no crumb. Help is an overlay
 *  (Amendment 4 §5, I31): the screen under it keeps its marks. */
export function Where({ screen, selectedInitiative, review, go, goHome, openInitiatives, openUsage }: WhereProps) {
  const crumb = screen === "initiative" ? selectedInitiative ?? "Agents" : null;
  // The Review screen (review-view §2): `<initiative> › <card title> ›
  // Review`, Review the current mark.
  return (
    <span className={`tb-group tb-where ${review ? "review-where" : ""}`}>
      <nav className="places" aria-label="Places">
        <PlaceTab label="Home" place="home" screen={screen} onClick={go(goHome)} title="Needs me and every initiative" />
        <PlaceTab label="Initiatives" place="initiatives" screen={screen} onClick={go(openInitiatives)} title="Every initiative as a card: awake, asleep and archived" />
        <PlaceTab label="Usage" place="usage" screen={screen} onClick={go(openUsage)} title="Tokens and money, week by week" />
      </nav>
      {review ? (
        <span className="crumbs">
          <span className="mono crumb-id" title={review.initiative}>{review.initiative}</span>
          <span className="crumb-sep" aria-hidden="true">›</span>
          <span className="crumb-card" title={review.title}>{review.title}</span>
          <span className="crumb-sep" aria-hidden="true">›</span>
          <b aria-current="page">Review</b>
        </span>
      ) : crumb && (
        <span className="crumbs">
          <b className={selectedInitiative ? "mono crumb-id" : undefined} title={crumb} aria-current="page">{crumb}</b>
        </span>
      )}
    </span>
  );
}

/** The app's own controls, icons only: Compact to icon (only where the
 *  icon runs), Help, Settings. Settings is a screen of no place, so on it
 *  the gear is the screen's mark (I22). Help is an overlay, opened and not
 *  current (Amendment 4 §5, I31): `?` is expanded and selected while open,
 *  never `aria-current`, and Settings under it stays current. Current is a
 *  line (`.on`), open is a surface (`.open`) (A5 §1, I35). */
export function AppControls({ floats, help, settings, onCompact, onHelp, onSettings }: { floats: boolean; help: boolean; settings: boolean; onCompact: () => void; onHelp: () => void; onSettings: () => void }) {
  return (
    <>
      {floats && <button className="ghost gear" onClick={onCompact} title="Compact to icon (the icon floats on every desktop)" aria-label="Compact to icon"><CompactIcon /></button>}
      <button className={`ghost gear sl ${help ? "open" : ""}`} onClick={onHelp} title="Help: how we build, from help_doc" aria-label="Help" aria-expanded={help}><CircleHelp size={14} /></button>
      <button className={`ghost gear sl ${settings ? "on" : ""}`} onClick={onSettings} title="Settings" aria-label="Settings" aria-current={settings ? "page" : undefined}><Settings size={14} /></button>
    </>
  );
}

/** One place as a quiet text tab: the current one is `aria-current="page"`
 *  with the accent underline; the parent of the open initiative carries the
 *  underline in --fg-subtle and no `aria-current`, still a link (I22). */
function PlaceTab({ label, place, screen, onClick, title }: { label: string; place: Place; screen: Screen; onClick: () => void; title: string }) {
  const mark = markOf(place, screen);
  return (
    <button type="button" className={`place-tab sl ${mark === "current" ? "on" : mark === "parent" ? "parent" : ""}`} aria-current={mark === "current" ? "page" : undefined} onClick={onClick} title={title}>{label}</button>
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
