import { Action } from "metagpt";

export class ReviewPoem extends Action {
  REVIEW_TEMPLATE_PROMPT = `
    Here is the historical conversation record : {msg} .
    Check student-created poems about the subject provided by human and give your suggestions for revisions. You prefer poems with elegant sentences and retro style.
    Return only your comments with NO other texts.
    your comments:
    `;
  constructor() {
    super("ReviewPoem");
  }

  async run(msg: string) {
    const prompt = this.REVIEW_TEMPLATE_PROMPT.replace("{msg}", msg);
    const result = (await this.getResultFromLLM(prompt)) as string;
    return result;
  }
}
