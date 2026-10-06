//go:build darwin

// The floating icon (docs/ux/specs/floating-icon.md, 0090): a non-activating
// NSPanel beside the Wails window, shown on every desktop where the window is
// not, never on a full-screen app's desktop and never key. A click brings the
// Wails window to this desktop as the initiative list (the frontend's
// FloatList, told by the Wails event floaticon:list); a pick makes it full
// here, Escape or a click outside sends it home. Public API only.
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
#include "floaticon_darwin.h"

extern void floatIconClicked(char *origin);
extern void floatIconClosed(void);
extern void floatIconUnavailable(char *reason);

static const CGFloat kTile = 56;
static const CGFloat kRadius = 14;
static const CGFloat kPad = 40;       // room for the dragging shadow, 0 16px 40px
static const CGFloat kInset = 8;      // the tile stays this far inside the visible frame
static const CGFloat kFirst = 24;     // first place: bottom right, this far in
static const CGFloat kDragAt = 4;     // a press that moves more is a drag
static const CGFloat kListW = 360;
static const CGFloat kListMaxH = 480;
static const CGFloat kListMinH = 160;
static const CGFloat kGap = 8;        // between the icon and the list

typedef enum { StateHome, StateListing, StateCompacted, StateReturning } FloatState;
static const char *stateName[] = {"home", "listing", "compacted", "returning"};

static NSPanel *panel;
static CALayer *group;                // the tile and its shadows; scaled as one
static CALayer *shadowNear, *shadowFar;
static NSArray<CALayer *> *bars;
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
static BOOL started;
static FILE *logFile;
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

static NSRect tileOf(NSRect win) { return NSMakeRect(NSMinX(win) + kPad, NSMinY(win) + kPad, kTile, kTile); }

static NSScreen *screenAt(NSPoint p) {
    for (NSScreen *s in [NSScreen screens]) {
        if (NSPointInRect(p, [s frame])) return s;
    }
    return [NSScreen mainScreen];
}

static NSRect clampTile(NSRect t, NSScreen *s) {
    NSRect v = NSInsetRect([s visibleFrame], kInset, kInset);
    t.origin.x = MAX(NSMinX(v), MIN(NSMinX(t), NSMaxX(v) - kTile));
    t.origin.y = MAX(NSMinY(v), MIN(NSMinY(t), NSMaxY(v) - kTile));
    return t;
}

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
    NSRect vis = [scr visibleFrame];
    NSDictionary *p = places[screenKey(scr)];
    NSRect t = p ? NSMakeRect(NSMinX(vis) + [p[@"x"] doubleValue], NSMinY(vis) + [p[@"y"] doubleValue], kTile, kTile)
                 : NSMakeRect(NSMaxX(vis) - kFirst - kTile, NSMinY(vis) + kFirst, kTile, kTile);
    t = clampTile(t, scr);
    [panel setFrameOrigin:NSMakePoint(NSMinX(t) - kPad, NSMinY(t) - kPad)];
    flog(@"place: tile %@, inside %@", NSStringFromRect(tileOf([panel frame])), NSStringFromRect(NSInsetRect(vis, kInset, kInset)));
}

static void reanchorList(NSRect tile);

// After a drop: kept inside the display under the tile's centre, remembered there.
static void dropAt(void) {
    NSRect t = tileOf([panel frame]);
    NSScreen *s = screenAt(NSMakePoint(NSMidX(t), NSMidY(t)));
    t = clampTile(t, s);
    NSRect vis = [s visibleFrame];
    places[screenKey(s)] = @{@"x" : @(NSMinX(t) - NSMinX(vis)), @"y" : @(NSMinY(t) - NSMinY(vis))};
    places[@"last"] = screenKey(s);
    savePlaces();
    // The window animator animates frame, not frameOrigin: an animated
    // setFrameOrigin: is dropped, which left the icon where the pointer let
    // go, under the Dock (Pablo's take 3). Animate the frame, then make sure.
    NSRect target = NSMakeRect(NSMinX(t) - kPad, NSMinY(t) - kPad, NSWidth([panel frame]), NSHeight([panel frame]));
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
    [panel setFrameOrigin:NSMakePoint(NSMinX(c) - kPad, NSMinY(c) - kPad)];
    flog(@"clamp (%@): tile %@ -> %@, inside %@", why, NSStringFromRect(t), NSStringFromRect(tileOf([panel frame])),
         NSStringFromRect(NSInsetRect([s visibleFrame], kInset, kInset)));
}

// ---------- the look: §2's table ----------

typedef enum { LookResting, LookHover, LookPressed, LookDragging } Look;

static void setShadow(CALayer *l, CGFloat y, CGFloat blur, CGFloat a) {
    l.shadowOpacity = a;
    l.shadowRadius = blur / 2;
    l.shadowOffset = CGSizeMake(0, -y); // layer y is up
}

static void setLook(Look k, double dur) {
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

// The bars breathe (§1): scale.y 0.82 to 1.0 and back over 2.4 s, staggered
// 0.3 s; under Reduce motion they stand still at full height.
static void breathe(void) {
    BOOL still = reduceMotion();
    CFTimeInterval t0 = CACurrentMediaTime();
    for (NSUInteger i = 0; i < [bars count]; i++) {
        CALayer *bar = bars[i];
        [bar removeAnimationForKey:@"breathe"];
        if (still) continue;
        CABasicAnimation *a = [CABasicAnimation animationWithKeyPath:@"transform.scale.y"];
        a.fromValue = @0.82;
        a.toValue = @1.0;
        a.duration = 1.2;
        a.autoreverses = YES;
        a.repeatCount = HUGE_VALF;
        a.beginTime = t0 + i * 0.3;
        a.fillMode = kCAFillModeBackwards;
        a.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut];
        [bar addAnimation:a forKey:@"breathe"];
    }
    flog(@"breathe: %@", still ? @"still (reduce motion)" : @"on");
}

// ---------- desktops ----------

// The marker is how the home desktop is known: a window that is not on all
// desktops stays where it was ordered in, and isOnActiveSpace is public.
static void orderHere(NSWindow *w, dispatch_block_t then) {
    NSWindowCollectionBehavior b = [w collectionBehavior];
    [w setCollectionBehavior:(b & ~NSWindowCollectionBehaviorCanJoinAllSpaces) | NSWindowCollectionBehaviorMoveToActiveSpace];
    [w orderFrontRegardless];
    after(0.15, ^{
        [w setCollectionBehavior:b];
        if (then) then();
    });
}

static void markHome(void) {
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
    orderHere(marker, nil);
    flog(@"home marked");
}

// A full-screen desktop (T3): another app's normal window covers the whole
// display the icon is on. FullScreenNone does not keep a CanJoinAllSpaces
// panel off it. Read only at a desktop-change notification, after the slide:
// mid-slide the list holds both desktops' windows (the spike's misfire).
static BOOL fullScreenSpace(void) {
    NSScreen *scr = [panel screen] ?: [NSScreen mainScreen];
    NSRect f = [scr frame];
    CGFloat top = NSMaxY([[NSScreen screens][0] frame]);
    CGRect want = CGRectMake(NSMinX(f), top - NSMaxY(f), NSWidth(f), NSHeight(f)); // CG: y down from the first display's top
    NSArray *list = CFBridgingRelease(CGWindowListCopyWindowInfo(kCGWindowListOptionOnScreenOnly | kCGWindowListExcludeDesktopElements, kCGNullWindowID));
    pid_t me = getpid();
    for (NSDictionary *w in list) {
        if ([w[(id)kCGWindowLayer] intValue] != 0 || [w[(id)kCGWindowOwnerPID] intValue] == me) continue;
        CGRect r;
        if (!CGRectMakeWithDictionaryRepresentation((CFDictionaryRef)w[(id)kCGWindowBounds], &r)) continue;
        if (fabs(r.origin.x - want.origin.x) < 1 && fabs(r.origin.y - want.origin.y) < 1 &&
            r.size.width >= want.size.width - 1 && r.size.height >= want.size.height - 1) {
            flog(@"full-screen window of pid %d", [w[(id)kCGWindowOwnerPID] intValue]);
            return YES;
        }
    }
    return NO;
}

static void watchPointer(void);

static void showIcon(void) {
    after(0.25, ^{ watchPointer(); }); // it may appear under a still pointer
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
        orderHere(mainWin, nil);
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
    [mainWin setStyleMask:NSWindowStyleMaskBorderless | NSWindowStyleMaskResizable];
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

static void bringList(void) {
    if (state == StateHome) {
        homeFrame = [mainWin frame];
        listFromCompact = NO;
    } else if (state == StateCompacted) {
        listFromCompact = YES;
    } else if (state == StateReturning) {
        listFromCompact = NO;
    }
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
    orderHere(mainWin, ^{
        [mainWin makeKeyAndOrderFront:nil];
        [NSApp activateIgnoringOtherApps:YES];
        flog(@"click +0.15s: onActive=%d frame=%@", [mainWin isOnActiveSpace], NSStringFromRect([mainWin frame]));
    });
    // The corner the list grows from: the one by the icon.
    NSString *origin = [NSString stringWithFormat:@"%@ %@", listAbove ? @"bottom" : @"top", NSMidX(tileOf([panel frame])) > NSMidX(f) ? @"right" : @"left"];
    floatIconClicked((char *)[origin UTF8String]);
    update(@"click", NO);
}

static void iconClicked(void) {
    if (state == StateListing && [mainWin isOnActiveSpace] && [mainWin isVisible]) {
        FloatIconDismiss();
        return;
    }
    bringList();
}

// ---------- the panel ----------

@interface FloatPanel : NSPanel
@end
@implementation FloatPanel
- (BOOL)canBecomeKeyWindow { return NO; }
- (BOOL)canBecomeMainWindow { return NO; }
@end

@interface FloatIconView : NSView
@property NSPoint downAt;
@property NSPoint originAt;
@property BOOL dragging;
@property BOOL inside;
@property BOOL pressing;
@end

static FloatIconView *iconView;

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
    CGFloat grow = kTile * 0.04; // the dragging scale, 1.08, covers hover's 1.06
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
    return NSPointInRect(q, NSMakeRect(kPad, kPad, kTile, kTile)) ? self : nil;
}

- (void)updateTrackingAreas {
    [super updateTrackingAreas];
    for (NSTrackingArea *a in [self trackingAreas]) [self removeTrackingArea:a];
    [self addTrackingArea:[[NSTrackingArea alloc] initWithRect:NSMakeRect(kPad, kPad, kTile, kTile)
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
    setLook(LookPressed, 0.08);
    flog(@"pointer down at %@", NSStringFromPoint(self.downAt));
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
        flog(@"pointer drag end (moved %.1f px)", moved);
        [panel setLevel:NSFloatingWindowLevel];
        dropAt();
        setLook(self.inside ? LookHover : LookResting, 0.16);
        after(0.17, ^{ watchPointer(); }); // the panel moved under a still pointer
        return;
    }
    setLook(self.inside ? LookHover : LookResting, 0.08);
    flog(@"pointer click (moved %.1f px)", moved);
    iconClicked();
}

// Accessibility (F9): a button named Deltagos that opens the list.
- (BOOL)isAccessibilityElement { return YES; }
- (NSAccessibilityRole)accessibilityRole { return NSAccessibilityButtonRole; }
- (NSString *)accessibilityLabel { return @"Deltagos"; }
- (NSString *)accessibilityHelp { return @"Opens the initiative list"; }
- (BOOL)accessibilityPerformPress {
    flog(@"accessibility press");
    iconClicked();
    return YES;
}
@end

static CALayer *shadowLayer(CGRect r) {
    CALayer *l = [CALayer layer];
    l.frame = r;
    CGPathRef path = CGPathCreateWithRoundedRect(CGRectMake(0, 0, r.size.width, r.size.height), kRadius, kRadius, NULL);
    l.shadowPath = path;
    CGPathRelease(path);
    l.shadowColor = CGColorGetConstantColor(kCGColorBlack);
    return l;
}

static void build(void) {
    CGFloat side = kTile + 2 * kPad;
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
    CGRect tileR = CGRectMake(kPad, kPad, kTile, kTile);
    group = [CALayer layer];
    group.frame = tileR; // anchored at its centre, so it scales in place
    CGRect inner = CGRectMake(0, 0, kTile, kTile);
    shadowFar = shadowLayer(inner);
    shadowNear = shadowLayer(inner);
    [group addSublayer:shadowFar];
    [group addSublayer:shadowNear];

    CALayer *tile = [CALayer layer];
    tile.frame = inner;
    tile.cornerRadius = kRadius;
    if (@available(macOS 11.0, *)) tile.cornerCurve = kCACornerCurveContinuous;
    tile.backgroundColor = [hex(0x1a1523) CGColor];
    tile.borderWidth = 1;
    tile.borderColor = [[NSColor colorWithWhite:1 alpha:0.08] CGColor];
    tile.masksToBounds = YES;
    [group addSublayer:tile];
    [v.layer addSublayer:group];

    // Three bars, the app icon's mark: now, blocked and next hues.
    unsigned hues[3] = {0xb06cff, 0xff4d63, 0xa9a0ff};
    CGFloat heights[3] = {30, 20, 25};
    CGFloat bw = 8, gap = 5, x0 = (kTile - (3 * bw + 2 * gap)) / 2, base = 13;
    NSMutableArray *bs = [NSMutableArray array];
    for (int i = 0; i < 3; i++) {
        CALayer *bar = [CALayer layer];
        bar.anchorPoint = CGPointMake(0.5, 0);
        bar.bounds = CGRectMake(0, 0, bw, heights[i]);
        bar.position = CGPointMake(x0 + i * (bw + gap) + bw / 2, base);
        bar.cornerRadius = 2;
        bar.backgroundColor = [hex(hues[i]) CGColor];
        [tile addSublayer:bar];
        [bs addObject:bar];
    }
    bars = bs;
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
}

void FloatIconStart(const char *logPath, const char *placeFile) {
    char *lp = strdup(logPath), *pp = strdup(placeFile);
    dispatch_async(dispatch_get_main_queue(), ^{
        if (*lp) logFile = fopen(lp, "a");
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
        markHome();
        started = YES;
        NSNotificationCenter *wc = [[NSWorkspace sharedWorkspace] notificationCenter];
        [wc addObserverForName:NSWorkspaceActiveSpaceDidChangeNotification object:nil queue:[NSOperationQueue mainQueue]
                    usingBlock:^(NSNotification *n) { update(@"space-change", YES); }];
        [wc addObserverForName:NSWorkspaceAccessibilityDisplayOptionsDidChangeNotification object:nil queue:[NSOperationQueue mainQueue]
                    usingBlock:^(NSNotification *n) { breathe(); setLook(LookResting, 0); }];
        [[NSNotificationCenter defaultCenter] addObserverForName:NSApplicationDidChangeScreenParametersNotification object:nil
                                                           queue:[NSOperationQueue mainQueue]
                                                      usingBlock:^(NSNotification *n) { placeIcon(); flog(@"screens changed: icon re-placed"); }];
        flog(@"start: main=%@ min=%@ reduceMotion=%d ignoresMouse=%d", NSStringFromRect([mainWin frame]), NSStringFromSize(appMinSize), reduceMotion(), [panel ignoresMouseEvents]);
        update(@"start", YES);
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
void FloatIconFull(void) {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (!started || state != StateListing) return;
        state = StateHome;
        NSScreen *s = [mainWin screen] ?: [NSScreen mainScreen];
        NSRect v = [s visibleFrame];
        NSRect f = homeFrame;
        f.size.width = MIN(NSWidth(f), NSWidth(v));
        f.size.height = MIN(NSHeight(f), NSHeight(v));
        f.origin.x = MAX(NSMinX(v), MIN(NSMinX(f), NSMaxX(v) - NSWidth(f)));
        f.origin.y = MAX(NSMinY(v), MIN(NSMinY(f), NSMaxY(v) - NSHeight(f)));
        restoreChrome();
        [mainWin setFrame:f display:YES animate:!reduceMotion()];
        markHome();
        flog(@"full: frame=%@ min=%@", NSStringFromRect([mainWin frame]), NSStringFromSize([mainWin minSize]));
        update(@"full", NO);
    });
}

// Pick nothing (§3, F7): the window leaves this desktop and returns to its
// home the next time that desktop is active; from Compact, it compacts again.
void FloatIconDismiss(void) {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (!started || state != StateListing) return;
        [mainWin orderOut:nil];
        restoreChrome();
        [mainWin setFrame:homeFrame display:NO];
        state = listFromCompact ? StateCompacted : StateReturning;
        floatIconClosed();
        [NSApp deactivate]; // focus goes back to what was in front
        flog(@"dismiss: %s min=%@", stateName[state], NSStringFromSize([mainWin minSize]));
        update(@"dismiss", NO);
    });
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
