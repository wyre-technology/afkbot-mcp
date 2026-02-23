# CLAUDE.md

This is an MCP server that wraps the AFKBot PTO management API.

## Build & Run

```bash
npm ci && npm run build
node dist/index.js          # stdio transport
npm run dev                 # dev mode with tsx
```

## Architecture

- `src/index.ts` — MCP server entry, registers 5 tools
- `src/auth/azureAuth.ts` — MSAL client credential flow for Azure Easy Auth
- `src/client/afkbotClient.ts` — HTTP client for AFKBot REST API
- `src/tools/` — Individual tool handlers

## Key Details

- AFKBot API uses Azure Easy Auth (Entra ID)
- Auth is client credential flow — needs its own app registration
- The MCP server doesn't need Slack IDs — it works with email addresses
- Uses `@modelcontextprotocol/sdk` with stdio transport
