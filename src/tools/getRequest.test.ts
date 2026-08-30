import { test, describe, mock } from "node:test";
import assert from "node:assert/strict";

import type { PtoRequest } from "../client/afkbotClient.js";

let lastId: string | undefined;
let nextResult: PtoRequest;

mock.module("../client/afkbotClient.js", {
  namedExports: {
    getPtoRequest: async (id: string) => {
      lastId = id;
      return nextResult;
    },
  },
});

const { handleGetRequest } = await import("./getRequest.js");

describe("handleGetRequest", () => {
  test("looks up the request by the given id and returns it as JSON text", async () => {
    nextResult = {
      id: "req-42",
      employee_email: "jane@wyre.ai",
      request_type: "full_day",
      start_date: "2026-09-01",
      end_date: "2026-09-01",
      status: "approved",
      created_at: "2026-08-28T00:00:00Z",
    };

    const result = await handleGetRequest({ request_id: "req-42" });

    assert.equal(lastId, "req-42");
    assert.deepEqual(result, {
      content: [{ type: "text", text: JSON.stringify(nextResult, null, 2) }],
    });
  });
});
