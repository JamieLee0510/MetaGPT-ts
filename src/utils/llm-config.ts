// llmConfig.ts

// Enum for LLMType
enum LLMType {
  OPENAI = "openai",
  ANTHROPIC = "anthropic",
  CLAUDE = "claude",
  SPARK = "spark",
  ZHIPUAI = "zhipuai",
  FIREWORKS = "fireworks",
  OPEN_LLM = "open_llm",
  GEMINI = "gemini",
  METAGPT = "metagpt",
  AZURE = "azure",
  OLLAMA = "ollama",
  QIANFAN = "qianfan",
  DASHSCOPE = "dashscope",
  MOONSHOT = "moonshot",
  MISTRAL = "mistral",
  YI = "yi",
  OPENROUTER = "openrouter",
}

// Interface for LLMConfig
interface LLMConfig {
  apiKey: string;
  apiType: LLMType;
  baseUrl: string;
  apiVersion?: string;

  model?: string;
  pricingPlan?: string;

  accessKey?: string;
  secretKey?: string;
  endpoint?: string;

  appId?: string;
  apiSecret?: string;
  domain?: string;

  maxToken: number;
  temperature: number;
  topP: number;
  topK: number;
  repetitionPenalty: number;
  stop?: string;
  presencePenalty: number;
  frequencyPenalty: number;
  bestOf?: number;
  n?: number;
  stream: boolean;
  logprobs?: boolean;
  topLogprobs?: number;
  timeout: number;

  proxy?: string;

  calcUsage: boolean;
}

// Function to validate API key
function checkLlmKey(value: string): string {
  if (!value || value === "YOUR_API_KEY") {
    throw new Error("Please set your API key in config2.yaml");
  }
  return value;
}

// Function to validate timeout
function checkTimeout(
  value: number | undefined,
  defaultTimeout: number,
): number {
  return value ?? defaultTimeout;
}

// Example usage
const LLM_API_TIMEOUT = 600;

const config: LLMConfig = {
  apiKey: "sk-",
  apiType: LLMType.OPENAI,
  baseUrl: "https://api.openai.com/v1",
  timeout: checkTimeout(undefined, LLM_API_TIMEOUT),
  maxToken: 4096,
  temperature: 0.0,
  topP: 1.0,
  topK: 0,
  repetitionPenalty: 1.0,
  presencePenalty: 0.0,
  frequencyPenalty: 0.0,
  stream: false,
  calcUsage: true,
};

try {
  config.apiKey = checkLlmKey(config.apiKey);
} catch (error: any) {
  console.error(error.message);
}

export { LLMConfig, LLMType, checkLlmKey, checkTimeout };
