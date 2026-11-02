package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"reflect"
	"strings"
	"testing"

	"organizer/internal/cache"
	"organizer/internal/model"
)

// The run report's gate rows (docs/specs/leftovers-57.md R1-R4, R6, W12).
// The samples are read from $CONTRACTS_DIR/factory-report/; CONTRACTS_DIR is
// the pin: a checkout of agent-mailbox-specs at the commit these types
// follow (54369d3 on feat/report-dead-minutes, factory-report 8474386 plus
// dead_minutes; FR-20). Unset, the tests fall back to
// ~/agent-slack/specs/contracts, which is NOT pinned: it holds whatever that
// checkout is at, and the tests log that they read it. A missing sample
// fails, never skips. Fake factories print the samples; only R2 runs the
// real factory, over the contract's own fixture.

const reportContractPin = "agent-mailbox-specs 54369d3 (feat/report-dead-minutes)"

func reportContractDir() string {
	if d := os.Getenv("CONTRACTS_DIR"); d != "" {
		return filepath.Join(d, "factory-report")
	}
	home, _ := os.UserHomeDir()
	return filepath.Join(home, "agent-slack", "specs", "contracts", "factory-report")
}

// readReportSample is the sample's path and bytes, or an error naming it.
func readReportSample(dir, name string) (string, []byte, error) {
	p := filepath.Join(dir, name)
	b, err := os.ReadFile(p)
	if err != nil {
		return p, nil, fmt.Errorf("factory-report contract sample %s is missing: %v (set CONTRACTS_DIR to the contracts/ of a checkout of %s)", name, err, reportContractPin)
	}
	return p, b, nil
}

func reportSample(t *testing.T, name string) (string, []byte) {
	t.Helper()
	if os.Getenv("CONTRACTS_DIR") == "" {
		t.Logf("CONTRACTS_DIR unset: reading %s, an unpinned checkout; the pin is %s", reportContractDir(), reportContractPin)
	}
	p, b, err := readReportSample(reportContractDir(), name)
	if err != nil {
		t.Fatal(err)
	}
	return p, b
}

// R1's second half: the loader's failure names the missing sample.
func TestReportSampleMissingNamesIt(t *testing.T) {
	_, _, err := readReportSample(t.TempDir(), "expected.json")
	if err == nil || !strings.Contains(err.Error(), "expected.json") {
		t.Fatalf("err = %v, want one naming expected.json", err)
	}
}

// fakeFactory puts a factory on an otherwise empty PATH (plus /bin and
// /usr/bin for the script's own tools) that logs its arguments one per line
// to the returned log, then runs body. ~/bin is not looked in.
func fakeFactory(t *testing.T, body string) (log string) {
	t.Helper()
	dir := t.TempDir()
	log = filepath.Join(dir, "args.log")
	script := "#!/bin/sh\nfor a in \"$@\"; do printf '%s\\n' \"$a\" >>'" + log + "'; done\n" + body + "\n"
	if err := os.WriteFile(filepath.Join(dir, "factory"), []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", dir+":/bin:/usr/bin")
	noFallback(t)
	return log
}

func noFallback(t *testing.T) {
	old := factoryFallbackDirs
	factoryFallbackDirs = func() []string { return nil }
	t.Cleanup(func() { factoryFallbackDirs = old })
}

func reportService(root string) *Service {
	si := model.ScannedInitiative{Initiative: model.Initiative{ID: "fixture", Path: root}}
	return &Service{state: cache.State{Local: model.Snapshot{Machine: "lodestar", Initiatives: []model.ScannedInitiative{si}}}}
}

func readArgs(t *testing.T, log string) []string {
	t.Helper()
	b, err := os.ReadFile(log)
	if err != nil {
		t.Fatalf("factory was not run: %v", err)
	}
	return strings.Split(strings.TrimRight(string(b), "\n"), "\n")
}

// generic decodes JSON into maps and slices, dropping the top-level keys
// named (case.json's ignore_fields).
func generic(t *testing.T, b []byte, drop ...string) any {
	t.Helper()
	var v any
	if err := json.Unmarshal(b, &v); err != nil {
		t.Fatal(err)
	}
	if m, ok := v.(map[string]any); ok {
		for _, k := range drop {
			delete(m, k)
		}
	}
	return v
}

func reencode(t *testing.T, v any) []byte {
	t.Helper()
	b, err := json.Marshal(v)
	if err != nil {
		t.Fatal(err)
	}
	return b
}

// R1: decode expected.json, encode it again: equal with root ignored.
func TestReportDecodesContract(t *testing.T) {
	p, want := reportSample(t, "expected.json")
	log := fakeFactory(t, "cat '"+p+"'")
	r, err := reportService("/x/init").Report("fixture", "2026-10-20 00:00", "2026-10-20 09:00")
	if err != nil {
		t.Fatal(err)
	}
	got := generic(t, reencode(t, r.Report), "root")
	if !reflect.DeepEqual(got, generic(t, want, "root")) {
		t.Fatalf("re-encoded report differs from expected.json:\n%s", reencode(t, r.Report))
	}
	wantArgs := []string{"report", "/x/init", "--since", "2026-10-20 00:00", "--until", "2026-10-20 09:00", "--json"}
	if a := readArgs(t, log); !reflect.DeepEqual(a, wantArgs) {
		t.Fatalf("args = %q, want %q", a, wantArgs)
	}
}

// R2: the real factory over make-fixture.sh, case.json's window, --text:
// byte-equal to expected.txt.
func TestReportTextRealFactory(t *testing.T) {
	bin, err := exec.LookPath("factory")
	if err != nil {
		home, _ := os.UserHomeDir()
		if _, e := os.Stat(filepath.Join(home, "bin", "factory")); e != nil {
			if os.Getenv("CI") != "" {
				t.Skip("R2 needs the real factory, which CI does not have")
			}
			t.Fatalf("R2 needs the real factory on PATH or in ~/bin: %v", err)
		}
		bin = filepath.Join(home, "bin", "factory")
	}
	reportSample(t, "case.json")
	_, want := reportSample(t, "expected.txt")
	mk, _ := reportSample(t, "make-fixture.sh")

	fx := filepath.Join(t.TempDir(), "fx")
	if out, err := exec.Command("bash", mk, fx).CombinedOutput(); err != nil {
		t.Fatalf("make-fixture.sh: %v\n%s", err, out)
	}
	sourceEnv(t, filepath.Join(fx, "env.sh"))
	// The resolved factory first on PATH.
	t.Setenv("PATH", filepath.Dir(bin)+":"+os.Getenv("PATH"))

	got, err := reportService(filepath.Join(fx, "init")).ReportText("fixture", "2026-10-20 00:00", "2026-10-20 09:00")
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal([]byte(got), want) {
		t.Fatalf("ReportText is not byte-equal to expected.txt:\n--- got\n%s--- want\n%s", got, want)
	}
}

// sourceEnv applies env.sh to this process the way `source` would: every
// variable it exports is set, every one it unsets is unset (and restored
// after the test).
func sourceEnv(t *testing.T, path string) {
	t.Helper()
	out, err := exec.Command("/bin/sh", "-c", ". '"+path+"' && env -0").Output()
	if err != nil {
		t.Fatalf("source %s: %v", path, err)
	}
	after := map[string]string{}
	for _, kv := range strings.Split(string(out), "\x00") {
		if k, v, ok := strings.Cut(kv, "="); ok {
			after[k] = v
		}
	}
	for k, v := range after {
		if os.Getenv(k) != v {
			t.Setenv(k, v)
		}
	}
	for _, kv := range os.Environ() {
		k, _, _ := strings.Cut(kv, "=")
		if _, ok := after[k]; !ok {
			t.Setenv(k, os.Getenv(k)) // restores it after the test
			os.Unsetenv(k)
		}
	}
}

// R3: factory missing, factory failing, an initiative of another machine.
func TestReportErrors(t *testing.T) {
	t.Run("missing", func(t *testing.T) {
		t.Setenv("PATH", t.TempDir())
		noFallback(t)
		s := reportService("/x/init")
		if _, err := s.Report("fixture", "a", "b"); err == nil || err.Error() != "factory report not found" {
			t.Fatalf("Report err = %v", err)
		}
		if _, err := s.ReportText("fixture", "a", "b"); err == nil || err.Error() != "factory report not found" {
			t.Fatalf("ReportText err = %v", err)
		}
		if _, err := s.ReportWindows("fixture"); err == nil || err.Error() != "factory report not found" {
			t.Fatalf("ReportWindows err = %v", err)
		}
	})
	t.Run("exit 2", func(t *testing.T) {
		fakeFactory(t, "echo partial; echo boom >&2; echo second >&2; exit 2")
		s := reportService("/x/init")
		if _, err := s.Report("fixture", "a", "b"); err == nil || err.Error() != "boom" {
			t.Fatalf("Report err = %v, want boom", err)
		}
		if _, err := s.ReportText("fixture", "a", "b"); err == nil || err.Error() != "boom" {
			t.Fatalf("ReportText err = %v, want boom", err)
		}
		if _, err := s.ReportWindows("fixture"); err == nil || err.Error() != "boom" {
			t.Fatalf("ReportWindows err = %v, want boom", err)
		}
	})
	t.Run("remote", func(t *testing.T) {
		log := fakeFactory(t, "echo '{}'")
		s := &Service{state: cache.State{
			Local: model.Snapshot{Machine: "lodestar", Initiatives: []model.ScannedInitiative{
				{Initiative: model.Initiative{ID: "here", Path: "/x/here"}},
				{Initiative: model.Initiative{ID: "other", Path: "/x/other"}},
			}},
			Remote: []model.Snapshot{{Machine: "odyssey", Initiatives: []model.ScannedInitiative{
				{Initiative: model.Initiative{ID: "fixture"}},
				{Initiative: model.Initiative{ID: "away"}},
			}}},
		}}
		if _, err := s.Report("fixture", "a", "b"); err == nil || err.Error() != "drawn on odyssey" {
			t.Fatalf("Report err = %v", err)
		}
		if _, err := s.ReportText("fixture", "a", "b"); err == nil || err.Error() != "drawn on odyssey" {
			t.Fatalf("ReportText err = %v", err)
		}
		if _, err := s.ReportWindows("fixture"); err == nil || err.Error() != "drawn on odyssey" {
			t.Fatalf("ReportWindows err = %v", err)
		}
		if _, err := os.Stat(log); !os.IsNotExist(err) {
			t.Fatalf("factory ran for a remote initiative: %v", err)
		}
	})
}

// R4: the windows as given, newest first; a picked one drawn with @epochs.
func TestReportWindows(t *testing.T) {
	p, want := reportSample(t, "expected-windows.json")
	log := fakeFactory(t, "cat '"+p+"'")
	s := reportService("/x/init")
	w, err := s.ReportWindows("fixture")
	if err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(generic(t, reencode(t, w), "root"), generic(t, want, "root")) {
		t.Fatalf("re-encoded windows differ from expected-windows.json:\n%s", reencode(t, w))
	}
	if len(w.Windows) < 2 {
		t.Fatalf("the sample has %d windows, want two or more", len(w.Windows))
	}
	for i := 1; i < len(w.Windows); i++ {
		if w.Windows[i].Since > w.Windows[i-1].Since {
			t.Fatalf("windows not newest first: %d after %d", w.Windows[i].Since, w.Windows[i-1].Since)
		}
	}
	wantArgs := []string{"report", "/x/init", "--windows", "--days", "14", "--json"}
	if a := readArgs(t, log); !reflect.DeepEqual(a, wantArgs) {
		t.Fatalf("args = %q, want %q", a, wantArgs)
	}

	// A picked window: the first, drawn by its epochs.
	ep, _ := reportSample(t, "expected.json")
	log = fakeFactory(t, "cat '"+ep+"'")
	pick := w.Windows[0]
	since, until := fmt.Sprintf("@%d", pick.Since), fmt.Sprintf("@%d", pick.Until)
	if _, err := s.Report("fixture", since, until); err != nil {
		t.Fatal(err)
	}
	wantArgs = []string{"report", "/x/init", "--since", "@1792454400", "--until", "@1792476000", "--json"}
	if a := readArgs(t, log); !reflect.DeepEqual(a, wantArgs) {
		t.Fatalf("picked window args = %q, want %q", a, wantArgs)
	}
}

// R6: waves as given, and tokens per line from the usage fixture: only the
// line's cards, only session-days inside the window.
func TestReportWavesAndTokens(t *testing.T) {
	p, want := reportSample(t, "expected.json")
	fakeFactory(t, "cat '"+p+"'")
	ledger, err := filepath.Abs(filepath.Join("..", "..", "testdata", "report-usage", "usage.jsonl"))
	if err != nil {
		t.Fatal(err)
	}
	old := reportLedger
	reportLedger = func() string { return ledger }
	t.Cleanup(func() { reportLedger = old })

	r, err := reportService("/x/init").Report("fixture", "2026-10-20 00:00", "2026-10-20 09:00")
	if err != nil {
		t.Fatal(err)
	}
	var sample map[string]json.RawMessage
	if err := json.Unmarshal(want, &sample); err != nil {
		t.Fatal(err)
	}
	if r.Report.Waves == nil {
		t.Fatal("report has no waves block")
	}
	if !reflect.DeepEqual(generic(t, reencode(t, r.Report.Waves)), generic(t, sample["waves"])) {
		t.Fatalf("waves differ from expected.json's:\n%s", reencode(t, r.Report.Waves))
	}
	if n := len(r.Report.Waves.Waves); n < 2 {
		t.Fatalf("sample has %d waves, want two or more", n)
	}

	// Line 1 (a, b): s-a1 1500 + s-b1 2500 + s-b2 100; s-a0 is before the
	// window, s-x1 another initiative's, s-w1 a supervisor's wave task.
	// Line 2 (c): s-c1 700; s-c2 runs past the window's end. Line 3 (d): none.
	wantTokens := []LineTokens{
		{T: 1792458600, Tokens: 4100, Sessions: 3},
		{T: 1792468800, Tokens: 700, Sessions: 1},
		{T: 1792483200, Tokens: 0, Sessions: 0},
	}
	if !reflect.DeepEqual(r.LineTokens, wantTokens) {
		t.Fatalf("line tokens = %+v, want %+v", r.LineTokens, wantTokens)
	}
	for i, lt := range r.LineTokens {
		if lt.T != r.Report.Progress.Lines[i].T || lt.T != r.Report.Waves.Lines[i].T {
			t.Fatalf("line %d: tokens at %d, progress at %d, waves at %d", i, lt.T, r.Report.Progress.Lines[i].T, r.Report.Waves.Lines[i].T)
		}
	}
}
