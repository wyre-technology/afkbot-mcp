import { z } from "zod";
import { listPtoRequests } from "../client/afkbotClient.js";

export const teamCalendarSchema = {
  start_date: z.string().describe("Start date in YYYY-MM-DD format"),
  end_date: z
    .string()
    .optional()
    .describe("End date in YYYY-MM-DD format (defaults to start_date)"),
};

export async function handleTeamCalendar(params: {
  start_date: string;
  end_date?: string;
}) {
  const result = await listPtoRequests({
    start_date: params.start_date,
    end_date: params.end_date || params.start_date,
    status: "approved",
  });

  const summary = result.requests.map((r) => ({
    employee: r.employee_email || r.slack_username,
    type: r.request_type,
    start: r.start_date,
    end: r.end_date,
    details: r.details,
  }));

  return {
    content: [
      {
        type: "text" as const,
        text:
          summary.length === 0
            ? "No one is scheduled to be out during this period."
            : JSON.stringify(summary, null, 2),
      },
    ],
  };
}
