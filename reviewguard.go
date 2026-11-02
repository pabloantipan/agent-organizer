package main

import (
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"os/user"
	"path/filepath"
	"strings"
)

// The review and dev builds refuse the real home (leftovers-65, 0178). At
// 03:08 on 2026-11-02 a reviewer's build ran against Pablo's real data
// directory because the rule lived only in prompts. The binary now knows
// which build it is and refuses to start the app unless both
// ORGANIZER_CONFIG and XDG_DATA_HOME are set and resolve outside the
// account's real home. Production builds are untouched.

// reviewBundleID is the bundle id scripts/review-build.sh gives its copy.
const reviewBundleID = "cl.antipan.organizer.review"

// devRealHomeEnv lets the lead's own `wails dev` run against the real home
// (FR-3). A review build has no override.
const devRealHomeEnv = "ORGANIZER_DEV_REAL_HOME"

// guardedVars are checked in this order; the refusal names the first that fails.
var guardedVars = []string{"ORGANIZER_CONFIG", "XDG_DATA_HOME"}

type buildKind int

const (
	buildProduction buildKind = iota
	buildReview
	buildDev
)

func (k buildKind) String() string {
	switch k {
	case buildReview:
		return "review build"
	case buildDev:
		return "dev build"
	}
	return "production build"
}

// bundleID reads CFBundleIdentifier from the Info.plist of the bundle the
// executable sits in (<bundle>/Contents/MacOS/<exe> → <bundle>/Contents/Info.plist).
// ok is false for a binary outside a bundle's Contents/MacOS, or a bundle
// without a readable plist.
func bundleID(exe string) (id string, ok bool) {
	macos := filepath.Dir(exe)
	contents := filepath.Dir(macos)
	if filepath.Base(macos) != "MacOS" || filepath.Base(contents) != "Contents" {
		return "", false
	}
	plist := filepath.Join(contents, "Info.plist")
	if _, err := os.Stat(plist); err != nil {
		return "", false
	}
	out, err := exec.Command("/usr/bin/plutil", "-extract", "CFBundleIdentifier", "raw", "-o", "-", plist).Output()
	if err != nil {
		return "", false
	}
	return strings.TrimSpace(string(out)), true
}

// kindOf: a dev tag wins (wails dev builds outside any review bundle);
// otherwise the bundle id decides review; everything else is production.
func kindOf(exe string, devTag bool) buildKind {
	if devTag {
		return buildDev
	}
	if id, ok := bundleID(exe); ok && id == reviewBundleID {
		return buildReview
	}
	return buildProduction
}

// resolvePath is the cleaned absolute path with the symlinks of its longest
// existing prefix evaluated; the part that does not exist yet is kept as is.
func resolvePath(p string) (string, error) {
	abs, err := filepath.Abs(p)
	if err != nil {
		return "", err
	}
	abs = filepath.Clean(abs)
	rest := ""
	cur := abs
	for {
		if _, err := os.Lstat(cur); err == nil {
			real, err := filepath.EvalSymlinks(cur)
			if err != nil {
				return "", err
			}
			return filepath.Join(real, rest), nil
		}
		parent := filepath.Dir(cur)
		if parent == cur {
			return abs, nil
		}
		rest = filepath.Join(filepath.Base(cur), rest)
		cur = parent
	}
}

// underDir reports whether path is dir or inside it.
func underDir(path, dir string) bool {
	if path == dir {
		return true
	}
	return strings.HasPrefix(path, strings.TrimSuffix(dir, string(filepath.Separator))+string(filepath.Separator))
}

// guardDecision is the whole rule (FR-1, FR-3, FR-4). realHome is the user
// database's home ("" when it could not be read, which refuses a guarded
// build). A nil error starts the app.
func guardDecision(kind buildKind, getenv func(string) string, realHome string) error {
	if kind == buildProduction {
		return nil
	}
	if kind == buildDev && getenv(devRealHomeEnv) == "1" {
		return nil
	}
	if realHome == "" {
		return errors.New("the account's home could not be read from the user database")
	}
	home, err := resolvePath(realHome)
	if err != nil {
		return fmt.Errorf("the account's home %s does not resolve: %v", realHome, err)
	}
	for _, name := range guardedVars {
		v := getenv(name)
		if v == "" {
			return fmt.Errorf("%s is unset or empty", name)
		}
		p, err := resolvePath(v)
		if err != nil {
			return fmt.Errorf("%s=%s does not resolve: %v", name, v, err)
		}
		if underDir(p, home) {
			return fmt.Errorf("%s=%s resolves to %s, under the real home %s", name, v, p, home)
		}
	}
	return nil
}

// realHomeDir is the user database's home, never $HOME.
func realHomeDir() string {
	u, err := user.Current()
	if err != nil {
		return ""
	}
	return u.HomeDir
}

// reviewGuard runs the decision for this binary and, on a refusal, writes one
// line to stderr and returns 2. It returns 0 when the app may start. main
// calls it first in the app branch, before the logger or anything that
// reads or writes config, cache or data (FR-2).
func reviewGuard(stderr io.Writer, exe string, getenv func(string) string, realHome string) int {
	kind := kindOf(exe, devBuild)
	err := guardDecision(kind, getenv, realHome)
	if err == nil {
		return 0
	}
	hint := "export the fixture's (eval \"$(scripts/fixture-home.sh)\")"
	if kind == buildDev {
		hint += " or set " + devRealHomeEnv + "=1"
	}
	fmt.Fprintf(stderr, "Deltagos %s refuses to start: %v; %s\n", kind, err, hint)
	return 2
}

// guardApp is main's call: the real executable, environment and home.
func guardApp() int {
	exe, err := os.Executable()
	if err != nil {
		exe = ""
	}
	return reviewGuard(os.Stderr, exe, os.Getenv, realHomeDir())
}
