import { StateGraph, interrupt } from "@langchain/langgraph";
import * as z from "zod";
import { Page } from "playwright";
import { BrowserFactory } from "../factory";

const LoginState = z.object({
  img: z.string().optional(),
  loginRequired: z.boolean().optional(),
  loginUrl: z.string().optional(),
  credentials: z
    .object({
      username: z.string(),
      password: z.string(),
    })
    .optional(),
});

type LoginStateType = z.infer<typeof LoginState>;

async function detectLoginNode(state: LoginStateType) {
  const page = await BrowserFactory.getPage();

  const loginDetected = await page.evaluate(() => {
    const loginIndicators = [
      'input[type="password"]',
      'input[name="password"]',
      'input[id*="password"]',
      'input[name="username"]',
      'input[name="email"]',
      'button[type="submit"]',
      'form[action*="login"]',
      'form[action*="signin"]',
    ];

    const passwordFields = document.querySelectorAll('input[type="password"]');
    const loginForms = document.querySelectorAll(
      'form[action*="login"], form[action*="signin"]',
    );

    return passwordFields.length > 0 || loginForms.length > 0;
  });

  if (!loginDetected) {
    return {
      loginRequired: false,
    };
  }

  const url = page.url();

  return {
    loginRequired: true,
    loginUrl: url,
  };
}

async function handleLoginInterruptNode(state: LoginStateType) {
  const loginUrl = state.loginUrl || "unknown";

  const userResponse = interrupt({
    action_requests: [
      {
        name: "provide_credentials",
        args: {
          username: "",
          password: "",
        },
        description: `Login required at ${loginUrl}`,
      },
    ],
    review_configs: [
      {
        action_name: "provide_credentials",
        allowed_decisions: ["edit", "approve"],
        args_schema: {
          type: "object",
          properties: {
            username: {
              type: "string",
              title: "Username or Email",
              description: "Enter your username or email address",
            },
            password: {
              type: "string",
              title: "Password",
              description: "Enter your password",
            },
          },
          required: ["username", "password"],
        },
      },
    ],
  });

  console.log(
    "Received login response:",
    JSON.stringify(userResponse, null, 2),
  );

  let credentials = null;

  if (userResponse && typeof userResponse === "object") {
    const response = userResponse as any;

    if (response.decisions && Array.isArray(response.decisions)) {
      const decision = response.decisions[0];
      if (
        (decision?.type === "approve" || decision?.type === "edit") &&
        decision.edited_action?.args
      ) {
        credentials = {
          username: decision.edited_action.args.username || "",
          password: decision.edited_action.args.password || "",
        };
      }
    }
  }

  console.log("Parsed credentials:", credentials ? "received" : "not received");

  return { credentials };
}

async function performLoginNode(state: LoginStateType) {
  console.log("Login credentials received, passing to agent for form filling");
  return {
    loginRequired: false,
    credentials: state.credentials,
  };
}

function shouldRequestCredentials(state: LoginStateType) {
  if (!state.loginRequired) {
    return "end";
  }
  return state.credentials ? "login" : "interrupt";
}

const workflow = new StateGraph(LoginState)
  .addNode("detect", detectLoginNode)
  .addNode("interrupt", handleLoginInterruptNode)
  .addNode("login", performLoginNode)
  .addEdge("__start__", "detect")
  .addConditionalEdges("detect", shouldRequestCredentials, {
    interrupt: "interrupt",
    login: "login",
    end: "__end__",
  })
  .addEdge("interrupt", "login")
  .addEdge("login", "__end__");

export const loginHandlerGraph = workflow
  .compile({ checkpointer: true })
  .withConfig({
    recursionLimit: 1000,
  });
