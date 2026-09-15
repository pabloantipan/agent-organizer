// Thin wrapper over the generated Wails bindings so components import one
// module and tests can stub it. Mirrors Bitacora's useTauri.ts.
import * as App from "../../wailsjs/go/main/App";
import { auth, config, discuss, main, model, service } from "../../wailsjs/go/models";
export type Account = auth.Account;
export type LockState = service.LockState;
export type AgentsView = service.AgentsView;
export type AgentGroup = service.AgentGroup;
export type Seat = service.Seat;
export type CardWait = service.CardWait;
export type ThreadState = model.ThreadState;
export type Agent = model.Agent;
export type ContextStatus = model.ContextStatus;

export type BoardView = main.BoardView;
export type Config = config.Config;
export type SyncResult = service.SyncResult;
export type Order = model.Order;
export type Note = model.Note;
export type RetireOptions = service.RetireOptions;
export type RetirePlan = service.RetirePlan;
export type RetireReport = service.RetireReport;
export type CellView = service.CellView;
export type CellThread = service.CellThread;
export type CellThreadView = service.CellThreadView;
export type CellPost = service.CellPost;
export type CellMessage = discuss.Message;
export type Group = model.Group;

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
  createCrew: (id: string): Promise<string[]> => App.CreateCrew(id),
  getCell: (id: string): Promise<CellView> => App.GetCell(id),
  getCellThread: (id: string, tid: string): Promise<CellThreadView> => App.GetCellThread(id, tid),
  postToCell: (id: string, p: CellPost): Promise<discuss.PostResult> => App.PostToCell(id, p as service.CellPost),
  setCellThreadStatus: (id: string, tid: string, status: string): Promise<void> => App.SetCellThreadStatus(id, tid, status),
  searchCell: (id: string, q: string): Promise<CellMessage[]> => App.SearchCell(id, q),
  pickUp: (id: string): Promise<number> => App.PickUp(id),
  addNote: (id: string, slug: string, text: string): Promise<model.Note> => App.AddNote(id, slug, text),
  editNote: (id: string, slug: string, noteId: string, text: string): Promise<void> => App.EditNote(id, slug, noteId, text),
  setResolved: (key: string, resolved: boolean): Promise<void> => App.SetResolved(key, resolved),
  planRetire: (o: RetireOptions): Promise<RetirePlan> => App.PlanRetire(o as service.RetireOptions),
  retire: (o: RetireOptions): Promise<RetireReport> => App.Retire(o as service.RetireOptions),
  clean: (): Promise<RetireReport> => App.Clean(),
  killAgent: (session: string): Promise<void> => App.KillAgent(session),
  stopAgent: (pid: number): Promise<void> => App.StopAgent(pid),
  setInitiativeOrder: (ids: string[]): Promise<void> => App.SetInitiativeOrder(ids),
  setGroups: (groups: Group[]): Promise<void> => App.SetGroups(groups),
  setCardOrder: (id: string, slugs: string[]): Promise<void> => App.SetCardOrder(id, slugs),
};
