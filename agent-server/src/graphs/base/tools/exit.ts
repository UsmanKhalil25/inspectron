import { tool } from "@langchain/core/tools";
import * as z from "zod";

export const exit = tool(
  () => {
    return "Task marked as complete. The browser will be closed.";
  },
  {
    name: "exit",
    description:
      "Call when the task is complete and no more actions are needed. This will signal that the agent is done and ready to close the browser.",
    schema: z.object({}),
  },
);
