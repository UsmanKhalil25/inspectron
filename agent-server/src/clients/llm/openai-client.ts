import { ChatOpenAI } from "@langchain/openai";

import { stringEnv, numberEnv } from "../../utils/config.js";

export class OpenaiClient {
  private readonly apiKey = stringEnv("OPENAI_API_KEY");
  private readonly modelName = stringEnv("OPENAI_MODEL_NAME", "gpt-4o-mini");
  private readonly temperature = numberEnv("OPENAI_MODEL_TEMPERATURE", 1);

  private readonly _llm = new ChatOpenAI({
    model: this.modelName,
    temperature: this.temperature,
    apiKey: this.apiKey,
  });

  get llm(): ChatOpenAI {
    return this._llm;
  }
}
