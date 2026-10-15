import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

// R4 (leftovers-35 FR-3, U5): a new thread or a branch that was sent
// (PostToCell returned an id) and that the feed has not listed after
// LIST_WAIT_MS lets Send go: the form clears, the live region says the one
// sentence, focus goes to the docked box's field, and a later listing moves
// nothing. Vitest runs in Node with no DOM library (Busy.controls.test says
// why), so the form is a server render whose Send press is captured, the
// timers are faked, and the parent's effects are the exported pieces they
// run: `sentWatch` (wait, land or let go), `letGoUnlisted` (clear, say,
// focus) and the live region's own `speaker`.

const h = vi.hoisted(() => ({
  calls: [] as { busy: boolean; onPress: () => void }[],
  api: {} as Record<string, ReturnType<typeof vi.fn>>,
}));

vi.mock("../lib/busy", async (orig) => {
  const real = await orig<typeof import("../lib/busy")>();
  return { ...real, busyButton: (o: { busy: boolean; onPress: () => void }) => { h.calls.push(o); return real.busyButton(o); } };
});
vi.mock("../hooks/useWails", () => ({
  api: new Proxy({}, { get: (_t, name: string) => (h.api[name] ??= vi.fn(async () => ({}))) }),
}));
vi.mock("../stores/board.store", () => {
  const state = {};
  return { useBoard: Object.assign((sel?: (s: unknown) => unknown) => (sel ? sel(state) : state), { getState: () => state, setState: () => undefined }) };
});

vi.mock("../lib/drafts", async (orig) => {
  const real = await orig<typeof import("../lib/drafts")>();
  return { ...real, useDraft: () => undefined };
});

const { NewThread, sentWatch, letGoUnlisted, SENT_UNLISTED } = await import("./Conversation");
const { LIST_WAIT_MS } = await import("../lib/listWait");
const { speaker, SAY_GAP_MS } = await import("../lib/liveRegion");

type El = { name: string; focus: () => void; contains?: (x: unknown) => boolean; querySelector?: (q: string) => El | null };
function dom() {
  const body = { name: "BODY" };
  const doc = { activeElement: body as unknown, body };
  const el = (name: string): El => { const e: El = { name, focus: () => { doc.activeElement = e; } }; return e; };
  const field = el("docked field");
  const send = el("Branch");
  const dock = { ...el("dock"), contains: (x: unknown) => x === field || x === send, querySelector: (q: string) => (q.startsWith("textarea") ? field : null) };
  return { doc, body, field, send, dock };
}

beforeEach(() => { vi.useFakeTimers(); h.calls = []; for (const k of Object.keys(h.api)) delete h.api[k]; });
afterEach(() => { vi.useRealTimers(); });

describe("R4: a sent thread the feed never lists lets Send go (leftovers-35 FR-3)", () => {
  it("Send not busy, form cleared, the region's words exact, focus on the docked field; a late listing moves nothing", async () => {
    const { doc, body, field, send, dock } = dom();
    let said = "";
    const { say } = speaker((m) => { said = m; });
    const land = vi.fn();
    const clear = vi.fn();
    const watch = sentWatch({ land, letGo: () => letGoUnlisted(doc as never, dock as never, clear, say) });

    // Branch is pressed with focus on it; the fake PostToCell returns an id.
    h.api.postToCell = vi.fn(async () => ({ thread_id: "t9" }));
    let done: string | null = null;
    renderToStaticMarkup(<NewThread initiativeId="init-a" draftKey="k" seats={["po_a"]} to="po_a" subject="re: the rail" body="quote" onDone={(tid) => { done = tid; }} />);
    send.focus();
    h.calls[h.calls.length - 1].onPress();
    await vi.advanceTimersByTimeAsync(0);
    expect(h.api.postToCell).toHaveBeenCalledTimes(1);
    expect(done).toBe("t9");
    watch.sent(done!);

    // The feed moves without it; until LIST_WAIT_MS nothing lets go.
    watch.feed(["t1", "t2"]);
    await vi.advanceTimersByTimeAsync(LIST_WAIT_MS - 1);
    expect(clear).not.toHaveBeenCalled();
    expect(doc.activeElement).toBe(send);

    await vi.advanceTimersByTimeAsync(1);
    expect(clear).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(SAY_GAP_MS);
    expect(said).toBe("Sent. The thread shows when the feed lists it.");
    expect(doc.activeElement).toBe(field);
    expect(doc.activeElement).not.toBe(body);

    // Cleared is a remount: a fresh form, Send not busy, its fields empty.
    h.calls = [];
    const fresh = renderToStaticMarkup(<NewThread initiativeId="init-a" draftKey="k" seats={["po_a"]} to="" onDone={() => undefined} />);
    expect(h.calls[h.calls.length - 1].busy).toBe(false);
    expect(fresh).not.toMatch(/Sending…/);
    expect(fresh).toMatch(/aria-label="Subject"[^>]*value=""|value=""[^>]*aria-label="Subject"/);
    expect(fresh).toMatch(/<textarea[^>]*><\/textarea>/);

    // The thread shows later: no landing, focus stays where it is.
    watch.feed(["t1", "t2", "t9"]);
    await vi.advanceTimersByTimeAsync(LIST_WAIT_MS);
    expect(land).not.toHaveBeenCalled();
    expect(doc.activeElement).toBe(field);
    expect(clear).toHaveBeenCalledTimes(1);

    // Never "failed", in the region or the form.
    expect(SENT_UNLISTED).not.toMatch(/fail/i);
    expect(said + fresh).not.toMatch(/fail/i);
  });

  it("a thread listed in time lands, and nothing lets go after", async () => {
    const land = vi.fn();
    const letGo = vi.fn();
    const watch = sentWatch({ land, letGo });
    watch.sent("t9");
    await vi.advanceTimersByTimeAsync(LIST_WAIT_MS - 1);
    watch.feed(["t9"]);
    expect(land).toHaveBeenCalledWith("t9");
    await vi.advanceTimersByTimeAsync(LIST_WAIT_MS);
    expect(letGo).not.toHaveBeenCalled();
  });

  it("focus that left the dock is not taken back", async () => {
    const { doc, field, dock } = dom();
    const elsewhere = { name: "rail row", focus: () => undefined };
    doc.activeElement = elsewhere;
    let said = "";
    letGoUnlisted(doc as never, dock as never, () => undefined, speaker((m) => { said = m; }).say);
    await vi.advanceTimersByTimeAsync(SAY_GAP_MS);
    expect(said).toBe(SENT_UNLISTED);
    expect(doc.activeElement).toBe(elsewhere);
    expect(doc.activeElement).not.toBe(field);
  });
});
