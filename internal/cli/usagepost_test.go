package cli

import (
	"bytes"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"organizer/internal/record"
)

// U6: doctor prints the usage post's outcome in FR-5's words: off with why,
// the last ok post, the last failed one. Temp config, data and state dirs;
// a test key; the record URL is never called.
func TestDoctorReportsTheUsagePost(t *testing.T) {
	dir := t.TempDir()
	state := filepath.Join(dir, "discuss")
	cfgPath := filepath.Join(dir, "config.yaml")
	t.Setenv("ORGANIZER_CONFIG", cfgPath)
	t.Setenv("XDG_DATA_HOME", dir)
	now := func() time.Time { return time.Date(2026, 10, 6, 9, 0, 0, 0, time.UTC) }
	if err := record.WriteKey(state, "fk_test_doctor_key"); err != nil {
		t.Fatal(err)
	}
	if err := record.WriteFactory(state, "testfactory"); err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(filepath.Join(dir, "organizer"), 0o700); err != nil {
		t.Fatal(err)
	}
	at := "2026-10-06T08:30:00Z"
	base := fmt.Sprintf("machine: lodestar\nroots: []\ndiscuss_state_dir: %s\n", state)
	on := base + "record_url: http://127.0.0.1:1\n"

	for _, c := range []struct{ cfg, last, want string }{
		{base, "", "usage post: off: no record_url"},
		{on, `{"at":"` + at + `","ok":true,"rows":3}`, "usage post: ok " + at + ", 3 rows"},
		{on, `{"at":"` + at + `","ok":false,"reason":"HTTP 500: store down"}`, "usage post: failed " + at + ": HTTP 500: store down"},
	} {
		if err := os.WriteFile(cfgPath, []byte(c.cfg), 0o644); err != nil {
			t.Fatal(err)
		}
		if c.last != "" {
			body := `{"accepted":{},"last":` + c.last + `}`
			if err := os.WriteFile(filepath.Join(dir, "organizer", "usage-post.json"), []byte(body), 0o600); err != nil {
				t.Fatal(err)
			}
		}
		var out, errb bytes.Buffer
		if code := doctor(mustLoad(t), nil, &out, &errb, now); code != 0 {
			t.Fatalf("doctor exit %d: %s", code, errb.String())
		}
		if !strings.Contains(out.String(), c.want+"\n") {
			t.Errorf("doctor did not print %q:\n%s", c.want, out.String())
		}
		if strings.Contains(out.String(), "fk_test_doctor_key") {
			t.Errorf("doctor printed the key:\n%s", out.String())
		}
	}
}
