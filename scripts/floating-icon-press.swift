// floating-icon-press.swift — press one Deltagos instance's floating icon
// through accessibility (the icon's AXPress, a single click), found by pid so
// another Review app on the machine is never touched. Only the icon's button
// is pressed: a window smaller than 300 pt whose button is named Deltagos.
// Exit 0 pressed, 3 no visible icon, 5 no accessibility permission.
//
//   swift scripts/floating-icon-press.swift <pid>
import AppKit
import ApplicationServices

guard CommandLine.arguments.count == 2, let pid = Int32(CommandLine.arguments[1]) else {
    FileHandle.standardError.write("usage: floating-icon-press.swift <pid>\n".data(using: .utf8)!); exit(2)
}
guard AXIsProcessTrusted() else { print("no accessibility permission"); exit(5) }
func attr(_ e: AXUIElement, _ a: String) -> AnyObject? {
    var v: AnyObject?
    return AXUIElementCopyAttributeValue(e, a as CFString, &v) == .success ? v : nil
}
let app = AXUIElementCreateApplication(pid)
for w in (attr(app, kAXWindowsAttribute) as? [AXUIElement]) ?? [] {
    var size = CGSize.zero
    if let s = attr(w, kAXSizeAttribute) { AXValueGetValue(s as! AXValue, .cgSize, &size) }
    guard size.width > 0, size.width < 300 else { continue }
    for c in (attr(w, kAXChildrenAttribute) as? [AXUIElement]) ?? [] {
        let role = attr(c, kAXRoleAttribute) as? String
        let name = (attr(c, kAXDescriptionAttribute) as? String) ?? (attr(c, kAXTitleAttribute) as? String) ?? ""
        if role == kAXButtonRole, name.hasPrefix("Deltagos") {
            let r = AXUIElementPerformAction(c, kAXPressAction as CFString)
            print("pressed \(name) in a \(Int(size.width)) pt window: \(r.rawValue)")
            exit(r == .success ? 0 : 1)
        }
    }
}
print("no visible icon for pid \(pid)")
exit(3)
