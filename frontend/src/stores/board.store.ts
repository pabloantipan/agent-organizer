import { create } from "zustand";
import { api, type Account, type AgentsView, type BoardView, type Group, type LockState, type Note } from "../hooks/useWails";
import type { merge } from "../../wailsjs/go/models";
import { dropDraft, editDraft, openDraft, type Draft, type Drafts } from "../lib/drafts";
import { railCollapsedFor, roomyOf, widthClassOf, type WidthClass } from "../lib/width";

/** Navigation is Home, one initiative under its header with six sub-views,
 *  or Settings behind the gear (FR-14). */
export type Screen = "home" | "initiative" | "settings";
export type Sub = "overview" | "work" | "roadmap" | "decisions" | "conversations" | "agents";

/** The identity mode of the backend. "off" is the default and means there is
 *  no sign-in anywhere: no gate, no account UI, sync skipped. */
export type AuthMode = "off" | "firebase";

/** Mirror of config.AuthMode in Go: anything but an explicit firebase is off. */
export const authModeOf = (raw: string | undefined): AuthMode => (raw?.trim().toLowerCase() === "firebase" ? "firebase" : "off");

type State = {
  view: BoardView | null;
  account: Account | null;
  lock: LockState | null;
  // null until loadSession has answered; the gate waits for it.
  authMode: AuthMode | null;
  offlineChoice: boolean;
  syncNote: string | null;
  loadSession: () => Promise<void>;
  setAccount: (a: Account | null) => void;
  setLock: (l: LockState) => void;
  setOfflineChoice: (v: boolean) => void;
  agents: AgentsView | null;
  applyAgents: (v: AgentsView) => void;
  // slackFocus is the agent the Conversations sub-view is narrowed to, set from an agent
  // row's Message button; openSlack switches to it and to the initiative.
  // railCollapsed narrows the rail to a strip of ranks; remembered per machine.
  // With no stored choice it follows the width class (railCollapsedFor).
  railCollapsed: boolean;
  setRailCollapsed: (v: boolean) => void;
  // The window's width class (responsive-home FR-1) and regular's top, where
  // Home's cap lifts (FR-3). Set by App's one resize listener, only on change.
  widthClass: WidthClass;
  roomy: boolean;
  setWindowWidth: (w: number) => void;
  // The Rule box open on a Needs me row and what is typed in it, kept above
  // Home's layout so crossing a width class keeps both (FR-5). key is the
  // row's key, decision:<initiative>/<NNNN>. Leaving Home closes it.
  ruleDraft: RuleDraft | null;
  // One draft per record until Rule or Cancel (FR-9): closing a box, opening
  // another row's, or leaving Home keeps its words here, and reopening
  // restores them. Only dropRule (Cancel, the ruling written, the row gone)
  // discards one.
  ruleDrafts: Record<string, Draft>;
  openRule: (key: string | null) => void;
  setRuleDraft: (patch: Partial<Omit<RuleDraft, "key">>) => void;
  dropRule: (key: string) => void;
  // The initiative header open (Details) or folded (initiative-header FR-1).
  // The stored choice is written only by the lead's Details toggle; a landing
  // folds the header in memory and leaves the stored choice alone, which the
  // next navigation made by hand (openInitiative) applies again.
  headerOpen: boolean;
  setHeaderOpen: (v: boolean) => void;
  // stageFocus is the stage Roadmap → Stages expands and focuses, set by a
  // stage tile: <initiative>/<stage id>. StageRoadmap consumes it and clears it.
  stageFocus: string | null;
  openStage: (initiativeId: string, stageId: string) => void;
  clearStageFocus: () => void;
  slackFocus: string | null;
  setSlackFocus: (agent: string | null) => void;
  openSlack: (initiativeId: string, agent: string | null) => void;
  // slackDraft is a one-shot instruction for Conversations from elsewhere
  // in the app: open this thread, or start a conversation with this subject.
  // The sub-view consumes it and clears it.
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
  screen: Screen;
  sub: Sub;
  // needsMeFocus is the Needs me row Home scrolls to and highlights, set by
  // openNeedsMe: decision:<initiative>/<NNNN>, thread:<id>, card:<initiative>/<slug>.
  needsMeFocus: string | null;
  // decisionFocus is the record Decisions expands, scrolls to and highlights,
  // set by openDecision: <initiative>/<NNNN>. Any other navigation clears it.
  decisionFocus: string | null;
  // Counts openDecision calls, so pressing the chip again on the same record
  // lands again (FR-2: a press always visibly does something).
  decisionSeq: number;
  // agentsLanding is where focus lands on the Agents sub-view after a
  // Needs me verb (ui-leftovers FR-5): "seat:<name>", the seat blocking the
  // launch, or "crew-up", Bring crew up. Crew consumes it and clears it.
  agentsLanding: string | null;
  openAgentsAt: (initiativeId: string, landing: string) => void;
  clearAgentsLanding: () => void;
  goHome: () => void;
  openInitiative: (id: string, sub: Sub) => void;
  openNeedsMe: (key: string) => void;
  openDecision: (initiativeId: string, number: string) => void;
  openSettings: () => void;
  selected: merge.BoardCard | null;
  filterMachine: string | null;
  filterClient: string | null;
  // The initiative on screen; null on Home and Settings.
  selectedInitiative: string | null;
  setSelectedInitiative: (id: string | null) => void;
  refresh: () => Promise<void>;
  sync: () => Promise<void>;
  select: (c: merge.BoardCard | null) => void;
  setFilterMachine: (m: string | null) => void;
  setFilterClient: (c: string | null) => void;
  reorderInitiatives: (ids: string[]) => Promise<void>;
  setGroups: (groups: Group[]) => Promise<void>;
  reorderCards: (initiativeId: string, slugs: string[]) => Promise<void>;
};

export type RuleDraft = { key: string; chosen: string; words: string };

const draftsOf = (st: State): Drafts => ({ open: st.ruleDraft, drafts: st.ruleDrafts });
const ruleState = (d: Drafts) => ({ ruleDraft: d.open, ruleDrafts: d.drafts });

const RAIL_KEY = "rail.collapsed.strip";
const storedRail = () => { try { return localStorage.getItem(RAIL_KEY); } catch { return null; } };
const HEADER_KEY = "initiative.header.open";
const storedHeaderOpen = () => { try { return localStorage.getItem(HEADER_KEY) === "1"; } catch { return false; } };
const width0 = typeof window === "undefined" ? 1440 : window.innerWidth;

export const useBoard = create<State>((set, get) => ({
  view: null,
  account: null,
  lock: null,
  authMode: null,
  offlineChoice: false,
  syncNote: null,
  loadSession: async () => {
    try {
      const [account, lock, cfg] = await Promise.all([api.getAccount(), api.getLock(), api.getConfig()]);
      set({ account, lock, authMode: authModeOf(cfg.auth) });
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
  railCollapsed: railCollapsedFor(storedRail(), widthClassOf(width0)),
  // The lead's toggle is the only writer of the stored choice.
  setRailCollapsed: (railCollapsed) => { try { localStorage.setItem(RAIL_KEY, railCollapsed ? "1" : "0"); } catch { /* per-viewer */ } set({ railCollapsed }); },
  widthClass: widthClassOf(width0),
  roomy: roomyOf(width0),
  setWindowWidth: (w) => {
    const widthClass = widthClassOf(w);
    const roomy = roomyOf(w);
    const st = get();
    if (widthClass === st.widthClass && roomy === st.roomy) return;
    set({ widthClass, roomy, railCollapsed: railCollapsedFor(storedRail(), widthClass) });
  },
  ruleDraft: null,
  ruleDrafts: {},
  openRule: (key) => set((st) => ruleState(openDraft(draftsOf(st), key))),
  setRuleDraft: (patch) => set((st) => ruleState(editDraft(draftsOf(st), patch))),
  dropRule: (key) => set((st) => ruleState(dropDraft(draftsOf(st), key))),
  headerOpen: storedHeaderOpen(),
  setHeaderOpen: (headerOpen) => { try { localStorage.setItem(HEADER_KEY, headerOpen ? "1" : "0"); } catch { /* per-viewer */ } set({ headerOpen }); },
  stageFocus: null,
  openStage: (selectedInitiative, stageId) => set({ ruleDraft: null, headerOpen: false, screen: "initiative", selectedInitiative, sub: "roadmap", selected: null, needsMeFocus: null, decisionFocus: null, stageFocus: `${selectedInitiative}/${stageId}` }),
  clearStageFocus: () => set({ stageFocus: null }),
  slackFocus: null,
  setSlackFocus: (slackFocus) => set({ slackFocus }),
  openSlack: (selectedInitiative, slackFocus) => set({ ruleDraft: null, headerOpen: false, screen: "initiative", sub: "conversations", selectedInitiative, slackFocus, slackDraft: null, needsMeFocus: null }),
  slackDraft: null,
  openSlackThread: (selectedInitiative, threadId) => set({ ruleDraft: null, headerOpen: false, screen: "initiative", sub: "conversations", selectedInitiative, selected: null, slackDraft: { threadId }, needsMeFocus: null }),
  openSlackDraft: (selectedInitiative, slackFocus, subject, body) => set({ ruleDraft: null, headerOpen: false, screen: "initiative", sub: "conversations", selectedInitiative, selected: null, slackFocus, slackDraft: { subject, body }, needsMeFocus: null }),
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
  screen: "home",
  sub: "overview",
  needsMeFocus: null,
  decisionFocus: null,
  decisionSeq: 0,
  goHome: () => set({ screen: "home", selectedInitiative: null, needsMeFocus: null, decisionFocus: null }),
  agentsLanding: null,
  openAgentsAt: (selectedInitiative, agentsLanding) => set({ ruleDraft: null, headerOpen: false, screen: "initiative", selectedInitiative, sub: "agents", needsMeFocus: null, decisionFocus: null, agentsLanding }),
  clearAgentsLanding: () => set({ agentsLanding: null }),
  // A navigation by hand: the header takes the lead's stored choice again.
  openInitiative: (selectedInitiative, sub) => set({ ruleDraft: null, headerOpen: storedHeaderOpen(), screen: "initiative", selectedInitiative, sub, needsMeFocus: null, decisionFocus: null, stageFocus: null }),
  openNeedsMe: (needsMeFocus) => set({ headerOpen: false, screen: "home", selectedInitiative: null, selected: null, needsMeFocus, decisionFocus: null }),
  openDecision: (selectedInitiative, number) => set((st) => ({ ruleDraft: null, headerOpen: false, screen: "initiative", selectedInitiative, sub: "decisions", selected: null, needsMeFocus: null, stageFocus: null, decisionFocus: `${selectedInitiative}/${number}`, decisionSeq: st.decisionSeq + 1 })),
  openSettings: () => set({ ruleDraft: null, screen: "settings", selectedInitiative: null, needsMeFocus: null, decisionFocus: null }),
  selected: null,
  filterMachine: null,
  filterClient: null,
  selectedInitiative: null,
  // Picking an initiative keeps the sub-view you are on; clearing it is Home.
  setSelectedInitiative: (id) => (id === null ? get().goHome() : get().openInitiative(id, get().screen === "initiative" ? get().sub : "overview")),

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
      if (r.skipped === "auth off") {
        // The app is meant to run this way; a skip nobody can act on is noise.
        set({ syncing: false, syncNote: null, lastMessage: null });
        return;
      }
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

  // Open on a Needs me card row is a landing, so it folds the header (FR-1);
  // opening a card anywhere else leaves the header as it is.
  select: (selected) => set(selected && get().screen === "home" ? { selected, headerOpen: false } : { selected }),
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
