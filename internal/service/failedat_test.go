package service

import (
	"encoding/json"
	"os"
	"strings"
	"testing"
	"time"
)

// G2 (leftovers-30 FR-2): a seat that fails twice (exit 3, retried, 3 again)
// carries failed_at, the second failure's time, after started_at. The fake
// clock moves one minute per probe call made, so each try has its own time.
func TestFailedSeatCarriesFailedAt(t *testing.T) {
	f := newFakeProbe(t, "crewfix", "3", "3")
	s, _ := crewService(t, f, "dev_bruno")
	fakeLive(t)
	base := time.Date(2026, 10, 14, 12, 0, 0, 0, time.UTC)
	s.now = func() time.Time {
		b, _ := os.ReadFile(f.calls)
		return base.Add(time.Duration(strings.Count(string(b), "wrapper ")) * time.Minute)
	}

	if _, err := s.StartCrew("init-crew", true); err != nil {
		t.Fatal(err)
	}
	got, _ := s.WaitLaunch("init-crew")
	seat := got.Seats[0]
	if seat.State != LaunchFailed || seat.StartedAt == nil || seat.FailedAt == nil {
		t.Fatalf("seat %+v, want failed with started_at and failed_at", seat)
	}
	if want := base.Add(2 * time.Minute); !seat.FailedAt.Equal(want) {
		t.Errorf("failed_at %s, want %s (after the second probe call)", seat.FailedAt, want)
	}
	if !seat.FailedAt.After(*seat.StartedAt) {
		t.Errorf("failed_at %s not after started_at %s", seat.FailedAt, seat.StartedAt)
	}
	if want := base.Add(time.Minute); !seat.StartedAt.Equal(want) {
		t.Errorf("started_at %s, want the retry's start %s", seat.StartedAt, want)
	}

	b, err := json.Marshal(seat)
	if err != nil || !strings.Contains(string(b), `"failed_at":"2026-10-14T12:02:00Z"`) {
		t.Errorf("the entry's JSON %s (%v) does not carry failed_at", b, err)
	}

	// A retry clears it.
	if err := s.RetrySeat("init-crew", "dev_bruno"); err != nil {
		t.Fatal(err)
	}
	for _, l := range s.Launches() {
		for _, st := range l.Seats {
			if st.State == LaunchQueued && st.FailedAt != nil {
				t.Errorf("a queued retry kept failed_at %s", st.FailedAt)
			}
		}
	}
	s.WaitLaunch("init-crew")
}
