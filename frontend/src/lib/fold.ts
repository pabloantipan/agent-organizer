// The initiative header's stored fold (initiative-header FR-1, FR-11,
// FR-19): one key per machine, "1" open and "0" folded. The lead's Details
// toggle writes it, and every landing writes "folded" so the next tab he
// presses keeps it folded. Storage is per viewer: when it throws or is
// missing, the header reads folded and the write is dropped.

export const HEADER_KEY = "initiative.header.open";

type Store = Pick<Storage, "getItem" | "setItem">;

const local = (): Store | undefined => {
  try { return globalThis.localStorage; } catch { return undefined; }
};

/** Whether the lead last left Details open. Folded when nothing is stored. */
export function storedHeaderOpen(store: Store | undefined = local()): boolean {
  try { return store?.getItem(HEADER_KEY) === "1"; } catch { return false; }
}

/** Store the lead's choice and return it, for the store's `headerOpen`. */
export function storeHeaderOpen(open: boolean, store: Store | undefined = local()): boolean {
  try { store?.setItem(HEADER_KEY, open ? "1" : "0"); } catch { /* per-viewer */ }
  return open;
}

/** A landing folds the header and stores "folded" as the lead's choice
 *  (FR-11); returns false for `headerOpen`. */
export function storeFolded(store: Store | undefined = local()): boolean {
  return storeHeaderOpen(false, store);
}
