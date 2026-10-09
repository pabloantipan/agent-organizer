// focus-handoff-check.swift — a stand-in for any app the lead closes on a
// desktop (float-focus-steal S1): opens one small window on the current
// desktop, activates itself, waits, then quits, so macOS hands activation to
// whatever it picks next on that desktop. The frontmost-app log and the float
// log then say which app that was and whether the desktop changed.
//
//   swift scripts/focus-handoff-check.swift [seconds before quitting, default 2]
import AppKit

let wait = Double(CommandLine.arguments.dropFirst().first ?? "") ?? 2
let app = NSApplication.shared
app.setActivationPolicy(.regular)
let w = NSWindow(contentRect: NSRect(x: 200, y: 200, width: 320, height: 120), styleMask: [.titled], backing: .buffered, defer: false)
w.title = "focus-handoff-check"
w.makeKeyAndOrderFront(nil)
app.activate(ignoringOtherApps: true)
DispatchQueue.main.asyncAfter(deadline: .now() + wait) {
    print(String(format: "%.3f quitting", Date().timeIntervalSince1970))
    exit(0)
}
app.run()
