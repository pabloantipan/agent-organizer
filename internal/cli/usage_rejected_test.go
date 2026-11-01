package cli

import (
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// leftovers-54 G4 (FR-4): `organizer usage` and `organizer doctor` list the
// rows the record rejected, from the post state in the data dir: the count,
// then per row the session, the day and the record's reason. The state is
// written as JSON so this compiles against any version.
func TestG4UsageAndDoctorListRejectedRows(t *testing.T) {
	fixtureEnv(t)
	t.Setenv("CLAUDE_CONFIG_DIR", t.TempDir())
	data := filepath.Join(os.Getenv("XDG_DATA_HOME"), "organizer")
	if err := os.MkdirAll(data, 0o700); err != nil {
		t.Fatal(err)
	}
	state := `{"accepted":{"s-ok|2026-10-05":"h0"},"rejected":{` +
		`"s-neg|2026-10-05":{"session_id":"s-neg","day":"2026-10-05","reason":"token counts and messages cannot be negative","hash":"h1","at":"2026-10-06T09:00:00Z"},` +
		`"s-typed|2026-10-04":{"session_id":"s-typed","day":"2026-10-04","reason":"input is a JSON string","hash":"h2","at":"2026-10-06T09:00:00Z"}}}`
	if err := os.WriteFile(filepath.Join(data, "usage-post.json"), []byte(state), 0o600); err != nil {
		t.Fatal(err)
	}
	now := func() time.Time { return time.Date(2026, 10, 6, 12, 0, 0, 0, time.Local) }
	rows := [][3]string{
		{"s-neg", "2026-10-05", "token counts and messages cannot be negative"},
		{"s-typed", "2026-10-04", "input is a JSON string"},
	}
	for _, cmd := range []string{"usage", "doctor"} {
		t.Run(cmd, func(t *testing.T) {
			var out, errb bytes.Buffer
			if code := runWith([]string{cmd}, &out, &errb, now); code != 0 {
				t.Fatalf("exit %d: %s", code, errb.String())
			}
			got := out.String()
			if !strings.Contains(got, "rejected by the record: 2 rows") {
				t.Errorf("no count of rejected rows in:\n%s", got)
			}
			for _, r := range rows {
				found := false
				for _, line := range strings.Split(got, "\n") {
					if strings.Contains(line, r[0]) && strings.Contains(line, r[1]) && strings.Contains(line, r[2]) {
						found = true
					}
				}
				if !found {
					t.Errorf("no line with %s, %s and %q in:\n%s", r[0], r[1], r[2], got)
				}
			}
			if strings.Contains(got, "s-ok") {
				t.Errorf("an accepted row is listed:\n%s", got)
			}
		})
	}
}

// No rejected rows, no section: the report and doctor stay as they were.
func TestUsageNoRejectedRowsNoSection(t *testing.T) {
	fixtureEnv(t)
	t.Setenv("CLAUDE_CONFIG_DIR", t.TempDir())
	now := func() time.Time { return time.Date(2026, 10, 6, 12, 0, 0, 0, time.Local) }
	var out, errb bytes.Buffer
	if code := runWith([]string{"usage"}, &out, &errb, now); code != 0 {
		t.Fatalf("exit %d: %s", code, errb.String())
	}
	if strings.Contains(out.String(), "rejected") {
		t.Errorf("a rejected section with nothing rejected:\n%s", out.String())
	}
}
