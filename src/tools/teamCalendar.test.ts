import { test, describe, mock } from "node:test";
import assert from "node:assert/strict";

import type { PtoRequest } from "../client/afkbotClient.js";

interface ListParams {
  start_date?: string;
  end_date?: string;
  status?: string;
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

const { handleTeamCalendar } = await import("./teamCalendar.js");

describe("handleTeamCalendar", () => {
  test("defaults end_date to start_date and hardcodes status=approved", async () => {
    nextResult = { requests: [] };

    await handleTeamCalendar({ start_date: "2026-09-01" });

    assert.deepEqual(lastParams, {
      start_date: "2026-09-01",
      end_date: "2026-09-01",
      status: "approved",
    });
  });

  test("passes an explicit end_date through unchanged", async () => {
    nextResult = { requests: [] };

    await handleTeamCalendar({ start_date: "2026-09-01", end_date: "2026-09-05" });

    assert.equal(lastParams?.end_date, "2026-09-05");
  });

  test("returns the no-one-out message when the client returns no requests", async () => {
    nextResult = { requests: [] };

    const result = await handleTeamCalendar({ start_date: "2026-09-01" });

    assert.deepEqual(result, {
      content: [
        { type: "text", text: "No one is scheduled to be out during this period." },
      ],
    });
  });

  test("maps requests to a trimmed summary, falling back to slack_username when employee_email is blank", async () => {
    nextResult = {
      requests: [
        {
          id: "req-1",
          employee_email: "jane@wyre.ai",
          request_type: "full_day",
          start_date: "2026-09-01",
          end_date: "2026-09-01",
          details: "Vacation",
          status: "approved",
          created_at: "2026-08-28T00:00:00Z",
        },
        {
          id: "req-2",
          employee_email: "",
          slack_username: "bob.slack",
          request_type: "partial_day",
          start_date: "2026-09-02",
          end_date: "2026-09-02",
          status: "approved",
          created_at: "2026-08-28T00:00:00Z",
        },
      ],
    };

    const result = await handleTeamCalendar({ start_date: "2026-09-01", end_date: "2026-09-02" });

    const expectedSummary = [
      {
        employee: "jane@wyre.ai",
        type: "full_day",
        start: "2026-09-01",
        end: "2026-09-01",
        details: "Vacation",
      },
      {
        employee: "bob.slack",
        type: "partial_day",
        start: "2026-09-02",
        end: "2026-09-02",
        details: undefined,
      },
    ];

    assert.deepEqual(result, {
      content: [{ type: "text", text: JSON.stringify(expectedSummary, null, 2) }],
    });
  });
});
