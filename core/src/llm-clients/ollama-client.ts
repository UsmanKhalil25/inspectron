import { ChatOllama } from "@langchain/ollama";

import { stringEnv, numberEnv } from "../utils/config";

export class OllamaClient {
  private readonly modelName = stringEnv("OLLAMA_MODEL_NAME", "gemma3:latest");
  private readonly temperature = numberEnv("OLLAMA_MODEL_TEMPERATURE", 1);

  private readonly _llm = new ChatOllama({
    model: this.modelName,
    temperature: this.temperature,
  });

  get llm(): ChatOllama {
    return this._llm;
  }
}
