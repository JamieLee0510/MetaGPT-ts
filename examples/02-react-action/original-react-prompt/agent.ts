import OpenAI from "openai";
import { Tool } from "./tool";
import { OPENAI_KEY } from "./const";
import { generateSysPrompt, generateToolDesc } from "./helper";
import { ChatCompletionMessageParam } from "openai/resources";

export class Agent {
  path: string;
  tool: Tool;
  systemPrompt: string;
  model: OpenAI;

  constructor(path = "") {
    this.path = path;
    this.tool = new Tool();
    this.systemPrompt = this.buildSystemInput();
    this.model = new OpenAI({ apiKey: OPENAI_KEY });
  }

  /**
   * 回傳系統prompt，增加tool和tool的藐視，讓模型可參考與調用
   */
  buildSystemInput(): string {
    const toolDescs: string[] = [];
    const toolNames: string[] = [];

    this.tool.toolConfig.forEach((tool) => {
      toolNames.push(tool["name_for_model"]);
      toolDescs.push(generateToolDesc({ ...tool }));
    });
    const toolDescsStr = toolDescs.join("\n\n");
    const toolNamesStr = toolNames.join(",");
    const sysPrompt = generateSysPrompt({ toolDescsStr, toolNamesStr });
    return sysPrompt;
  }

  /**
   * ReAct 的格式：問題、思考、行動、思考、行動
   * @param text
   */
  parseLatestPluginCall(text: string) {
    let pluginName = "";
    let pluginArgs = "";
    const i = text.lastIndexOf("\nAction:");
    const j = text.lastIndexOf("\nAction Input:");
    let k = text.lastIndexOf("\nObservation:");

    if (i >= 0 && i < j) {
      // If the text has `Action` and `Action input`,
      if (k < j) {
        // but does not contain `Observation`,
        text = text.trimEnd() + "\nObservation:"; // Add it back.
        k = text.lastIndexOf("\nObservation:");
      }
      pluginName = text.substring(i + "\nAction:".length, j).trim();
      pluginArgs = text.substring(j + "\nAction Input:".length, k).trim();
      text = text.substring(0, k);
    }

    return { pluginName, pluginArgs, text };
  }

  async callPlugin(pluginName: string, pluginArgs: string) {
    if (pluginName == "google_search") {
      return await this.tool.googleSearch(pluginArgs);
    }
  }

  async textCompletion(inputText: string, history: string[] = []) {
    const qText = `\nQuestion: ${inputText}`;
    const messages = [
      { role: "system", content: this.systemPrompt },
      { role: "user", content: qText },
    ] as ChatCompletionMessageParam[];
    // TODO: InternLM2Chat 和 OpenAI 的 SDK 入參不一樣
    const completion = await this.model.chat.completions.create({
      messages,
      model: "gpt-4",
    });
    let responseText = completion.choices[0].message.content as string;
    const { pluginName, pluginArgs, text } =
      this.parseLatestPluginCall(responseText);
    if (pluginName) {
      responseText += await this.callPlugin(pluginArgs, pluginArgs);
    }

    const newMessages = [
      ...messages,
      { role: "user", content: responseText }, // TODO: 這邊的role是要修改嗎？
    ] as ChatCompletionMessageParam[];
    const resultCompletion = await this.model.chat.completions.create({
      messages: newMessages,
      model: "gpt-4",
    });

    return resultCompletion.choices[0].message.content as string;
  }
}
