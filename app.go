package main

import (
	"context"
	"time"

	"organizer/internal/auth"
	"organizer/internal/cli"

	wruntime "github.com/wailsapp/wails/v2/pkg/runtime"

	"organizer/internal/config"
	"organizer/internal/discuss"
	"organizer/internal/merge"
	"organizer/internal/model"
	"organizer/internal/service"
)

// App is the Wails-bound surface. It stays thin; logic lives in service.
type App struct {
	ctx context.Context
	svc *service.Service
	err string
}

func NewApp() *App { return &App{} }

// agentsEvery is the sampling period for agent processes. One ps and one
// lsof per tick; nothing runs when the window is closed.
const agentsEvery = 10 * time.Second

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	svc, err := service.New()
	if err != nil {
		a.err = err.Error()
		return
	}
	a.svc = svc
	go a.agentTicker(ctx)
}

// agentTicker re-samples agents and pushes the view to the frontend as the
// "agents" event, so every tab updates without focus or a manual rescan.
func (a *App) agentTicker(ctx context.Context) {
	defer func() {
		if r := recover(); r != nil {
			wruntime.LogErrorf(ctx, "agent ticker stopped: %v", r)
		}
	}()
	// First sample right away so the UI does not wait a full period; the
	// second one, ten seconds later, is the first that can tell working from idle.
	a.svc.Scan(false)
	wruntime.EventsEmit(ctx, "agents", a.svc.RefreshAgents())
	t := time.NewTicker(agentsEvery)
	defer t.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-t.C:
			wruntime.EventsEmit(ctx, "agents", a.svc.RefreshAgents())
		}
	}
}

// BoardView is what the UI renders: the merged board plus sync metadata.
type BoardView struct {
	Board    merge.Board `json:"board"`
	Order    model.Order `json:"order"`
	PulledAt time.Time   `json:"pulled_at"`
	Error    string      `json:"error,omitempty"`
}

func (a *App) GetBoard() BoardView {
	if a.svc == nil {
		return BoardView{Error: a.err}
	}
	return BoardView{Board: a.svc.Board(), Order: a.svc.Order(), PulledAt: a.svc.PulledAt()}
}

func (a *App) SyncNow() (service.SyncResult, error) {
	if a.svc == nil {
		return service.SyncResult{}, errString(a.err)
	}
	ctx, cancel := context.WithTimeout(a.ctx, 60*time.Second)
	defer cancel()
	return a.svc.Sync(ctx, true, true)
}

func (a *App) GetConfig() config.Config {
	if a.svc == nil {
		return config.Default()
	}
	return a.svc.Config()
}

func (a *App) SaveConfig(cfg config.Config) error {
	if a.svc == nil {
		return errString(a.err)
	}
	return a.svc.SaveConfig(cfg)
}

func (a *App) ConfigPath() string { return config.Path() }

// Version reports the build version shown in the UI.
func (a *App) Version() string { return cli.Version }

// ReviewPrompt returns the agent prompt for an initiative.
func (a *App) ReviewPrompt(initiativeID string) (string, error) {
	if a.svc == nil {
		return "", errString(a.err)
	}
	return a.svc.ReviewPrompt(initiativeID)
}

// CopyReviewPrompt puts the prompt on the clipboard.
func (a *App) CopyReviewPrompt(initiativeID string) error {
	text, err := a.ReviewPrompt(initiativeID)
	if err != nil {
		return err
	}
	return wruntime.ClipboardSetText(a.ctx, text)
}

// RunReview opens a terminal running the configured agent with the prompt.
func (a *App) RunReview(initiativeID string) error {
	if a.svc == nil {
		return errString(a.err)
	}
	return a.svc.RunReview(initiativeID)
}

func (a *App) GetOrder() model.Order {
	if a.svc == nil {
		return model.Order{}
	}
	return a.svc.Order()
}

func (a *App) SetInitiativeOrder(ids []string) error {
	if a.svc == nil {
		return errString(a.err)
	}
	return a.svc.SetInitiativeOrder(ids)
}

func (a *App) AddNote(initiativeID, slug, text string) (model.Note, error) {
	if a.svc == nil {
		return model.Note{}, errString(a.err)
	}
	return a.svc.AddNote(initiativeID, slug, text)
}

func (a *App) EditNote(initiativeID, slug, id, text string) error {
	if a.svc == nil {
		return errString(a.err)
	}
	return a.svc.EditNote(initiativeID, slug, id, text)
}

func (a *App) SetResolved(key string, resolved bool) error {
	if a.svc == nil {
		return errString(a.err)
	}
	return a.svc.SetResolved(key, resolved)
}

// SetGroups replaces the rail groups; the ranking follows them.
func (a *App) SetGroups(groups []model.Group) error {
	if a.svc == nil {
		return errString(a.err)
	}
	return a.svc.SetGroups(groups)
}

func (a *App) SetCardOrder(initiativeID string, slugs []string) error {
	if a.svc == nil {
		return errString(a.err)
	}
	return a.svc.SetCardOrder(initiativeID, slugs)
}

func (a *App) OpenInEditor(path string) error { return a.svc.OpenInEditor(path) }
func (a *App) OpenTerminal(dir string) error  { return a.svc.OpenTerminal(dir) }
func (a *App) Reveal(path string) error       { return a.svc.Reveal(path) }

// ---- session and lock ----

// GetAccount is the account view: the empty account while auth is off, which
// is what tells the frontend there is no identity to show.
func (a *App) GetAccount() auth.Account {
	if a.svc == nil {
		return auth.Account{}
	}
	return a.svc.Account()
}

func (a *App) SignIn(email, password string) (auth.Account, error) {
	if a.svc == nil {
		return auth.Account{}, errString(a.err)
	}
	ctx, cancel := context.WithTimeout(a.ctx, 30*time.Second)
	defer cancel()
	return a.svc.SignIn(ctx, email, password)
}

func (a *App) SignUp(email, password string) (auth.Account, error) {
	if a.svc == nil {
		return auth.Account{}, errString(a.err)
	}
	ctx, cancel := context.WithTimeout(a.ctx, 30*time.Second)
	defer cancel()
	return a.svc.SignUp(ctx, email, password)
}

func (a *App) SignOut() error {
	if a.svc == nil {
		return errString(a.err)
	}
	if a.svc.AuthMode() == config.AuthOff {
		return service.ErrAuthOff
	}
	return a.svc.Auth.SignOut()
}

func (a *App) ResetPassword(email string) error {
	if a.svc == nil {
		return errString(a.err)
	}
	if a.svc.AuthMode() == config.AuthOff {
		return service.ErrAuthOff
	}
	ctx, cancel := context.WithTimeout(a.ctx, 30*time.Second)
	defer cancel()
	return a.svc.Auth.ResetPassword(ctx, email)
}

func (a *App) GetLock() service.LockState {
	if a.svc == nil {
		return service.LockState{Unlocked: true}
	}
	return a.svc.LockState()
}

func (a *App) Unlock(passcode string) (service.LockState, error) {
	if a.svc == nil {
		return service.LockState{Unlocked: true}, nil
	}
	return a.svc.Unlock(passcode)
}

func (a *App) LockNow() service.LockState {
	if a.svc == nil {
		return service.LockState{Unlocked: true}
	}
	return a.svc.RelockNow()
}

func (a *App) SetPasscode(current, next string, force bool) (service.LockState, error) {
	if a.svc == nil {
		return service.LockState{}, errString(a.err)
	}
	return a.svc.SetPasscode(current, next, force)
}

func (a *App) ClearPasscode(current string) (service.LockState, error) {
	if a.svc == nil {
		return service.LockState{}, errString(a.err)
	}
	return a.svc.ClearPasscode(current)
}

// GetAgents re-samples agent processes and sessions, grouped per initiative.
func (a *App) GetAgents() service.AgentsView {
	if a.svc == nil {
		return service.AgentsView{}
	}
	return a.svc.RefreshAgents()
}

// CreateAgent starts a new probe for an initiative (empty name = animal name).
func (a *App) CreateAgent(initiativeID, name string) error {
	if a.svc == nil {
		return errString(a.err)
	}
	return a.svc.CreateAgent(initiativeID, name)
}

// CreateCrew launches every seat of the initiative's cell: one probe per
// persona in one iTerm2 window. Returns the launch lines it ran.
func (a *App) CreateCrew(initiativeID string) ([]string, error) {
	if a.svc == nil {
		return nil, errString(a.err)
	}
	return a.svc.CreateCrew(initiativeID, true)
}

// ---- the Cell tab: one initiative's mailbox, read and written as the human ----

func (a *App) GetCell(initiativeID string) (service.CellView, error) {
	if a.svc == nil {
		return service.CellView{}, errString(a.err)
	}
	return a.svc.Cell(initiativeID)
}

func (a *App) GetCellThread(initiativeID, threadID string) (service.CellThreadView, error) {
	if a.svc == nil {
		return service.CellThreadView{}, errString(a.err)
	}
	return a.svc.CellThread(initiativeID, threadID)
}

func (a *App) PostToCell(initiativeID string, p service.CellPost) (discuss.PostResult, error) {
	if a.svc == nil {
		return discuss.PostResult{}, errString(a.err)
	}
	return a.svc.PostToCell(initiativeID, p)
}

func (a *App) SetCellThreadStatus(initiativeID, threadID, status string) error {
	if a.svc == nil {
		return errString(a.err)
	}
	return a.svc.SetCellThreadStatus(initiativeID, threadID, status)
}

func (a *App) SearchCell(initiativeID, q string) ([]discuss.Message, error) {
	if a.svc == nil {
		return nil, errString(a.err)
	}
	return a.svc.SearchCell(initiativeID, q)
}

// PlanRetire shows what retiring seats of a cell would do; Retire does it.
func (a *App) PlanRetire(o service.RetireOptions) (service.RetirePlan, error) {
	if a.svc == nil {
		return service.RetirePlan{}, errString(a.err)
	}
	return a.svc.PlanRetire(o)
}

func (a *App) Retire(o service.RetireOptions) (service.RetireReport, error) {
	if a.svc == nil {
		return service.RetireReport{}, errString(a.err)
	}
	r, err := a.svc.Retire(o)
	if err == nil {
		wruntime.EventsEmit(a.ctx, "agents", a.svc.RefreshAgents())
	}
	return r, err
}

// Clean removes exited probe sessions and stale statusline records.
func (a *App) Clean() (service.RetireReport, error) {
	if a.svc == nil {
		return service.RetireReport{}, errString(a.err)
	}
	r, err := a.svc.Clean()
	if err == nil {
		wruntime.EventsEmit(a.ctx, "agents", a.svc.RefreshAgents())
	}
	return r, err
}

// PickUp marks the human's mail in a cell as delivered: the mailbox was read.
func (a *App) PickUp(initiativeID string) (int, error) {
	if a.svc == nil {
		return 0, errString(a.err)
	}
	return a.svc.PickUp(initiativeID)
}

// CellTypes exists only so the Wails generator emits the nested discuss types.
func (a *App) CellTypes() (discuss.Thread, discuss.Message) {
	return discuss.Thread{}, discuss.Message{}
}

// KillAgent removes a probe session via `probe -k`.
func (a *App) KillAgent(session string) error {
	if a.svc == nil {
		return errString(a.err)
	}
	if err := a.svc.KillAgent(session); err != nil {
		return err
	}
	wruntime.EventsEmit(a.ctx, "agents", a.svc.RefreshAgents())
	return nil
}

// StopAgent terminates a plain-terminal agent process.
func (a *App) StopAgent(pid int) error {
	if a.svc == nil {
		return errString(a.err)
	}
	if err := a.svc.StopAgent(pid); err != nil {
		return err
	}
	time.Sleep(300 * time.Millisecond)
	wruntime.EventsEmit(a.ctx, "agents", a.svc.RefreshAgents())
	return nil
}

// AttachSession opens an agent session in iTerm2 (or Terminal as fallback).
func (a *App) AttachSession(name string) error {
	if a.svc == nil {
		return errString(a.err)
	}
	return a.svc.AttachSession(name)
}

// MilestoneType exists only so the Wails generator emits model.Milestone in
// models.ts; nested slice element types are otherwise skipped.
func (a *App) MilestoneType() model.Milestone { return model.Milestone{} }

type errString string

func (e errString) Error() string { return string(e) }
