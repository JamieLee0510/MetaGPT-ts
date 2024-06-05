import { OpenAI } from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";

import { OpenAIApi } from "./llm-api/openai-api";
import { GeminiAIApi } from "./llm-api/gemini-api";
import { OllamaApi } from "./llm-api/ollama-api";

config();

const apiKeyChecker = (llm: LLMType): string => {
  let apiKey: string | undefined = "";
  switch (llm) {
    case LLMType.OPENAI:
      apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error(`OPENAI_API_KEY key not defined in env`);
      break;
    case LLMType.GEMINI:
      apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error(`GEMINI_API_KEY key not defined in env`);
      break;
    // case LLMType.MISTRAL:
    //   apiKey = process.env.MISTRAL_API_KEY;
    //   if (!apiKey) throw new Error(`MISTRAL_API_KEY key not defined in env`);
    //   break;

    default:
      apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error(`openai key not defined in env`);
      break;
  }
  return apiKey;
};

export enum LLMType {
  OPENAI = "openai",
  GEMINI = "gemini",
  // MISTRAL = "mistral",
  OLLAMA = "ollama",
}

export const llmClientGenerator = {
  [LLMType.OPENAI]: () => {
    const apiKey = apiKeyChecker(LLMType.OPENAI);
    const client = new OpenAI({ apiKey });
    return client;
  },
  [LLMType.GEMINI]: () => {
    const apiKey = apiKeyChecker(LLMType.GEMINI);
    const client = new GoogleGenerativeAI(apiKey);
    return client;
  },
  // [LLMType.MISTRAL]: () => {
  //   const apiKey = apiKeyChecker(LLMType.MISTRAL);
  //   const client = new MistralClient(apiKey);
  //   return client;
  // },
};

export const generateLlmApi = (
  llmType: LLMType = LLMType.OPENAI,
  {
    model,
    systemPrompt,
    baseUrl,
  }: { model: string; systemPrompt?: string; baseUrl?: string },
) => {
  switch (llmType) {
    case LLMType.OPENAI:
      return new OpenAIApi({ model, baseUrl });
    case LLMType.GEMINI:
      return new GeminiAIApi({ model });
    case LLMType.OLLAMA:
      return new OllamaApi({ model });
  }
};

export const defaultLlmClient = llmClientGenerator[LLMType.OPENAI]();
