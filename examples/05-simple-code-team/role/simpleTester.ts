import { Role } from "metagpt";
import { SimpleWriteTest } from "../action/simpleWriteTest";
import { SimpleWriteCode } from "../action/simpleWriteCode";
import { SimpleWriteReview } from "../action/simpleWriteReview";
import { Message } from "metagpt/index";

export class SimpleTester extends Role {
  constructor() {
    super({ name: "Bob", profile: "SimpleTester" });
    this.setActions([new SimpleWriteTest()]);
    this._watch([SimpleWriteCode, SimpleWriteReview]);
  }

  async _act(): Promise<Message> {
    const todo = this.roleContext.todo!;

    // use all memory as context
    const messages = this.getMemories();
    const context = JSON.stringify(
      messages.map((msg) => `${msg.role}: ${msg.content}`),
    );

    const codeText = (await todo.run(context, 5)) as string;

    const msg = new Message({
      content: codeText,
      role: this.profile,
      causeBy: todo.constructor.name,
    });
    return msg;
  }
}
