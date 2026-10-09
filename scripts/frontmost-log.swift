// frontmost-log.swift — the frontmost-app log (float-focus-steal S1, S2): one
// line per app activation, epoch seconds and local time, the app's name and
// pid, from NSWorkspaceDidActivateApplicationNotification; also each desktop
// change (polled), so a log shows which activation moved the desktop. Runs until
// killed; output goes to stdout, unbuffered.
//
//   swift scripts/frontmost-log.swift >> frontmost.log &
import AppKit

setvbuf(stdout, nil, _IOLBF, 0)
_ = NSApplication.shared // the desktop-change notification needs an app connection
// The desktop's number, 1-based among its display's desktops, as Mission
// Control orders them: private CGS calls, in this check script only (the app
// itself uses public API alone).
typealias MainConn = @convention(c) () -> Int32
typealias ActiveSpace = @convention(c) (Int32) -> UInt64
typealias DisplaySpaces = @convention(c) (Int32) -> Unmanaged<CFArray>
let cg = dlopen("/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics", RTLD_NOW)
let mainConn = unsafeBitCast(dlsym(cg, "CGSMainConnectionID"), to: MainConn.self)
let activeSpace = unsafeBitCast(dlsym(cg, "CGSGetActiveSpace"), to: ActiveSpace.self)
let displaySpaces = unsafeBitCast(dlsym(cg, "CGSCopyManagedDisplaySpaces"), to: DisplaySpaces.self)
func desktop() -> String {
    let c = mainConn(), id = activeSpace(c)
    for d in displaySpaces(c).takeRetainedValue() as? [[String: Any]] ?? [] {
        let spaces = (d["Spaces"] as? [[String: Any]] ?? []).compactMap { $0["ManagedSpaceID"] as? UInt64 ?? ($0["id64"] as? UInt64) }
        if let i = spaces.firstIndex(of: id) { return "desktop \(i + 1) of \(spaces.count)" }
    }
    return "desktop ? (space \(id))"
}
let fmt = DateFormatter()
fmt.dateFormat = "HH:mm:ss.SSS"
func line(_ s: String) {
    let d = Date()
    print(String(format: "%.3f", d.timeIntervalSince1970), fmt.string(from: d), "[\(desktop())]", s)
}
let wc = NSWorkspace.shared.notificationCenter
wc.addObserver(forName: NSWorkspace.didActivateApplicationNotification, object: nil, queue: .main) { n in
    let a = n.userInfo?[NSWorkspace.applicationUserInfoKey] as? NSRunningApplication
    line("activated \(a?.localizedName ?? "?") pid \(a?.processIdentifier ?? 0) (\(a?.bundleIdentifier ?? "?"))")
}
// Desktop changes by polling every 0.25 s: the notification coalesces quick
// moves and is not delivered to a plain script reliably.
var lastDesktop = desktop()
Timer.scheduledTimer(withTimeInterval: 0.25, repeats: true) { _ in
    let d = desktop()
    if d != lastDesktop {
        lastDesktop = d
        line("desktop changed; frontmost \(NSWorkspace.shared.frontmostApplication?.localizedName ?? "?")")
    }
}
line("start; frontmost \(NSWorkspace.shared.frontmostApplication?.localizedName ?? "?")")
RunLoop.main.run()
