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
  loginCompleted: z.boolean().optional(),
});

type LoginStateType = z.infer<typeof LoginState>;

async function detectLoginNode(state: LoginStateType) {
  // Skip login detection if already logged in
  if (state.loginCompleted) {
    return {
      loginRequired: false,
    };
  }

  const page = await BrowserFactory.getPage();

  const loginDetected = await page.evaluate(() => {
    // Check for password field
    const passwordFields = document.querySelectorAll('input[type="password"]');
    if (passwordFields.length === 0) {
      return false;
    }

    // Get page text content to check for signup/register keywords
    const pageText = document.body.innerText.toLowerCase();
    const url = window.location.href.toLowerCase();

    // If it's clearly a signup/register page, exclude it
    const signupKeywords = ['sign up', 'signup', 'register', 'create account', 'join'];
    const isSignupPage = signupKeywords.some(keyword => {
      return url.includes(keyword) || pageText.includes(keyword);
    });

    if (isSignupPage) {
      // Check if there are multiple password fields (confirm password = likely signup)
      if (passwordFields.length > 1) {
        return false;
      }

      // Check for confirm password field by name/id
      const confirmPasswordField = document.querySelector(
        'input[name*="confirm" i][type="password"], input[id*="confirm" i][type="password"]'
      );
      if (confirmPasswordField) {
        return false;
      }
    }

    // Check for login-specific forms
    const loginForms = document.querySelectorAll(
      'form[action*="login" i], form[action*="signin" i]'
    );

    // Look for login-specific text near the password field
    const loginKeywords = ['log in', 'login', 'sign in', 'signin'];
    const hasLoginKeyword = loginKeywords.some(keyword => pageText.includes(keyword));

    return loginForms.length > 0 || hasLoginKeyword;
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
    loginCompleted: true,
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

// Don't pass checkpointer - subgraph will use parent's checkpointer for shared state
const compiled = workflow.compile();

export const loginHandlerGraph = compiled;