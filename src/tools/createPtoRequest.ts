import { z } from "zod";
import { createPtoRequest as apiCreate } from "../client/afkbotClient.js";

export const createPtoRequestSchema = {
  employee_email: z
    .string()
    .email()
    .describe("Employee email address for the PTO request"),
  request_type: z
    .enum(["full_day", "partial_day"])
    .describe("Type of time off: full_day or partial_day"),
  start_date: z
    .string()
    .describe("Start date in YYYY-MM-DD format"),
  end_date: z
    .string()
    .optional()
    .describe("End date in YYYY-MM-DD format (defaults to start_date for single day)"),
  start_time: z
    .string()
    .optional()
    .describe("Start time in HH:MM format (for partial_day requests)"),
  end_time: z
    .string()
    .optional()
    .describe("End time in HH:MM format (for partial_day requests)"),
  details: z
    .string()
    .optional()
    .describe("Additional details or reason for the time off"),
};

export async function handleCreatePtoRequest(params: {
  employee_email: string;
  request_type: "full_day" | "partial_day";
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  details?: string;
}) {
  const result = await apiCreate({
    employee_email: params.employee_email,
    request_type: params.request_type,
    start_date: params.start_date,
    end_date: params.end_date || params.start_date,
    start_time: params.start_time,
    end_time: params.end_time,
    details: params.details,
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
