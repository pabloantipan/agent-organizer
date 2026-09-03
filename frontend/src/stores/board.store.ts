import { create } from "zustand";
import { api, type AgentsView, type BoardView } from "../hooks/useWails";
import type { merge } from "../../wailsjs/go/models";

export type Tab = "board" | "agents" | "roadmap" | "calendar" | "initiatives" | "settings";

type State = {
  view: BoardView | null;
  agents: AgentsView | null;
  applyAgents: (v: AgentsView) => void;
  loading: boolean;
  syncing: boolean;
  error: string | null;
  lastMessage: string | null;
  tab: Tab;
  selected: merge.BoardCard | null;
  filterMachine: string | null;
  filterClient: string | null;
  // null = every initiative (the merged board); otherwise one initiative id.
  selectedInitiative: string | null;
  setSelectedInitiative: (id: string | null) => void;
  refresh: () => Promise<void>;
  sync: () => Promise<void>;
  setTab: (t: Tab) => void;
  select: (c: merge.BoardCard | null) => void;
  setFilterMachine: (m: string | null) => void;
  setFilterClient: (c: string | null) => void;
  reorderInitiatives: (ids: string[]) => Promise<void>;
  reorderCards: (initiativeId: string, slugs: string[]) => Promise<void>;
};

export const useBoard = create<State>((set, get) => ({
  view: null,
  agents: null,
  applyAgents: (agents) =>
    set((st) => {
      if (!st.view) return { agents };
      // Patch the live counts into the board so rail, header, and rows move
      // without a full rescan. Remote rows are untouched.
      const byId = new Map(agents.groups?.map((g) => [g.id, g]) ?? []);
      const initiatives = (st.view.board.initiatives ?? []).map((i) => {
        if (!i.local) return i;
        const g = byId.get(i.id);
        return g ? Object.assign(Object.create(Object.getPrototypeOf(i)), i, { agents: g.agents, live: g.live, working: g.working }) : i;
      });
      const board = Object.assign(Object.create(Object.getPrototypeOf(st.view.board)), st.view.board, { initiatives, unassigned_agents: agents.unassigned });
      const view = Object.assign(Object.create(Object.getPrototypeOf(st.view)), st.view, { board });
      return { agents, view };
    }),
  loading: false,
  syncing: false,
  error: null,
  lastMessage: null,
  tab: "board",
  selected: null,
  filterMachine: null,
  filterClient: null,
  selectedInitiative: null,
  setSelectedInitiative: (selectedInitiative) => set({ selectedInitiative }),

  refresh: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const view = await api.getBoard();
      set({ view, error: view.error ?? null, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  sync: async () => {
    if (get().syncing) return;
    set({ syncing: true, lastMessage: null });
    try {
      const r = await api.syncNow();
      set({
        syncing: false,
        lastMessage: `pushed ${r.pushed}, pulled ${r.machines?.length ?? 0} machine(s)`,
      });
      await get().refresh();
    } catch (e) {
      set({ syncing: false, error: String(e) });
    }
  },

  setTab: (tab) => set({ tab }),
  select: (selected) => set({ selected }),
  setFilterMachine: (filterMachine) => set({ filterMachine }),
  setFilterClient: (filterClient) => set({ filterClient }),

  reorderInitiatives: async (ids) => {
    try {
      await api.setInitiativeOrder(ids);
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    }
  },
  reorderCards: async (initiativeId, slugs) => {
    try {
      await api.setCardOrder(initiativeId, slugs);
      await get().refresh();
    } catch (e) {
      set({ error: String(e) });
    }
  },
}));
