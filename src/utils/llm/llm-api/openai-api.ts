import OpenAI from "openai";
import { BaseLLM } from "./base-llm";
import { LLMType, llmClientGenerator } from "src/utils/llm/generator";
/**
 * 在 Action/Role初始化的時候，繼承/
 */

export class OpenAIApi extends BaseLLM {
  model;
  client: OpenAI;
  constructor({ model, baseUrl }: { model: string; baseUrl?: string }) {
    super();
    this.model = model;
    this.client = llmClientGenerator[LLMType.OPENAI]();
  }

  async completeChat(prompt: string, systemPrompt?: string) {
    const response = await this.client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt ? systemPrompt : "You are a helpful assistant.",
        },
        { role: "user", content: prompt },
      ],
      model: this.model,
    });
    const data = response.choices[0].message.content as string;
    return data;
  }

  async completeStreamChat(prompt: string) {
    return "";
  }
}
