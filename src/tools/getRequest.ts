import { z } from "zod";
import { getPtoRequest } from "../client/afkbotClient.js";

export const getRequestSchema = {
  request_id: z.string().describe("The PTO request ID to retrieve"),
};

export async function handleGetRequest(params: { request_id: string }) {
  const result = await getPtoRequest(params.request_id);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
