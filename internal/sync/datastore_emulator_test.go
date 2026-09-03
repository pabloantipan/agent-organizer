//go:build datastore_emulator

// Runs only against the emulator:
//
//	gcloud beta emulators datastore start --no-store-on-disk &
//	DATASTORE_EMULATOR_HOST=localhost:8081 go test -tags datastore_emulator ./internal/sync/
//
// The fake cannot catch struct-tag or query drift; this can.
package sync

import (
	"context"
	"os"
	"testing"
	"time"

	"organizer/internal/model"
)

func TestEmulatorRoundTrip(t *testing.T) {
	if os.Getenv("DATASTORE_EMULATOR_HOST") == "" {
		t.Skip("DATASTORE_EMULATOR_HOST not set")
	}
	ctx := context.Background()
	st, err := Open(ctx, "demo-local", "organizer-test")
	if err != nil {
		t.Fatal(err)
	}
	defer st.Close()
	t0 := time.Now().UTC().Truncate(time.Second)
	if _, _, err := st.Push(ctx, snap("emu-a", t0, "one", "two")); err != nil {
		t.Fatal(err)
	}
	if _, retired, err := st.Push(ctx, snap("emu-a", t0.Add(time.Second), "one")); err != nil || retired != 1 {
		t.Fatalf("retired=%d err=%v", retired, err)
	}
	snaps, err := st.Pull(ctx)
	if err != nil {
		t.Fatal(err)
	}
	var found *model.Snapshot
	for i := range snaps {
		if snaps[i].Machine == "emu-a" {
			found = &snaps[i]
		}
	}
	if found == nil || len(found.Initiatives) != 1 || found.Initiatives[0].ID != "one" {
		t.Fatalf("pull: %+v", snaps)
	}
}
