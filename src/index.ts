#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

const apiKey = process.env.MIDDLEBRICK_API_KEY;

if (!apiKey) {
  process.stderr.write(
    "Error: MIDDLEBRICK_API_KEY environment variable is required.\n" +
      "Get your API key at: https://middlebrick.com/dashboard\n"
  );
  process.exit(1);
}

const baseUrl = process.env.MIDDLEBRICK_BASE_URL;
const server = createServer({ apiKey, baseUrl });
const transport = new StdioServerTransport();

await server.connect(transport);
