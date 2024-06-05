import { GoogleGenerativeAI } from "@google/generative-ai";
import { BaseLLM } from "./base-llm";
import { LLMType, llmClientGenerator } from "src/utils/llm/generator";
/**
 * 在 Action/Role初始化的時候，繼承/
 */

export class GeminiAIApi extends BaseLLM {
  model;
  client: GoogleGenerativeAI;
  constructor({ model }: { model: string }) {
    super();
    this.model = model;
    this.client = llmClientGenerator[LLMType.GEMINI]();
  }

  async completeChat(prompt: string, systemPrompt?: string) {
    const model = this.client.getGenerativeModel({ model: this.model });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  }

  async completeStreamChat(prompt: string) {
    // TODO:
    return "";
  }
}
