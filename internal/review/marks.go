package review

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"
)

// Marks are a reviewer's marks on one head's map (review-map v2 FR-16):
// kept in <data>/review/<initiative>/<head>/state.json beside the map,
// never in the reviewed repo, a card file or Firestore.
type Marks struct {
	Initiative string `json:"initiative"`
	Card       string `json:"card"`
	Head       string `json:"head"`
	Marks      []Mark `json:"marks"`
	// Changed are the previous head's marks whose symbol's head text is not
	// the same on this head, or whose symbol is gone: `changed since you
	// reviewed`, with no mark.
	Changed []Mark `json:"changed"`
	// From is the head the marks were carried from, when they were.
	From string `json:"from,omitempty"`
	// Thread is the review's one discuss thread (v3 FR-26): opened by the
	// first ask, carried to the card's next head with the marks.
	Thread string `json:"thread,omitempty"`
}

// Mark is one symbol's mark. Hash is sha256 of the symbol's head text when
// it was marked, which is what carries it to a later head.
type Mark struct {
	Symbol string `json:"symbol"`
	State  string `json:"state"`
	Note   string `json:"note"`
	By     string `json:"by"`
	At     string `json:"at"`
	Hash   string `json:"hash"`
	// From is the head a carried mark was made on; "" when made on this one.
	From string `json:"from,omitempty"`
	// Asked is the id of the message that asked about this mark (FR-26);
	// "" when it was kept here and asked of no one.
	Asked string `json:"asked,omitempty"`
	// AskedThread is the thread it was asked in (leftovers-41 FR-10): the
	// review's thread at the ask, which a closed thread's replacement does
	// not move.
	AskedThread string `json:"asked_thread,omitempty"`
	// AskedNote is the note the ask was sent with (leftovers-44 FR-1): a
	// later Save that changes the note keeps the ask, and the panel offers
	// to ask again while the note differs from it.
	AskedNote string `json:"asked_note,omitempty"`
}

// ThreadOf is the thread mk was asked in: its own AskedThread, else, for a
// mark asked before that field existed, the review's Thread; "" when it
// was not asked.
func (m Marks) ThreadOf(mk Mark) string {
	switch {
	case mk.Asked == "":
		return ""
	case mk.AskedThread != "":
		return mk.AskedThread
	default:
		return m.Thread
	}
}

// ChangedWords is what a mark that did not carry reads as.
const ChangedWords = "changed since you reviewed"

// MarkStates are the three marks; "" clears a symbol's mark.
var MarkStates = []string{"reviewed", "question", "blocked"}

// StatePath is <data>/review/<initiative>/<head>/state.json.
func StatePath(initiative, head string) string {
	return filepath.Join(DataDir(), "review", initiative, head, "state.json")
}

// TextOf is a symbol's text on its map's head, for the hash.
type TextOf func(n Node) (string, error)

// HashText is the hash a mark keeps.
func HashText(s string) string {
	h := sha256.Sum256([]byte(s))
	return hex.EncodeToString(h[:])
}

// ReadMarks is the marks of card on rm's head. The first read of a head
// with no marks of its own carries the newest other head's marks for the
// card: each whose symbol's head text hashes the same, and the rest as
// Changed. That first read writes the result, so a third head carries from
// the second.
func ReadMarks(initiative, card string, rm *RevMap, text TextOf) (Marks, error) {
	p := StatePath(initiative, rm.Head)
	if m, err := loadMarks(p); err == nil {
		return m, nil
	} else if !errors.Is(err, os.ErrNotExist) {
		return Marks{}, err
	}
	m := Marks{Initiative: initiative, Card: card, Head: rm.Head, Marks: []Mark{}, Changed: []Mark{}}
	prev, ok := previousMarks(initiative, card, rm.Head)
	if !ok {
		return m, nil
	}
	m.From, m.Thread = prev.Head, prev.Thread
	nodes := map[string]Node{}
	for _, n := range rm.Nodes {
		nodes[n.ID] = n
	}
	for _, mk := range prev.Marks {
		if mk.From == "" {
			mk.From = prev.Head
		}
		n, ok := nodes[mk.Symbol]
		if ok && Markable(n) {
			if t, err := text(n); err == nil && HashText(t) == mk.Hash {
				m.Marks = append(m.Marks, mk)
				continue
			}
		}
		m.Changed = append(m.Changed, mk)
	}
	return m, saveMarks(p, m)
}

// SetMark marks symbol on rm's head, or clears its mark with state "".
// Question and blocked need a note; only a changed symbol (not a package,
// not an affected one) takes a mark. A mark that was asked keeps its ask
// (Asked, AskedThread, AskedNote) whatever the new state or note
// (leftovers-44 FR-1): the ask is a message sent, not part of the mark.
func SetMark(initiative, card string, rm *RevMap, text TextOf, symbol, state, note, by string, at time.Time) (Marks, error) {
	note = strings.TrimSpace(note)
	if state != "" && !contains(MarkStates, state) {
		return Marks{}, fmt.Errorf("mark %q is not one of %s", state, strings.Join(MarkStates, ", "))
	}
	if (state == "question" || state == "blocked") && note == "" {
		return Marks{}, fmt.Errorf("a %s mark needs a note", state)
	}
	var node *Node
	for i := range rm.Nodes {
		if rm.Nodes[i].ID == symbol {
			node = &rm.Nodes[i]
		}
	}
	if node == nil {
		return Marks{}, fmt.Errorf("no symbol %s in the map of %s", symbol, short(rm.Head))
	}
	if !Markable(*node) {
		return Marks{}, fmt.Errorf("%s is %s, not a changed symbol; only changed symbols take a mark", symbol, node.Change)
	}
	m, err := ReadMarks(initiative, card, rm, text)
	if err != nil {
		return Marks{}, err
	}
	var was Mark
	keep := m.Marks[:0]
	for _, mk := range m.Marks {
		if mk.Symbol != symbol {
			keep = append(keep, mk)
		} else {
			was = mk
		}
	}
	m.Marks = keep
	changed := m.Changed[:0]
	for _, mk := range m.Changed {
		if mk.Symbol != symbol {
			changed = append(changed, mk)
		}
	}
	m.Changed = changed
	if state != "" {
		t, err := text(*node)
		if err != nil {
			return Marks{}, err
		}
		m.Marks = append(m.Marks, Mark{Symbol: symbol, State: state, Note: note, By: by, At: at.UTC().Format(time.RFC3339), Hash: HashText(t),
			Asked: was.Asked, AskedThread: was.AskedThread, AskedNote: was.AskedNote})
		sort.Slice(m.Marks, func(i, j int) bool { return m.Marks[i].Symbol < m.Marks[j].Symbol })
	}
	return m, saveMarks(StatePath(initiative, rm.Head), m)
}

// SetAsked records the review's thread on head's marks and, when asked is
// not "", that symbol's mark was asked in it by message asked (FR-26),
// keeping the thread on the mark (leftovers-41 FR-10) and the note it was
// asked with (leftovers-44 FR-1).
func SetAsked(initiative, head, symbol, thread, asked, note string) (Marks, error) {
	p := StatePath(initiative, head)
	m, err := loadMarks(p)
	if err != nil {
		return Marks{}, err
	}
	m.Thread = thread
	if asked != "" {
		found := false
		for i := range m.Marks {
			if m.Marks[i].Symbol == symbol {
				m.Marks[i].Asked, m.Marks[i].AskedThread, m.Marks[i].AskedNote, found = asked, thread, strings.TrimSpace(note), true
			}
		}
		if !found {
			return Marks{}, fmt.Errorf("no mark on %s at %s", symbol, short(head))
		}
	}
	return m, saveMarks(p, m)
}

// Markable is a changed symbol, the only kind that takes a mark: not a
// package, not an affected one.
func Markable(n Node) bool { return n.Level == "symbol" && n.Change != "affected" }

func loadMarks(p string) (Marks, error) {
	var m Marks
	b, err := os.ReadFile(p)
	if err != nil {
		return m, err
	}
	if err := json.Unmarshal(b, &m); err != nil {
		return m, fmt.Errorf("%s: %w", p, err)
	}
	if m.Marks == nil {
		m.Marks = []Mark{}
	}
	if m.Changed == nil {
		m.Changed = []Mark{}
	}
	return m, nil
}

func saveMarks(p string, m Marks) error {
	if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
		return err
	}
	b, _ := json.MarshalIndent(m, "", "  ")
	tmp := p + ".tmp"
	if err := os.WriteFile(tmp, append(b, '\n'), 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, p)
}

// previousMarks is the newest state.json of card under the initiative
// other than head's.
func previousMarks(initiative, card, head string) (Marks, bool) {
	dirs, _ := filepath.Glob(filepath.Join(DataDir(), "review", initiative, "*", "state.json"))
	var best Marks
	var bestAt time.Time
	for _, p := range dirs {
		st, err := os.Stat(p)
		if err != nil {
			continue
		}
		m, err := loadMarks(p)
		if err != nil || m.Card != card || m.Head == head {
			continue
		}
		if best.Head == "" || st.ModTime().After(bestAt) {
			best, bestAt = m, st.ModTime()
		}
	}
	return best, best.Head != ""
}

// Context is how many lines a range read shows on each side (FR-14).
const Context = 3

// Text is a file's lines at a sha around one range.
type Text struct {
	Path  string   `json:"path"`
	Sha   string   `json:"sha"`
	First int      `json:"first"` // the line number of Lines[0], 1-based
	Lines []string `json:"lines"`
	Total int      `json:"total"` // the file's line count at sha
}

var shaRe = regexp.MustCompile(`^[0-9a-f]{4,64}$`)

// RepoPath checks that p names a file inside a repo: relative, with no
// step out of it. It returns p cleaned, with forward slashes.
func RepoPath(p string) (string, error) {
	c := path.Clean(filepath.ToSlash(p))
	if p == "" || strings.ContainsRune(p, 0) || path.IsAbs(c) || filepath.IsAbs(p) || c == "." || c == ".." || strings.HasPrefix(c, "../") {
		return "", fmt.Errorf("path %q is outside the repo", p)
	}
	return c, nil
}

// ReadRange is file at sha in dir from line from to line to (1-based,
// inclusive) with Context lines each side, clipped to the file, by `git
// show`, read only. to < from reads the one line from.
func ReadRange(dir, sha, file string, from, to int) (Text, error) {
	if !shaRe.MatchString(sha) {
		return Text{}, fmt.Errorf("%q is not a commit sha", sha)
	}
	file, err := RepoPath(file)
	if err != nil {
		return Text{}, err
	}
	if kind, err := git(dir, "cat-file", "-t", sha+":"+file); err != nil || kind != "blob" {
		return Text{}, fmt.Errorf("no file %s at %s", file, short(sha))
	}
	body, err := gitRaw(dir, "show", "--no-color", sha+":"+file)
	if err != nil {
		return Text{}, err
	}
	lines := strings.Split(strings.TrimSuffix(body, "\n"), "\n")
	if body == "" {
		lines = nil
	}
	if to < from {
		to = from
	}
	lo, hi := max(from-Context, 1), min(to+Context, len(lines))
	t := Text{Path: file, Sha: sha, First: lo, Lines: []string{}, Total: len(lines)}
	if lo <= hi {
		t.Lines = append(t.Lines, lines[lo-1:hi]...)
	}
	return t, nil
}

// SymbolText is n's text on its map's head: its head range of its file,
// in the repo of repos (by name) the node's file belongs to. A node with
// no head range (deleted) has no text.
func SymbolText(rm *RevMap, repos []Repo, n Node) (string, error) {
	if n.RangeHead == nil {
		return "", nil
	}
	dir, sha, file, err := locate(rm, repos, n.File)
	if err != nil {
		return "", err
	}
	body, err := gitRaw(dir, "show", "--no-color", sha+":"+file)
	if err != nil {
		return "", err
	}
	lines := strings.Split(body, "\n")
	from, to := n.RangeHead[0], n.RangeHead[1]
	if from < 1 || to > len(lines) || to < from {
		return "", fmt.Errorf("%s: range %d-%d outside %s at %s", n.ID, from, to, file, short(sha))
	}
	return strings.Join(lines[from-1:to], "\n"), nil
}

// locate is the repo dir, head sha and repo-relative path of a map file:
// a multi-repo map prefixes files with the repo's name (rm.Repos).
func locate(rm *RevMap, repos []Repo, file string) (dir, sha, rel string, err error) {
	if len(rm.Repos) == 0 {
		if len(repos) == 0 {
			return "", "", "", errors.New("no repo to read from")
		}
		return repos[0].Dir, rm.Head, file, nil
	}
	for _, rp := range rm.Repos {
		if rest, ok := strings.CutPrefix(file, rp.Name+"/"); ok {
			for _, r := range repos {
				if r.Name == rp.Name {
					return r.Dir, rp.Head, rest, nil
				}
			}
		}
	}
	return "", "", "", fmt.Errorf("no repo of the map holds %s", file)
}

// RepoOf is the repo dir and repo-relative path of a map file, for a range
// read (FR-14).
func RepoOf(rm *RevMap, repos []Repo, file string) (dir, rel string, err error) {
	dir, _, rel, err = locate(rm, repos, file)
	return dir, rel, err
}

// gitRaw is git with its output as it is: file text keeps its spaces.
func gitRaw(dir string, args ...string) (string, error) {
	cmd := exec.Command("git", append([]string{"-C", dir}, args...)...)
	var out, errb bytes.Buffer
	cmd.Stdout, cmd.Stderr = &out, &errb
	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("git %s: %v: %s", strings.Join(args, " "), err, strings.TrimSpace(errb.String()))
	}
	return out.String(), nil
}
