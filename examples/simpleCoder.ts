/**
 * SimpleCoder agent能力
 * 1. 獲取用戶輸入的需求 --- 用戶提供 msg， getMemories()
 * 2. 記憶用戶需求 --- Memory: getMemories()
 * 3. 編寫對應的程式碼 -- Action: WriteSimpleCode
 */

import { Action } from "metagpt/action/action";
import { Role } from "metagpt/role/role";

class WriteSimpleCode extends Action {
  promptTemplate: string;
  constructor() {
    super("WriteSimpleCode");
    this.promptTemplate = `Write a python function that can {instruction} and 
    provide two runnable test cases. 
    Return '''python your_code_here''' with No other texts,
    your code:
    `;
  }
  async run(instruction: string) {
    const prompt = this.promptTemplate.replace("{instruction}", instruction);
    const result = (await this.getResultFromLLM(prompt)) as string;
    const codeText = WriteSimpleCode.parseCode(result);
    return codeText;
  }

  static parseCode(result: string) {
    const pattern = /'''python([\s\S]*?)'''/;
    const match = result.match(pattern);
    const codeText = match ? match[1] : result;
    return codeText;
  }
}

class SimpleCoder extends Role {
  constructor() {
    super({ name: "Alice", profile: "SimpleCoder" });
    this._initActions([new WriteSimpleCode()]);
  }

  async _act() {}
}
