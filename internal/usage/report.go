package usage

import (
	"fmt"
	"regexp"
	"sort"
	"strconv"
	"time"
)

// Cuts are the four ways the table splits a week, in the view's order.
var Cuts = []string{"initiative", "role", "task", "model"}

// Totals is one week in sum: the three tiles.
type Totals struct {
	Week  string `json:"week"`  // 2026-W41
	Start string `json:"start"` // the Monday, YYYY-MM-DD
	End   string `json:"end"`   // the Sunday
	// Money is the sum of the costs known; WithoutCost counts the sessions
	// whose cost no record carries, so the view can say what it excludes.
	Money       float64 `json:"money"`
	Input       int64   `json:"input"`
	Output      int64   `json:"output"`
	CacheRead   int64   `json:"cache_read"`
	CacheWrite  int64   `json:"cache_write"`
	Tokens      int64   `json:"tokens"`
	Sessions    int     `json:"sessions"`
	Hours       float64 `json:"hours"` // summed session time, first to last message per day
	Running     int     `json:"running"`
	WithoutCost int     `json:"without_cost"`
}

// WeekPoint is one bar of the money chart and one entry of the week list.
type WeekPoint struct {
	Week     string  `json:"week"`
	Start    string  `json:"start"`
	Money    float64 `json:"money"`
	Tokens   int64   `json:"tokens"`
	Sessions int     `json:"sessions"`
	// From is set on the first recorded week, which starts mid-week: the
	// first recorded day.
	From string `json:"from,omitempty"`
}

// Reason is one reason a row's sessions are not attributed, with how many.
type Reason struct {
	Reason   string `json:"reason"`
	Sessions int    `json:"sessions"`
}

// RowSession is a session inside a task row: who ran it on that task.
type RowSession struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Role string `json:"role"`
}

// Row is one row of a cut, sorted by money; Not attributed is last.
type Row struct {
	Key  string `json:"key"`  // the initiative, role, model, or <initiative>/<task>
	Name string `json:"name"` // what the view prints: a task row's card title
	// Initiative and Cards are set on task rows: the card slugs it spans
	// (two or more for a supervisor's wave).
	Initiative    string       `json:"initiative,omitempty"`
	Cards         []string     `json:"cards,omitempty"`
	Money         float64      `json:"money"`
	Share         float64      `json:"share"` // of the week's money, 0..1
	Input         int64        `json:"input"`
	Output        int64        `json:"output"`
	CacheRead     int64        `json:"cache_read"`
	CacheWrite    int64        `json:"cache_write"`
	Tokens        int64        `json:"tokens"`
	Sessions      int          `json:"sessions"`
	WithoutCost   int          `json:"without_cost"`
	NotAttributed bool         `json:"not_attributed"`
	Reasons       []Reason     `json:"reasons,omitempty"`
	Members       []RowSession `json:"members,omitempty"` // task rows: builder, reviewers, supervisor
}

// SessionRow is one line of the Sessions list.
type SessionRow struct {
	ID         string    `json:"id"`
	Name       string    `json:"name"`
	Initiative string    `json:"initiative"`
	Task       string    `json:"task"`
	TaskTitle  string    `json:"task_title"`
	Role       string    `json:"role"`
	Reason     string    `json:"reason,omitempty"`
	Model      string    `json:"model"`
	Start      time.Time `json:"start"`
	End        time.Time `json:"end"`
	Minutes    float64   `json:"minutes"` // first to last message in the week
	Running    bool      `json:"running"`
	Input      int64     `json:"input"`
	Output     int64     `json:"output"`
	CacheRead  int64     `json:"cache_read"`
	CacheWrite int64     `json:"cache_write"`
	Tokens     int64     `json:"tokens"`
	Money      *float64  `json:"money"`
}

// View is the week as the CLI prints it and App.Usage returns it.
type View struct {
	Machine  string           `json:"machine"`
	Week     string           `json:"week"`
	ThisWeek Totals           `json:"this_week"`
	LastWeek Totals           `json:"last_week"`
	FirstDay string           `json:"first_day"` // the first recorded day, empty for an empty ledger
	History  []WeekPoint      `json:"history"`   // up to 12 weeks ending at Week, oldest first
	Weeks    []WeekPoint      `json:"weeks"`     // every recorded week, newest first
	Cuts     map[string][]Row `json:"cuts"`      // initiative, role, task, model
	Sessions []SessionRow     `json:"sessions"`  // newest first
	Stats    Stats            `json:"stats"`
}

var weekRe = regexp.MustCompile(`^(\d{4})-W(\d{2})$`)

// WeekStart is the Monday 00:00 local of an ISO week (Monday first, 0098 O1).
func WeekStart(week string, loc *time.Location) (time.Time, error) {
	if loc == nil {
		loc = time.Local
	}
	m := weekRe.FindStringSubmatch(week)
	if m == nil {
		return time.Time{}, fmt.Errorf("week %q is not YYYY-Www", week)
	}
	y, _ := strconv.Atoi(m[1])
	w, _ := strconv.Atoi(m[2])
	// January 4th is always in week 1.
	jan4 := time.Date(y, 1, 4, 0, 0, 0, 0, loc)
	mon := jan4.AddDate(0, 0, -((int(jan4.Weekday()) + 6) % 7))
	start := mon.AddDate(0, 0, 7*(w-1))
	if yy, ww := start.ISOWeek(); w < 1 || yy != y || ww != w {
		return time.Time{}, fmt.Errorf("week %q does not exist", week)
	}
	return start, nil
}

// WeekOf names the week a local day falls in.
func WeekOf(t time.Time) string {
	y, w := t.ISOWeek()
	return fmt.Sprintf("%d-W%02d", y, w)
}

func weekOfDay(day string, loc *time.Location) string {
	t, err := time.ParseInLocation("2006-01-02", day, loc)
	if err != nil {
		return ""
	}
	return WeekOf(t)
}

// Build makes the view of one week from the ledger. running names the
// sessions whose process is alive now.
func Build(lines []Line, week string, running map[string]bool, loc *time.Location) (View, error) {
	if loc == nil {
		loc = time.Local
	}
	start, err := WeekStart(week, loc)
	if err != nil {
		return View{}, err
	}
	v := View{Week: week, Cuts: map[string][]Row{}}
	last := WeekOf(start.AddDate(0, 0, -7))

	byWeek := map[string][]Line{}
	for _, l := range lines {
		if v.FirstDay == "" || l.Day < v.FirstDay {
			v.FirstDay = l.Day
		}
		if w := weekOfDay(l.Day, loc); w != "" {
			byWeek[w] = append(byWeek[w], l)
		}
	}
	v.ThisWeek = totals(week, byWeek[week], running, loc)
	v.LastWeek = totals(last, byWeek[last], running, loc)

	firstWeek := ""
	if v.FirstDay != "" {
		firstWeek = weekOfDay(v.FirstDay, loc)
	}
	point := func(w string) WeekPoint {
		t := totals(w, byWeek[w], running, loc)
		p := WeekPoint{Week: w, Start: t.Start, Money: t.Money, Tokens: t.Tokens, Sessions: t.Sessions}
		if w == firstWeek {
			p.From = v.FirstDay
		}
		return p
	}
	v.History = []WeekPoint{}
	for i := 11; i >= 0; i-- {
		w := WeekOf(start.AddDate(0, 0, -7*i))
		// Weeks before the first recorded one are not drawn; the selected
		// week always is, even empty.
		if i > 0 && (firstWeek == "" || w < firstWeek) {
			continue
		}
		v.History = append(v.History, point(w))
	}
	v.Weeks = []WeekPoint{}
	names := make([]string, 0, len(byWeek))
	for w := range byWeek {
		names = append(names, w)
	}
	sort.Sort(sort.Reverse(sort.StringSlice(names)))
	for _, w := range names {
		v.Weeks = append(v.Weeks, point(w))
	}

	these := byWeek[week]
	for _, c := range Cuts {
		v.Cuts[c] = cut(c, these, v.ThisWeek.Money)
	}
	v.Sessions = sessions(these, running)
	return v, nil
}

func totals(week string, ls []Line, running map[string]bool, loc *time.Location) Totals {
	t := Totals{Week: week}
	if s, err := WeekStart(week, loc); err == nil {
		t.Start, t.End = s.Format("2006-01-02"), s.AddDate(0, 0, 6).Format("2006-01-02")
	}
	sess := map[string]bool{}
	noCost := map[string]bool{}
	for _, l := range ls {
		sess[l.SessionID] = true
		t.Input += l.Input
		t.Output += l.Output
		t.CacheRead += l.CacheRead
		t.CacheWrite += l.CacheWrite
		if l.Cost != nil {
			t.Money += *l.Cost
		} else {
			noCost[l.SessionID] = true
		}
		t.Hours += l.Last.Sub(l.First).Hours()
	}
	t.Tokens = t.Input + t.Output + t.CacheRead + t.CacheWrite
	t.Sessions = len(sess)
	t.WithoutCost = len(noCost)
	for id := range sess {
		if running[id] {
			t.Running++
		}
	}
	return t
}

// keyOf is the row a line falls in for a cut, and its printed name; an empty
// key is Not attributed.
func keyOf(c string, l Line) (key, name string) {
	switch c {
	case "initiative":
		return l.Initiative, l.Initiative
	case "role":
		return l.Role, l.Role
	case "task":
		if l.Initiative == "" || l.Task == "" {
			return "", ""
		}
		name := l.TaskTitle
		if name == "" {
			name = l.Task
		}
		return l.Initiative + "/" + l.Task, name
	}
	return "", ""
}

func cut(c string, ls []Line, weekMoney float64) []Row {
	rows := map[string]*Row{}
	sess := map[string]map[string]bool{}
	noCost := map[string]map[string]bool{}
	reasons := map[string]map[string]bool{}
	add := func(key, name string, l Line, k Kinds, cost *float64) {
		r := rows[key]
		if r == nil {
			r = &Row{Key: key, Name: name}
			if key == "" {
				r.Name, r.NotAttributed = NotAttributed, true
			}
			if c == "task" && key != "" {
				r.Initiative, r.Cards = l.Initiative, l.Cards
				if len(r.Cards) == 0 {
					r.Cards = []string{l.Task}
				}
			}
			rows[key] = r
			sess[key], noCost[key], reasons[key] = map[string]bool{}, map[string]bool{}, map[string]bool{}
		}
		r.Input += k.Input
		r.Output += k.Output
		r.CacheRead += k.CacheRead
		r.CacheWrite += k.CacheWrite
		if cost != nil {
			r.Money += *cost
		} else {
			noCost[key][l.SessionID] = true
		}
		if !sess[key][l.SessionID] {
			sess[key][l.SessionID] = true
			if c == "task" && key != "" {
				r.Members = append(r.Members, RowSession{ID: l.SessionID, Name: l.Name, Role: l.Role})
			}
		}
		if key == "" {
			reasons[key][l.SessionID+"\x00"+reasonFor(c, l)] = true
		}
	}
	for _, l := range ls {
		if c == "model" {
			var total int64
			for _, k := range l.Models {
				total += k.Total()
			}
			for m, k := range l.Models {
				var cost *float64
				if l.Cost != nil && total > 0 {
					x := *l.Cost * float64(k.Total()) / float64(total)
					cost = &x
				}
				add(m, m, l, k, cost)
			}
			continue
		}
		key, name := keyOf(c, l)
		add(key, name, l, l.Kinds, l.Cost)
	}
	// Not attributed is always the last row, never hidden: zero is an answer.
	if rows[""] == nil {
		rows[""] = &Row{Name: NotAttributed, NotAttributed: true}
	}
	out := make([]Row, 0, len(rows))
	for key, r := range rows {
		r.Tokens = r.Input + r.Output + r.CacheRead + r.CacheWrite
		r.Sessions = len(sess[key])
		r.WithoutCost = len(noCost[key])
		if weekMoney > 0 {
			r.Share = r.Money / weekMoney
		}
		if key == "" {
			count := map[string]int{}
			for k := range reasons[key] {
				for i := 0; i < len(k); i++ {
					if k[i] == 0 {
						count[k[i+1:]]++
						break
					}
				}
			}
			for why, n := range count {
				r.Reasons = append(r.Reasons, Reason{Reason: why, Sessions: n})
			}
			sort.Slice(r.Reasons, func(i, j int) bool {
				if r.Reasons[i].Sessions != r.Reasons[j].Sessions {
					return r.Reasons[i].Sessions > r.Reasons[j].Sessions
				}
				return r.Reasons[i].Reason < r.Reasons[j].Reason
			})
		}
		sort.Slice(r.Members, func(i, j int) bool { return r.Members[i].Name < r.Members[j].Name })
		out = append(out, *r)
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].NotAttributed != out[j].NotAttributed {
			return !out[i].NotAttributed
		}
		if out[i].Money != out[j].Money {
			return out[i].Money > out[j].Money
		}
		if out[i].Tokens != out[j].Tokens {
			return out[i].Tokens > out[j].Tokens
		}
		return out[i].Key < out[j].Key
	})
	return out
}

// reasonFor says why a line is not attributed in this cut.
func reasonFor(c string, l Line) string {
	switch c {
	case "model":
		return "no model on its messages"
	case "task":
		if l.Initiative != "" && l.Task == "" && (l.Role == RoleFSE || l.Role == RolePersona || l.Role == RolePair || l.Role == RoleSession) {
			return "a " + l.Role + " session works on no single card"
		}
	}
	if l.Reason != "" {
		return l.Reason
	}
	return "not attributed"
}

func sessions(ls []Line, running map[string]bool) []SessionRow {
	by := map[string]*SessionRow{}
	models := map[string]map[string]int64{}
	for _, l := range ls {
		s := by[l.SessionID]
		if s == nil {
			s = &SessionRow{ID: l.SessionID, Name: l.Name, Initiative: l.Initiative, Task: l.Task, TaskTitle: l.TaskTitle,
				Role: l.Role, Reason: l.Reason, Start: l.First, End: l.Last, Running: running[l.SessionID]}
			by[l.SessionID] = s
			models[l.SessionID] = map[string]int64{}
		}
		if l.First.Before(s.Start) {
			s.Start = l.First
		}
		if l.Last.After(s.End) {
			s.End = l.Last
		}
		s.Input += l.Input
		s.Output += l.Output
		s.CacheRead += l.CacheRead
		s.CacheWrite += l.CacheWrite
		if l.Cost != nil {
			x := *l.Cost
			if s.Money != nil {
				x += *s.Money
			}
			s.Money = &x
		}
		for m, k := range l.Models {
			models[l.SessionID][m] += k.Total()
		}
	}
	out := make([]SessionRow, 0, len(by))
	for id, s := range by {
		s.Tokens = s.Input + s.Output + s.CacheRead + s.CacheWrite
		s.Minutes = s.End.Sub(s.Start).Minutes()
		best := int64(-1)
		for m, n := range models[id] {
			if n > best || (n == best && m < s.Model) {
				s.Model, best = m, n
			}
		}
		out = append(out, *s)
	}
	sort.Slice(out, func(i, j int) bool {
		if !out[i].Start.Equal(out[j].Start) {
			return out[i].Start.After(out[j].Start)
		}
		return out[i].ID < out[j].ID
	})
	return out
}
