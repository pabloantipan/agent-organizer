import { describe, expect, it, vi } from "vitest";

// leftovers-67 V3 (FR-5) at the store: the map's place is per initiative,
// session only, and setting it is not a navigation.
vi.mock("../hooks/useWails", () => ({ api: {} }));
const { useBoard } = await import("./board.store");

describe("V3: mapPlace", () => {
  it("starts empty and keeps one place per initiative", () => {
    expect(useBoard.getState().mapPlace).toEqual({});
    const a = { level: "modules", container: "harbor_api", picks: { "modules:harbor_api": "harbor_api__booking" }, containersSeen: true };
    const b = { level: "context", picks: {}, containersSeen: false };
    useBoard.getState().setMapPlace("harbor", a);
    useBoard.getState().setMapPlace("elenx", b);
    expect(useBoard.getState().mapPlace).toEqual({ harbor: a, elenx: b });
    useBoard.getState().setMapPlace("harbor", { ...a, picks: {} });
    expect(useBoard.getState().mapPlace.elenx).toBe(b);
    expect(useBoard.getState().mapPlace.harbor.picks).toEqual({});
  });
  it("is not a navigation: the screen, the sub-view and an open Review stay", () => {
    const review = { back: { screen: "initiative", selectedInitiative: "harbor", sub: "work", card: {} } } as never;
    useBoard.setState({ screen: "initiative", sub: "roadmap", review });
    useBoard.getState().setMapPlace("harbor", { level: "containers", picks: {}, containersSeen: true });
    expect(useBoard.getState()).toMatchObject({ screen: "initiative", sub: "roadmap", review });
  });
  it("is never written to browser storage", () => {
    const writes: string[] = [];
    const ls = { getItem: () => null, setItem: (k: string) => writes.push(k), removeItem: () => undefined };
    vi.stubGlobal("localStorage", ls);
    useBoard.getState().setMapPlace("harbor", { level: "context", picks: {}, containersSeen: true });
    vi.unstubAllGlobals();
    expect(writes).toEqual([]);
  });
});
