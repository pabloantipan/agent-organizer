package main

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	wruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// reviewResizeEnv resizes the window once, by the app's own API, for a
// review that must show a live resize without driving input
// (docs/specs/leftovers-62.md U2, Amendment 2): `<w>x<h>@<seconds>`, for
// example `1024x640@20`, calls runtime.WindowSetSize(w, h) that many
// seconds after startup. Unset or empty, nothing runs; a value that does
// not parse is logged and ignored. The pattern is memfake.go's.
const reviewResizeEnv = "ORGANIZER_REVIEW_RESIZE"

// resizeAsk is one parsed ORGANIZER_REVIEW_RESIZE.
type resizeAsk struct {
	W, H  int
	After time.Duration
}

// parseReviewResize reads `<w>x<h>@<seconds>`; the seconds may be a
// fraction and may be 0. Width and height must be positive.
func parseReviewResize(v string) (resizeAsk, error) {
	size, delay, ok := strings.Cut(strings.TrimSpace(v), "@")
	if !ok {
		return resizeAsk{}, fmt.Errorf("%s=%q: want <w>x<h>@<seconds>", reviewResizeEnv, v)
	}
	ws, hs, ok := strings.Cut(size, "x")
	if !ok {
		return resizeAsk{}, fmt.Errorf("%s=%q: want <w>x<h>@<seconds>", reviewResizeEnv, v)
	}
	w, errW := strconv.Atoi(ws)
	h, errH := strconv.Atoi(hs)
	s, errS := strconv.ParseFloat(delay, 64)
	if errW != nil || errH != nil || errS != nil || w <= 0 || h <= 0 || s < 0 {
		return resizeAsk{}, fmt.Errorf("%s=%q: want <w>x<h>@<seconds>, positive size", reviewResizeEnv, v)
	}
	return resizeAsk{W: w, H: h, After: time.Duration(s * float64(time.Second))}, nil
}

// reviewResize runs the one resize the env asks for, through setSize after
// the delay, and reports whether it was asked. Unset, it returns false at
// once and calls nothing. It blocks for the delay, so startup runs it in a
// goroutine; ctx ending first cancels it.
func reviewResize(ctx context.Context, getenv func(string) string, setSize func(context.Context, int, int), logf func(string, ...any)) bool {
	v := strings.TrimSpace(getenv(reviewResizeEnv))
	if v == "" {
		return false
	}
	ask, err := parseReviewResize(v)
	if err != nil {
		logf("review resize ignored: %v", err)
		return false
	}
	select {
	case <-ctx.Done():
		return true
	case <-time.After(ask.After):
	}
	logf("review resize: %s=%s, window set to %dx%d", reviewResizeEnv, v, ask.W, ask.H)
	setSize(ctx, ask.W, ask.H)
	return true
}

// startReviewResize is the one line startup calls: inert unless the env is
// set.
func startReviewResize(ctx context.Context) {
	if strings.TrimSpace(os.Getenv(reviewResizeEnv)) == "" {
		return
	}
	go reviewResize(ctx, os.Getenv, wruntime.WindowSetSize, func(f string, a ...any) { wruntime.LogInfof(ctx, f, a...) })
}
