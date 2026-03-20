import { interrupt } from "@langchain/langgraph";
import type { LoginStateType } from "./state.ts";
import { BrowserManager } from "../../../libs/index.ts";

export async function detectLoginNode(state: LoginStateType) {
  if (state.loginCompleted) {
    console.log("[Login Handler] Skipping - already completed login");
    return {
      loginRequired: false,
    };
  }

  const page = await BrowserManager.getPage();
  const currentUrl = page.url();

  if (state.credentials && state.loginUrl && currentUrl !== state.loginUrl) {
    console.log(
      "[Login Handler] URL changed after login, marking as completed",
    );
    return {
      loginRequired: false,
      loginCompleted: true,
    };
  }

  const loginDetected = await page.evaluate(() => {
    const passwordFields = document.querySelectorAll('input[type="password"]');
    if (passwordFields.length === 0) {
      return false;
    }

    const pageText = document.body.innerText.toLowerCase();
    const url = window.location.href.toLowerCase();

    const signupKeywords = [
      "sign up",
      "signup",
      "register",
      "create account",
      "join",
    ];
    const isSignupPage = signupKeywords.some((keyword) => {
      return url.includes(keyword) || pageText.includes(keyword);
    });

    if (isSignupPage) {
      if (passwordFields.length > 1) {
        return false;
      }

      const confirmPasswordField = document.querySelector(
        'input[name*="confirm" i][type="password"], input[id*="confirm" i][type="password"]',
      );
      if (confirmPasswordField) {
        return false;
      }
    }

    const loginForms = document.querySelectorAll(
      'form[action*="login" i], form[action*="signin" i]',
    );

    const loginKeywords = ["log in", "login", "sign in", "signin"];
    const hasLoginKeyword = loginKeywords.some((keyword) =>
      pageText.includes(keyword),
    );

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

export function handleLoginInterruptNode(state: LoginStateType) {
  const loginUrl = state.loginUrl || "unknown";

  const userResponse: unknown = interrupt({
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

  let credentials: { username: string; password: string } | undefined;

  if (userResponse && typeof userResponse === "object") {
    const response = userResponse as Record<string, unknown>;

    if (response.decisions && Array.isArray(response.decisions)) {
      const decision = response.decisions[0] as {
        type?: string;
        edited_action?: { args?: { username?: string; password?: string } };
      };
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

export function performLoginNode(state: LoginStateType) {
  console.log(
    "[Login Handler] Login credentials received, passing to agent for form filling",
  );
  console.log(
    "[Login Handler] NOT setting loginCompleted - agent will fill form and we'll detect completion after",
  );
  return {
    loginRequired: false,
    credentials: state.credentials,
  };
}

export function shouldRequestCredentials(state: LoginStateType) {
  if (!state.loginRequired) {
    console.log("[Login Handler] Login not required, ending");
    return "end";
  }

  if (state.credentials) {
    console.log(
      "[Login Handler] Credentials already provided, proceeding to login",
    );
    return "login";
  }

  console.log("[Login Handler] Login required, requesting credentials");
  return "interrupt";
}
