#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  createPtoRequestSchema,
  handleCreatePtoRequest,
} from "./tools/createPtoRequest.js";
import { listRequestsSchema, handleListRequests } from "./tools/listRequests.js";
import { getRequestSchema, handleGetRequest } from "./tools/getRequest.js";
import {
  cancelRequestSchema,
  handleCancelRequest,
} from "./tools/cancelRequest.js";
import {
  teamCalendarSchema,
  handleTeamCalendar,
} from "./tools/teamCalendar.js";

const server = new McpServer({
  name: "afkbot-mcp",
  version: "1.0.0",
});

// Register tools
server.tool(
  "create_pto_request",
  "File a new PTO request. Handles full-day and partial-day requests. The AFKBot backend will orchestrate across Float, Outlook, Autotask, and Rootly.",
  createPtoRequestSchema,
  handleCreatePtoRequest
);

server.tool(
  "list_pto_requests",
  "List PTO requests with optional filtering by status and employee.",
  listRequestsSchema,
  handleListRequests
);

server.tool(
  "get_pto_request",
  "Get details of a specific PTO request by ID.",
  getRequestSchema,
  handleGetRequest
);

server.tool(
  "cancel_pto_request",
  "Cancel a pending or approved PTO request.",
  cancelRequestSchema,
  handleCancelRequest
);

server.tool(
  "team_calendar",
  "View who is out on a given date or date range. Shows approved PTO for the team.",
  teamCalendarSchema,
  handleTeamCalendar
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AFKBot MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
