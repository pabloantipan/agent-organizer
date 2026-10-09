//go:build darwin

// The floating icon (docs/ux/specs/floating-icon.md, 0090): a non-activating
// NSPanel beside the Wails window, shown on every desktop where the window is
// not, never on a full-screen app's desktop and never key. A click brings the
// Wails window to this desktop as the initiative list (the frontend's
// FloatList, told by the Wails event floaticon:list); a pick makes it full
// here, Escape, a click outside or the icon sends it home. Public API only.
//
// Two Wails v2 internals are leaned on (T5): the window is found by its class
// name, WailsWindow, in [NSApp windows], and its minimum size lives twice, in
// -[NSWindow minSize] and WailsWindow's userMinSize, which Wails re-applies
// after full screen and on any runtime size call. FloatIconStart checks both
// and leaves the icon off, with a log line, when either is missing.

#import <Cocoa/Cocoa.h>
#import <QuartzCore/QuartzCore.h>
#include <stdlib.h>
#include <string.h>
#include <signal.h>
#include <errno.h>
#include "floaticon_darwin.h"

extern void floatIconClicked(char *origin);
extern void floatIconClosed(void);
extern void floatIconExpanded(void);
extern void floatIconUnavailable(char *reason);

// The icon's size is per display (Amendment 1, F12): 56 pt, 72 or 88 by the
// display's visible width. Everything drawn scales by size / 56: the radius,
// the mark, the shadows and the panel's shadow margin. The inset, the first
// place, the drag threshold and the list stay in points.
static const CGFloat kBase = 56;      // the size the layers are drawn for
static const CGFloat kBasePad = 40;   // room for the dragging shadow at 56, 0 16px 40px
static const CGFloat kInset = 8;      // the tile stays this far inside the visible frame
static const CGFloat kFirst = 24;     // first place: bottom right, this far in
static const CGFloat kDragAt = 4;     // a press that moves more is a drag
static CGFloat tileSz = kBase;        // the tile's side now, in points
static CGFloat padSz = kBasePad;      // the panel's shadow margin now
static const CGFloat kListW = 360;
static const CGFloat kListMaxH = 480;
// Not a floor (Amendment 3: the list ends 8 px under its last row): only a
// guard below the shortest content, the field and one line.
static const CGFloat kListMinH = 64;
static const CGFloat kGap = 8;        // between the icon and the list

typedef enum { StateHome, StateListing, StateCompacted, StateReturning } FloatState;
static const char *stateName[] = {"home", "listing", "compacted", "returning"};

static NSPanel *panel;
static CALayer *group;                // the tile and its shadows; scaled as one
static CALayer *shadowNear, *shadowFar;
static CALayer *tileLayer;           // the rounded square the mark sits on
static CALayer *markLayer;           // the mark, in the drawing's 100-unit space (y down)
static CAShapeLayer *dLayer;         // the D, its gaps a dash pattern
static CAShapeLayer *bigGear, *smallGear;
static CAShapeLayer *ring;            // the memory ring outside the tile (ram-indicator §2)
static NSString *memLevel = @"normal"; // the memory reading's level, for the ring and the name
static NSView *iconViewForRing(void);
static NSWindow *mainWin;
static NSWindow *marker;              // 1x1 window left on the home desktop
static FloatState state = StateHome;
static BOOL listFromCompact;          // the list came from Compact: picking nothing compacts again
static BOOL listAbove;                // the list opened above the icon: its bottom edge is fixed
static NSRect homeFrame;
static NSSize appMinSize;             // Wails' minimum as configured, put back on full
static CGFloat listHeight = kListMaxH;
static NSWindowStyleMask homeStyle;
static NSColor *homeBackground;
static NSWindowAnimationBehavior homeAnimation;
static BOOL started;
static FILE *logFile;
static char *logPath;                 // the float log's path, kept for the check hook
static dispatch_source_t usr1, usr2; // the check hooks, only with FLOAT_LOG
static NSString *placePath;
static NSMutableDictionary *places;   // display key -> {x, y} of the tile from the visible frame's origin

static double now(void) { return [[NSDate date] timeIntervalSince1970]; }

// The float log (N2): only with FLOAT_LOG set to a path.
static void flog(NSString *fmt, ...) {
    if (!logFile) return;
    va_list ap;
    va_start(ap, fmt);
    NSString *s = [[NSString alloc] initWithFormat:fmt arguments:ap];
    va_end(ap);
    fprintf(logFile, "%.3f %s\n", now(), [s UTF8String]);
    fflush(logFile);
}

static void after(double s, dispatch_block_t b) {
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(s * NSEC_PER_SEC)), dispatch_get_main_queue(), b);
}

static NSColor *hex(unsigned v) {
    return [NSColor colorWithSRGBRed:((v >> 16) & 0xff) / 255.0 green:((v >> 8) & 0xff) / 255.0 blue:(v & 0xff) / 255.0 alpha:1];
}

// FLOAT_REDUCE_MOTION=1 or 0 forces the setting for a check; otherwise the
// system's Reduce motion decides.
static BOOL reduceMotion(void) {
    const char *f = getenv("FLOAT_REDUCE_MOTION");
    if (f && *f) return strcmp(f, "1") == 0;
    return [[NSWorkspace sharedWorkspace] accessibilityDisplayShouldReduceMotion];
}

static NSWindow *findMain(void) {
    for (NSWindow *w in [NSApp windows]) {
        if ([NSStringFromClass([w class]) isEqualToString:@"WailsWindow"]) return w;
    }
    return nil;
}

static void setMin(NSSize s) {
    [mainWin setValue:[NSValue valueWithSize:s] forKey:@"userMinSize"];
    [mainWin setMinSize:s];
}

// ---------- place: per display, shared by every desktop ----------

static NSString *screenKey(NSScreen *s) {
    CGDirectDisplayID d = [[s deviceDescription][@"NSScreenNumber"] unsignedIntValue];
    return [NSString stringWithFormat:@"%u-%u-%u", CGDisplayVendorNumber(d), CGDisplayModelNumber(d), CGDisplaySerialNumber(d)];
}

// A check's stand-in for every display's visible width, only with FLOAT_LOG
// set: FLOAT_SIZE_WIDTH at start, then the number in <FLOAT_LOG>.width when
// SIGUSR1 arrives (0 is the real width). One display can then show each size
// and the screen-change path. 0 means none.
static CGFloat widthStandIn;

// The size for a display, by its visible width (F12): up to 1920 is 56,
// to 2999 is 72, from 3000 is 88.
static CGFloat sizeFor(NSScreen *s) {
    CGFloat w = widthStandIn > 0 ? widthStandIn : NSWidth([s visibleFrame]);
    return w >= 3000 ? 88 : w > 1920 ? 72 : 56;
}

static NSRect tileOf(NSRect win) { return NSMakeRect(NSMinX(win) + padSz, NSMinY(win) + padSz, tileSz, tileSz); }

static NSScreen *screenAt(NSPoint p) {
    for (NSScreen *s in [NSScreen screens]) {
        if (NSPointInRect(p, [s frame])) return s;
    }
    return [NSScreen mainScreen];
}

static NSRect clampTile(NSRect t, NSScreen *s) {
    NSRect v = NSInsetRect([s visibleFrame], kInset, kInset);
    t.origin.x = MAX(NSMinX(v), MIN(NSMinX(t), NSMaxX(v) - tileSz));
    t.origin.y = MAX(NSMinY(v), MIN(NSMinY(t), NSMaxY(v) - tileSz));
    return t;
}

static void sizeIcon(CGFloat size, NSString *why);

static void savePlaces(void) {
    if (placePath) [places writeToFile:placePath atomically:YES];
}

// Where the icon stands: the last display it was dropped on, if connected,
// else the main display; its remembered place there, else the first place.
static void placeIcon(void) {
    NSScreen *scr = [NSScreen mainScreen];
    NSString *last = places[@"last"];
    for (NSScreen *s in [NSScreen screens]) {
        if ([screenKey(s) isEqualToString:last]) scr = s;
    }
    sizeIcon(sizeFor(scr), @"place");
    NSRect vis = [scr visibleFrame];
    NSDictionary *p = places[screenKey(scr)];
    NSRect t = p ? NSMakeRect(NSMinX(vis) + [p[@"x"] doubleValue], NSMinY(vis) + [p[@"y"] doubleValue], tileSz, tileSz)
                 : NSMakeRect(NSMaxX(vis) - kFirst - tileSz, NSMinY(vis) + kFirst, tileSz, tileSz);
    t = clampTile(t, scr);
    [panel setFrameOrigin:NSMakePoint(NSMinX(t) - padSz, NSMinY(t) - padSz)];
    flog(@"place: tile %@, icon %.0f pt radius %.0f (panel frame read back %@), inside %@ of display %@ (visible width %.0f)",
         NSStringFromRect(tileOf([panel frame])), NSWidth([panel frame]) - 2 * padSz, tileLayer.cornerRadius, NSStringFromRect([panel frame]),
         NSStringFromRect(NSInsetRect(vis, kInset, kInset)), screenKey(scr), NSWidth(vis));
}

static void reanchorList(NSRect tile);

// After a drop: kept inside the display under the tile's centre, remembered there.
static void dropAt(void) {
    NSRect t = tileOf([panel frame]);
    NSScreen *s = screenAt(NSMakePoint(NSMidX(t), NSMidY(t)));
    // Dropped on a display of another size: the icon takes that size at
    // once, about the same centre, then springs inside the display.
    if (sizeFor(s) != tileSz) {
        sizeIcon(sizeFor(s), @"drop");
        t = tileOf([panel frame]);
    }
    t = clampTile(t, s);
    NSRect vis = [s visibleFrame];
    places[screenKey(s)] = @{@"x" : @(NSMinX(t) - NSMinX(vis)), @"y" : @(NSMinY(t) - NSMinY(vis))};
    places[@"last"] = screenKey(s);
    savePlaces();
    // The window animator animates frame, not frameOrigin: an animated
    // setFrameOrigin: is dropped, which left the icon where the pointer let
    // go, under the Dock (Pablo's take 3). Animate the frame, then make sure.
    NSRect target = NSMakeRect(NSMinX(t) - padSz, NSMinY(t) - padSz, NSWidth([panel frame]), NSHeight([panel frame]));
    void (^landed)(void) = ^{
        if (!NSEqualRects([panel frame], target)) [panel setFrame:target display:YES];
        flog(@"drop: tile landed at %@, inside %@ with the 8 px inset, on %@", NSStringFromRect(tileOf([panel frame])),
             NSStringFromRect(NSInsetRect(vis, kInset, kInset)), screenKey(s));
    };
    if (reduceMotion()) {
        [panel setFrame:target display:YES];
        landed();
    } else {
        [NSAnimationContext runAnimationGroup:^(NSAnimationContext *c) {
            c.duration = 0.16;
            [[panel animator] setFrame:target display:YES];
        } completionHandler:landed];
    }
    reanchorList(t);
}

// Inside the visible frame with the inset wherever the icon stands now: a
// desktop switch, a display change or the Dock shown, hidden, resized or
// moved to another side can leave a good place outside it.
static void clampIcon(NSString *why) {
    NSRect t = tileOf([panel frame]);
    NSScreen *s = screenAt(NSMakePoint(NSMidX(t), NSMidY(t)));
    NSRect c = clampTile(t, s);
    if (NSEqualRects(c, t)) return;
    [panel setFrameOrigin:NSMakePoint(NSMinX(c) - padSz, NSMinY(c) - padSz)];
    flog(@"clamp (%@): tile %@ -> %@, inside %@", why, NSStringFromRect(t), NSStringFromRect(tileOf([panel frame])),
         NSStringFromRect(NSInsetRect([s visibleFrame], kInset, kInset)));
}

// ---------- the look: §2's table ----------

typedef enum { LookResting, LookHover, LookPressed, LookDragging } Look;

static Look look = LookResting;      // the look now, re-applied at a new size

// §2's offsets and blur are for 56; they scale with the icon (F12).
static void setShadow(CALayer *l, CGFloat y, CGFloat blur, CGFloat a) {
    CGFloat k = tileSz / kBase;
    l.shadowOpacity = a;
    l.shadowRadius = blur * k / 2;
    l.shadowOffset = CGSizeMake(0, -y * k); // layer y is up
}

static void setLook(Look k, double dur) {
    look = k;
    BOOL still = reduceMotion();
    CGFloat scale = 1.0;
    [CATransaction begin];
    [CATransaction setAnimationDuration:dur];
    [CATransaction setAnimationTimingFunction:[CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseOut]];
    switch (k) {
    case LookResting:
    case LookPressed:
        setShadow(shadowNear, 1, 3, 0.35);
        setShadow(shadowFar, 8, 24, 0.40);
        scale = k == LookPressed ? 0.96 : 1.0;
        break;
    case LookHover:
        setShadow(shadowNear, 2, 4, 0.35);
        setShadow(shadowFar, 12, 32, 0.45);
        scale = 1.06;
        break;
    case LookDragging:
        setShadow(shadowNear, 0, 0, 0);
        setShadow(shadowFar, 16, 40, 0.50);
        scale = 1.08;
        break;
    }
    group.transform = CATransform3DMakeScale(still ? 1 : scale, still ? 1 : scale, 1);
    [CATransaction commit];
}

// ---------- the mark (floating-icon Amendment 4, 0102) ----------

// Geometry and constants from docs/ux/inputs/deltagos-mark/deltagos-mark-handoff.md,
// unchanged: the gears mesh only with these numbers. The icon keeps the gears
// turning and the gaps travelling at a constant speed; the points, the notches
// and the varying speed are the Help's (about 2 px at 56 pt).
static const CGFloat kMarkSpeed = 24;       // SPEED, units/s
static const CGFloat kMarkShare = 0.74;     // the mark's width on the tile
static const CGFloat kMarkStroke = 9;       // HALF 4.5 each side
typedef struct { CGFloat cx, cy, teeth, rOut, rIn, hole, phase; } Gear;
static const Gear kGear = {66.8, 64.8, 10, 25.5, 20.83, 7.65, 27};
#define kD45 (36.4 / M_SQRT2)
static const Gear kGear2 = {66.8 - kD45, 64.8 - kD45, 5, 13.9, 9.25, 3.5, 27};
// The still frame's dash (travel 0, every gap at its longest, GAP 5.25 at
// SPACING 13), as the exported app icon draws it; the D is 177.05 long.
static const CGFloat kMarkDash[6] = {7.75, 5.25, 7.75, 5.25, 145.80, 5.25};
static const CGFloat kMarkLength = 177.05;

// M27 30 Q27 24 33 24 L48 24 C68 24 77 37 77 50 C77 63 68 76 48 76 L33 76 Q27 76 27 70 Z
static CGPathRef markD(void) {
    CGMutablePathRef p = CGPathCreateMutable();
    CGPathMoveToPoint(p, NULL, 27, 30);
    CGPathAddQuadCurveToPoint(p, NULL, 27, 24, 33, 24);
    CGPathAddLineToPoint(p, NULL, 48, 24);
    CGPathAddCurveToPoint(p, NULL, 68, 24, 77, 37, 77, 50);
    CGPathAddCurveToPoint(p, NULL, 77, 63, 68, 76, 48, 76);
    CGPathAddLineToPoint(p, NULL, 33, 76);
    CGPathAddQuadCurveToPoint(p, NULL, 27, 76, 27, 70);
    CGPathCloseSubpath(p);
    return p;
}

// gearPath of the drawing: root half-width 0.33 of a step, tip 0.2, a hole
// filled even-odd.
static CGPathRef gearPath(Gear g) {
    CGMutablePathRef p = CGPathCreateMutable();
    int n = (int)g.teeth;
    CGFloat step = 2 * M_PI / n, ht = step * 0.33, tt = step * 0.2, ph = g.phase * M_PI / 180;
    for (int k = 0; k < n; k++) {
        CGFloat a = k * step - M_PI / 2 + ph;
        CGPoint q[4] = {{g.cx + g.rIn * cos(a - ht), g.cy + g.rIn * sin(a - ht)}, {g.cx + g.rOut * cos(a - tt), g.cy + g.rOut * sin(a - tt)},
                        {g.cx + g.rOut * cos(a + tt), g.cy + g.rOut * sin(a + tt)}, {g.cx + g.rIn * cos(a + ht), g.cy + g.rIn * sin(a + ht)}};
        if (k == 0) CGPathMoveToPoint(p, NULL, q[0].x, q[0].y);
        else CGPathAddLineToPoint(p, NULL, q[0].x, q[0].y);
        for (int j = 1; j < 4; j++) CGPathAddLineToPoint(p, NULL, q[j].x, q[j].y);
    }
    CGPathCloseSubpath(p);
    CGPathAddEllipseInRect(p, NULL, CGRectMake(g.cx - g.hole, g.cy - g.hole, 2 * g.hole, 2 * g.hole));
    return p;
}

static CAShapeLayer *gearLayer(Gear g, unsigned color) {
    CAShapeLayer *l = [CAShapeLayer layer];
    CGPathRef p = gearPath(g);
    l.path = p;
    CGPathRelease(p);
    l.fillRule = kCAFillRuleEvenOdd;
    l.fillColor = [hex(color) CGColor];
    l.bounds = CGRectMake(0, 0, 100, 100);
    l.anchorPoint = CGPointMake(g.cx / 100, g.cy / 100); // turns about its centre
    l.position = CGPointMake(g.cx, g.cy);
    return l;
}

// The mark's layers, in the drawing's units: the gears behind, clipped to the
// D's silhouette (the path filled and stroked 9), then the D stroked 9 with a
// butt cap and round joins. markLayer flips y, so the drawing's coordinates
// and its rotation signs (positive turns clockwise) hold as written.
static void buildMark(void) {
    markLayer = [CALayer layer];
    markLayer.bounds = CGRectMake(20, 17, 64, 66); // the drawing's viewBox
    CGPathRef d = markD();
    CALayer *gears = [CALayer layer];
    gears.frame = CGRectMake(0, 0, 100, 100);
    CAShapeLayer *inside = [CAShapeLayer layer];
    inside.frame = CGRectMake(0, 0, 100, 100);
    inside.path = d;
    inside.fillColor = inside.strokeColor = CGColorGetConstantColor(kCGColorWhite);
    inside.lineWidth = kMarkStroke;
    inside.lineJoin = kCALineJoinRound;
    gears.mask = inside;
    bigGear = gearLayer(kGear, 0xd946ef);    // --magenta-9 (0102 A)
    smallGear = gearLayer(kGear2, 0xa9a0ff); // --periwinkle-9
    [gears addSublayer:bigGear];
    [gears addSublayer:smallGear];
    [markLayer addSublayer:gears];
    dLayer = [CAShapeLayer layer];
    dLayer.frame = CGRectMake(0, 0, 100, 100);
    dLayer.path = d;
    dLayer.fillColor = nil;
    dLayer.strokeColor = [hex(0x8a3ffc) CGColor]; // --accent
    dLayer.lineWidth = kMarkStroke;
    dLayer.lineJoin = kCALineJoinRound;
    dLayer.lineCap = kCALineCapButt;
    NSMutableArray *dash = [NSMutableArray array];
    for (int i = 0; i < 6; i++) [dash addObject:@(kMarkDash[i])];
    dLayer.lineDashPattern = dash;
    dLayer.lineDashPhase = 0; // travel 0, the still frame
    [markLayer addSublayer:dLayer];
    CGPathRelease(d);
    [tileLayer addSublayer:markLayer];
}

// The mark on the tile: 74% of its width, centred (the drawing's tile).
static void layoutMark(void) {
    CGFloat s = tileSz * kMarkShare / 64;
    markLayer.position = CGPointMake(tileSz / 2, tileSz / 2);
    markLayer.transform = CATransform3DMakeScale(s, -s, 1);
}

static CABasicAnimation *forever(NSString *key, CGFloat to, CFTimeInterval dur) {
    CABasicAnimation *a = [CABasicAnimation animationWithKeyPath:key];
    a.fromValue = @0;
    a.toValue = @(to);
    a.duration = dur;
    a.repeatCount = HUGE_VALF;
    a.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionLinear];
    return a;
}

// The mark's motion, decorative (0088), in place of the bars' breathing: the
// gaps travel round the D at SPEED (the dash phase goes back one D length per
// lap, as the drawing's dashoffset = -travel), the big gear turns at
// SPEED / rOut, clockwise, the small one twice as fast the other way
// (teeth 10 to 5). Under Reduce motion, the still frame: travel 0.
static void breathe(void) {
    BOOL still = reduceMotion();
    for (CALayer *l in @[ dLayer, bigGear, smallGear ]) [l removeAnimationForKey:@"breathe"];
    if (!still) {
        CFTimeInterval turn = 2 * M_PI * kGear.rOut / kMarkSpeed; // 6.68 s
        [dLayer addAnimation:forever(@"lineDashPhase", -kMarkLength, kMarkLength / kMarkSpeed) forKey:@"breathe"];
        [bigGear addAnimation:forever(@"transform.rotation.z", 2 * M_PI, turn) forKey:@"breathe"];
        [smallGear addAnimation:forever(@"transform.rotation.z", -2 * M_PI, turn * kGear2.teeth / kGear.teeth) forKey:@"breathe"];
    }
    flog(@"breathe: %@", still ? @"still (reduce motion): the mark's still frame, travel 0, gears at rest"
                               : [NSString stringWithFormat:@"on: the mark's gaps travel %.0f units/s (a lap %.2f s), big gear a turn in %.2f s clockwise, small in %.2f s the other way",
                                                            kMarkSpeed, kMarkLength / kMarkSpeed, 2 * M_PI * kGear.rOut / kMarkSpeed, M_PI * kGear.rOut / kMarkSpeed]);
}

// ---------- memory: the ring (docs/ux/specs/ram-indicator.md §2, Amendment 2) ----------

// Outside the tile, so it never touches the mark or its animation, 2 pt from
// the tile's edge, at every level, since the ring is also how the lead finds
// the icon (0109): the tone at normal, with no reading and with a failed
// one; amber (--amber-9) at high; amber 3 pt at critical, breathing in
// opacity 1 to 0.5 over 1.6 s (0.8 each way), steady under Reduce motion.
// A 1 pt keyline in the ground (#1a1523) sits just outside the ring at every
// level and does not breathe: it holds the ring on a light wallpaper (amber
// on white is 1.8:1, the ground 17.9:1). Points, not scaled with the icon:
// the design gives the ring in px, as a mark of the edge, not of the tile's
// drawing.
static const CGFloat kRingGap = 2;
static const CGFloat kKeyline = 1;
static CAShapeLayer *keyline;          // the ground's 1 pt edge outside the ring

static CGPathRef ringPath(CGFloat out) {
    CGRect r = CGRectInset(CGRectMake(0, 0, tileSz, tileSz), -out, -out);
    return CGPathCreateWithRoundedRect(r, tileSz / 4 + out, tileSz / 4 + out, NULL);
}

static void layoutRing(void) {
    CGFloat w = [memLevel isEqualToString:@"critical"] ? 3 : 2;
    CGPathRef path = ringPath(kRingGap + w / 2);
    ring.frame = CGRectMake(0, 0, tileSz, tileSz);
    ring.path = path;
    ring.lineWidth = w;
    CGPathRelease(path);
    CGPathRef edge = ringPath(kRingGap + w + kKeyline / 2);
    keyline.frame = ring.frame;
    keyline.path = edge;
    keyline.lineWidth = kKeyline;
    CGPathRelease(edge);
}

static void applyRing(void) {
    if (!ring) return;
    BOOL high = [memLevel isEqualToString:@"high"], critical = [memLevel isEqualToString:@"critical"];
    BOOL still = reduceMotion();
    [CATransaction begin];
    [CATransaction setDisableActions:YES];
    layoutRing();
    ring.strokeColor = [hex(high || critical ? 0xffb020 : 0xd946ef) CGColor]; // --amber-9 for pressure, else --tone (Amendment 2)
    ring.hidden = NO;
    keyline.hidden = NO;
    ring.opacity = 1;
    [ring removeAnimationForKey:@"breathe"];
    if (critical && !still) {
        CABasicAnimation *a = [CABasicAnimation animationWithKeyPath:@"opacity"];
        a.fromValue = @1.0;
        a.toValue = @0.5;
        a.duration = 0.8;
        a.autoreverses = YES;
        a.repeatCount = HUGE_VALF;
        a.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut];
        [ring addAnimation:a forKey:@"breathe"];
    }
    [CATransaction commit];
    [iconViewForRing() setToolTip:[memLevel isEqualToString:@"normal"] ? @"Deltagos" : [NSString stringWithFormat:@"Deltagos, memory %@", memLevel]];
    NSAccessibilityPostNotification(iconViewForRing(), NSAccessibilityTitleChangedNotification);
    flog(@"memory ring: %@ (%@, keyline 1 pt #1a1523)", memLevel,
         high ? @"amber #ffb020 2 pt" : critical ? (still ? @"amber #ffb020 3 pt, steady (reduce motion)" : @"amber #ffb020 3 pt, breathing")
              : @"tone #d946ef 2 pt");
}

// ---------- desktops ----------

// The marker is how the home desktop is known: a window that is not on all
// desktops stays where it was ordered in, and isOnActiveSpace is public.
static void orderHere(NSWindow *w, NSString *why, dispatch_block_t then) {
    flog(@"activation: orderFrontRegardless %@ (%@) by %@, app active=%d", w == mainWin ? @"main window" : w == marker ? @"home marker" : @"window",
         why, NSStringFromRect([w frame]), [NSApp isActive]);
    NSWindowCollectionBehavior b = [w collectionBehavior];
    [w setCollectionBehavior:(b & ~NSWindowCollectionBehaviorCanJoinAllSpaces) | NSWindowCollectionBehaviorMoveToActiveSpace];
    [w orderFrontRegardless];
    after(0.15, ^{
        [w setCollectionBehavior:b];
        if (then) then();
    });
}

static void markHome(NSString *why) {
    if (!marker) {
        marker = [[NSWindow alloc] initWithContentRect:NSMakeRect(0, 0, 1, 1) styleMask:NSWindowStyleMaskBorderless backing:NSBackingStoreBuffered defer:NO];
        [marker setOpaque:NO];
        [marker setBackgroundColor:[NSColor clearColor]];
        [marker setIgnoresMouseEvents:YES];
        [marker setReleasedWhenClosed:NO];
        // Managed, not Transient: a transient window follows you to every desktop.
        [marker setCollectionBehavior:NSWindowCollectionBehaviorIgnoresCycle | NSWindowCollectionBehaviorManaged];
    }
    [marker orderOut:nil];
    orderHere(marker, [NSString stringWithFormat:@"markHome from %@", why], nil);
    flog(@"home marked");
}

// A full-screen desktop (T3, narrowed by Amendment 3): FullScreenNone does
// not keep a CanJoinAllSpaces panel off it, so the window list is read. A
// window that covers the whole display is not enough: a zoomed window does
// when the menu bar hides itself, and so does any borderless one, on a normal
// desktop where the icon belongs (F15). What only a full-screen Space has is
// the Dock's backdrop: a Dock window over the whole display above the
// wallpaper and below the desktop icons' level (it is also what a split view
// stands on, where no single window covers the display). Should a macOS drop
// the backdrop, a covering window on a desktop with no Finder desktop is
// taken as full screen, the old test kept honest. Read only at a
// desktop-change notification, after the slide: mid-slide the list holds
// both desktops' windows (the spike's misfire).
static BOOL fullScreenSpace(void) {
    NSScreen *scr = [panel screen] ?: [NSScreen mainScreen];
    NSRect f = [scr frame];
    CGFloat top = NSMaxY([[NSScreen screens][0] frame]);
    CGRect want = CGRectMake(NSMinX(f), top - NSMaxY(f), NSWidth(f), NSHeight(f)); // CG: y down from the first display's top
    NSArray *list = CFBridgingRelease(CGWindowListCopyWindowInfo(kCGWindowListOptionOnScreenOnly, kCGNullWindowID));
    int desktopLevel = CGWindowLevelForKey(kCGDesktopWindowLevelKey), iconsLevel = CGWindowLevelForKey(kCGDesktopIconWindowLevelKey);
    pid_t me = getpid(), cover = 0;
    BOOL backdrop = NO, desktop = NO;
    for (NSDictionary *w in list) {
        CGRect r;
        if (!CGRectMakeWithDictionaryRepresentation((CFDictionaryRef)w[(id)kCGWindowBounds], &r)) continue;
        BOOL whole = fabs(r.origin.x - want.origin.x) < 1 && fabs(r.origin.y - want.origin.y) < 1 &&
                     r.size.width >= want.size.width - 1 && r.size.height >= want.size.height - 1;
        if (!whole) continue;
        int layer = [w[(id)kCGWindowLayer] intValue];
        pid_t pid = [w[(id)kCGWindowOwnerPID] intValue];
        if (layer == 0 && pid != me && !cover) cover = pid;
        else if (layer == iconsLevel) desktop = YES;
        else if (layer > desktopLevel && layer < iconsLevel && [w[(id)kCGWindowOwnerName] isEqualToString:@"Dock"]) backdrop = YES;
    }
    BOOL fs = backdrop || (cover && !desktop);
    if (cover || backdrop) flog(@"full-screen test: window over the whole display %@, Dock backdrop %d, Finder desktop %d: %@",
                                cover ? [NSString stringWithFormat:@"of pid %d", cover] : @"none", backdrop, desktop,
                                fs ? @"a full-screen Space" : @"a normal desktop");
    return fs;
}

static void watchPointer(void);

static void showIcon(void) {
    after(0.25, ^{ watchPointer(); }); // it may appear under a still pointer
    // Read back, not assumed: on screen is the window server's word.
    after(0.3, ^{
        flog(@"icon read back: isVisible=%d on screen=%d alpha=%.2f frame=%@", [panel isVisible],
             ([panel occlusionState] & NSWindowOcclusionStateVisible) != 0, [panel alphaValue], NSStringFromRect([panel frame]));
    });
    if (reduceMotion()) {
        [panel setAlphaValue:1];
        [panel orderFrontRegardless];
        return;
    }
    [panel setAlphaValue:0];
    [panel orderFrontRegardless];
    CABasicAnimation *a = [CABasicAnimation animationWithKeyPath:@"transform.scale"];
    a.fromValue = @0.9;
    a.toValue = @1.0;
    a.duration = 0.2;
    a.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseOut];
    [group addAnimation:a forKey:@"appear"];
    [NSAnimationContext runAnimationGroup:^(NSAnimationContext *c) {
        c.duration = 0.2;
        [[panel animator] setAlphaValue:1];
    } completionHandler:nil];
}

static void restoreChrome(void);

// fsCheck: only a desktop-change notification may read the window list.
static void update(NSString *why, BOOL fsCheck) {
    clampIcon(why);
    BOOL back = NO;
    if (state == StateReturning && [marker isOnActiveSpace]) {
        back = YES;
        restoreChrome();
        [mainWin setFrame:homeFrame display:NO];
        orderHere(mainWin, [NSString stringWithFormat:@"update(%@), returning and the home marker on the active desktop", why], nil);
        state = StateHome;
        flog(@"%@: home desktop active, window back", why);
    }
    // A window just ordered in reads as elsewhere for a moment; it is here.
    BOOL here = back || ([mainWin isVisible] && [mainWin isOnActiveSpace]);
    BOOL want = state == StateHome ? !here : YES;
    BOOL fs = NO;
    if (want && fsCheck) {
        fs = fullScreenSpace();
        want = !fs;
    } else if (want && !fsCheck && ![panel isVisible]) {
        // No fresh read of the window list: keep it hidden where it was hidden.
        want = NO;
    }
    BOOL shown = [panel isVisible];
    if (want && !shown) showIcon();
    else if (!want && shown) [panel orderOut:nil];
    flog(@"%@: state=%s here=%d fs=%d icon %@", why, stateName[state], here, fs,
         want == shown ? (shown ? @"stays" : @"stays hidden") : (want ? @"shown" : @"hidden"));
}

// ---------- the Wails window as the list, then full ----------

// The list's look: borderless, radius 12, the window's own shadow.
static void listChrome(void) {
    if ([mainWin styleMask] & NSWindowStyleMaskFullScreen) return;
    if (!([mainWin styleMask] & NSWindowStyleMaskTitled)) return; // already
    homeStyle = [mainWin styleMask];
    homeBackground = [mainWin backgroundColor];
    homeAnimation = [mainWin animationBehavior];
    [mainWin setStyleMask:NSWindowStyleMaskBorderless | NSWindowStyleMaskResizable];
    // A borderless window gets AppKit's shrink-and-fade when ordered out
    // (about 0.3 s on screen after isVisible says no): the list closes at
    // once (Amendment 3), so none.
    [mainWin setAnimationBehavior:NSWindowAnimationBehaviorNone];
    [mainWin setOpaque:NO];
    [mainWin setBackgroundColor:[NSColor clearColor]];
    NSView *cv = [mainWin contentView];
    cv.wantsLayer = YES;
    cv.layer.cornerRadius = 12;
    if (@available(macOS 11.0, *)) cv.layer.cornerCurve = kCACornerCurveContinuous;
    cv.layer.masksToBounds = YES;
    [mainWin setHasShadow:YES];
    [mainWin invalidateShadow];
}

// Wails' minimum comes back whatever the chrome was: a list brought from
// native full screen kept its title bar, and the minimum must not stay at
// the list's (code review, 898f9a9).
static void restoreChrome(void) {
    setMin(appMinSize);
    if (homeStyle == 0 || ([mainWin styleMask] & NSWindowStyleMaskTitled)) return;
    NSView *cv = [mainWin contentView];
    cv.layer.cornerRadius = 0;
    cv.layer.masksToBounds = NO;
    [mainWin setStyleMask:homeStyle];
    [mainWin setAnimationBehavior:homeAnimation];
    [mainWin setOpaque:YES];
    if (homeBackground) [mainWin setBackgroundColor:homeBackground];
}

static CGFloat listMaxH(NSScreen *s) { return MIN(kListMaxH, floor(NSHeight([s visibleFrame]) * 0.7)); }

// The list's frame: 360 wide, beside the icon, opening toward the screen's centre.
static NSRect listFrameAt(NSRect t, CGFloat h) {
    NSScreen *s = screenAt(NSMakePoint(NSMidX(t), NSMidY(t)));
    NSRect vis = [s visibleFrame];
    h = MAX(kListMinH, MIN(h, listMaxH(s)));
    BOOL right = NSMidX(t) > NSMidX(vis);
    listAbove = NSMidY(t) < NSMidY(vis);
    NSRect f = NSMakeRect(right ? NSMaxX(t) - kListW : NSMinX(t), listAbove ? NSMaxY(t) + kGap : NSMinY(t) - kGap - h, kListW, h);
    NSRect v = NSInsetRect(vis, kInset, kInset);
    f.origin.x = MAX(NSMinX(v), MIN(NSMinX(f), NSMaxX(v) - kListW));
    f.origin.y = MAX(NSMinY(v), MIN(NSMinY(f), NSMaxY(v) - h));
    return f;
}

static NSRect listFrame(CGFloat h) { return listFrameAt(tileOf([panel frame]), h); }

// The list follows the icon when it is dragged while the list is open here
// (the lead's take: dropped elsewhere, the list stayed behind).
static void reanchorList(NSRect tile) {
    if (state != StateListing || ![mainWin isVisible] || ![mainWin isOnActiveSpace]) return;
    NSRect f = listFrameAt(tile, NSHeight([mainWin frame]));
    [[mainWin animator] setFrame:f display:YES];
    flog(@"list follows the icon to %@", NSStringFromRect(f));
}

// ---------- activation: only the lead's own acts (float-focus-steal) ----------

// The icon is a window on every desktop, so macOS counts Deltagos as an app
// with a window wherever the lead is. When the app in front quits or hides,
// macOS hands activation to the most recent such app; for Deltagos AppKit
// then makes the main window key, and with "switch to a Space with open
// windows" on, a main window at home on another desktop pulls the lead there.
// That activation is refused here: the window goes back home the way a
// dismissed list does (Returning, ordered in when its desktop is next shown)
// and activation goes where macOS would have sent it without the icon.
static double leadActAt;               // our own activation for a lead's act (a click, a double-click, the notification)
static double otherLeftAt;             // another app quit or hid
static pid_t frontPid;                 // the last other app in front
static NSRunningApplication *beforeList; // the app in front when the list opened

static BOOL gonePid(pid_t pid) { return pid > 0 && kill(pid, 0) == -1 && errno == ESRCH; }

// Another app's normal window, topmost on this desktop; nil when there is none.
static NSRunningApplication *topOther(void) {
    NSArray *list = CFBridgingRelease(CGWindowListCopyWindowInfo(kCGWindowListOptionOnScreenOnly | kCGWindowListExcludeDesktopElements, kCGNullWindowID));
    pid_t me = getpid();
    for (NSDictionary *w in list) {
        if ([w[(id)kCGWindowLayer] intValue] != 0) continue;
        pid_t pid = [w[(id)kCGWindowOwnerPID] intValue];
        if (pid == me || gonePid(pid)) continue;
        NSRunningApplication *a = [NSRunningApplication runningApplicationWithProcessIdentifier:pid];
        if (a && [a activationPolicy] == NSApplicationActivationPolicyRegular && ![a isHidden]) return a;
    }
    return nil;
}

static BOOL onThisDesktop(NSRunningApplication *a) {
    if (!a || [a isTerminated] || [a isHidden]) return NO;
    NSArray *list = CFBridgingRelease(CGWindowListCopyWindowInfo(kCGWindowListOptionOnScreenOnly | kCGWindowListExcludeDesktopElements, kCGNullWindowID));
    for (NSDictionary *w in list)
        if ([w[(id)kCGWindowLayer] intValue] == 0 && [w[(id)kCGWindowOwnerPID] intValue] == [a processIdentifier]) return YES;
    return NO;
}

// Activation goes to an app on this desktop, never to one whose windows are
// elsewhere (that would move the lead too): the preferred one if it has a
// window here, else the topmost other window's app, else Finder, which owns
// every desktop.
static void handActivation(NSRunningApplication *prefer, NSString *why) {
    NSRunningApplication *to = onThisDesktop(prefer) ? prefer : topOther();
    if (!to) to = [[NSRunningApplication runningApplicationsWithBundleIdentifier:@"com.apple.finder"] firstObject];
    BOOL ok = [to activateWithOptions:0];
    flog(@"activation: handed to %@ pid %d (%@): %d", [to localizedName], [to processIdentifier], why, ok);
}

static void leadAct(void) { leadActAt = now(); }

// The app is about to become active. Ours, for a lead's act, passes; so does
// any activation with no app just gone (the Dock, Cmd-Tab, a click on a
// window: the lead's). The system's hand-on after another app quit or hid is
// refused when Deltagos has no window on this desktop.
static void willBecomeActive(void) {
    if (!started) return;
    BOOL ours = now() - leadActAt < 1;
    BOOL handedOn = now() - otherLeftAt < 0.5 || gonePid(frontPid) ||
                    [[NSRunningApplication runningApplicationWithProcessIdentifier:frontPid] isHidden];
    if (ours || !handedOn) return;
    BOOL away = [mainWin isVisible] && ![mainWin isOnActiveSpace];
    if ([mainWin isVisible] && !away) return; // a window here: no desktop moves
    if ([mainWin styleMask] & NSWindowStyleMaskFullScreen) return; // its own Space; left to the system
    if (away && state == StateHome) {
        homeFrame = [mainWin frame];
        [mainWin orderOut:nil];
        state = StateReturning;
    }
    flog(@"activation: refused the system's hand-on (pid %d left), main window %@; state=%s", frontPid,
         away ? @"sent home (returning)" : @"not shown", stateName[state]);
    dispatch_async(dispatch_get_main_queue(), ^{
        handActivation(nil, @"the system's hand-on refused");
        update(@"hand-on refused", NO);
    });
}

static void watchOthers(void) {
    NSNotificationCenter *wc = [[NSWorkspace sharedWorkspace] notificationCenter];
    pid_t me = getpid();
    [wc addObserverForName:NSWorkspaceDidActivateApplicationNotification object:nil queue:[NSOperationQueue mainQueue]
                usingBlock:^(NSNotification *n) {
                    NSRunningApplication *a = n.userInfo[NSWorkspaceApplicationKey];
                    if ([a processIdentifier] != me) frontPid = [a processIdentifier];
                }];
    for (NSString *name in @[ NSWorkspaceDidTerminateApplicationNotification, NSWorkspaceDidHideApplicationNotification ])
        [wc addObserverForName:name object:nil queue:[NSOperationQueue mainQueue] usingBlock:^(NSNotification *n) {
            NSRunningApplication *a = n.userInfo[NSWorkspaceApplicationKey];
            if ([a processIdentifier] != me) otherLeftAt = now();
        }];
    // Not the main queue: it must run before AppKit makes the window key.
    [[NSNotificationCenter defaultCenter] addObserverForName:NSApplicationWillBecomeActiveNotification object:NSApp queue:nil
                                                  usingBlock:^(NSNotification *n) { willBecomeActive(); }];
}

static double clickUpAt;              // wall time of the mouse-up that asked for the list, for the log

static void bringList(void) {
    if (state == StateHome) {
        homeFrame = [mainWin frame];
        listFromCompact = NO;
    } else if (state == StateCompacted) {
        listFromCompact = YES;
    } else if (state == StateReturning) {
        listFromCompact = NO;
    }
    if (![NSApp isActive]) beforeList = [[NSWorkspace sharedWorkspace] frontmostApplication];
    state = StateListing;
    listChrome();
    setMin(NSMakeSize(kListW, kListMinH));
    // The rows' height comes from the frontend at once; a height left from
    // the last filter would open it short and then jump (the lead's take).
    listHeight = kListMaxH;
    NSRect f = listFrame(listHeight);
    [mainWin setAlphaValue:1];
    [mainWin setFrame:f display:YES];
    flog(@"click: list at %@ (from %@)", NSStringFromRect(f), listFromCompact ? @"compact" : @"home");
    // Window first, activate after: activating while the window is on another
    // desktop switches the user there.
    orderHere(mainWin, @"bringList", ^{
        flog(@"activation: makeKeyAndOrderFront and activateIgnoringOtherApps by bringList, app active=%d", [NSApp isActive]);
        leadAct();
        [mainWin makeKeyAndOrderFront:nil];
        [NSApp activateIgnoringOtherApps:YES];
        flog(@"click +0.15s: onActive=%d frame=%@", [mainWin isOnActiveSpace], NSStringFromRect([mainWin frame]));
    });
    // F11: read back, not assumed; the time is from the mouse-up.
    if (clickUpAt > 0) {
        flog(@"list front: isVisible=%d onActive=%d frame=%@, %.0f ms after the click", [mainWin isVisible], [mainWin isOnActiveSpace],
             NSStringFromRect([mainWin frame]), (now() - clickUpAt) * 1000);
        clickUpAt = 0;
    }
    // The corner the list grows from: the one by the icon.
    NSString *origin = [NSString stringWithFormat:@"%@ %@", listAbove ? @"bottom" : @"top", NSMidX(tileOf([panel frame])) > NSMidX(f) ? @"right" : @"left"];
    floatIconClicked((char *)[origin UTF8String]);
    update(@"click", NO);
}

static void dismissList(NSString *why);
static void growFromIcon(NSString *why);

// A click on the icon with the list open closes it at once (Amendment 3,
// which replaces Amendment 2's wait); a second click within the double-click
// interval then grows the full window from the icon, never the list again.
static void iconClicked(void) {
    if (state == StateListing && [mainWin isOnActiveSpace] && [mainWin isVisible]) {
        dismissList(@"icon");
        return;
    }
    bringList();
}

static void goFull(NSString *why);

// A double-click (F10, F11): the list the first click opened grows into the
// full window here, at the view the window last showed, which the frontend
// keeps (the list never changes it). If the first click closed an open list
// instead, the full window grows from the icon and the list stays closed
// (Amendment 3).
static void doubleClicked(void) {
    if (state == StateHome && [mainWin isVisible] && [mainWin isOnActiveSpace]) return; // already full here
    if (state == StateListing && [mainWin isVisible]) {
        floatIconExpanded(); // the frontend closes the list without touching the view
        goFull(@"double-click");
        return;
    }
    growFromIcon(@"double-click after a close");
}

// ---------- the panel ----------

@interface FloatPanel : NSPanel
@end
@implementation FloatPanel
- (BOOL)canBecomeKeyWindow { return NO; }
- (BOOL)canBecomeMainWindow { return NO; }
// AppKit keeps a window's top under the menu bar, which with the shadow
// margin left the tile 40 px (at 56) under it, not 8 (Amendment 3, F14).
// clampTile keeps the tile itself inside the visible frame with the inset;
// the transparent margin may lie under the menu bar.
- (NSRect)constrainFrameRect:(NSRect)r toScreen:(NSScreen *)s { return r; }
@end

@interface FloatIconView : NSView
@property NSPoint downAt;
@property NSPoint originAt;
@property BOOL dragging;
@property BOOL inside;
@property BOOL pressing;
@property NSTimeInterval lastClickUp; // event time of the last click's mouse-up; 0 after a double or a drag
@property BOOL second;                // this press is the second of a double-click
@end

static FloatIconView *iconView;
static NSView *iconViewForRing(void) { return iconView; }

// Clicks beside the tile pass through (code review, 898f9a9): the panel is
// larger than the tile to hold its shadow, and a window takes every click on
// its frame wherever it is drawn. So the panel ignores the pointer except
// while the pointer is over the tile (its hover-scaled bounds) or a press
// or drag is under way. Mouse-moved and dragged events flip it as they come:
// a global monitor sees them while the panel ignores the pointer (other
// apps get them), a local one while it takes them; nothing runs while the
// pointer is still (re-review, c48cdf2). The same drives the hover look,
// since entered/exited cannot fire while ignored. A global monitor of mouse
// events needs no permission; only key events do.
static BOOL overTile(NSPoint p) {
    NSRect t = tileOf([panel frame]);
    CGFloat grow = tileSz * 0.04; // the dragging scale, 1.08, covers hover's 1.06
    return NSPointInRect(p, NSInsetRect(t, -grow, -grow));
}

static void watchPointer(void) {
    if (![panel isVisible]) return;
    BOOL busy = iconView.pressing || iconView.dragging;
    BOOL over = overTile([NSEvent mouseLocation]);
    BOOL take = busy || over;
    if ([panel ignoresMouseEvents] == take) {
        [panel setIgnoresMouseEvents:!take];
        flog(@"pointer %@", take ? @"over the tile: icon takes clicks" : @"off the tile: clicks pass through");
    }
    if (!busy && over != iconView.inside) {
        iconView.inside = over;
        setLook(over ? LookHover : LookResting, 0.12);
    }
}

@implementation FloatIconView
- (BOOL)acceptsFirstMouse:(NSEvent *)e { return YES; }
- (BOOL)isFlipped { return NO; }

// Only the tile takes the pointer; the shadow margin does not.
- (NSView *)hitTest:(NSPoint)p {
    NSPoint q = [self convertPoint:p fromView:[self superview]];
    return NSPointInRect(q, NSMakeRect(padSz, padSz, tileSz, tileSz)) ? self : nil;
}

- (void)updateTrackingAreas {
    [super updateTrackingAreas];
    for (NSTrackingArea *a in [self trackingAreas]) [self removeTrackingArea:a];
    [self addTrackingArea:[[NSTrackingArea alloc] initWithRect:NSMakeRect(padSz, padSz, tileSz, tileSz)
                                                       options:NSTrackingCursorUpdate | NSTrackingActiveAlways
                                                         owner:self
                                                      userInfo:nil]];
}

- (void)cursorUpdate:(NSEvent *)e { [[NSCursor pointingHandCursor] set]; }

- (void)mouseDown:(NSEvent *)e {
    self.downAt = [NSEvent mouseLocation];
    self.originAt = [[self window] frame].origin;
    self.dragging = NO;
    self.pressing = YES;
    // The system's interval, from the last click's mouse-up to this press.
    NSTimeInterval gap = self.lastClickUp > 0 ? [e timestamp] - self.lastClickUp : -1;
    self.second = [e clickCount] >= 2 || (gap >= 0 && gap <= [NSEvent doubleClickInterval]);
    setLook(LookPressed, 0.08);
    flog(@"pointer down at %@ (clickCount %ld, %.0f ms after the last click, interval %.0f ms%@)", NSStringFromPoint(self.downAt), (long)[e clickCount],
         gap * 1000, [NSEvent doubleClickInterval] * 1000, self.second ? @", second click" : @"");
}

- (void)mouseDragged:(NSEvent *)e {
    NSPoint p = [NSEvent mouseLocation];
    CGFloat dx = p.x - self.downAt.x, dy = p.y - self.downAt.y;
    if (!self.dragging && hypot(dx, dy) <= kDragAt) return;
    if (!self.dragging) {
        self.dragging = YES;
        setLook(LookDragging, 0.12);
        // Over the Dock while dragging, so it never vanishes under it; back
        // to the floating level on the drop.
        [panel setLevel:NSStatusWindowLevel];
        flog(@"pointer drag start (moved %.1f px)", hypot(dx, dy));
    }
    [[self window] setFrameOrigin:NSMakePoint(self.originAt.x + dx, self.originAt.y + dy)];
}

- (void)mouseUp:(NSEvent *)e {
    NSPoint p = [NSEvent mouseLocation];
    CGFloat moved = hypot(p.x - self.downAt.x, p.y - self.downAt.y);
    self.pressing = NO;
    if (self.dragging) {
        self.dragging = NO;
        self.lastClickUp = 0; // a drag is never a click
        flog(@"pointer drag end (moved %.1f px)", moved);
        [panel setLevel:NSFloatingWindowLevel];
        dropAt();
        setLook(self.inside ? LookHover : LookResting, 0.16);
        after(0.17, ^{ watchPointer(); }); // the panel moved under a still pointer
        return;
    }
    setLook(self.inside ? LookHover : LookResting, 0.08);
    clickUpAt = now();
    if (self.second) {
        // A third click starts over: it is a single click again.
        self.lastClickUp = 0;
        self.second = NO;
        flog(@"pointer double-click (moved %.1f px)", moved);
        doubleClicked();
        return;
    }
    // At once, on mouse-up, with no wait for the interval (F11).
    self.lastClickUp = [e timestamp];
    flog(@"pointer click (moved %.1f px)", moved);
    iconClicked();
}

// Accessibility (F9): a button named Deltagos that opens the list.
- (BOOL)isAccessibilityElement { return YES; }
- (NSAccessibilityRole)accessibilityRole { return NSAccessibilityButtonRole; }
// The name adds the memory level at high and critical (ram-indicator §2).
- (NSString *)accessibilityLabel {
    return [memLevel isEqualToString:@"normal"] ? @"Deltagos" : [NSString stringWithFormat:@"Deltagos, memory %@", memLevel];
}
- (NSString *)accessibilityHelp { return @"Opens the initiative list"; }
// The press is a single click: it opens the list (a double-click has no
// accessibility action; a pick in the list opens full).
- (BOOL)accessibilityPerformPress {
    flog(@"accessibility press");
    clickUpAt = now();
    iconClicked();
    return YES;
}
@end

static void shadowPath(CALayer *l) {
    CGPathRef path = CGPathCreateWithRoundedRect(CGRectMake(0, 0, tileSz, tileSz), tileSz / 4, tileSz / 4, NULL);
    l.shadowPath = path;
    CGPathRelease(path);
}

// Lays the layers out for tileSz: the tile, its radius a quarter of it, the
// mark and the shadows by tileSz / 56. Bounds and position, not frame, since
// the group carries the look's scale.
static void layoutLayers(void) {
    CGRect inner = CGRectMake(0, 0, tileSz, tileSz);
    [CATransaction begin];
    [CATransaction setDisableActions:YES];
    group.bounds = inner;
    group.position = CGPointMake(padSz + tileSz / 2, padSz + tileSz / 2); // anchored at its centre, so it scales in place
    for (CALayer *l in @[ shadowFar, shadowNear ]) {
        l.frame = inner;
        shadowPath(l);
    }
    tileLayer.frame = inner;
    tileLayer.cornerRadius = tileSz / 4;
    layoutMark();
    if (ring) layoutRing();
    [CATransaction commit];
}

// The icon at a new size (F12): the panel grows or shrinks about the tile's
// centre, the margin follows, the layers are laid out again and the look
// re-applied; the caller clamps. Logged from the window read back.
static void sizeIcon(CGFloat size, NSString *why) {
    if (size == tileSz && NSWidth([panel frame]) == size + 2 * padSz) return;
    NSRect was = tileOf([panel frame]);
    tileSz = size;
    padSz = round(kBasePad * size / kBase);
    CGFloat side = tileSz + 2 * padSz;
    NSRect f = NSMakeRect(round(NSMidX(was) - side / 2), round(NSMidY(was) - side / 2), side, side);
    [panel setFrame:f display:NO];
    [[panel contentView] setFrame:NSMakeRect(0, 0, side, side)];
    layoutLayers();
    setLook(look, 0);
    [[panel contentView] updateTrackingAreas];
    [[panel contentView] setNeedsDisplay:YES];
    NSRect r = [panel frame];
    flog(@"size (%@): icon %.0f pt, radius %.0f, shadow margin %.0f; panel frame read back %@, tile %@", why, NSWidth(r) - 2 * padSz,
         tileLayer.cornerRadius, padSz, NSStringFromRect(r), NSStringFromRect(tileOf(r)));
}

static void build(void) {
    tileSz = kBase;
    padSz = kBasePad;
    CGFloat side = tileSz + 2 * padSz;
    panel = [[FloatPanel alloc] initWithContentRect:NSMakeRect(0, 0, side, side)
                                          styleMask:NSWindowStyleMaskBorderless | NSWindowStyleMaskNonactivatingPanel
                                            backing:NSBackingStoreBuffered
                                              defer:NO];
    [panel setFloatingPanel:YES];
    [panel setLevel:NSFloatingWindowLevel]; // under system dialogs and the menu bar
    [panel setHidesOnDeactivate:NO];
    [panel setOpaque:NO];
    [panel setBackgroundColor:[NSColor clearColor]];
    [panel setHasShadow:NO]; // the two-layer shadow is drawn by layers
    [panel setReleasedWhenClosed:NO];
    [panel setCollectionBehavior:NSWindowCollectionBehaviorCanJoinAllSpaces | NSWindowCollectionBehaviorStationary |
                                 NSWindowCollectionBehaviorIgnoresCycle | NSWindowCollectionBehaviorFullScreenNone];

    FloatIconView *v = [[FloatIconView alloc] initWithFrame:NSMakeRect(0, 0, side, side)];
    v.wantsLayer = YES;
    group = [CALayer layer];
    shadowFar = [CALayer layer];
    shadowNear = [CALayer layer];
    for (CALayer *l in @[ shadowFar, shadowNear ]) {
        l.shadowColor = CGColorGetConstantColor(kCGColorBlack);
        [group addSublayer:l];
    }

    keyline = [CAShapeLayer layer];
    keyline.fillColor = nil;
    keyline.strokeColor = [hex(0x1a1523) CGColor]; // the ground, #1a1523, the tile's own fill
    keyline.hidden = YES;
    [group addSublayer:keyline];
    ring = [CAShapeLayer layer];
    ring.fillColor = nil;
    ring.strokeColor = [hex(0xd946ef) CGColor]; // --tone until the first applyRing; amber for pressure, never red
    ring.hidden = YES;
    [group addSublayer:ring];

    tileLayer = [CALayer layer];
    if (@available(macOS 11.0, *)) tileLayer.cornerCurve = kCACornerCurveContinuous;
    tileLayer.backgroundColor = [hex(0x1a1523) CGColor];
    tileLayer.borderWidth = 1; // the hairline stays one point at every size
    tileLayer.borderColor = [[NSColor colorWithWhite:1 alpha:0.08] CGColor];
    tileLayer.masksToBounds = YES;
    [group addSublayer:tileLayer];
    [v.layer addSublayer:group];

    buildMark();
    layoutLayers();
    [panel setContentView:v];
    iconView = v;
    [panel setIgnoresMouseEvents:YES];
    [panel setAcceptsMouseMovedEvents:YES]; // the local monitor sees moves over the margin
    NSEventMask moves = NSEventMaskMouseMoved | NSEventMaskLeftMouseDragged;
    [NSEvent addGlobalMonitorForEventsMatchingMask:moves handler:^(NSEvent *e) {
        static BOOL seen;
        if (!seen) { seen = YES; flog(@"pointer: global move monitor live"); }
        watchPointer();
    }];
    // The float log says how a list closed (a take reads it back): the keys
    // the list gets, and the window losing key, which is how a click outside
    // or leaving the desktop reaches it.
    [NSEvent addLocalMonitorForEventsMatchingMask:NSEventMaskKeyDown handler:^NSEvent *(NSEvent *e) {
        if (state == StateListing && [e window] == mainWin) {
            unsigned short k = [e keyCode];
            if (k == 53) flog(@"key: Escape");
            else if (k == 36 || k == 76) flog(@"key: Return");
            else if ([[e characters] length]) flog(@"key: typed %@", [e characters]);
        }
        return e;
    }];
    [[NSNotificationCenter defaultCenter] addObserverForName:NSWindowDidResignKeyNotification object:mainWin queue:[NSOperationQueue mainQueue]
                                                  usingBlock:^(NSNotification *n) {
                                                      if (state != StateListing) return;
                                                      NSPoint p = [NSEvent mouseLocation];
                                                      flog(@"list lost key: pointer at %@ (%@), list %@, app active=%d", NSStringFromPoint(p),
                                                           overTile(p) ? @"over the icon" : NSPointInRect(p, [mainWin frame]) ? @"inside the list" : @"outside the list and the icon",
                                                           NSStringFromRect([mainWin frame]), [NSApp isActive]);
                                                  }];
    [NSEvent addLocalMonitorForEventsMatchingMask:moves handler:^NSEvent *(NSEvent *e) {
        watchPointer();
        return e;
    }];
    [v setToolTip:@"Deltagos"];
    // The window lists the button itself: a borderless panel's content view
    // is not offered to accessibility clients by default.
    [panel setAccessibilityChildren:@[ v ]];
    [v setAccessibilityParent:panel];
    setLook(LookResting, 0);
    // FLOAT_LOOK=hover|pressed|dragging holds that look for a still (F2);
    // the pointer's next enter or exit puts the real one back.
    const char *look = getenv("FLOAT_LOOK");
    if (look && strcmp(look, "hover") == 0) setLook(LookHover, 0);
    else if (look && strcmp(look, "pressed") == 0) setLook(LookPressed, 0);
    else if (look && strcmp(look, "dragging") == 0) setLook(LookDragging, 0);
    breathe();
    applyRing();
}

// The activation log (float-focus-steal S1), only with FLOAT_LOG: every time
// the app becomes or stops being active, or the main window becomes key or
// main, with the state, the desktop, the event being handled and the calls
// that led there, so an activation nobody asked for names its caller (ours,
// or the system's: an event, an Apple event, the window server).
static void logActivation(NSString *what) {
    NSEvent *e = [NSApp currentEvent];
    NSAppleEventDescriptor *ae = [[NSAppleEventManager sharedAppleEventManager] currentAppleEvent];
    NSArray *stack = [NSThread callStackSymbols];
    NSMutableArray *frames = [NSMutableArray array];
    for (NSUInteger i = 2; i < MIN(stack.count, 22); i++) {
        NSString *f = [stack[i] stringByReplacingOccurrencesOfString:@"  +" withString:@" " options:NSRegularExpressionSearch range:NSMakeRange(0, [stack[i] length])];
        [frames addObject:f];
    }
    flog(@"activation: %@; state=%s main visible=%d onActive=%d key=%d marker onActive=%d; event %@; apple event %@; stack: %@", what,
         stateName[state], [mainWin isVisible], [mainWin isOnActiveSpace], [mainWin isKeyWindow], [marker isOnActiveSpace],
         e ? [NSString stringWithFormat:@"type %lu window %ld", (unsigned long)[e type], (long)[e windowNumber]] : @"none",
         ae ? [NSString stringWithFormat:@"%@", ae] : @"none", [frames componentsJoinedByString:@" | "]);
}

static void watchActivation(void) {
    NSNotificationCenter *c = [NSNotificationCenter defaultCenter];
    NSDictionary *names = @{
        NSApplicationWillBecomeActiveNotification : @"app will become active",
        NSApplicationDidBecomeActiveNotification : @"app did become active",
        NSApplicationDidResignActiveNotification : @"app resigned active",
    };
    for (NSString *n in names)
        [c addObserverForName:n object:NSApp queue:nil usingBlock:^(NSNotification *x) { logActivation(names[n]); }];
    [c addObserverForName:NSWindowDidBecomeKeyNotification object:mainWin queue:nil usingBlock:^(NSNotification *x) { logActivation(@"main window became key"); }];
    [c addObserverForName:NSWindowDidBecomeMainNotification object:mainWin queue:nil usingBlock:^(NSNotification *x) { logActivation(@"main window became main"); }];
}

void FloatIconStart(const char *logArg, const char *placeFile) {
    char *lp = strdup(logArg), *pp = strdup(placeFile);
    dispatch_async(dispatch_get_main_queue(), ^{
        if (*lp) {
            logFile = fopen(lp, "a");
            logPath = strdup(lp);
            const char *w = getenv("FLOAT_SIZE_WIDTH");
            if (w && *w) widthStandIn = atof(w);
        }
        if (*pp) placePath = [NSString stringWithUTF8String:pp];
        free(lp);
        free(pp);
        // T5: the two Wails internals, checked before anything is built.
        mainWin = findMain();
        NSString *missing = nil;
        if (!mainWin) missing = @"no WailsWindow in [NSApp windows]";
        else if (![mainWin respondsToSelector:@selector(userMinSize)] || ![mainWin respondsToSelector:@selector(setUserMinSize:)])
            missing = @"WailsWindow has no userMinSize";
        if (missing) {
            flog(@"start: %@; the icon stays off", missing);
            floatIconUnavailable((char *)[missing UTF8String]);
            return;
        }
        appMinSize = [[mainWin valueForKey:@"userMinSize"] sizeValue];
        places = [NSMutableDictionary dictionaryWithContentsOfFile:placePath ?: @""] ?: [NSMutableDictionary dictionary];
        build();
        placeIcon();
        markHome(@"start");
        started = YES;
        watchOthers();
        NSNotificationCenter *wc = [[NSWorkspace sharedWorkspace] notificationCenter];
        [wc addObserverForName:NSWorkspaceActiveSpaceDidChangeNotification object:nil queue:[NSOperationQueue mainQueue]
                    usingBlock:^(NSNotification *n) { update(@"space-change", YES); }];
        [wc addObserverForName:NSWorkspaceAccessibilityDisplayOptionsDidChangeNotification object:nil queue:[NSOperationQueue mainQueue]
                    usingBlock:^(NSNotification *n) { breathe(); applyRing(); setLook(LookResting, 0); }];
        [[NSNotificationCenter defaultCenter] addObserverForName:NSApplicationDidChangeScreenParametersNotification object:nil
                                                           queue:[NSOperationQueue mainQueue]
                                                      usingBlock:^(NSNotification *n) {
                                                          flog(@"screens changed (%lu displays): sizing and placing the icon again", (unsigned long)[[NSScreen screens] count]);
                                                          placeIcon();
                                                      }];
        // With FLOAT_LOG set, SIGUSR1 posts the screen-parameters notification,
        // so a check without a second display still runs that path.
        if (logFile) {
            signal(SIGUSR1, SIG_IGN);
            usr1 = dispatch_source_create(DISPATCH_SOURCE_TYPE_SIGNAL, SIGUSR1, 0, dispatch_get_main_queue());
            dispatch_source_set_event_handler(usr1, ^{
                NSString *w = [NSString stringWithContentsOfFile:[NSString stringWithFormat:@"%s.width", logPath] encoding:NSUTF8StringEncoding error:nil];
                if (w) widthStandIn = [w doubleValue];
                flog(@"SIGUSR1: width stand-in %.0f; posting the screen-parameters notification", widthStandIn);
                [[NSNotificationCenter defaultCenter] postNotificationName:NSApplicationDidChangeScreenParametersNotification object:NSApp];
            });
            dispatch_resume(usr1);
            // SIGUSR2 runs what a double-click's second press and mouse-up
            // run (not the click count, which only a pointer makes).
            signal(SIGUSR2, SIG_IGN);
            usr2 = dispatch_source_create(DISPATCH_SOURCE_TYPE_SIGNAL, SIGUSR2, 0, dispatch_get_main_queue());
            dispatch_source_set_event_handler(usr2, ^{
                flog(@"SIGUSR2: the double-click's second press and action, without a pointer");
                clickUpAt = now();
                doubleClicked();
            });
            dispatch_resume(usr2);
            watchActivation();
        }
        flog(@"start: main=%@ min=%@ reduceMotion=%d ignoresMouse=%d icon window %ld", NSStringFromRect([mainWin frame]), NSStringFromSize(appMinSize), reduceMotion(), [panel ignoresMouseEvents], (long)[panel windowNumber]);
        update(@"start", YES);
        // A check's stand-in for another desktop, only with FLOAT_LOG:
        // FLOAT_SHOW_ICON=1 shows the icon here at start, so its window can
        // be shot (screencapture -l) without moving between desktops. The
        // next desktop change decides again.
        const char *show = getenv("FLOAT_SHOW_ICON");
        if (logFile && show && strcmp(show, "1") == 0 && ![panel isVisible]) {
            showIcon();
            flog(@"FLOAT_SHOW_ICON: icon shown on the home desktop for a check");
        }
    });
}

// Compact (§4): the window shrinks into the icon at its place; the icon then
// shows on every desktop, this one too, until a pick.
void FloatIconCompact(void) {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (!started || state != StateHome) return;
        homeFrame = [mainWin frame];
        state = StateCompacted;
        flog(@"compact from %@", NSStringFromRect(homeFrame));
        void (^done)(void) = ^{
            [mainWin orderOut:nil];
            [mainWin setAlphaValue:1];
            [mainWin setFrame:homeFrame display:NO];
            setMin(appMinSize);
            update(@"compact", NO);
        };
        // The icon shows first, so the window has somewhere to shrink into.
        if (![panel isVisible]) showIcon();
        if (reduceMotion() || ([mainWin styleMask] & NSWindowStyleMaskFullScreen)) {
            done();
            return;
        }
        [mainWin setMinSize:NSMakeSize(1, 1)];
        [NSAnimationContext runAnimationGroup:^(NSAnimationContext *c) {
            c.duration = 0.2;
            c.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseIn];
            [[mainWin animator] setFrame:tileOf([panel frame]) display:YES];
            [[mainWin animator] setAlphaValue:0];
        } completionHandler:done];
    });
}

// A pick: the window goes full on this desktop, which becomes its home; its
// size and place are the ones it had at home, kept inside this display.
// The full window's frame on a display: its home size and place, kept inside.
static NSRect fullFrameOn(NSScreen *s) {
    NSRect v = [s visibleFrame];
    NSRect f = homeFrame;
    f.size.width = MIN(NSWidth(f), NSWidth(v));
    f.size.height = MIN(NSHeight(f), NSHeight(v));
    f.origin.x = MAX(NSMinX(v), MIN(NSMinX(f), NSMaxX(v) - NSWidth(f)));
    f.origin.y = MAX(NSMinY(v), MIN(NSMinY(f), NSMaxY(v) - NSHeight(f)));
    return f;
}

static void goFull(NSString *why) {
        if (!started || state != StateListing) return;
        state = StateHome;
        NSRect f = fullFrameOn([mainWin screen] ?: [NSScreen mainScreen]);
        NSRect from = [mainWin frame]; // the list's frame, before its chrome changes
        restoreChrome();
        // The growth keeps the house motion (Amendment 2): 200 ms, not
        // setFrame:animate:'s own pace (about 0.36 s on the 3440); none under
        // Reduce motion. The window animator animates the frame; if it did
        // not land, it is set (the drop's lesson).
        double t0 = now();
        BOOL still = reduceMotion();
        void (^grown)(void) = ^{
            if (!NSEqualRects([mainWin frame], f)) [mainWin setFrame:f display:YES];
            BOOL titled = ([mainWin styleMask] & NSWindowStyleMaskTitled) != 0;
            flog(@"full (%@) read back: %@, growth %.0f ms%@ from %@ to %@, visible=%d onActive=%d key=%d state=%s", why,
                 titled ? @"full window" : @"still the list", (now() - t0) * 1000, still ? @" (reduce motion: none)" : @"",
                 NSStringFromRect(from), NSStringFromRect([mainWin frame]), [mainWin isVisible], [mainWin isOnActiveSpace], [mainWin isKeyWindow],
                 stateName[state]);
        };
        if (still) {
            [mainWin setFrame:f display:YES];
            grown();
        } else {
            [NSAnimationContext runAnimationGroup:^(NSAnimationContext *c) {
                c.duration = 0.2;
                c.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseOut];
                [[mainWin animator] setFrame:f display:YES];
            } completionHandler:grown];
        }
        markHome(why);
        flog(@"full (%@): growing to %@ min=%@", why, NSStringFromRect(f), NSStringFromSize([mainWin minSize]));
        update(@"full", NO);
}

void FloatIconFull(void) {
    dispatch_async(dispatch_get_main_queue(), ^{ goFull(@"pick"); });
}

// The second click of a double-click whose first closed the list (Amendment
// 3): the full window grows out of the icon here, as Compact shrinks into
// it, at the view it last showed; the list is not shown again. This desktop
// becomes its home.
static void growFromIcon(NSString *why) {
    if (!started || (state != StateReturning && state != StateCompacted) || [mainWin isVisible]) return;
    NSRect tile = tileOf([panel frame]);
    NSRect f = fullFrameOn(screenAt(NSMakePoint(NSMidX(tile), NSMidY(tile))));
    state = StateHome;
    restoreChrome();
    [mainWin setMinSize:NSMakeSize(1, 1)]; // the growth starts at the tile; userMinSize is put back after
    [mainWin setFrame:tile display:NO];
    double t0 = now();
    BOOL still = reduceMotion();
    [mainWin setAlphaValue:still ? 1 : 0];
    orderHere(mainWin, [NSString stringWithFormat:@"growFromIcon(%@)", why], ^{
        flog(@"activation: makeKeyAndOrderFront and activateIgnoringOtherApps by growFromIcon(%@), app active=%d", why, [NSApp isActive]);
        leadAct();
        [mainWin makeKeyAndOrderFront:nil];
        [NSApp activateIgnoringOtherApps:YES];
    });
    void (^grown)(void) = ^{
        if (!NSEqualRects([mainWin frame], f)) [mainWin setFrame:f display:YES];
        [mainWin setAlphaValue:1];
        setMin(appMinSize);
        BOOL titled = ([mainWin styleMask] & NSWindowStyleMaskTitled) != 0;
        flog(@"full (%@) read back: %@, growth %.0f ms%@ from the icon %@ to %@, visible=%d onActive=%d key=%d state=%s", why,
             titled ? @"full window" : @"still the list", (now() - t0) * 1000, still ? @" (reduce motion: none)" : @"",
             NSStringFromRect(tile), NSStringFromRect([mainWin frame]), [mainWin isVisible], [mainWin isOnActiveSpace], [mainWin isKeyWindow],
             stateName[state]);
    };
    if (still) {
        [mainWin setFrame:f display:YES];
        grown();
    } else {
        [NSAnimationContext runAnimationGroup:^(NSAnimationContext *c) {
            c.duration = 0.2;
            c.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseOut];
            [[mainWin animator] setFrame:f display:YES];
            [[mainWin animator] setAlphaValue:1];
        } completionHandler:grown];
    }
    floatIconExpanded(); // the list is already closed; the view it covered shows
    markHome(why);
    flog(@"full (%@): growing from the icon %@ to %@, %.0f ms after the click, the list not reopened", why, NSStringFromRect(tile),
         NSStringFromRect(f), clickUpAt > 0 ? (now() - clickUpAt) * 1000 : -1);
    clickUpAt = 0;
    update(@"full", NO);
}

// Pick nothing (§3, F7): the window leaves this desktop and returns to its
// home the next time that desktop is active; from Compact, it compacts again.
static void dismissList(NSString *why) {
    if (!started || state != StateListing) return;
    [mainWin orderOut:nil];
    BOOL gone = ![mainWin isVisible];
    restoreChrome();
    [mainWin setFrame:homeFrame display:NO];
    state = listFromCompact ? StateCompacted : StateReturning;
    floatIconClosed();
    // Focus goes back to what was in front: [NSApp deactivate] alone leaves
    // Deltagos active with no window here (Darwin 25), the most recent app
    // for macOS to hand activation to later. A click outside already moved it.
    if ([NSApp isActive]) handActivation(beforeList, @"the list closed");
    beforeList = nil;
    // F16 reads the close back: isVisible after the order-out, and for the
    // icon's click its time from the mouse-up.
    NSString *at = @"";
    if (clickUpAt > 0) {
        at = [NSString stringWithFormat:@", %.0f ms after the click", (now() - clickUpAt) * 1000];
        clickUpAt = 0;
    }
    flog(@"dismiss (%@): list isVisible=%d%@; %s min=%@", why, !gone, at, stateName[state], NSStringFromSize([mainWin minSize]));
    update(@"dismiss", NO);
}

void FloatIconDismiss(void) {
    dispatch_async(dispatch_get_main_queue(), ^{ dismissList(@"frontend"); });
}

// The list's height as its rows need it (§3): up to 480, or 70% of the
// display if smaller; the edge by the icon stays put.
void FloatIconListHeight(int height) {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (!started || state != StateListing) return;
        NSScreen *s = [mainWin screen] ?: [NSScreen mainScreen];
        CGFloat h = MAX(kListMinH, MIN((CGFloat)height, listMaxH(s)));
        listHeight = h;
        NSRect f = [mainWin frame];
        if (fabs(NSHeight(f) - h) < 1) return;
        if (!listAbove) f.origin.y = NSMaxY(f) - h;
        f.size.height = h;
        [mainWin setFrame:f display:YES];
        flog(@"list height %.0f", h);
    });
}

// The memory reading's level from each sample (ram-indicator §2): the ring
// and the icon's name follow it. Only a change is applied.
void FloatIconMemory(const char *level) {
    NSString *l = [NSString stringWithUTF8String:level];
    dispatch_async(dispatch_get_main_queue(), ^{
        NSString *want = [l isEqualToString:@"high"] || [l isEqualToString:@"critical"] ? l : @"normal";
        if ([want isEqualToString:memLevel]) return;
        memLevel = want;
        if (started) applyRing();
    });
}

// The memory notification's click (ram-indicator §3): Deltagos full on this
// desktop, through the paths a click and a double-click on the icon already
// take, nothing of its own: a list open here grows full; a window returning
// home or compacted grows from the icon; a window at home on another
// desktop is brought here as the list a click brings, then grown full as a
// double-click grows it. A window already here is left to the system, which
// activated the app for the click.
void FloatIconBringFull(void) {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (!started) return;
        flog(@"memory notification: state=%s visible=%d onActive=%d", stateName[state], [mainWin isVisible], [mainWin isOnActiveSpace]);
        if (state == StateHome && [mainWin isVisible] && [mainWin isOnActiveSpace]) return;
        if (state == StateHome) bringList();
        doubleClicked();
    });
}
