package scan

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

// leftovers-78 G1 (FR-4, AR45): the scan trims `client` when it reads
// initiative.yaml; a client of only spaces is no client.
func TestClientTrimmed(t *testing.T) {
	for _, c := range []struct{ name, yaml, want string }{
		{"two spaces", `client: "  "`, ""},
		{"padded acme", `client: " acme "`, "acme"},
		{"tab and spaces", "client: \"\\t \"", ""},
		{"none", "", ""},
	} {
		t.Run(c.name, func(t *testing.T) {
			root := t.TempDir()
			wo := filepath.Join(root, workingOnDir)
			if err := os.MkdirAll(wo, 0o755); err != nil {
				t.Fatal(err)
			}
			body := "id: x\ntitle: X\n" + c.yaml + "\nstatus: active\n"
			if err := os.WriteFile(filepath.Join(wo, initiativeFile), []byte(body), 0o644); err != nil {
				t.Fatal(err)
			}
			si := ReadInitiative(root, Options{Now: time.Now})
			if si.Client != c.want {
				t.Errorf("client %q, want %q", si.Client, c.want)
			}
			if len(si.Problems) != 0 {
				t.Errorf("problems: %+v", si.Problems)
			}
		})
	}
}
