// Thin wrapper over the generated Wails bindings so components import one
// module and tests can stub it. Mirrors Bitacora's useTauri.ts.
import * as App from "../../wailsjs/go/main/App";
import { config, main, model, service } from "../../wailsjs/go/models";
export type AgentsView = service.AgentsView;
export type Agent = model.Agent;

export type BoardView = main.BoardView;
export type Config = config.Config;
export type SyncResult = service.SyncResult;
export type Order = model.Order;

export const api = {
  getBoard: (): Promise<BoardView> => App.GetBoard(),
  syncNow: (): Promise<SyncResult> => App.SyncNow(),
  getConfig: (): Promise<Config> => App.GetConfig(),
  saveConfig: (c: Config): Promise<void> => App.SaveConfig(c),
  configPath: (): Promise<string> => App.ConfigPath(),
  openInEditor: (p: string): Promise<void> => App.OpenInEditor(p),
  openTerminal: (p: string): Promise<void> => App.OpenTerminal(p),
  reveal: (p: string): Promise<void> => App.Reveal(p),
  getOrder: (): Promise<Order> => App.GetOrder(),
  reviewPrompt: (id: string): Promise<string> => App.ReviewPrompt(id),
  copyReviewPrompt: (id: string): Promise<void> => App.CopyReviewPrompt(id),
  runReview: (id: string): Promise<void> => App.RunReview(id),
  attachSession: (name: string): Promise<void> => App.AttachSession(name),
  getAgents: (): Promise<AgentsView> => App.GetAgents(),
  createAgent: (id: string, name: string): Promise<void> => App.CreateAgent(id, name),
  killAgent: (session: string): Promise<void> => App.KillAgent(session),
  stopAgent: (pid: number): Promise<void> => App.StopAgent(pid),
  setInitiativeOrder: (ids: string[]): Promise<void> => App.SetInitiativeOrder(ids),
  setCardOrder: (id: string, slugs: string[]): Promise<void> => App.SetCardOrder(id, slugs),
};
