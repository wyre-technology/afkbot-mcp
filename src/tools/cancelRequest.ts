import { z } from "zod";
import { deletePtoRequest } from "../client/afkbotClient.js";

export const cancelRequestSchema = {
  request_id: z.string().describe("The PTO request ID to cancel"),
  reason: z.string().optional().describe("Reason for cancellation"),
};

export async function handleCancelRequest(params: {
  request_id: string;
  reason?: string;
}) {
  const result = await deletePtoRequest(params.request_id, params.reason);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
