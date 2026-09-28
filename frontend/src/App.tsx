import { useEffect, useRef } from "react";
import { TopBar } from "./components/TopBar";
import { Board } from "./components/Board";
import { Rail } from "./components/Rail";
import { Home } from "./components/Home";
import { Overview } from "./components/Overview";
import { InitiativeHeader } from "./components/InitiativeHeader";
import { Settings } from "./components/Settings";
import { RoadmapView } from "./components/RoadmapView";
import { DecisionsView } from "./components/DecisionsView";
import { AgentsView } from "./components/AgentsView";
import { SlackView } from "./components/SlackView";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Gate } from "./components/Gate";
import { CardDrawer } from "./components/CardDrawer";
import { useBoard } from "./stores/board.store";
import { api, type AgentsView as AgentsPayload } from "./hooks/useWails";
import { EventsOn } from "../wailsjs/runtime/runtime";
import "./styles/shell.css";

export default function App() {
  const { screen, refresh, sync, applyAgents, railCollapsed } = useBoard();

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && refresh());

    const off = EventsOn("agents", (v: AgentsPayload) => applyAgents(v));
    let timer: number | undefined;
    api.getConfig().then((c) => {
      const minutes = c.sync_interval_minutes ?? 0;
      if (minutes > 0 && c.gcp_project) {
        timer = window.setInterval(sync, minutes * 60_000);
      }
    });
    return () => {
      window.removeEventListener("focus", onFocus);
      off();
      if (timer) window.clearInterval(timer);
    };
  }, [refresh, sync, applyAgents]);

  return (
    <Gate>
    <div className="shell">
      <TopBar />
      {screen === "settings" ? (
        <main className="content"><ErrorBoundary name="Settings"><Settings /></ErrorBoundary></main>
      ) : (
        <main className={`content with-rail ${railCollapsed ? "rail-strip" : ""}`}>
          <Rail />
          {screen === "home" ? <div className="board-wrap"><ErrorBoundary name="Home"><Home /></ErrorBoundary></div> : <InitiativeScreen />}
        </main>
      )}
      <CardDrawer />
    </div>
    </Gate>
  );
}

/** One initiative: its header over the six sub-views (FR-14). Each sub-view
 *  mounts the view that existed before the redesign; Conversations is the
 *  Slack view renamed, Calendar lives inside Roadmap. */
function InitiativeScreen() {
  const { view, selectedInitiative, sub, goHome } = useBoard();
  // The body under the tabs is the one scroll container (FR-11); another tab
  // or initiative opens at its top, not at the scroll the last one left.
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => { body.current?.scrollTo(0, 0); }, [selectedInitiative, sub]);
  if (!view) return <div className="board-wrap"><div className="empty">Loading…</div></div>;
  const rows = (view.board.initiatives ?? []).filter((i) => i.id === selectedInitiative);
  const initiative = rows.find((i) => i.local) ?? rows[0];
  if (!initiative) {
    return (
      <div className="board-wrap">
        <div className="panel empty-state">
          <div>{selectedInitiative} is not on the board any more.</div>
          <div className="sub">A rescan no longer finds its working-on/initiative.yaml.</div>
          <button onClick={goHome}>Back to Home</button>
        </div>
      </div>
    );
  }
  return (
    <div className="initiative-screen">
      <InitiativeHeader initiative={initiative} />
      <div ref={body} className={`board-wrap ${sub === "conversations" ? "slack-wrap" : ""}`}>
        {sub === "overview" && <ErrorBoundary name="Overview"><Overview initiative={initiative} /></ErrorBoundary>}
        {sub === "work" && <ErrorBoundary name="Board"><Board /></ErrorBoundary>}
        {sub === "roadmap" && <ErrorBoundary name="RoadmapView"><RoadmapView /></ErrorBoundary>}
        {sub === "decisions" && <ErrorBoundary name="DecisionsView"><DecisionsView /></ErrorBoundary>}
        {sub === "conversations" && <ErrorBoundary name="SlackView"><SlackView /></ErrorBoundary>}
        {sub === "agents" && <ErrorBoundary name="AgentsView"><AgentsView /></ErrorBoundary>}
      </div>
    </div>
  );
}
