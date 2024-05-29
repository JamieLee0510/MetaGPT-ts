import { Message, Role } from "metagpt/index";
import { ReviewPoem } from "../actions/reviewPoem";
import { WritePoem } from "../actions/writePoem";

export class Teacher extends Role {
  constructor() {
    super({ name: "Wang", profile: "Teacher" });
    this.setActions([new ReviewPoem()]);
    this._watch([WritePoem]);
  }

  async _act() {
    const todo = this.roleContext.todo;
    const allMsg = this.getMemories(); // 獲取所有記憶
    const allMsgText = allMsg.reduce((acc, curr) => {
      return (acc += curr.content);
    }, "");
    const poemText = await new ReviewPoem().run(allMsgText);

    const newMsg = new Message({
      content: poemText,
      role: this.profile,
      causeBy: todo?.constructor.name,
    });
    return newMsg;
  }
}
