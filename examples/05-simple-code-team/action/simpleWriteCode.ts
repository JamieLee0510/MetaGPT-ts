import { Action } from "metagpt";
import { CodeParser } from "metagpt/utils/code-parser";
import {
  markdownCodeBlockStart,
  markdownCodeBlockEnd,
} from "metagpt/utils/common";

const PROMPT_TEMPLATE = `
Write a python function that can {instruction}.
Return ${markdownCodeBlockStart}python  your_code_there ${markdownCodeBlockEnd} with NO other texts.
your code:
`;

/**
 * The Action of writing code
 */
export class SimpleWriteCode extends Action {
  constructor() {
    super("SimpleWriteCode");
  }

  async run(instructure: string) {
    const prompt = PROMPT_TEMPLATE.replace("{instruction}", instructure);
    const result = (await this.getResultFromLLM(prompt)) as string;
    const code = SimpleWriteCode.parseCode(result);
    return code;
  }

  static parseCode(result: string) {
    const pattern = /```python([\s\S]*?)```/;
    const match = result.match(pattern);
    const codeText = match ? match[1] : result;
    return codeText;
  }
}
