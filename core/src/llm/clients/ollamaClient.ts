import { ChatOllama } from "@langchain/ollama";
import { OllamaModel } from "../types";

export interface OllamaClientConfig {
  baseUrl: string;
  model: OllamaModel;
  temperature?: number;
}

export function createOllamaClient({
  baseUrl,
  model,
  temperature = 0.7,
}: OllamaClientConfig) {
  return new ChatOllama({
    baseUrl,
    model,
    temperature,
  });
}
