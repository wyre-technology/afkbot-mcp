import { z } from "zod";
import { listPtoRequests } from "../client/afkbotClient.js";

export const listRequestsSchema = {
  status: z
    .enum(["pending", "approved", "declined", "all"])
    .optional()
    .describe("Filter by status (default: all)"),
  employee_email: z
    .string()
    .email()
    .optional()
    .describe("Filter by employee email"),
  limit: z.number().optional().describe("Max results to return (default: 25)"),
  offset: z.number().optional().describe("Offset for pagination"),
};

export async function handleListRequests(params: {
  status?: string;
  employee_email?: string;
  limit?: number;
  offset?: number;
}) {
  const result = await listPtoRequests({
    status: params.status === "all" ? undefined : params.status,
    employee_email: params.employee_email,
    limit: params.limit || 25,
    offset: params.offset,
  });

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
