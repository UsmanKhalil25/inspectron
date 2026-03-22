import { ChatAnthropic } from "@langchain/anthropic";

import { stringEnv, numberEnv } from "../../libs/utils";

export class AnthropicClient {
  private readonly apiKey = stringEnv("ANTHROPIC_API_KEY");
  private readonly modelName = stringEnv(
    "ANTHROPIC_MODEL_NAME",
    "claude-3-haiku-20240307",
  );
  private readonly temperature = numberEnv("ANTHROPIC_MODEL_TEMPERATURE", 1);

  private readonly _llm = new ChatAnthropic({
    model: this.modelName,
    temperature: this.temperature,
    anthropicApiKey: this.apiKey,
  });

  get llm(): ChatAnthropic {
    return this._llm;
  }
}
