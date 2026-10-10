//go:build darwin

// Go glue for the memory warning's notification (notify_darwin.m).
package main

/*
#cgo CFLAGS: -x objective-c -fobjc-arc
#cgo LDFLAGS: -framework Cocoa -framework UserNotifications
#include <stdlib.h>
const char *NotifyBundleID(void);
void NotifyStart(const char *refused);
void NotifyPost(const char *title, const char *body);
int NotifyState(void);
*/
import "C"

import (
	"unsafe"

	wruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// notifyApp is the app the click reaches; set once at startup.
var notifyApp *App

func notifyStart(a *App, faked bool) {
	notifyApp = a
	r := C.CString(notifyRefusal(C.GoString(C.NotifyBundleID()), faked))
	defer C.free(unsafe.Pointer(r))
	C.NotifyStart(r)
}

func notifyPost(title, body string) {
	t, b := C.CString(title), C.CString(body)
	defer C.free(unsafe.Pointer(t))
	defer C.free(unsafe.Pointer(b))
	C.NotifyPost(t, b)
}

// notifyState is the centre's last word: "not asked", "on", "off" (for
// Deltagos, in System Settings), "no bundle" or "not installed" (a review
// build or a fixture run, which posts nothing).
func notifyState() string {
	return [...]string{"not asked", "on", "off", "no bundle", "not installed"}[C.NotifyState()]
}

//export notifyClicked
func notifyClicked() {
	if notifyApp != nil {
		go notifyApp.memoryNotificationClicked()
	}
}

//export notifyLog
func notifyLog(line *C.char) {
	s := C.GoString(line)
	if notifyApp != nil && notifyApp.ctx != nil {
		go wruntime.LogInfo(notifyApp.ctx, s)
	}
}
