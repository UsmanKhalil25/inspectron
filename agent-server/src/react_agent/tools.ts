import { tool } from "@langchain/core/tools";
import { z } from "zod";

const chatTool = tool(
  async ({ message }: { message: string }) => {
    return `Received message: "${message}". This is a simple chat tool responding to your message.`;
  },
  {
    name: "chat",
    description:
      "A simple chat tool for processing and responding to messages. Use this when you need to process or respond to user messages.",
    schema: z.object({
      message: z.string().describe("The message to process"),
    }),
  },
);

export const TOOLS = [chatTool];
