import { test, describe, mock } from "node:test";
import assert from "node:assert/strict";

import type { PtoRequest } from "../client/afkbotClient.js";

interface ListParams {
  status?: string;
  limit?: number;
  offset?: number;
  employee_email?: string;
  start_date?: string;
  end_date?: string;
}

let lastParams: ListParams | undefined;
let nextResult: { requests: PtoRequest[]; total?: number };

mock.module("../client/afkbotClient.js", {
  namedExports: {
    listPtoRequests: async (params?: ListParams) => {
      lastParams = params;
      return nextResult;
    },
  },
});

const { handleListRequests } = await import("./listRequests.js");

const sampleRequest: PtoRequest = {
  id: "req-1",
  employee_email: "jane@wyre.ai",
  request_type: "full_day",
  start_date: "2026-09-01",
  end_date: "2026-09-01",
  status: "pending",
  created_at: "2026-08-28T00:00:00Z",
};

describe("handleListRequests", () => {
  test('translates status "all" into an unfiltered (undefined) status', async () => {
    nextResult = { requests: [sampleRequest], total: 1 };

    await handleListRequests({ status: "all" });

    assert.equal(lastParams?.status, undefined);
    assert.equal(lastParams?.limit, 25);
  });

  test("passes a concrete status filter through unchanged", async () => {
    nextResult = { requests: [], total: 0 };

    await handleListRequests({ status: "pending" });

    assert.equal(lastParams?.status, "pending");
  });

  test("defaults limit to 25 when omitted", async () => {
    nextResult = { requests: [], total: 0 };

    await handleListRequests({});

    assert.equal(lastParams?.limit, 25);
  });

  test("passes an explicit limit, offset, and employee_email through", async () => {
    nextResult = { requests: [], total: 0 };

    await handleListRequests({
      employee_email: "jane@wyre.ai",
      limit: 5,
      offset: 10,
    });

    assert.equal(lastParams?.employee_email, "jane@wyre.ai");
    assert.equal(lastParams?.limit, 5);
    assert.equal(lastParams?.offset, 10);
  });

  test("wraps the client response as JSON text content", async () => {
    nextResult = { requests: [sampleRequest], total: 1 };

    const result = await handleListRequests({ status: "all" });

    assert.deepEqual(result, {
      content: [{ type: "text", text: JSON.stringify(nextResult, null, 2) }],
    });
  });
});
