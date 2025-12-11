import type { ChatOpenAI } from "@langchain/openai";
import type { ChatOllama } from "@langchain/ollama";

import { OpenaiClient } from "../clients/llm/openai-client.js";
import { OllamaClient } from "../clients/llm/ollama-client.js";
import { stringEnv } from "../utils/config.js";

export class LLMFactory {
  private static openaiClient: OpenaiClient | null = null;
  private static ollamaClient: OllamaClient | null = null;

  static getLLM(provider?: string): ChatOpenAI | ChatOllama {
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
    }

    throw new Error(
      `Unknown LLM provider: ${selectedProvider}. Supported providers: openai, ollama`,
    );
  }

  static reset(): void {
    this.openaiClient = null;
    this.ollamaClient = null;
  }
}
