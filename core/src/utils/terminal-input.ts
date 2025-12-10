import inquirer from "inquirer";

export interface ActionRequest {
  name: string;
  args: Record<string, any>;
  description?: string;
}

export interface ApprovalDecision {
  type: "approve" | "reject";
  message?: string;
}

function formatActionDetails(actionRequest: ActionRequest): string {
  const lines = [
    `Tool: ${actionRequest.name}`,
    `Arguments: ${JSON.stringify(actionRequest.args, null, 2)}`,
  ];

  if (actionRequest.description) {
    lines.push(`Description: ${actionRequest.description}`);
  }

  return lines.join("\n");
}

export async function promptForApproval(
  actionRequest: ActionRequest,
): Promise<ApprovalDecision> {
  const actionDetails = formatActionDetails(actionRequest);

  const { decision } = await inquirer.prompt([
    {
      type: "list",
      name: "decision",
      message: `Agent wants to perform this action:\n\n${actionDetails}\n\nWhat would you like to do?`,
      choices: [
        { name: "✅ Approve - Execute this action", value: "approve" },
        { name: "❌ Reject - Skip this action", value: "reject" },
        {
          name: "✏️  Reject with reason - Provide feedback to agent",
          value: "reject_with_reason",
        },
      ],
    },
  ]);

  if (decision === "approve") {
    return { type: "approve" };
  } else if (decision === "reject_with_reason") {
    const { reason } = await inquirer.prompt([
      {
        type: "input",
        name: "reason",
        message: "Enter rejection reason (this will be sent to the agent):",
        default: "Action rejected by user",
      },
    ]);
    return {
      type: "reject",
      message: reason,
    };
  } else {
    return {
      type: "reject",
      message: "Action rejected by user",
    };
  }
}

export async function promptForMultipleApprovals(
  actionRequests: ActionRequest[],
): Promise<ApprovalDecision[]> {
  const decisions: ApprovalDecision[] = [];

  for (let i = 0; i < actionRequests.length; i++) {
    const actionRequest = actionRequests[i];
    const prefix =
      actionRequests.length > 1
        ? `[Action ${i + 1}/${actionRequests.length}] `
        : "";

    const decision = await promptForApproval({
      ...actionRequest,
      description: prefix + (actionRequest.description || ""),
    });
    decisions.push(decision);
  }

  return decisions;
}
