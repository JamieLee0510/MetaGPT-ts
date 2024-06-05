import ollama from "ollama";

import { BaseLLM } from "./base-llm";

// TODO: currently only in node environment
export class OllamaApi extends BaseLLM {
  model;
  constructor({ model }: { model: string; baseUrl?: string }) {
    super();
    this.model = model;
  }

  async completeChat(prompt: string, systemPrompt?: string) {
    // TODO:currently only work in node environment
    const response = await ollama.chat({
      messages: [
        {
          role: "system",
          content: systemPrompt ? systemPrompt : "You are a helpful assistant.",
        },
        { role: "user", content: prompt },
      ],
      model: this.model,
    });
    const data = response.message.content as string;
    return data;
  }

  async completeStreamChat(prompt: string) {
    return "";
  }
}
