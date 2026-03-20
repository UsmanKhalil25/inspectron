import type { ChatOpenAI } from "@langchain/openai";
import type { ChatOllama } from "@langchain/ollama";
import type { ChatAnthropic } from "@langchain/anthropic";

import { OpenaiClient } from "./openai-client";
import { OllamaClient } from "./ollama-client";
import { AnthropicClient } from "./anthropic-client";
import { stringEnv } from "../../utils/config";

export class LlmFactory {
  private static openaiClient: OpenaiClient | null = null;
  private static ollamaClient: OllamaClient | null = null;
  private static anthropicClient: AnthropicClient | null = null;

  static getLLM(provider?: string): ChatOpenAI | ChatOllama | ChatAnthropic {
    const selectedProvider = provider || stringEnv("LLM_PROVIDER", "openai");

    if (selectedProvider === "openai") {
      if (!this.openaiClient) {
        this.openaiClient = new OpenaiClient();
      }
      return this.openaiClient.llm;
    } else if (selectedProvider === "ollama") {
      if (!this.ollamaClient) {
        this.ollamaClient = new OllamaClient();
      }
      return this.ollamaClient.llm;
    } else if (selectedProvider === "anthropic") {
      if (!this.anthropicClient) {
        this.anthropicClient = new AnthropicClient();
      }
      return this.anthropicClient.llm;
    }

    throw new Error(
      `Unknown LLM provider: ${selectedProvider}. Supported providers: openai, ollama, anthropic`,
    );
  }

  static reset(): void {
    this.openaiClient = null;
    this.ollamaClient = null;
    this.anthropicClient = null;
  }
}
