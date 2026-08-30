import { test, describe, mock } from "node:test";
import assert from "node:assert/strict";

let lastArgs: [string, string | undefined] | undefined;
let nextResult: { success: boolean; message?: string };

mock.module("../client/afkbotClient.js", {
  namedExports: {
    deletePtoRequest: async (id: string, reason?: string) => {
      lastArgs = [id, reason];
      return nextResult;
    },
  },
});

const { handleCancelRequest } = await import("./cancelRequest.js");

describe("handleCancelRequest", () => {
  test("passes the request id and reason through to the client", async () => {
    nextResult = { success: true, message: "cancelled" };

    const result = await handleCancelRequest({
      request_id: "req-9",
      reason: "no longer needed",
    });

    assert.deepEqual(lastArgs, ["req-9", "no longer needed"]);
    assert.deepEqual(result, {
      content: [{ type: "text", text: JSON.stringify(nextResult, null, 2) }],
    });
  });

  test("passes undefined for an omitted reason rather than inventing one", async () => {
    nextResult = { success: true };

    await handleCancelRequest({ request_id: "req-10" });

    assert.deepEqual(lastArgs, ["req-10", undefined]);
  });
});
