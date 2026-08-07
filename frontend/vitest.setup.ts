// Minimal in-memory localStorage so service modules that guard on
// `typeof window === "undefined"` exercise their real storage logic.
const store = new Map<string, string>();

const localStorageMock = {
  getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
  setItem: (key: string, value: string) => {
    store.set(key, String(value));
  },
  removeItem: (key: string) => {
    store.delete(key);
  },
  clear: () => store.clear(),
  key: (i: number) => Array.from(store.keys())[i] ?? null,
  get length() {
    return store.size;
  },
};

// @ts-expect-error minimal window stub for node test env
globalThis.window = { localStorage: localStorageMock };