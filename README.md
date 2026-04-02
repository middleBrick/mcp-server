# @middlebrick/mcp-server

[MCP](https://modelcontextprotocol.io) server for [middleBrick](https://middlebrick.com) API security scanning. Lets AI assistants (Claude, Cursor, etc.) scan APIs for vulnerabilities via tool calls.

## Setup

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "middlebrick": {
      "command": "npx",
      "args": ["-y", "@middlebrick/mcp-server"],
      "env": {
        "MIDDLEBRICK_API_KEY": "mb_your_key_here"
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "middlebrick": {
      "command": "npx",
      "args": ["-y", "@middlebrick/mcp-server"],
      "env": {
        "MIDDLEBRICK_API_KEY": "mb_your_key_here"
      }
    }
  }
}
```

Get your API key at: [middlebrick.com/dashboard](https://middlebrick.com/dashboard)

## Tools

| Tool | Description |
|------|-------------|
| `scan_api` | Scan an API endpoint for security vulnerabilities |
| `get_scan` | Get results of a previous scan |
| `list_scans` | List previous scans |

### scan_api

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | API endpoint URL |
| `method` | string | No | HTTP method (default: GET) |

### get_scan

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `scanId` | string | Yes | Scan ID to retrieve |

### list_scans

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | No | Max results |
| `offset` | number | No | Skip count |
| `status` | string | No | Filter: queued, processing, completed, failed |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MIDDLEBRICK_API_KEY` | Yes | API key |
| `MIDDLEBRICK_BASE_URL` | No | API URL override |

## License

Apache 2.0 — [middleBrick](https://middlebrick.com)
