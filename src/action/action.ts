import { LLMType, generateLlmApi } from "src/utils/llm/generator";
import { BaseLLM } from "src/utils/llm/llm-api/base-llm";

export class Action {
  name: string;
  llmApi: BaseLLM;
  llmModel: string;
  promptTemplate: string;
  constructor(
    name: string,
    promptTemplate?: string,
    llm?: LLMType,
    llmModel?: string,
  ) {
    this.name = name;
    // TODO: current use openai sdk
    // this.llmClient = c
    this.promptTemplate = promptTemplate
      ? promptTemplate
      : "You are a helpful assistant.";

    this.llmModel = llmModel ? llmModel : "gpt-3.5-turbo";

    // TODO:
    this.llmApi = generateLlmApi(llm, { model: this.llmModel });
  }

  async getResultFromLLM(prompt: string) {
    // const response = await this.llmClient.chat.completions.create({
    //   messages: [
    //     { role: "system", content: this.promptTemplate },
    //     { role: "user", content: prompt },
    //   ],
    //   model: "gpt-3.5-turbo",
    // });
    // const data = response.choices[0].message.content;
    const result = await this.llmApi.completeChat(prompt);
    return result;
  }

  async run(instruction: string, ...args: any[]): Promise<string> {
    return "hihi";
  }
}

export class UserRequiredAction extends Action {
  constructor() {
    super("UserRequirement");
  }
}
export const UserRequiredActionFlag = "UserRequirement";
