package service

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"syscall"
	"time"

	"organizer/internal/model"
	"organizer/internal/review"
)

// The Review view's reads, make and marks (review-map v2 FR-14 to FR-16):
// every call takes a local card, resolved the way `organizer review`
// resolves it (review.Resolve: the branch, else its merge on main). The map
// and the marks live in the data dir beside each other; nothing is written
// into the reviewed repo.

// Review status states.
const (
	ReviewNone    = "none"    // no map for the card's current head
	ReviewMap     = "map"     // a map for the current head
	ReviewMoved   = "moved"   // a map for an older head of the card only
	ReviewMissing = "missing" // neither the branch nor a merge: no Review section
)

// ReviewStatus is a card's review state. Head and Base are the card's
// change as it resolves now; MapHead is the head of the map shown (the
// current one for map, the newest older one for moved).
type ReviewStatus struct {
	Initiative string `json:"initiative"`
	Card       string `json:"card"`
	State      string `json:"state"`
	Head       string `json:"head"`
	Base       string `json:"base"`
	// From is how the change was found: "merge-base main", "merge on first parent".
	From    string `json:"from"`
	MapHead string `json:"map_head"`
	MapPath string `json:"map_path"`
	// Reason is why the card is missing, naming the branch and the merge.
	Reason string `json:"reason"`
	// Make is the card's make running now, or the last one that ended in
	// this process; nil when there was none.
	Make *ReviewMake `json:"make"`
	// Checkouts is, per repo of the card, which checkout here has the
	// shown map's head as its HEAD (leftovers-42 FR-3); empty without a map.
	Checkouts []ReviewCheckout `json:"checkouts"`
}

// Make states.
const (
	MakeRunning = "making"
	MakeDone    = "done"
	MakeFailed  = "failed"
	MakeStopped = "stopped"
)

// ReviewMake is one background make of a card's map (FR-15). Elapsed is
// whole seconds since Started, to the end once it ended. Error is the
// command's first error line on failure, Command what to run by hand.
type ReviewMake struct {
	Initiative string `json:"initiative"`
	Card       string `json:"card"`
	State      string `json:"state"`
	Started    string `json:"started"`
	Elapsed    int    `json:"elapsed"`
	Head       string `json:"head"`
	Error      string `json:"error"`
	Command    string `json:"command"`
}

// ReviewMarks are the marks of the map of one head (FR-16).
type ReviewMarks = review.Marks

// ReviewText is a file's lines at a sha around one range (FR-14).
type ReviewText = review.Text

// reviewCommand is the make's process: this binary as `organizer review`.
// Tests replace it with their own helper process.
var reviewCommand = func(args ...string) (*exec.Cmd, error) {
	exe, err := os.Executable()
	if err != nil {
		return nil, err
	}
	return exec.Command(exe, args...), nil
}

// makes holds each card's make, running or last ended, process-wide: the
// app has one Service, and a make is a child process of it.
var makes = struct {
	sync.Mutex
	m map[string]*reviewJob
}{m: map[string]*reviewJob{}}

type reviewJob struct {
	view    ReviewMake
	started time.Time
	ended   time.Time
	cmd     *exec.Cmd
	work    string
	stopped bool
}

func makeKey(initiativeID, card string) string { return initiativeID + "/" + card }

func (j *reviewJob) snapshot(now time.Time) ReviewMake {
	v := j.view
	end := now
	if !j.ended.IsZero() {
		end = j.ended
	}
	v.Elapsed = int(end.Sub(j.started) / time.Second)
	return v
}

// localCard is the scanned initiative and card, refusing a card that is
// only on another machine: its repo is not here to read.
func (s *Service) localCard(initiativeID, slug string) (*model.ScannedInitiative, error) {
	si, err := s.initiative(initiativeID)
	if err == nil {
		for _, c := range si.Cards {
			if c.Slug == slug {
				return si, nil
			}
		}
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, snap := range s.state.Remote {
		for _, ri := range snap.Initiatives {
			if ri.ID != initiativeID {
				continue
			}
			for _, c := range ri.Cards {
				if c.Slug == slug {
					return nil, fmt.Errorf("card %s of %s is on %s, not this machine; review it there", slug, initiativeID, snap.Machine)
				}
			}
		}
	}
	if err != nil {
		return nil, err
	}
	return nil, fmt.Errorf("initiative %s has no card %s on this machine", initiativeID, slug)
}

// resolveCard is the card's change now, its repos, and the missing reason
// when it has neither a branch nor a merge.
func (s *Service) resolveCard(initiativeID, slug string) (*model.ScannedInitiative, []review.Range, []review.Repo, error) {
	si, err := s.localCard(initiativeID, slug)
	if err != nil {
		return nil, nil, nil, err
	}
	ranges, _, err := review.Resolve(si, slug)
	var repos []review.Repo
	for _, c := range si.Cards {
		if c.Slug == slug {
			repos = review.ReposOf(si.Path, si.ID, c.Repos)
		}
	}
	return si, ranges, repos, err
}

// ReviewStatus is FR-14's status: none, the map for the current head, or
// moved with both shas; missing when the card has no branch and no merge.
func (s *Service) ReviewStatus(initiativeID, slug string) (ReviewStatus, error) {
	si, ranges, repos, err := s.resolveCard(initiativeID, slug)
	st := ReviewStatus{Initiative: initiativeID, Card: slug, Make: currentMake(initiativeID, slug, s.now()), Checkouts: []ReviewCheckout{}}
	var m *review.Missing
	switch {
	case errors.As(err, &m):
		st.State, st.Reason = ReviewMissing, m.What
		return st, nil
	case err != nil:
		return st, err
	}
	st.Head, st.Base, st.From = ranges[0].Head, ranges[0].Base, ranges[0].From
	if p := review.DefaultPath(initiativeID, st.Head); fileExists(p) {
		st.State, st.MapHead, st.MapPath = ReviewMap, st.Head, p
		st.Checkouts = checkoutsAt(si, slug, p, repos)
		return st, nil
	}
	if head, p, ok := newestMap(initiativeID, slug); ok {
		st.State, st.MapHead, st.MapPath = ReviewMoved, head, p
		st.Checkouts = checkoutsAt(si, slug, p, repos)
		return st, nil
	}
	st.State = ReviewNone
	return st, nil
}

// newestMap is the newest map under the initiative made for the card.
func newestMap(initiativeID, slug string) (head, path string, ok bool) {
	paths, _ := filepath.Glob(filepath.Join(review.DataDir(), "review", initiativeID, "*", "revmap.json"))
	type found struct {
		head, path string
		at         time.Time
	}
	var all []found
	for _, p := range paths {
		f, err := os.Open(p)
		if err != nil {
			continue
		}
		var hdr struct {
			Target string `json:"target"`
			Head   string `json:"head"`
		}
		err = json.NewDecoder(f).Decode(&hdr)
		st, serr := f.Stat()
		f.Close()
		if err != nil || serr != nil || hdr.Target != slug {
			continue
		}
		all = append(all, found{hdr.Head, p, st.ModTime()})
	}
	if len(all) == 0 {
		return "", "", false
	}
	sort.Slice(all, func(i, j int) bool { return all[i].at.After(all[j].at) })
	return all[0].head, all[0].path, true
}

// ReviewMap is the card's map for head, "" being the current head.
func (s *Service) ReviewMap(initiativeID, slug, head string) (*review.RevMap, error) {
	rm, _, err := s.cardMap(initiativeID, slug, head)
	return rm, err
}

func (s *Service) cardMap(initiativeID, slug, head string) (*review.RevMap, []review.Repo, error) {
	_, ranges, repos, err := s.resolveCard(initiativeID, slug)
	if head == "" {
		if err != nil {
			return nil, nil, err
		}
		head = ranges[0].Head
	} else if err != nil && !isMissing(err) {
		return nil, nil, err
	}
	if strings.ContainsAny(head, "/\\.") || head == "" {
		return nil, nil, fmt.Errorf("%q is not a head sha", head)
	}
	b, err := os.ReadFile(review.DefaultPath(initiativeID, head))
	if errors.Is(err, os.ErrNotExist) {
		return nil, nil, fmt.Errorf("no review map for %s of %s at %s", slug, initiativeID, shortSha(head))
	}
	if err != nil {
		return nil, nil, err
	}
	var rm review.RevMap
	if err := json.Unmarshal(b, &rm); err != nil {
		return nil, nil, fmt.Errorf("review map of %s at %s: %w", slug, shortSha(head), err)
	}
	if rm.Target != slug {
		return nil, nil, fmt.Errorf("the map at %s is of %s, not card %s", shortSha(head), rm.Target, slug)
	}
	return &rm, repos, nil
}

// ReviewFile is a file of the card's map at sha, the range from..to plus
// review.Context lines each side, read by git show (FR-14). file is as the
// map writes it (repo-prefixed when the card has several repos).
func (s *Service) ReviewFile(initiativeID, slug, sha, file string, from, to int) (ReviewText, error) {
	if _, err := review.RepoPath(file); err != nil {
		return ReviewText{}, err
	}
	_, ranges, repos, err := s.resolveCard(initiativeID, slug)
	if err != nil && !isMissing(err) {
		return ReviewText{}, err
	}
	dir, rel := "", file
	if len(repos) == 1 {
		dir = repos[0].Dir
	} else {
		for _, r := range repos {
			if rest, ok := strings.CutPrefix(file, r.Name+"/"); ok && r.Name != "" {
				dir, rel = r.Dir, rest
			}
		}
	}
	if dir == "" && len(ranges) > 0 {
		dir = ranges[0].Repo
	}
	if dir == "" {
		return ReviewText{}, fmt.Errorf("no repo of card %s holds %s", slug, file)
	}
	t, err := review.ReadRange(dir, sha, rel, from, to)
	if err == nil {
		t.Path = file
	}
	return t, err
}

// ReviewMarks is the marks of the card's map at head ("" the current head),
// carrying the previous head's marks on the first read (FR-16).
func (s *Service) ReviewMarks(initiativeID, slug, head string) (ReviewMarks, error) {
	rm, repos, err := s.cardMap(initiativeID, slug, head)
	if err != nil {
		return ReviewMarks{}, err
	}
	return review.ReadMarks(initiativeID, slug, rm, symbolText(rm, repos))
}

// MarkReview marks a symbol of the card's map at head ("" the current
// head): reviewed, question or blocked, "" to clear; question and blocked
// need a note. The mark is signed by the ruler (rule.go).
func (s *Service) MarkReview(initiativeID, slug, head, symbol, state, note string) (ReviewMarks, error) {
	si, err := s.localCard(initiativeID, slug)
	if err != nil {
		return ReviewMarks{}, err
	}
	rm, repos, err := s.cardMap(initiativeID, slug, head)
	if err != nil {
		return ReviewMarks{}, err
	}
	return review.SetMark(initiativeID, slug, rm, symbolText(rm, repos), symbol, state, note, ruler(si), s.now())
}

func symbolText(rm *review.RevMap, repos []review.Repo) review.TextOf {
	return func(n review.Node) (string, error) { return review.SymbolText(rm, repos, n) }
}

// MakeReview starts the card's map in the background: `organizer review
// <initiative> <card> --json`, reconciled with change-check (FR-11, FR-15),
// as a child process writing into a work dir of its own; the map moves to
// its place only when the make succeeds. One make per card at a time.
// onChange, when set, is told when the make ends, outside the lock.
func (s *Service) MakeReview(initiativeID, slug string, onChange func(ReviewMake)) (ReviewMake, error) {
	if _, _, _, err := s.resolveCard(initiativeID, slug); err != nil {
		return ReviewMake{}, err
	}
	key := makeKey(initiativeID, slug)
	makes.Lock()
	defer makes.Unlock()
	if j := makes.m[key]; j != nil && j.view.State == MakeRunning {
		return j.snapshot(s.now()), fmt.Errorf("a map of %s is already being made (%d s)", slug, j.snapshot(s.now()).Elapsed)
	}
	if err := os.MkdirAll(review.DataDir(), 0o755); err != nil {
		return ReviewMake{}, err
	}
	work, err := os.MkdirTemp(review.DataDir(), "review-make-")
	if err != nil {
		return ReviewMake{}, err
	}
	out := filepath.Join(work, "revmap.json")
	cmd, err := reviewCommand("review", initiativeID, slug, "--json", "--out", out, "--work", work)
	if err != nil {
		os.RemoveAll(work)
		return ReviewMake{}, err
	}
	cmd.Stdout = io.Discard
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	// its own process group, so Stop reaches go list, node and
	// change-check under it too
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	started := s.now()
	j := &reviewJob{started: started, cmd: cmd, work: work, view: ReviewMake{
		Initiative: initiativeID, Card: slug, State: MakeRunning, Started: started.UTC().Format(time.RFC3339),
		Command: "organizer review " + initiativeID + " " + slug + " --json",
	}}
	if err := cmd.Start(); err != nil {
		os.RemoveAll(work)
		return ReviewMake{}, fmt.Errorf("%s: %w", j.view.Command, err)
	}
	makes.m[key] = j
	go func() {
		err := cmd.Wait()
		makes.Lock()
		switch {
		case j.stopped:
			j.view.State = MakeStopped
		case err != nil:
			j.view.State, j.view.Error = MakeFailed, firstErrorLine(stderr.String(), err)
		default:
			head, err := placeMap(initiativeID, out)
			if err != nil {
				j.view.State, j.view.Error = MakeFailed, err.Error()
			} else {
				j.view.State, j.view.Head = MakeDone, head
			}
		}
		os.RemoveAll(work)
		j.ended = s.now()
		v := j.snapshot(j.ended)
		makes.Unlock()
		if onChange != nil {
			onChange(v)
		}
	}()
	return j.snapshot(started), nil
}

// placeMap moves a finished make's map to review.DefaultPath for its head.
func placeMap(initiativeID, out string) (string, error) {
	b, err := os.ReadFile(out)
	if err != nil {
		return "", fmt.Errorf("the make wrote no map: %w", err)
	}
	var hdr struct {
		Head string `json:"head"`
	}
	if err := json.Unmarshal(b, &hdr); err != nil || hdr.Head == "" {
		return "", fmt.Errorf("the make's map has no head")
	}
	dst := review.DefaultPath(initiativeID, hdr.Head)
	if err := os.MkdirAll(filepath.Dir(dst), 0o755); err != nil {
		return "", err
	}
	return hdr.Head, os.Rename(out, dst)
}

func firstErrorLine(stderr string, err error) string {
	for _, l := range strings.Split(stderr, "\n") {
		if l = strings.TrimSpace(l); l != "" {
			return l
		}
	}
	return err.Error()
}

// StopReview kills the card's running make and its children; the make
// leaves no map and no work dir. Stopping a card with no make running is
// not an error: it returns the last make, or the zero one.
func (s *Service) StopReview(initiativeID, slug string) (ReviewMake, error) {
	makes.Lock()
	j := makes.m[makeKey(initiativeID, slug)]
	if j == nil {
		makes.Unlock()
		return ReviewMake{}, nil
	}
	if j.view.State != MakeRunning {
		v := j.snapshot(s.now())
		makes.Unlock()
		return v, nil
	}
	j.stopped = true
	pid := j.cmd.Process.Pid
	makes.Unlock()
	// the pid is the make's own, saved when it started; -pid is its group
	if err := syscall.Kill(-pid, syscall.SIGKILL); err != nil {
		_ = j.cmd.Process.Kill()
	}
	for {
		makes.Lock()
		done := !j.ended.IsZero()
		v := j.snapshot(s.now())
		makes.Unlock()
		if done {
			return v, nil
		}
		time.Sleep(20 * time.Millisecond)
	}
}

// ReviewMakeState is the card's make, running or last ended, nil if none.
func (s *Service) ReviewMakeState(initiativeID, slug string) *ReviewMake {
	return currentMake(initiativeID, slug, s.now())
}

func currentMake(initiativeID, slug string, now time.Time) *ReviewMake {
	makes.Lock()
	defer makes.Unlock()
	j := makes.m[makeKey(initiativeID, slug)]
	if j == nil {
		return nil
	}
	v := j.snapshot(now)
	return &v
}

func isMissing(err error) bool {
	var m *review.Missing
	return errors.As(err, &m)
}

func fileExists(p string) bool {
	_, err := os.Stat(p)
	return err == nil
}

func shortSha(sha string) string {
	if len(sha) > 7 {
		return sha[:7]
	}
	return sha
}
