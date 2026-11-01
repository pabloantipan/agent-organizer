package main

import (
	"os"
	"path"
	"regexp"
	"strings"
	"testing"

	"gopkg.in/yaml.v3"
)

// G2 (leftovers-54 FR-2): a tag build reads the contract samples from
// pabloantipan/agent-mailbox-specs checked out at a pinned full SHA, beside
// the organizer's checkout (never inside it, so the organizer's git status
// stays clean), and the step running make test has CONTRACTS_DIR at its
// contracts/.

const specsRepo = "pabloantipan/agent-mailbox-specs"

var fullSHA = regexp.MustCompile(`^[0-9a-f]{40}$`)

type wfStep struct {
	Name             string            `yaml:"name"`
	Uses             string            `yaml:"uses"`
	Run              string            `yaml:"run"`
	With             map[string]string `yaml:"with"`
	Env              map[string]string `yaml:"env"`
	WorkingDirectory string            `yaml:"working-directory"`
}

type wfJob struct {
	Env      map[string]string `yaml:"env"`
	Defaults struct {
		Run struct {
			WorkingDirectory string `yaml:"working-directory"`
		} `yaml:"run"`
	} `yaml:"defaults"`
	Steps []wfStep `yaml:"steps"`
}

type workflow struct {
	Env  map[string]string `yaml:"env"`
	Jobs map[string]wfJob  `yaml:"jobs"`
}

// cleanPath is a checkout path relative to the workspace, "" for its root.
func cleanPath(p string) string {
	p = path.Clean(strings.TrimSpace(p))
	if p == "." {
		return ""
	}
	return strings.TrimPrefix(p, "./")
}

func within(p, dir string) bool {
	return dir == "" || p == dir || strings.HasPrefix(p, dir+"/")
}

func TestReleaseWorkflowPinsContracts(t *testing.T) {
	raw, err := os.ReadFile(".github/workflows/release.yml")
	if err != nil {
		t.Fatal(err)
	}
	var wf workflow
	if err := yaml.Unmarshal(raw, &wf); err != nil {
		t.Fatalf("release.yml: %v", err)
	}
	if len(wf.Jobs) == 0 {
		t.Fatal("release.yml: no jobs")
	}
	for name, job := range wf.Jobs {
		checkJob(t, name, job, wf.Env)
	}
}

func checkJob(t *testing.T, name string, job wfJob, wfEnv map[string]string) {
	t.Helper()
	testAt, specsAt, ownAt := -1, -1, -1
	for i, s := range job.Steps {
		if strings.HasPrefix(s.Uses, "actions/checkout@") {
			if s.With["repository"] == specsRepo {
				if specsAt >= 0 {
					t.Errorf("job %s: %s checked out twice", name, specsRepo)
				}
				specsAt = i
			} else if s.With["repository"] == "" && ownAt < 0 {
				ownAt = i
			}
		}
		if testAt < 0 && regexp.MustCompile(`(^|\s|&&|;)make\s+test(\s|$)`).MatchString(s.Run) {
			testAt = i
		}
	}
	if testAt < 0 {
		return // a job that runs no make test reads no contracts
	}
	if specsAt < 0 {
		t.Fatalf("job %s: no actions/checkout of %s before make test (step %d)", name, specsRepo, testAt)
	}
	if specsAt > testAt {
		t.Errorf("job %s: %s is checked out at step %d, after make test at step %d", name, specsRepo, specsAt, testAt)
	}
	specs := job.Steps[specsAt]
	if ref := specs.With["ref"]; !fullSHA.MatchString(ref) {
		t.Errorf("job %s: %s ref %q is not a full 40-hex commit SHA", name, specsRepo, ref)
	}
	specsPath := cleanPath(specs.With["path"])
	if specsPath == "" {
		t.Fatalf("job %s: %s has no path of its own", name, specsRepo)
	}
	ownPath := ""
	if ownAt >= 0 {
		ownPath = cleanPath(job.Steps[ownAt].With["path"])
	}
	if within(specsPath, ownPath) {
		t.Errorf("job %s: %s at %q is inside the organizer's checkout %q, so its git status is not clean", name, specsRepo, specsPath, ownPath)
	}

	run := job.Steps[testAt]
	dir := run.WorkingDirectory
	if dir == "" {
		dir = job.Defaults.Run.WorkingDirectory
	}
	if cleanPath(dir) != ownPath {
		t.Errorf("job %s: make test runs in %q, not in the organizer's checkout %q", name, dir, ownPath)
	}

	cd, ok := run.Env["CONTRACTS_DIR"]
	if !ok {
		cd, ok = job.Env["CONTRACTS_DIR"]
	}
	if !ok {
		cd, ok = wfEnv["CONTRACTS_DIR"]
	}
	if !ok {
		t.Fatalf("job %s: CONTRACTS_DIR is not set for the make test step", name)
	}
	var rel string
	for _, ws := range []string{"${{ github.workspace }}/", "${{github.workspace}}/", "$GITHUB_WORKSPACE/", "${GITHUB_WORKSPACE}/"} {
		if strings.HasPrefix(cd, ws) {
			rel = cleanPath(strings.TrimPrefix(cd, ws))
		}
	}
	if rel == "" {
		t.Fatalf("job %s: CONTRACTS_DIR %q is not absolute from the workspace", name, cd)
	}
	if want := path.Join(specsPath, "contracts"); rel != want {
		t.Errorf("job %s: CONTRACTS_DIR is %q, want the workspace's %q", name, rel, want)
	}
}
