import { loadMarkdown } from "../../../libs/utils";

export const INITIAL_AGENT_PROMPT = loadMarkdown("initial-agent-prompt.md");
export const WEB_BROWSING_AGENT_PROMPT = loadMarkdown(
  "web-browsing-agent-prompt.md",
);
export const SCREENSHOT_OBSERVATION_TEXT = loadMarkdown(
  "screenshot-observation-text.md",
);
