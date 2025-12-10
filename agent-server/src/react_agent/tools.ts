/**
 * This file defines the tools available to the ReAct agent.
 * Tools are functions that the agent can use to interact with external systems or perform specific tasks.
 */
import { tool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * Simple chat tool configuration
 * This tool allows the agent to process and respond to simple chat messages.
 */
const chatTool = tool(
  async ({ message }: { message: string }) => {
    // Simple chat tool that echoes the message with a response
    return `Received message: "${message}". This is a simple chat tool responding to your message.`;
  },
  {
    name: "chat",
    description: "A simple chat tool for processing and responding to messages. Use this when you need to process or respond to user messages.",
    schema: z.object({
      message: z.string().describe("The message to process"),
    }),
  }
);

/**
 * Export an array of all available tools
 * Add new tools to this array to make them available to the agent
 *
 * Note: You can create custom tools by implementing the Tool interface from @langchain/core/tools
 * and add them to this array.
 * See https://js.langchain.com/docs/how_to/custom_tools/#tool-function for more information.
 */
export const TOOLS = [chatTool];
