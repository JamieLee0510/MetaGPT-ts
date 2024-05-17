import { OPENAI_KEY } from "../utils/keys";
import OpenAI from "openai";

export class Action {
  name: string;
  llmClient: OpenAI;
  promptTemplate: string;
  constructor(name: string, promptTemplate?: string) {
    this.name = name;
    // TODO: current use openai sdk
    this.llmClient = new OpenAI({ apiKey: OPENAI_KEY });
    this.promptTemplate = promptTemplate
      ? promptTemplate
      : "You are a helpful assistant.";
  }

  async getResultFromLLM(prompt: string) {
    const response = await this.llmClient.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      model: "gpt-3.5-turbo",
    });
    const data = response.choices[0].message.content;
    return data;
  }

  generatePrompt(stringFlag: string) {
    return this.promptTemplate.replace(`stringFlag`, stringFlag);
  }

  async run(instruction: string): Promise<string> {
    return "hihi";
  }
}
