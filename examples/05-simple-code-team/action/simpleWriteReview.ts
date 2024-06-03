import { Action } from "metagpt/index";

const PROMPT_TEMPLATE = `
Context: {context}
Review the test cases and provide on cirtical commments:
`;

/**
 * The Action of code review by providing cirtical commments
 */
export class SimpleWriteReview extends Action {
  constructor() {
    super("SimpleWriteReview");
  }

  async run(context: string) {
    const prompt = PROMPT_TEMPLATE.replace("{context}", context);
    const result = (await this.getResultFromLLM(prompt)) as string;
    return result;
  }
}
