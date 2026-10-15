import { describe, expect, it, vi } from "vitest";
import { busyButton, busyLabel } from "./busy";

// leftovers-34 F2 (FR-2, launch-progress L27): the busy rule's helper. Node
// has no DOM, so focus is read off a stand-in that does what WebKit does: a
// button that turns `disabled` while focused drops focus to the body; an
// `aria-disabled` one keeps it. The live press is F3.

/** A stand-in button and document: `apply` sets the props a render gives. */
export function standIn(label: string) {
  const body = { tag: "body" };
  const doc = { activeElement: body as unknown, body };
  const el = {
    label,
    attrs: {} as Record<string, unknown>,
    focus: () => { if (!el.attrs.disabled) doc.activeElement = el; },
    apply: (p: Record<string, unknown>) => {
      el.attrs = p;
      if (p.disabled && doc.activeElement === el) doc.activeElement = body;
    },
  };
  return { doc, el, body };
}

describe("F2: busyButton, the busy rule's props and guarded handler", () => {
  it("not busy: no aria-disabled, the press goes through, the label is the verb", () => {
    const onPress = vi.fn();
    const p = busyButton({ busy: false, onPress });
    expect(p["aria-disabled"]).toBeUndefined();
    expect(p.disabled).toBe(false);
    p.onClick();
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(busyLabel(false, "Rule", "Ruling…")).toBe("Rule");
  });

  it("busy with a pending call: aria-disabled, never disabled, the gerund, a second press ignored, focus kept", () => {
    const { doc, el } = standIn("Rule");
    let busy = false;
    const call = vi.fn(() => new Promise<void>(() => undefined)); // the service never answers
    const onPress = () => { busy = true; void call(); };
    el.apply(busyButton({ busy, onPress }));
    el.focus();
    busyButton({ busy, onPress }).onClick(); // the press
    const p = busyButton({ busy, onPress }); // the render after it
    el.apply(p);
    expect(p["aria-disabled"]).toBe("true");
    expect(p.disabled).toBe(false);
    expect(busyLabel(busy, "Rule", "Ruling…")).toBe("Ruling…");
    p.onClick(); // a press while busy
    p.onClick();
    expect(call).toHaveBeenCalledTimes(1);
    expect(doc.activeElement).toBe(el);
  });

  it("busy wins over another reason: still aria-disabled, not disabled, so focus stays", () => {
    const p = busyButton({ busy: true, disabled: true, onPress: () => undefined });
    expect(p["aria-disabled"]).toBe("true");
    expect(p.disabled).toBe(false);
  });

  it("disabled for another reason and not busy: keeps disabled, no aria-disabled", () => {
    const p = busyButton({ busy: false, disabled: true, onPress: () => undefined });
    expect(p.disabled).toBe(true);
    expect(p["aria-disabled"]).toBeUndefined();
  });

  it("the stand-in is honest: plain disabled drops focus to the body", () => {
    const { doc, el, body } = standIn("Start");
    el.focus();
    el.apply({ disabled: true });
    expect(doc.activeElement).toBe(body);
  });
});
