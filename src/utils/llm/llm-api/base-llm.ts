//TODO: need to consider observing

export abstract class BaseLLM {
  systemPrompt = "You are a helpful assistant.";
  abstract model: string;

  abstract completeChat(prompt: string): Promise<string>;

  abstract completeStreamChat(prompt: string): any; // TODO: stream result type
}
