import { describe, it, expect } from "vitest";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { createServer } from "../src/server.js";

async function listTools(server: Server) {
  const handler = (server as any)._requestHandlers.get("tools/list");
  return handler({ method: "tools/list" });
}

describe("createServer", () => {
  it("returns a Server instance", () => {
    const server = createServer({ apiKey: "mb_test_key" });
    expect(server).toBeInstanceOf(Server);
  });

  it("exposes 3 tools via tools/list", async () => {
    const server = createServer({ apiKey: "mb_test_key" });
    const result = await listTools(server);
    expect(result.tools).toHaveLength(3);
  });

  it("tool names are scan_api, get_scan, list_scans", async () => {
    const server = createServer({ apiKey: "mb_test_key" });
    const result = await listTools(server);
    const names = result.tools.map((t: any) => t.name);
    expect(names).toContain("scan_api");
    expect(names).toContain("get_scan");
    expect(names).toContain("list_scans");
  });

  it("each tool has valid inputSchema", async () => {
    const server = createServer({ apiKey: "mb_test_key" });
    const result = await listTools(server);
    for (const tool of result.tools) {
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.type).toBe("object");
    }
  });
});
