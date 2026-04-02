import type { MiddleBrickClient } from "@middlebrick/api-client";
import { MiddleBrickError } from "@middlebrick/api-client";
import { formatScanResult, formatScanList } from "./formatters.js";

export const toolDefinitions = [
  {
    name: "scan_api",
    description:
      "Scan an API endpoint for security vulnerabilities and get a risk score",
    inputSchema: {
      type: "object" as const,
      properties: {
        url: {
          type: "string",
          description: "The API endpoint URL to scan",
        },
        method: {
          type: "string",
          description: "HTTP method (default: GET)",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "get_scan",
    description: "Get results of a previous middleBrick scan by its ID",
    inputSchema: {
      type: "object" as const,
      properties: {
        scanId: {
          type: "string",
          description: "The scan ID to retrieve",
        },
      },
      required: ["scanId"],
    },
  },
  {
    name: "list_scans",
    description: "List previous middleBrick API security scans",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of scans to return",
        },
        offset: {
          type: "number",
          description: "Number of scans to skip",
        },
        status: {
          type: "string",
          description:
            "Filter by status (queued, processing, completed, failed)",
        },
      },
    },
  },
];

interface ToolCallResult {
  [key: string]: unknown;
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

export async function handleToolCall(
  client: MiddleBrickClient,
  name: string,
  args: Record<string, unknown>
): Promise<ToolCallResult> {
  try {
    switch (name) {
      case "scan_api": {
        const url = args.url as string;
        const method = (args.method as string) || "GET";
        const result = await client.scanAndWait({
          apiUrl: url,
          method,
        });
        return {
          content: [{ type: "text", text: formatScanResult(result) }],
        };
      }

      case "get_scan": {
        const scanId = args.scanId as string;
        const result = await client.getScan(scanId);
        return {
          content: [{ type: "text", text: formatScanResult(result) }],
        };
      }

      case "list_scans": {
        const params: Record<string, unknown> = {};
        if (args.limit != null) params.limit = args.limit;
        if (args.offset != null) params.offset = args.offset;
        if (args.status != null) params.status = args.status;
        const hasParams = Object.keys(params).length > 0;
        const result = await client.listScans(
          hasParams ? (params as { limit?: number; offset?: number; status?: string }) : undefined
        );
        return {
          content: [{ type: "text", text: formatScanList(result) }],
        };
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    if (error instanceof MiddleBrickError) {
      if (error.statusCode === 401 || error.statusCode === 403) {
        return {
          content: [
            { type: "text", text: "Invalid or expired API key" },
          ],
          isError: true,
        };
      }
      return {
        content: [{ type: "text", text: error.message }],
        isError: true,
      };
    }
    const message =
      error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: message }],
      isError: true,
    };
  }
}
