// Package merge combines the local scan with remote snapshots into the Board
// the CLI and the UI render. Local always wins for this machine.
package merge

import (
	"sort"
	"time"

	"organizer/internal/model"
)

type BoardCard struct {
	model.Card
	InitiativeID    string    `json:"initiative_id"`
	InitiativeTitle string    `json:"initiative_title"`
	InitiativePath  string    `json:"initiative_path"`
	Client          string    `json:"client"`
	Machine         string    `json:"machine"`
	Local           bool      `json:"local"`
	ScannedAt       time.Time `json:"scanned_at"`
}

type BoardInitiative struct {
	model.Initiative
	Machine     string            `json:"machine"`
	Local       bool              `json:"local"`
	ScannedAt   time.Time         `json:"scanned_at"`
	LastUpdated time.Time         `json:"last_updated"`
	Now         int               `json:"now"`
	Blocked     int               `json:"blocked"`
	Next        int               `json:"next"`
	Done        int               `json:"done"`
	RepoStates  []model.RepoState `json:"repos_state"`
	Problems    []model.Problem   `json:"problems"`
	Agents      []model.Agent     `json:"agents"`
	Live        int               `json:"live"`
	Working     int               `json:"working"`
	// AlsoOn lists other machines reporting the same initiative id.
	AlsoOn []string `json:"also_on"`
}

type Board struct {
	Machine     string                 `json:"machine"`
	GeneratedAt time.Time              `json:"generated_at"`
	Machines    []string               `json:"machines"`
	Columns     map[string][]BoardCard `json:"columns"`
	Initiatives []BoardInitiative      `json:"initiatives"`
	// Unassigned are this machine's agents outside every initiative.
	Unassigned []model.Agent `json:"unassigned_agents"`
}

// Build merges. Remote snapshots whose machine equals local.Machine are
// dropped: the live scan is fresher than anything pushed earlier. Ranked
// initiatives and cards (see model.Order) come first, in that order.
func Build(local model.Snapshot, remote []model.Snapshot, order model.Order, now time.Time) Board {
	irank := func(id string) int { return model.Rank(order.Initiatives, id) }
	crank := func(init, slug string) int { return model.Rank(order.Cards[init], slug) }
	b := Board{
		Machine:     local.Machine,
		GeneratedAt: now,
		Columns:     map[string][]BoardCard{model.StatusNow: {}, model.StatusBlocked: {}, model.StatusNext: {}, model.StatusDone: {}},
	}
	b.Unassigned = local.Unassigned
	snaps := []model.Snapshot{local}
	for _, r := range remote {
		if r.Machine != local.Machine {
			snaps = append(snaps, r)
		}
	}
	machinesByID := map[string][]string{}
	for _, s := range snaps {
		b.Machines = append(b.Machines, s.Machine)
		for _, si := range s.Initiatives {
			machinesByID[si.ID] = append(machinesByID[si.ID], s.Machine)
		}
	}
	for _, s := range snaps {
		isLocal := s.Machine == local.Machine
		for _, si := range s.Initiatives {
			n, bl, x := si.Counts()
			done := 0
			for _, c := range si.Cards {
				if c.Archived || c.Status == model.StatusDone {
					done++
				}
			}
			bi := BoardInitiative{
				Initiative:  si.Initiative,
				Machine:     s.Machine,
				Local:       isLocal,
				ScannedAt:   si.ScannedAt,
				LastUpdated: si.LastUpdated(),
				Now:         n, Blocked: bl, Next: x, Done: done,
				RepoStates: si.RepoStates,
				Problems:   si.Problems,
			}
			for _, m := range machinesByID[si.ID] {
				if m != s.Machine {
					bi.AlsoOn = append(bi.AlsoOn, m)
				}
			}
			b.Initiatives = append(b.Initiatives, bi)
			for _, c := range si.Cards {
				col := c.Status
				if c.Archived || c.Status == model.StatusDone {
					col = model.StatusDone
				} else if model.StatusOrder(c.Status) > 2 {
					continue // unknown status: reported as a problem, not shown
				}
				b.Columns[col] = append(b.Columns[col], BoardCard{
					Card:            c,
					InitiativeID:    si.ID,
					InitiativeTitle: si.Title,
					InitiativePath:  si.Path,
					Client:          si.Client,
					Machine:         s.Machine,
					Local:           isLocal,
					ScannedAt:       si.ScannedAt,
				})
			}
		}
	}
	// Done has no manual order: newest first is the only useful view.
	done := b.Columns[model.StatusDone]
	sort.SliceStable(done, func(i, j int) bool { return done[i].UpdatedTime().After(done[j].UpdatedTime()) })
	for st := range b.Columns {
		if st == model.StatusDone {
			continue
		}
		col := b.Columns[st]
		sort.SliceStable(col, func(i, j int) bool {
			if ri, rj := irank(col[i].InitiativeID), irank(col[j].InitiativeID); ri != rj {
				return ri < rj
			}
			if ri, rj := crank(col[i].InitiativeID, col[i].Slug), crank(col[j].InitiativeID, col[j].Slug); ri != rj {
				return ri < rj
			}
			if col[i].Local != col[j].Local {
				return col[i].Local
			}
			ui, uj := col[i].UpdatedTime(), col[j].UpdatedTime()
			if !ui.Equal(uj) {
				return ui.After(uj)
			}
			return col[i].InitiativeID+col[i].Slug < col[j].InitiativeID+col[j].Slug
		})
	}
	sort.SliceStable(b.Initiatives, func(i, j int) bool {
		a, c := b.Initiatives[i], b.Initiatives[j]
		if ri, rj := irank(a.ID), irank(c.ID); ri != rj {
			return ri < rj
		}
		if (a.Now > 0) != (c.Now > 0) {
			return a.Now > 0
		}
		if a.Local != c.Local {
			return a.Local
		}
		return a.LastUpdated.After(c.LastUpdated)
	})
	return b
}

// ApplyOrder sorts a snapshot in place the way the board would: ranked
// initiatives first, and within each initiative ranked cards first, then the
// default order. Used by the CLI status view.
func ApplyOrder(snap *model.Snapshot, order model.Order) {
	sort.SliceStable(snap.Initiatives, func(i, j int) bool {
		return model.Rank(order.Initiatives, snap.Initiatives[i].ID) < model.Rank(order.Initiatives, snap.Initiatives[j].ID)
	})
	for k := range snap.Initiatives {
		si := &snap.Initiatives[k]
		ranks := order.Cards[si.ID]
		sort.SliceStable(si.Cards, func(i, j int) bool {
			a, b := si.Cards[i], si.Cards[j]
			if a.Archived != b.Archived {
				return !a.Archived
			}
			if oa, ob := model.StatusOrder(a.Status), model.StatusOrder(b.Status); oa != ob {
				return oa < ob
			}
			return model.Rank(ranks, a.Slug) < model.Rank(ranks, b.Slug)
		})
	}
}
