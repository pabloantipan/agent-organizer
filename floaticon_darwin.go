//go:build darwin

// Go glue for the floating icon (docs/ux/specs/floating-icon.md, 0090): the
// native panel lives in floaticon_darwin.m; these are the calls the frontend
// makes and the two callbacks the panel makes back.
package main

/*
#cgo CFLAGS: -x objective-c -fobjc-arc
#cgo LDFLAGS: -framework Cocoa -framework QuartzCore
#include <stdlib.h>
#include "floaticon_darwin.h"
*/
import "C"

import (
	"context"
	"os"
	"path/filepath"
	"sync/atomic"
	"unsafe"

	wruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

var (
	floatCtx context.Context
	// floatOff is set when the startup check (T5) leaves the icon off; the
	// top bar then hides Compact to icon.
	floatOff atomic.Bool
)

// floatIconStart builds the icon on the main thread. FLOAT_LOG, when set, is
// the path of the float log (N2); the remembered places live in the data dir.
func floatIconStart(ctx context.Context) {
	floatCtx = ctx
	base := os.Getenv("XDG_DATA_HOME")
	if base == "" {
		home, _ := os.UserHomeDir()
		base = filepath.Join(home, ".local", "share")
	}
	dir := filepath.Join(base, "organizer")
	_ = os.MkdirAll(dir, 0o755)
	logPath := C.CString(os.Getenv("FLOAT_LOG"))
	placePath := C.CString(filepath.Join(dir, "floaticon.plist"))
	defer C.free(unsafe.Pointer(logPath))
	defer C.free(unsafe.Pointer(placePath))
	C.FloatIconStart(logPath, placePath)
}

// floatIconClicked tells the frontend to show the list; origin is the
// corner it grows from ("bottom right"). Called on the main thread; emitted
// from a goroutine so Wails can dispatch.
//
//export floatIconClicked
func floatIconClicked(origin *C.char) {
	o := C.GoString(origin)
	go wruntime.EventsEmit(floatCtx, "floaticon:list", o)
}

// floatIconClosed tells the frontend the list is gone (picked nothing).
//
//export floatIconClosed
func floatIconClosed() {
	go wruntime.EventsEmit(floatCtx, "floaticon:close")
}

//export floatIconUnavailable
func floatIconUnavailable(reason *C.char) {
	floatOff.Store(true)
	msg := C.GoString(reason)
	go wruntime.LogErrorf(floatCtx, "floating icon off: %s", msg)
}

// FloatAvailable says whether the floating icon runs on this platform and
// passed its startup check.
func (a *App) FloatAvailable() bool { return !floatOff.Load() }

// FloatCompact shrinks the window into the icon (§4).
func (a *App) FloatCompact() { C.FloatIconCompact() }

// FloatPick makes the window full on this desktop after a pick in the list.
func (a *App) FloatPick() { C.FloatIconFull() }

// FloatDismiss is picking nothing: the window goes back home.
func (a *App) FloatDismiss() { C.FloatIconDismiss() }

// FloatListHeight sizes the list to its rows, within §3's limits.
func (a *App) FloatListHeight(height int) { C.FloatIconListHeight(C.int(height)) }
