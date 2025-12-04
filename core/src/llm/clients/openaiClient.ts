import { ChatOpenAI } from "@langchain/openai";
import { OpenAIModel } from "../types";

export interface OpenAIClientConfig {
  apiKey: string;
  model: OpenAIModel;
  temperature?: number;
}

export function createOpenAIClient({
  apiKey,
  model,
  temperature = 0.7,
}: OpenAIClientConfig) {
  return new ChatOpenAI({
    modelName: model,
    openAIApiKey: apiKey,
    temperature,
  });
}
