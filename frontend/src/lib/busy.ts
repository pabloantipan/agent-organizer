/** The design system's busy rule (launch-progress A7, L27; leftovers-34
 *  FR-2): a pressed control that waits on the service keeps focus. It takes
 *  `aria-disabled="true"` instead of `disabled`, which would drop focus to
 *  the body, shows its gerund, and ignores presses until the call settles;
 *  the result, not the wait, moves focus. A control disabled for another
 *  reason (empty text, no choice) keeps `disabled` while it is not busy.
 *  Spread the props on the button and draw `busyLabel` as its text. */
export function busyButton(o: { busy: boolean; disabled?: boolean; onPress: () => void }): {
  "aria-disabled"?: "true";
  disabled: boolean;
  onClick: () => void;
} {
  return {
    "aria-disabled": o.busy ? "true" : undefined,
    disabled: !o.busy && !!o.disabled,
    onClick: () => { if (!o.busy) o.onPress(); },
  };
}

/** The text of a busy-rule control: its gerund while busy ("Ruling…"). */
export const busyLabel = (busy: boolean, label: string, gerund: string) => (busy ? gerund : label);
