//go:build darwin

// The memory warning at critical (docs/ux/specs/ram-indicator.md §3,
// docs/specs/ram-indicator.md FR-6): the system's own notification through
// UNUserNotificationCenter, with the default sound. No osascript fallback:
// it could neither open the popover on a click nor say whether
// notifications are off (the spec's Rabbit holes).
//
// UNUserNotificationCenter needs a bundle: run outside one (wails dev, the
// bare binary) it raises, so the centre is never touched and the state
// reads "no bundle". Only the installed bundle posts (leftovers-15 FR-2):
// Go decides from NotifyBundleID and the run (notifyRefusal in app.go), and
// a review build or a fixture run never asks the centre for anything, so it
// is not even registered there; the state reads "not the installed app".

#import <Cocoa/Cocoa.h>
#import <UserNotifications/UserNotifications.h>
// The functions Go calls are declared in notify_darwin.go's preamble.

extern void notifyClicked(void);
extern void notifyLog(char *line);

static void nlog(NSString *fmt, ...) {
    va_list ap;
    va_start(ap, fmt);
    NSString *s = [[NSString alloc] initWithFormat:fmt arguments:ap];
    va_end(ap);
    notifyLog((char *)[s UTF8String]);
}

// The last state read from the centre: 0 not asked yet, 1 allowed, 2 off
// for Deltagos, 3 no bundle, 4 not the installed app (nothing is posted). Read on every post and
// every NotifyState, since he may switch them in System Settings meanwhile.
static _Atomic int state = 0;
static BOOL bundled;

@interface NotifyDelegate : NSObject <UNUserNotificationCenterDelegate>
@end
@implementation NotifyDelegate
// Shown even while Deltagos is in front: critical is worth the banner.
- (void)userNotificationCenter:(UNUserNotificationCenter *)c willPresentNotification:(UNNotification *)n
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions))done {
    done(UNNotificationPresentationOptionBanner | UNNotificationPresentationOptionList | UNNotificationPresentationOptionSound);
}
// The click: Go brings Deltagos full here and opens the popover.
- (void)userNotificationCenter:(UNUserNotificationCenter *)c didReceiveNotificationResponse:(UNNotificationResponse *)r
         withCompletionHandler:(void (^)(void))done {
    nlog(@"notification clicked (%@)", r.actionIdentifier);
    notifyClicked();
    done();
}
@end

static NotifyDelegate *delegate;

static void readSettings(void) {
    if (!bundled) return;
    [[UNUserNotificationCenter currentNotificationCenter] getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings *s) {
        int was = state;
        switch (s.authorizationStatus) {
        case UNAuthorizationStatusNotDetermined: state = 0; break;
        case UNAuthorizationStatusDenied: state = 2; break;
        default: state = s.alertSetting == UNNotificationSettingDisabled && s.notificationCenterSetting == UNNotificationSettingDisabled ? 2 : 1;
        }
        if (was != state) nlog(@"notifications: authorization status %ld, alert setting %ld: %s", (long)s.authorizationStatus, (long)s.alertSetting,
                               state == 1 ? "allowed" : state == 2 ? "off for Deltagos" : "not asked");
    }];
}

// The running bundle's identifier, "" outside a bundle.
const char *NotifyBundleID(void) {
    NSString *id = [[NSBundle mainBundle] bundleIdentifier];
    return id ? [id UTF8String] : "";
}

// Asks once (the system remembers the answer) and sets the delegate the
// click arrives through. Called at startup, so the first critical can post.
// refused is Go's reason this run posts nothing, "" when it may post.
void NotifyStart(const char *refused) {
    bundled = [[NSBundle mainBundle] bundleIdentifier] != nil && refused[0] == 0;
    if (!bundled) {
        state = [[NSBundle mainBundle] bundleIdentifier] != nil ? 4 : 3;
        nlog(@"notifications: %s, none will be posted", refused[0] ? refused : "not in a bundle");
        return;
    }
    dispatch_async(dispatch_get_main_queue(), ^{
        UNUserNotificationCenter *c = [UNUserNotificationCenter currentNotificationCenter];
        delegate = [NotifyDelegate new];
        c.delegate = delegate;
        [c requestAuthorizationWithOptions:(UNAuthorizationOptionAlert | UNAuthorizationOptionSound)
                         completionHandler:^(BOOL granted, NSError *err) {
                             nlog(@"notifications: authorization %@%@", granted ? @"granted" : @"refused",
                                  err ? [NSString stringWithFormat:@" (error %@ %ld: %@)", err.domain, (long)err.code, err.localizedDescription] : @"");
                             readSettings();
                         }];
    });
}

void NotifyPost(const char *title, const char *body) {
    if (!bundled) {
        nlog(@"notification not posted: %s", state == 4 ? "not the installed app" : "not in a bundle");
        return;
    }
    UNMutableNotificationContent *n = [UNMutableNotificationContent new];
    n.title = [NSString stringWithUTF8String:title];
    n.body = [NSString stringWithUTF8String:body];
    n.sound = [UNNotificationSound defaultSound];
    // One identifier: a new warning replaces the last one in the list.
    UNNotificationRequest *r = [UNNotificationRequest requestWithIdentifier:@"memory-critical" content:n trigger:nil];
    [[UNUserNotificationCenter currentNotificationCenter] addNotificationRequest:r withCompletionHandler:^(NSError *err) {
        if (err) nlog(@"notification refused: %@ %ld: %@", err.domain, (long)err.code, err.localizedDescription);
        else nlog(@"notification posted: %@", n.title);
        readSettings();
    }];
}

int NotifyState(void) {
    readSettings();
    return state;
}
