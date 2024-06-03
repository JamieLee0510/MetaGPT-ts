import { Action } from "metagpt";
import { CodeParser } from "metagpt/utils/code-parser";
import {
  markdownCodeBlockStart,
  markdownCodeBlockEnd,
} from "metagpt/utils/common";

const PROMPT_TEMPLATE = `
NOTICE
Role: You are a professional engineer; the main goal is to write google-style, elegant, modular, easy to read and maintain code
Language: Please use the same language as the user requirement, but the title and code should be still in English. For example, if the user speaks Chinese, the specific text of your answer should also be in Chinese.
ATTENTION: Use '##' to SPLIT SECTIONS, not '#'. Output format carefully referenced "Format example".

# Context
## Design
{design}


## Task
{task}

## Legacy Code
${markdownCodeBlockStart}Code
{code}
${markdownCodeBlockEnd}


## Debug logs
${markdownCodeBlockStart}text
{logs}

{summary_log}
${markdownCodeBlockEnd}


## Bug Feedback logs
${markdownCodeBlockStart}text
{feedback}
${markdownCodeBlockEnd}

# Format example
## Code: {filename}
${markdownCodeBlockStart}python
## {filename}
...
${markdownCodeBlockEnd}

# Instruction: Based on the context, follow "Format example", write code.

## Code: {filename}. Write code with triple quoto, based on the following attentions and context.
1. Only One file: do your best to implement THIS ONLY ONE FILE.
2. COMPLETE CODE: Your code will be part of the entire project, so please implement complete, reliable, reusable code snippets.
3. Set default value: If there is any setting, ALWAYS SET A DEFAULT VALUE, ALWAYS USE STRONG TYPE AND EXPLICIT VARIABLE. AVOID circular import.
4. Follow design: YOU MUST FOLLOW "Data structures and interfaces". DONT CHANGE ANY DESIGN. Do not use public member functions that do not exist in your design.
5. CAREFULLY CHECK THAT YOU DONT MISS ANY NECESSARY CLASS/FUNCTION IN THIS FILE.
6. Before using a external variable/module, make sure you import it first.
7. Write out EVERY CODE DETAIL, DON'T LEAVE TODO.
`;

export class WriteCode extends Action {
  constructor() {
    super("WriteCode");
  }

  /**
   * TODO: retry feature
   * @param prompt
   */
  async writeCode(prompt: string) {
    const codeResult = (await this.getResultFromLLM(prompt)) as string;
    const code = CodeParser.parseCode("", codeResult);
    return code;
  }

  async run(instructure: string) {
    const prompt = "hihi";
    const code = await this.writeCode(prompt);
    return code;
  }

  static getCodes() {}
}
