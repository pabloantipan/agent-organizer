// activate-pid.swift — activate one app by pid, as the lead's Cmd-Tab would
// (float-focus-steal S1): picks one of several apps sharing a name.
//
//   swift scripts/activate-pid.swift <pid>
import AppKit
guard CommandLine.arguments.count == 2, let pid = Int32(CommandLine.arguments[1]),
      let a = NSRunningApplication(processIdentifier: pid) else { print("usage: activate-pid.swift <pid>"); exit(2) }
print(a.activate(options: []) ? "activated \(a.localizedName ?? "?") pid \(pid)" : "refused")
