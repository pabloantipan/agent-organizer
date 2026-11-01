package service

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"organizer/internal/config"
)

// leftovers-54 G3 (FR-3, FR-4): a rejected row that changes and is rejected
// again is kept with its new reason and logged again (its content moved);
// UsageRejected reads the rows back for `organizer usage` and doctor.
func TestRejectedRowRejectedAgain(t *testing.T) {
	dataDir := usageHome(t)
	f := newUsageRecord(t)
	f.rejects = map[string]string{"s-0001": "first reason"}
	ls := usageLines(3)
	postUsage(context.Background(), usageTarget(f), dataDir, ls, fixedNow)
	f.mu.Lock()
	f.rejects = map[string]string{"s-0001": "second reason"}
	f.mu.Unlock()
	ls[1].Output += 1
	postUsage(context.Background(), usageTarget(f), dataDir, ls, fixedNow)
	if n := len(f.got()); n != 2 {
		t.Fatalf("posts %d, want 2", n)
	}
	got := UsageRejected()
	if len(got) != 1 || got[0].SessionID != "s-0001" || got[0].Day != "2026-10-05" || got[0].Reason != "second reason" {
		t.Errorf("UsageRejected %+v, want s-0001 with the second reason", got)
	}
	b, _ := os.ReadFile(filepath.Join(dataDir, "organizer.log"))
	if n := strings.Count(strings.TrimSpace(string(b)), "\n") + 1; n != 2 {
		t.Errorf("organizer.log has %d lines, want 2 (one per distinct rejection):\n%s", n, b)
	}
	if got := UsagePostStatus(config.Config{RecordURL: f.srv.URL, DiscussStateDir: usageStateDir(t, true)}); !strings.HasPrefix(got, "ok ") || !strings.HasSuffix(got, ", 0 rows, 1 rejected") {
		t.Errorf("status %q, want ok with 0 rows posted and 1 rejected", got)
	}
}
