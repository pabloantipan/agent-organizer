package scan

import (
	"context"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"organizer/internal/model"
)

// bitacoraFile is the FSE's bitácora, relative to the initiative root (the fse
// skill). Optional: most initiatives have no FSE, and then the activity is
// empty and there is no problem (FR-11).
const bitacoraFile = "docs/bitacora/fse_bitacora.md"

// handOffTitle is the heading the FSE leaves its next session under. It
// rewrites one such section per session, so the first one in the file is the
// current hand-off.
const handOffTitle = "HAND-OFF"

// The trailer the FSE signs its own commits with, and how many of them the
// board carries (FR-11).
const (
	fseTrailerKey   = "Committed-by"
	fseTrailerValue = "FSE"
	fseCommitLimit  = 10
)

// readFSE reads the FSE's activity for one initiative: the HAND-OFF section of
// its bitácora, and, when git is enabled, the commits the FSE signed at the
// root. Nothing here is ever a problem: the bitácora is the FSE's file, not the
// scanner's format, so a missing file or a missing section means the board says
// nothing rather than complaining.
//
// The third part of FR-11, the FSE's open threads, is not here: threads come
// from the discuss API through internal/service, which the scan cannot reach.
func readFSE(root string, opts Options) model.FSEActivity {
	var a model.FSEActivity
	p := filepath.Join(root, filepath.FromSlash(bitacoraFile))
	if b, err := os.ReadFile(p); err == nil {
		a.Path = p
		a.HandOff, a.HandOffBody = handOff(string(b))
	}
	if opts.Git {
		a.Commits = fseCommits(root, opts.GitTimeout)
	}
	return a
}

// handOff returns the bitácora's HAND-OFF heading without its hashes and the
// section's body verbatim, up to the next heading of the same level or higher.
func handOff(text string) (title, body string) {
	lines := strings.Split(text, "\n")
	start, level := -1, 0
	for i, l := range lines {
		if n, t := heading(l); n > 0 && strings.HasPrefix(strings.ToUpper(t), handOffTitle) {
			start, level, title = i, n, t
			break
		}
	}
	if start < 0 {
		return "", ""
	}
	end := len(lines)
	for i := start + 1; i < len(lines); i++ {
		if n, _ := heading(lines[i]); n > 0 && n <= level {
			end = i
			break
		}
	}
	return title, strings.Trim(strings.Join(lines[start+1:end], "\n"), "\n")
}

// heading reports the level of a markdown ATX heading and its text; 0 for any
// other line.
func heading(line string) (int, string) {
	n := 0
	for n < len(line) && line[n] == '#' {
		n++
	}
	if n == 0 || n > 6 || n == len(line) || line[n] != ' ' {
		return 0, ""
	}
	return n, strings.TrimSpace(line[n:])
}

// fseCommits is the last fseCommitLimit commits at the initiative root carrying
// a "Committed-by: FSE" trailer, newest first: time and subject, with the short
// sha so a view can point at one. Git is shelled out to, never a library
// (FR-11, Rabbit holes), and only when the root is a repo itself — an
// initiative root that merely sits inside one would otherwise report that
// repo's history as the FSE's.
func fseCommits(root string, timeout time.Duration) []model.FSECommit {
	if timeout <= 0 {
		timeout = 5 * time.Second
	}
	if st, err := os.Stat(filepath.Join(root, ".git")); err != nil || !(st.IsDir() || st.Mode().IsRegular()) {
		return nil
	}
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()
	// --grep only narrows the walk; the trailer field is what decides, so a
	// body line quoting the trailer is not mistaken for one.
	out, err := git(ctx, root, "log",
		"--max-count="+strconv.Itoa(fseCommitLimit*3),
		"--grep=^"+fseTrailerKey+": "+fseTrailerValue+"$",
		"--format=%h%x1f%cI%x1f%s%x1f%(trailers:key="+fseTrailerKey+",valueonly,separator=%x2C)")
	if err != nil || out == "" {
		return nil
	}
	var commits []model.FSECommit
	for _, line := range strings.Split(out, "\n") {
		f := strings.Split(line, "\x1f")
		if len(f) != 4 || !signedByFSE(f[3]) {
			continue
		}
		commits = append(commits, model.FSECommit{SHA: f[0], At: f[1], Subject: f[2]})
		if len(commits) == fseCommitLimit {
			break
		}
	}
	return commits
}

func signedByFSE(values string) bool {
	for _, v := range strings.Split(values, ",") {
		if strings.EqualFold(strings.TrimSpace(v), fseTrailerValue) {
			return true
		}
	}
	return false
}
