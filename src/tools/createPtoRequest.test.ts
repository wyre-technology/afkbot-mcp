import { test, describe, mock } from "node:test";
import assert from "node:assert/strict";

import type { PtoRequest, PtoRequestInput } from "../client/afkbotClient.js";

// The tool surface (index.ts registers this handler against the MCP SDK) was
// already exercised by smoke tests. What was never invoked is the handler's
// own request-shaping (end_date defaulting) and response-mapping logic. Mock
// the API client and drive the handler directly.

let lastInput: PtoRequestInput | undefined;
let nextResult: PtoRequest;

mock.module("../client/afkbotClient.js", {
  namedExports: {
    createPtoRequest: async (input: PtoRequestInput) => {
      lastInput = input;
      return nextResult;
    },
  },
});

const { handleCreatePtoRequest } = await import("./createPtoRequest.js");

describe("handleCreatePtoRequest", () => {
  test("defaults end_date to start_date when omitted", async () => {
    nextResult = {
      id: "req-1",
      employee_email: "jane@wyre.ai",
      request_type: "full_day",
      start_date: "2026-09-01",
      end_date: "2026-09-01",
      status: "pending",
      created_at: "2026-08-28T00:00:00Z",
    };

    const result = await handleCreatePtoRequest({
      employee_email: "jane@wyre.ai",
      request_type: "full_day",
      start_date: "2026-09-01",
    });

    assert.deepEqual(lastInput, {
      employee_email: "jane@wyre.ai",
      request_type: "full_day",
      start_date: "2026-09-01",
      end_date: "2026-09-01",
      start_time: undefined,
      end_time: undefined,
      details: undefined,
    });

    assert.deepEqual(result, {
      content: [{ type: "text", text: JSON.stringify(nextResult, null, 2) }],
    });
  });

  test("passes an explicit end_date and optional fields through unchanged", async () => {
    nextResult = {
      id: "req-2",
      employee_email: "jane@wyre.ai",
      request_type: "partial_day",
      start_date: "2026-09-01",
      end_date: "2026-09-03",
      start_time: "09:00",
      end_time: "13:00",
      details: "Dentist",
      status: "pending",
      created_at: "2026-08-28T00:00:00Z",
    };

    const result = await handleCreatePtoRequest({
      employee_email: "jane@wyre.ai",
      request_type: "partial_day",
      start_date: "2026-09-01",
      end_date: "2026-09-03",
      start_time: "09:00",
      end_time: "13:00",
      details: "Dentist",
    });

    assert.deepEqual(lastInput, {
      employee_email: "jane@wyre.ai",
      request_type: "partial_day",
      start_date: "2026-09-01",
      end_date: "2026-09-03",
      start_time: "09:00",
      end_time: "13:00",
      details: "Dentist",
    });

    assert.deepEqual(result, {
      content: [{ type: "text", text: JSON.stringify(nextResult, null, 2) }],
    });
  });
});
