# afkbot-mcp

MCP server for AFKBot PTO management — file time-off requests from any MCP client.

## Architecture

```
┌──────────────┐     stdio      ┌──────────────┐    HTTPS     ┌──────────────┐
│  MCP Client  │◄──────────────►│ afkbot-mcp   │◄────────────►│  AFKBot API  │
│ (Claude, etc)│                │  MCP Server   │   Bearer JWT │ (Azure ACA)  │
└──────────────┘                └──────────────┘              └──────┬───────┘
                                                                     │
                                                    ┌────────┬───────┼────────┐
                                                    │        │       │        │
                                                  Float  Outlook  Autotask  Rootly
```

AFKBot orchestrates PTO requests across Float, Outlook Calendar, Autotask, and Rootly. This MCP server wraps its REST API so any MCP-compatible client can file and manage time-off requests.

## Quick Start

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AZURE_TENANT_ID` | Yes | Azure AD tenant ID (`d92c73a4-ccc2-4277-8c5d-73c2849adfa4`) |
| `AZURE_CLIENT_ID` | Yes | Your MCP server's app registration client ID |
| `AZURE_CLIENT_SECRET` | Yes | Your MCP server's app registration client secret |
| `AFKBOT_API_URL` | No | AFKBot API URL (defaults to production) |
| `AFKBOT_APP_CLIENT_ID` | No | AFKBot Easy Auth client ID (defaults to production) |

### Run Locally

```bash
npm ci
npm run build
node dist/index.js
```

### Run with Docker

```bash
docker compose up --build
```

### Claude Desktop / Claude Code Config

```json
{
  "mcpServers": {
    "afkbot": {
      "command": "node",
      "args": ["/path/to/afkbot-mcp/dist/index.js"],
      "env": {
        "AZURE_TENANT_ID": "d92c73a4-ccc2-4277-8c5d-73c2849adfa4",
        "AZURE_CLIENT_ID": "your-app-client-id",
        "AZURE_CLIENT_SECRET": "your-app-client-secret"
      }
    }
  }
}
```

## Available Tools

### `create_pto_request`

File a new PTO request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `employee_email` | string | Yes | Employee email address |
| `request_type` | string | Yes | `full_day` or `partial_day` |
| `start_date` | string | Yes | Start date (YYYY-MM-DD) |
| `end_date` | string | No | End date (defaults to start_date) |
| `start_time` | string | No | Start time for partial day (HH:MM) |
| `end_time` | string | No | End time for partial day (HH:MM) |
| `details` | string | No | Reason or notes |

### `list_pto_requests`

List PTO requests with optional filters.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | `pending`, `approved`, `declined`, or `all` |
| `employee_email` | string | No | Filter by employee |
| `limit` | number | No | Max results (default: 25) |
| `offset` | number | No | Pagination offset |

### `get_pto_request`

Get details of a specific request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `request_id` | string | Yes | The PTO request ID |

### `cancel_pto_request`

Cancel a pending or approved request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `request_id` | string | Yes | The PTO request ID |
| `reason` | string | No | Reason for cancellation |

### `team_calendar`

View who's out on a given date range.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start_date` | string | Yes | Start date (YYYY-MM-DD) |
| `end_date` | string | No | End date (defaults to start_date) |

## Auth Setup

This MCP server authenticates to AFKBot using Azure AD client credentials. You need to create an app registration:

1. **Create an App Registration** in Azure AD (Entra ID)
   - Go to Azure Portal → Entra ID → App registrations → New registration
   - Name: `afkbot-mcp` (or your choice)
   - Supported account types: Single tenant

2. **Create a Client Secret**
   - In the app registration → Certificates & secrets → New client secret
   - Copy the secret value

3. **Grant API Permissions**
   - In the app registration → API permissions → Add a permission
   - Select "APIs my organization uses" → search for AFKBot (`17963178-bee5-4738-82a3-088e739bb95b`)
   - Add the appropriate permissions
   - Grant admin consent

4. **Set Environment Variables** using the values from the app registration

## WYRE Ecosystem

This is part of the WYRE Technology MCP server suite:

- **[autotask-mcp](https://github.com/wyre-technology/autotask-mcp)** — Kaseya Autotask PSA integration
- **afkbot-mcp** (this repo) — PTO management via AFKBot

## License

MIT — Copyright (c) 2025 Aaron Sachs
