import { Action } from "metagpt/index";
import {
  markdownCodeBlockStart,
  markdownCodeBlockEnd,
} from "metagpt/utils/common";

const PROMPT_TEMPLATE = `
Context: {context}
Write {k} unit tests using pytest for the given function, assuming you have imported it.
Return ${markdownCodeBlockStart}python your_code_here ${markdownCodeBlockEnd} with NO other texts,
your code:
`;

/**
 * The Action of writing code tests.
 */
export class SimpleWriteTest extends Action {
  constructor() {
    super("SimpleWriteTest");
  }

  async run(context: string, k = 3) {
    const prompt = PROMPT_TEMPLATE.replace("{context}", context).replace(
      "{k}",
      k.toString(),
    );
    const result = (await this.getResultFromLLM(prompt)) as string;
    const codeText = SimpleWriteTest.parseCode(result);
    return codeText;
  }

  static parseCode(result: string) {
    const pattern = /```python([\s\S]*?)```/;
    const match = result.match(pattern);
    const codeText = match ? match[1] : result;
    return codeText;
  }
}
