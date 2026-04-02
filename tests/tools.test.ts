import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleToolCall } from "../src/tools.js";
import type { ScanResult, ScanListResult } from "@middlebrick/api-client";
import { MiddleBrickError } from "@middlebrick/api-client";

const completedScan: ScanResult = {
  id: "scan_abc123",
  status: "completed",
  apiUrl: "https://api.example.com/v1/users",
  method: "GET",
  createdAt: "2026-01-01T00:00:00Z",
  completedAt: "2026-01-01T00:01:00Z",
  overall: 72,
  letterGrade: "C",
  categories: { Authentication: 80 },
  findings: [],
};

const scanList: ScanListResult = {
  scans: [
    {
      id: "scan_abc123",
      apiUrl: "https://api.example.com",
      method: "GET",
      status: "completed",
      riskScore: 72,
      errorMessage: null,
      createdAt: "2026-01-01T00:00:00Z",
      completedAt: "2026-01-01T00:01:00Z",
    },
  ],
  total: 1,
  limit: 10,
  offset: 0,
};

function createMockClient() {
  return {
    scanAndWait: vi.fn().mockResolvedValue(completedScan),
    getScan: vi.fn().mockResolvedValue(completedScan),
    listScans: vi.fn().mockResolvedValue(scanList),
    scanApi: vi.fn(),
  } as any;
}

describe("handleToolCall", () => {
  let client: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    client = createMockClient();
  });

  describe("scan_api", () => {
    it("calls scanAndWait with url and method", async () => {
      await handleToolCall(client, "scan_api", {
        url: "https://api.example.com",
        method: "POST",
      });
      expect(client.scanAndWait).toHaveBeenCalledWith({
        apiUrl: "https://api.example.com",
        method: "POST",
      });
    });

    it("defaults method to GET", async () => {
      await handleToolCall(client, "scan_api", {
        url: "https://api.example.com",
      });
      expect(client.scanAndWait).toHaveBeenCalledWith({
        apiUrl: "https://api.example.com",
        method: "GET",
      });
    });

    it("returns formatted text content", async () => {
      const result = await handleToolCall(client, "scan_api", {
        url: "https://api.example.com",
      });
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("middleBrick");
      expect(result.isError).toBeUndefined();
    });

    it("returns isError on MiddleBrickError", async () => {
      client.scanAndWait.mockRejectedValue(
        new MiddleBrickError("Rate limited", 429)
      );
      const result = await handleToolCall(client, "scan_api", {
        url: "https://api.example.com",
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe("Rate limited");
    });

    it('returns "Invalid or expired API key" on 401', async () => {
      client.scanAndWait.mockRejectedValue(
        new MiddleBrickError("Unauthorized", 401)
      );
      const result = await handleToolCall(client, "scan_api", {
        url: "https://api.example.com",
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe("Invalid or expired API key");
    });

    it('returns "Invalid or expired API key" on 403', async () => {
      client.scanAndWait.mockRejectedValue(
        new MiddleBrickError("Forbidden", 403)
      );
      const result = await handleToolCall(client, "scan_api", {
        url: "https://api.example.com",
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe("Invalid or expired API key");
    });
  });

  describe("get_scan", () => {
    it("calls getScan with scanId", async () => {
      await handleToolCall(client, "get_scan", { scanId: "scan_abc123" });
      expect(client.getScan).toHaveBeenCalledWith("scan_abc123");
    });

    it("returns formatted result", async () => {
      const result = await handleToolCall(client, "get_scan", {
        scanId: "scan_abc123",
      });
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("middleBrick");
    });

    it("returns isError on error", async () => {
      client.getScan.mockRejectedValue(new Error("Network error"));
      const result = await handleToolCall(client, "get_scan", {
        scanId: "scan_abc123",
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe("Network error");
    });
  });

  describe("list_scans", () => {
    it("calls listScans with params", async () => {
      await handleToolCall(client, "list_scans", {
        limit: 5,
        offset: 10,
        status: "completed",
      });
      expect(client.listScans).toHaveBeenCalledWith({
        limit: 5,
        offset: 10,
        status: "completed",
      });
    });

    it("passes undefined when no params", async () => {
      await handleToolCall(client, "list_scans", {});
      expect(client.listScans).toHaveBeenCalledWith(undefined);
    });

    it("returns formatted list", async () => {
      const result = await handleToolCall(client, "list_scans", {});
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("middleBrick Scans");
    });
  });

  describe("unknown tool", () => {
    it("returns isError for unknown tool", async () => {
      const result = await handleToolCall(client, "nonexistent", {});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe("Unknown tool: nonexistent");
    });
  });
});
