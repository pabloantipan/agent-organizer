package main

import "testing"

// N2 (leftovers-15 FR-2): only the installed bundle posts, and not with its
// memory reading forced; a review build or a fixture run logs the warning
// and posts nothing.
func TestNotifyRefusal(t *testing.T) {
	cases := []struct {
		bundle string
		faked  bool
		posts  bool
	}{
		{"cl.antipan.organizer", false, true},
		{"cl.antipan.organizer", true, false},
		{"cl.antipan.organizer.review", false, false},
		{"cl.antipan.organizer.review", true, false},
		{"com.example.other", false, false},
	}
	for _, c := range cases {
		why := notifyRefusal(c.bundle, c.faked)
		if (why == "") != c.posts {
			t.Errorf("%s faked=%v: refusal %q, want posts=%v", c.bundle, c.faked, why, c.posts)
		}
	}
}
