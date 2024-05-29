import { Action } from "metagpt";

export class WritePoem extends Action {
  POEM_PROMPT_TEMPLATE = `
    Here is the historical conversation record : {msg} .
    Write a poem about the subject provided by human, Return only the content of the generated poem with NO other texts.
    If the teacher provides suggestions about the poem, revise the student's poem based on the suggestions and return.
    your poem:
    `;
  constructor() {
    super("WritePoem");
  }

  async run(msg: string) {
    const prompt = this.POEM_PROMPT_TEMPLATE.replace("{msg}", msg);
    const result = (await this.getResultFromLLM(prompt)) as string;
    return result;
  }
}
