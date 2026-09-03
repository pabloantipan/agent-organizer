import { useEffect } from "react";
import { TopBar } from "./components/TopBar";
import { Board } from "./components/Board";
import { Rail } from "./components/Rail";
import { Initiatives } from "./components/Initiatives";
import { Settings } from "./components/Settings";
import { Calendar } from "./components/Calendar";
import { RoadmapView } from "./components/RoadmapView";
import { AgentsView } from "./components/AgentsView";
import { Gate } from "./components/Gate";
import { CardDrawer } from "./components/CardDrawer";
import { useBoard } from "./stores/board.store";
import { api, type AgentsView as AgentsPayload } from "./hooks/useWails";
import { EventsOn } from "../wailsjs/runtime/runtime";

export default function App() {
  const { tab, refresh, sync, applyAgents } = useBoard();

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
      <main className={["board", "calendar", "roadmap", "agents"].includes(tab) ? "content with-rail" : "content"}>
        {tab === "board" && (
          <>
            <Rail />
            <Board />
          </>
        )}
        {tab === "initiatives" && <Initiatives />}
        {tab === "agents" && (
          <>
            <Rail />
            <div className="board-wrap"><AgentsView /></div>
          </>
        )}
        {tab === "roadmap" && (
          <>
            <Rail />
            <div className="board-wrap"><RoadmapView /></div>
          </>
        )}
        {tab === "calendar" && (
          <>
            <Rail />
            <div className="board-wrap"><Calendar /></div>
          </>
        )}
        {tab === "settings" && <Settings />}
      </main>
      <CardDrawer />
    </div>
    </Gate>
  );
}
