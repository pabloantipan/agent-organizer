import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { merge } from "../../wailsjs/go/models";

// review-map v3 FR-29 (A4): Open the thread lands on Conversations with the
// review's thread, and `← Review` returns to the same symbol. The real
// store, with the bindings stubbed; SlackView's ← Review as drawn.

vi.mock("../hooks/useWails", () => ({ api: {} }));
const { useBoard } = await import("../stores/board.store");
const { ReviewBack } = await import("./SlackView");

const card = { initiative_id: "init-a", slug: "rv-fixture", title: "Review fixture", local: true } as unknown as merge.BoardCard;

describe("A4 (FR-29): Open the thread, then ← Review", () => {
  it("lands on the thread in Conversations and returns to the same symbol", () => {
    const st = useBoard.getState;
    st().openInitiative("init-a", "work");
    st().openReview(card);
    st().setReviewPlace({ head: "2bd87db", symbol: "go:example.com/inita/svc.Greet" });
    // Review's Open the thread
    st().openSlack("init-a", null, "01THREAD");
    expect(st().review).toBeNull();
    expect(st().screen).toBe("initiative");
    expect(st().sub).toBe("conversations");
    expect(st().selectedInitiative).toBe("init-a");
    expect(st().slackDraft).toEqual({ threadId: "01THREAD" });
    expect(st().reviewBack).toMatchObject({ initiative: "init-a", card: "rv-fixture", head: "2bd87db", symbol: "go:example.com/inita/svc.Greet" });
    // Conversations' header offers ← Review
    const h = renderToStaticMarkup(<ReviewBack initiative="init-a" reviewBack={st().reviewBack} onBack={() => undefined} />);
    expect(h).toBe('<button class="ghost" data-review-back="true">← Review</button>');
    st().backToReview();
    expect(st().review).toMatchObject({ initiative: "init-a", card: "rv-fixture", head: "2bd87db", symbol: "go:example.com/inita/svc.Greet" });
    expect(st().review?.back.sub).toBe("work");
    expect(st().reviewBack).toBeNull();
    // ← Card from there still goes back to the card back
    st().closeReview();
    expect(st().sub).toBe("work");
    expect(st().reviewReturn).toBe("init-a/rv-fixture");
  });
  it("no ← Review when Conversations was not opened from the review, or once left", () => {
    const st = useBoard.getState;
    st().openSlack("init-a", "fse");
    expect(st().reviewBack).toBeNull();
    expect(renderToStaticMarkup(<ReviewBack initiative="init-a" reviewBack={null} onBack={() => undefined} />)).toBe("");
    st().openReview(card);
    st().openSlack("init-a", null, "01THREAD");
    expect(st().reviewBack).not.toBeNull();
    // another initiative's Conversations does not offer it
    expect(renderToStaticMarkup(<ReviewBack initiative="init-b" reviewBack={st().reviewBack} onBack={() => undefined} />)).toBe("");
    // any navigation by screen drops it
    st().openInitiative("init-a", "work");
    expect(st().reviewBack).toBeNull();
  });
});
