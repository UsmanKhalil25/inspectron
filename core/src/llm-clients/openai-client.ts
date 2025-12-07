import OpenAI from "openai";

export class OpenaiClient {
  private apiKey: string;
  private modelName: string;
  private client: OpenAI;

  constructor() {
    this.apiKey = this.getApiKey();
    this.modelName = this.getModelName();
    this.client = new OpenAI({ apiKey: this.apiKey });
  }

  private getApiKey(): string {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Environment variable 'OPENAI_API_KEY' is not set.");
    }
    return apiKey;
  }

  private getModelName(): string {
    return process.env.OPENAI_MODEL_NAME ?? "gpt-4o-mini";
  }

  async generate(prompt: string): Promise<void> {
    const response = await this.client.chat.completions.create({
      model: this.modelName,
      messages: [{ role: "user", content: prompt }],
    });
    console.log(response.choices[0].message?.content);
  }
}
