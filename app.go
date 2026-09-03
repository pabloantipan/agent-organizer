package main

import (
	"context"
	"time"

	wruntime "github.com/wailsapp/wails/v2/pkg/runtime"

	"organizer/internal/config"
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
	PulledAt time.Time   `json:"pulled_at"`
	Error    string      `json:"error,omitempty"`
}

func (a *App) GetBoard() BoardView {
	if a.svc == nil {
		return BoardView{Error: a.err}
	}
	return BoardView{Board: a.svc.Board(), PulledAt: a.svc.PulledAt()}
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

func (a *App) SetCardOrder(initiativeID string, slugs []string) error {
	if a.svc == nil {
		return errString(a.err)
	}
	return a.svc.SetCardOrder(initiativeID, slugs)
}

func (a *App) OpenInEditor(path string) error { return a.svc.OpenInEditor(path) }
func (a *App) OpenTerminal(dir string) error  { return a.svc.OpenTerminal(dir) }
func (a *App) Reveal(path string) error       { return a.svc.Reveal(path) }

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
