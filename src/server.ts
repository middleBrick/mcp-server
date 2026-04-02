import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { MiddleBrickClient } from "@middlebrick/api-client";
import { toolDefinitions, handleToolCall } from "./tools.js";

export interface CreateServerOptions {
  apiKey: string;
  baseUrl?: string;
}

export function createServer(opts: CreateServerOptions): Server {
  const client = new MiddleBrickClient({
    apiKey: opts.apiKey,
    baseUrl: opts.baseUrl,
  });

  const server = new Server(
    { name: "middlebrick", version: "0.1.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: toolDefinitions,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    return handleToolCall(client, name, (args ?? {}) as Record<string, unknown>);
  });

  return server;
}
