import { create } from "zustand";
import { api, type Account, type AgentsView, type BoardView, type Group, type LockState, type Note } from "../hooks/useWails";
import type { merge } from "../../wailsjs/go/models";

export type Tab = "board" | "agents" | "slack" | "roadmap" | "calendar" | "initiatives" | "settings";

type State = {
  view: BoardView | null;
  account: Account | null;
  lock: LockState | null;
  offlineChoice: boolean;
  syncNote: string | null;
  loadSession: () => Promise<void>;
  setAccount: (a: Account | null) => void;
  setLock: (l: LockState) => void;
  setOfflineChoice: (v: boolean) => void;
  agents: AgentsView | null;
  applyAgents: (v: AgentsView) => void;
  // slackFocus is the agent the Slack tab is narrowed to, set from an agent
  // row's Message button; openSlack switches tab and initiative with it.
  // railCollapsed narrows the rail to a strip of ranks; remembered per machine.
  railCollapsed: boolean;
  setRailCollapsed: (v: boolean) => void;
  slackFocus: string | null;
  setSlackFocus: (agent: string | null) => void;
  openSlack: (initiativeId: string, agent: string | null) => void;
  // slackDraft is a one-shot instruction for the Slack tab from elsewhere
  // in the app: open this thread, or start a conversation with this subject.
  // The tab consumes it and clears it.
  slackDraft: { threadId?: string; subject?: string; body?: string } | null;
  openSlackThread: (initiativeId: string, threadId: string) => void;
  openSlackDraft: (initiativeId: string, agent: string | null, subject: string, body?: string) => void;
  clearSlackDraft: () => void;
  // The human's own state on cards and the queue, kept in the order document.
  addNote: (initiativeId: string, slug: string, text: string) => Promise<void>;
  editNote: (initiativeId: string, slug: string, noteId: string, text: string) => Promise<void>;
  setResolved: (key: string, resolved: boolean) => Promise<void>;
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
  setGroups: (groups: Group[]) => Promise<void>;
  reorderCards: (initiativeId: string, slugs: string[]) => Promise<void>;
};

export const useBoard = create<State>((set, get) => ({
  view: null,
  account: null,
  lock: null,
  offlineChoice: false,
  syncNote: null,
  loadSession: async () => {
    try {
      const [account, lock] = await Promise.all([api.getAccount(), api.getLock()]);
      set({ account, lock });
    } catch (e) {
      set({ error: String(e) });
    }
  },
  setAccount: (account) => set({ account }),
  setLock: (lock) => set({ lock }),
  setOfflineChoice: (offlineChoice) => set({ offlineChoice }),
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
  railCollapsed: (() => { try { return localStorage.getItem("rail.collapsed.strip") === "1"; } catch { return false; } })(),
  setRailCollapsed: (railCollapsed) => { try { localStorage.setItem("rail.collapsed.strip", railCollapsed ? "1" : "0"); } catch { /* per-viewer */ } set({ railCollapsed }); },
  slackFocus: null,
  setSlackFocus: (slackFocus) => set({ slackFocus }),
  openSlack: (selectedInitiative, slackFocus) => set({ tab: "slack", selectedInitiative, slackFocus, slackDraft: null }),
  slackDraft: null,
  openSlackThread: (selectedInitiative, threadId) => set({ tab: "slack", selectedInitiative, selected: null, slackDraft: { threadId } }),
  openSlackDraft: (selectedInitiative, slackFocus, subject, body) => set({ tab: "slack", selectedInitiative, selected: null, slackFocus, slackDraft: { subject, body } }),
  clearSlackDraft: () => set({ slackDraft: null }),
  addNote: async (initiativeId, slug, text) => {
    const key = `${initiativeId}/${slug}`;
    try {
      const n = await api.addNote(initiativeId, slug, text);
      set((st) => {
        if (!st.view) return {};
        const notes = { ...(st.view.order?.notes ?? {}) };
        notes[key] = [...(notes[key] ?? []), n];
        const order = Object.assign(Object.create(Object.getPrototypeOf(st.view.order)), st.view.order, { notes });
        return { view: Object.assign(Object.create(Object.getPrototypeOf(st.view)), st.view, { order }) };
      });
    } catch (e) { set({ error: String(e) }); }
  },
  editNote: async (initiativeId, slug, noteId, text) => {
    const key = `${initiativeId}/${slug}`;
    set((st) => {
      if (!st.view) return {};
      const notes = { ...(st.view.order?.notes ?? {}) };
      const list = (notes[key] ?? []).flatMap((n: Note) => (n.id !== noteId ? [n] : text.trim() ? [Object.assign(Object.create(Object.getPrototypeOf(n)), n, { text: text.trim() })] : []));
      if (list.length) notes[key] = list; else delete notes[key];
      const order = Object.assign(Object.create(Object.getPrototypeOf(st.view.order)), st.view.order, { notes });
      return { view: Object.assign(Object.create(Object.getPrototypeOf(st.view)), st.view, { order }) };
    });
    try { await api.editNote(initiativeId, slug, noteId, text); } catch (e) { set({ error: String(e) }); }
  },
  setResolved: async (key, resolved) => {
    set((st) => {
      if (!st.view) return {};
      const r = { ...(st.view.order?.resolved ?? {}) };
      if (resolved) r[key] = new Date().toISOString().slice(0, 10); else delete r[key];
      const order = Object.assign(Object.create(Object.getPrototypeOf(st.view.order)), st.view.order, { resolved: r });
      return { view: Object.assign(Object.create(Object.getPrototypeOf(st.view)), st.view, { order }) };
    });
    try { await api.setResolved(key, resolved); } catch (e) { set({ error: String(e) }); }
  },
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
      if (r.skipped) {
        set({ syncing: false, syncNote: r.skipped, lastMessage: null });
        return;
      }
      set({
        syncing: false,
        syncNote: null,
        lastMessage: `pushed ${r.pushed}, pulled ${r.machines?.length ?? 0} machine(s)`,
      });
      await get().refresh();
    } catch (e) {
      const msg = String(e);
      if (/not signed in|signed out|session expired/i.test(msg)) {
        set({ syncing: false, syncNote: msg.replace(/^Error:\s*/, "") });
        get().loadSession();
      } else {
        set({ syncing: false, error: msg });
      }
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
  setGroups: async (groups) => {
    try {
      await api.setGroups(groups);
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
