package main

import (
	"context"
	"testing"
	"time"
)

// leftovers-62 U2 (Amendment 2): the review resize parses <w>x<h>@<seconds>
// and calls the window's own setter once after the delay; unset, empty or
// malformed, it calls nothing.
func TestParseReviewResize(t *testing.T) {
	for _, c := range []struct {
		in   string
		want resizeAsk
		ok   bool
	}{
		{"1024x640@20", resizeAsk{1024, 640, 20 * time.Second}, true},
		{" 1440x900@0.5 ", resizeAsk{1440, 900, 500 * time.Millisecond}, true},
		{"1024x640@0", resizeAsk{1024, 640, 0}, true},
		{"1024x640", resizeAsk{}, false},
		{"1024@20", resizeAsk{}, false},
		{"0x640@1", resizeAsk{}, false},
		{"1024x-1@1", resizeAsk{}, false},
		{"axb@1", resizeAsk{}, false},
		{"1024x640@-1", resizeAsk{}, false},
		{"1024x640@soon", resizeAsk{}, false},
	} {
		got, err := parseReviewResize(c.in)
		if (err == nil) != c.ok || got != c.want {
			t.Errorf("parseReviewResize(%q) = %+v, %v; want %+v, ok %v", c.in, got, err, c.want, c.ok)
		}
	}
}

func TestReviewResizeUnsetDoesNothing(t *testing.T) {
	for _, v := range []string{"", "   ", "nonsense", "1024x640"} {
		calls := 0
		asked := reviewResize(context.Background(), func(string) string { return v },
			func(context.Context, int, int) { calls++ }, func(string, ...any) {})
		if asked || calls != 0 {
			t.Errorf("%s=%q: asked %v, %d calls; want false, 0", reviewResizeEnv, v, asked, calls)
		}
	}
	// startReviewResize with the variable unset starts nothing (no runtime
	// is behind this context, so a call into it would panic).
	t.Setenv(reviewResizeEnv, "")
	startReviewResize(context.Background())
}

func TestReviewResizeSetsOnceAfterDelay(t *testing.T) {
	var got [][2]int
	start := time.Now()
	asked := reviewResize(context.Background(), func(k string) string {
		if k == reviewResizeEnv {
			return "1024x640@0.05"
		}
		return ""
	}, func(_ context.Context, w, h int) { got = append(got, [2]int{w, h}) }, func(string, ...any) {})
	if !asked || len(got) != 1 || got[0] != [2]int{1024, 640} {
		t.Fatalf("asked %v, calls %v; want one call 1024x640", asked, got)
	}
	if time.Since(start) < 50*time.Millisecond {
		t.Errorf("called before the delay: %v", time.Since(start))
	}
}

func TestReviewResizeCancelled(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	calls := 0
	reviewResize(ctx, func(string) string { return "1024x640@10" }, func(context.Context, int, int) { calls++ }, func(string, ...any) {})
	if calls != 0 {
		t.Errorf("%d calls after the context ended", calls)
	}
}
