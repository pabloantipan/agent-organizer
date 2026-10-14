// tabharness: Tab rows of leftovers-22 in WKWebView, offscreen, no system input.
//
//   swiftc -O tabharness.swift -o tabharness   (run-rows.sh builds it into $TMPDIR)
//   ./tabharness --links on|off [--url http://localhost:34115] [--size 1440x900] steps.txt
//
// Activation policy prohibited (no Dock icon, never frontmost). The window
// is never ordered in: it lives at -20000,-20000, holds one WKWebView whose
// preferences.tabFocusesLinks is the --links flag, and receives key events
// only through [window sendEvent:]. Nothing is posted to the system.
//
// steps.txt, one per line ('#' comments):
//   key tab|shift-tab|return|up|down|left|right
//                                       post keyDown+keyUp to the window
//   eval <js>                           run JS, print its result
//   wait <ms>
//   until <js>                          poll until the JS is true (30 s)
//   report <label>                      print document.activeElement as JSON
//   reset                               focus moves to body, so the next Tab
//                                       starts at the top, as on a fresh screen
//   tabs <n> <label>                    n times: key tab, report <label>#i
//   snapshot <path.png>                 write the WKWebView's own rendering at
//                                       2x (takeSnapshot), never the screen
//
// The window is hidden, and WebKit throttles a hidden view's
// requestAnimationFrame, so an animated scroll (Down in a focused region)
// never moved. The preferences set inactiveSchedulingPolicy = .none
// (leftovers-26 Amendment 3, leftovers-27 FR-11): the page keeps running
// at full rate while the window stays offscreen and never shown.
import AppKit
import WebKit

let args = CommandLine.arguments
func opt(_ name: String, _ def: String) -> String {
  if let i = args.firstIndex(of: name), i + 1 < args.count { return args[i + 1] }
  return def
}
let links = opt("--links", "on") == "on"
let url = URL(string: opt("--url", "http://localhost:34115"))!
let size = opt("--size", "1440x900").split(separator: "x").map { CGFloat(Double($0)!) }
let stepsPath = args.last!

let app = NSApplication.shared
app.setActivationPolicy(.prohibited)

let reportJS = """
(() => {
  const a = document.activeElement;
  if (!a || a === document.body) return JSON.stringify({ tag: a ? a.tagName : null });
  const cs = getComputedStyle(a);
  let fv; try { fv = a.matches(':focus-visible'); } catch (e) { fv = 'unsupported'; }
  const name = (a.getAttribute('aria-label') || a.innerText || a.value || a.getAttribute('title') || '').trim().replace(/\\s+/g, ' ').slice(0, 70);
  const r = a.getBoundingClientRect();
  const card = a.closest('.ic');
  const region = a.closest('.skip-link') ? 'skip' : a.closest('.topbar') ? 'topbar' : a.closest('.rail') ? 'rail' : a.closest('main') ? 'main' : a.closest('[role=dialog], .drawer, .role-drawer, aside') ? 'panel' : 'other';
  return JSON.stringify({
    tag: a.tagName, role: a.getAttribute('role'), name, href: a.getAttribute('href'), region,
    focusVisible: fv, outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, outlineOffset: cs.outlineOffset,
    rect: [r.x, r.y, r.width, r.height].map(Math.round),
    onScreen: r.width > 1 && r.height > 1 && r.x >= 0 && r.y >= 0 && r.right <= innerWidth && r.bottom <= innerHeight,
    card: card ? { id: card.getAttribute('data-card'), raised: card.classList.contains('raised'), background: getComputedStyle(card).backgroundColor } : undefined,
  });
})()
"""

// WebKit matches :focus and :focus-visible only in a window it believes is
// key. This window says it is, to its own WKWebView only (the way
// WebKitTestRunner's window does): nothing changes for the system, the
// window is never ordered in and the app never activates.
final class OffscreenKeyWindow: NSWindow {
  override var isKeyWindow: Bool { true }
  override var canBecomeKey: Bool { true }
}

final class Runner: NSObject, WKNavigationDelegate {
  let window: NSWindow
  let web: WKWebView
  var steps: [String]
  init(steps: [String]) {
    self.steps = steps
    let cfg = WKWebViewConfiguration()
    cfg.preferences.tabFocusesLinks = links
    if #available(macOS 14.0, *) { cfg.preferences.inactiveSchedulingPolicy = .none }
    // A fresh store per run: the app keeps the screen and the rail's state
    // in localStorage, and one run must not start where the last one ended.
    cfg.websiteDataStore = .nonPersistent()
    let frame = NSRect(x: -20000, y: -20000, width: size[0], height: size[1])
    window = OffscreenKeyWindow(contentRect: frame, styleMask: [.titled, .resizable], backing: .buffered, defer: false)
    web = WKWebView(frame: NSRect(origin: .zero, size: frame.size), configuration: cfg)
    super.init()
    window.contentView = web
    window.makeFirstResponder(web)
    web.navigationDelegate = self
    NotificationCenter.default.post(name: NSWindow.didBecomeKeyNotification, object: window)
    var policy = "default"
    if #available(macOS 14.0, *) { policy = cfg.preferences.inactiveSchedulingPolicy == .none ? "none" : "other" }
    print("{\"harness\":\"start\",\"tabFocusesLinks\":\(links),\"inactiveSchedulingPolicy\":\"\(policy)\",\"url\":\"\(url)\",\"size\":\"\(Int(size[0]))x\(Int(size[1]))\",\"isKey\":\(window.isKeyWindow),\"visible\":\(window.isVisible)}")
    web.load(URLRequest(url: url))
  }

  func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
    waitReady(tries: 100)
  }

  func waitReady(tries: Int) {
    web.evaluateJavaScript("!!document.querySelector('.shell main')") { v, _ in
      if (v as? Bool) == true || tries == 0 {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { self.next() }
      } else {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { self.waitReady(tries: tries - 1) }
      }
    }
  }

  func key(_ name: String) {
    var chars = "", code: UInt16 = 0, flags: NSEvent.ModifierFlags = []
    switch name {
    case "tab": chars = "\t"; code = 48
    case "shift-tab": chars = "\u{19}"; code = 48; flags = [.shift]
    case "return": chars = "\r"; code = 36
    case "up": chars = String(UnicodeScalar(NSUpArrowFunctionKey)!); code = 126; flags = [.numericPad, .function]
    case "down": chars = String(UnicodeScalar(NSDownArrowFunctionKey)!); code = 125; flags = [.numericPad, .function]
    case "left": chars = String(UnicodeScalar(NSLeftArrowFunctionKey)!); code = 123; flags = [.numericPad, .function]
    case "right": chars = String(UnicodeScalar(NSRightArrowFunctionKey)!); code = 124; flags = [.numericPad, .function]
    default: fatalError("unknown key \(name)")
    }
    let ign = name == "shift-tab" ? "\t" : chars
    for type in [NSEvent.EventType.keyDown, .keyUp] {
      let ev = NSEvent.keyEvent(with: type, location: .zero, modifierFlags: flags, timestamp: ProcessInfo.processInfo.systemUptime,
                                windowNumber: window.windowNumber, context: nil, characters: chars,
                                charactersIgnoringModifiers: ign, isARepeat: false, keyCode: code)!
      window.sendEvent(ev)
    }
  }

  func report(_ label: String, then: @escaping () -> Void) {
    web.evaluateJavaScript(reportJS) { v, err in
      let body = (v as? String) ?? "{\"error\":\"\(err?.localizedDescription ?? "nil")\"}"
      print("{\"step\":\"\(label)\",\"active\":\(body)}")
      then()
    }
  }

  func next() {
    guard !steps.isEmpty else { fflush(stdout); exit(0) }
    let line = steps.removeFirst().trimmingCharacters(in: .whitespaces)
    if line.isEmpty || line.hasPrefix("#") { return next() }
    let parts = line.split(separator: " ", maxSplits: 1).map(String.init)
    let rest = parts.count > 1 ? parts[1] : ""
    let later = { (s: Double) in DispatchQueue.main.asyncAfter(deadline: .now() + s) { self.next() } }
    switch parts[0] {
    case "key": key(rest); later(0.15)
    case "wait": later((Double(rest) ?? 0) / 1000)
    case "report": report(rest) { self.next() }
    case "reset":
      web.evaluateJavaScript("document.activeElement && document.activeElement.blur(); window.getSelection().removeAllRanges(); document.body.tabIndex = -1; document.body.focus(); document.body.removeAttribute('tabindex'); 'ok'") { _, _ in later(0.1) }
    case "until":
      // until <js>: poll every 200 ms, up to 30 s, until the JS is true
      var tries = 150
      func poll() {
        web.evaluateJavaScript("!!(\(rest))") { v, _ in
          tries -= 1
          if (v as? Bool) == true { later(0.3) }
          else if tries == 0 { print("{\"until\":\"timeout\",\"js\":\"\(rest.replacingOccurrences(of: "\"", with: "'"))\"}"); later(0) }
          else { DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) { poll() } }
        }
      }
      poll()
    case "focusinfo":
      web.evaluateJavaScript("JSON.stringify({hasFocus: document.hasFocus(), visibility: document.visibilityState})") { v, _ in
        print("{\"focusinfo\":\(v as? String ?? "null")}"); later(0.05)
      }
    case "eval":
      web.evaluateJavaScript(rest) { v, err in
        let out = v.map { "\($0)" } ?? (err?.localizedDescription ?? "undefined")
        let esc = out.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "\"", with: "\\\"").replacingOccurrences(of: "\n", with: " ")
        print("{\"eval\":\"\(esc)\"}")
        later(0.4)
      }
    case "snapshot":
      // twice the view's width, so a 2 px ring and the gap beside it are legible
      let snap = WKSnapshotConfiguration()
      snap.snapshotWidth = NSNumber(value: Double(size[0] * 2))
      web.takeSnapshot(with: snap) { img, err in
        guard let img = img, let tiff = img.tiffRepresentation, let rep = NSBitmapImageRep(data: tiff),
              let png = rep.representation(using: .png, properties: [:]) else {
          print("{\"snapshot\":\"failed\",\"error\":\"\(err?.localizedDescription ?? "nil")\"}"); later(0); return
        }
        do { try png.write(to: URL(fileURLWithPath: rest)); print("{\"snapshot\":\"\(rest)\"}") }
        catch { print("{\"snapshot\":\"failed\",\"error\":\"\(error.localizedDescription)\"}") }
        later(0.05)
      }
    case "tabs":
      let p = rest.split(separator: " ", maxSplits: 1).map(String.init)
      let n = Int(p[0])!, label = p.count > 1 ? p[1] : "tab"
      var expanded: [String] = []
      for i in 1...n { expanded += ["key tab", "report \(label)#\(i)"] }
      steps = expanded + steps; next()
    default: fatalError("unknown step \(line)")
    }
  }
}

let steps = try! String(contentsOfFile: stepsPath, encoding: .utf8).components(separatedBy: "\n")
let runner = Runner(steps: steps)
DispatchQueue.main.asyncAfter(deadline: .now() + 120) { print("{\"harness\":\"timeout\"}"); exit(3) }
app.run()
