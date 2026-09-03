// Thin wrapper over the generated Wails bindings so components import one
// module and tests can stub it. Mirrors Bitacora's useTauri.ts.
import * as App from "../../wailsjs/go/main/App";
import { auth, config, main, model, service } from "../../wailsjs/go/models";
export type Account = auth.Account;
export type LockState = service.LockState;
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
  version: (): Promise<string> => App.Version(),
  getAccount: (): Promise<Account> => App.GetAccount(),
  signIn: (email: string, password: string): Promise<Account> => App.SignIn(email, password),
  signUp: (email: string, password: string): Promise<Account> => App.SignUp(email, password),
  signOut: (): Promise<void> => App.SignOut(),
  resetPassword: (email: string): Promise<void> => App.ResetPassword(email),
  getLock: (): Promise<LockState> => App.GetLock(),
  unlock: (passcode: string): Promise<LockState> => App.Unlock(passcode),
  lockNow: (): Promise<LockState> => App.LockNow(),
  setPasscode: (current: string, next: string, force: boolean): Promise<LockState> => App.SetPasscode(current, next, force),
  clearPasscode: (current: string): Promise<LockState> => App.ClearPasscode(current),
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
