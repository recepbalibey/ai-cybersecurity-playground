import { describe, it, expect, vi } from "vitest";
import { fetchDatasets, fetchDatasetContent } from "./aiAnalyst";

describe("aiAnalyst datasets", () => {
  it("fetchDatasets falls back to the three local datasets offline", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("offline"));
    const list = await fetchDatasets();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(3);
    const keys = list.map((d: { key: string }) => d.key);
    expect(keys).toContain("bruteforce");
    expect(keys).toContain("powershell_attack");
    expect(keys).toContain("malware_execution");
    vi.restoreAllMocks();
  });

  it("fetchDatasets prefers the backend list when reachable", async () => {
    const backend = { datasets: [{ key: "bruteforce", name: "Backend Dataset", entry_count: 9 }] };
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => backend,
    } as Response);
    const list = await fetchDatasets();
    expect(list).toEqual(backend.datasets);
    vi.restoreAllMocks();
  });

  it("fetchDatasetContent returns JSON text offline", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("offline"));
    const content = await fetchDatasetContent("bruteforce");
    expect(typeof content).toBe("string");
    expect(content).toContain("dataset_name");
    expect(content).toContain("log_entries");
    vi.restoreAllMocks();
  });
});