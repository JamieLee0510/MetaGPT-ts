import { Message, Role, UserRequirement } from "metagpt";
import { WritePoem } from "../actions/writePoem";
import { ReviewPoem } from "../actions/reviewPoem";

export class Student extends Role {
  constructor() {
    super({ name: "xiaoming", profile: "Student" });
    this.setActions([new WritePoem()]);
    this._watch([UserRequirement, ReviewPoem]);
  }

  async _act() {
    let todo = this.roleContext.todo;
    const allMsg = this.getMemories(); // 獲取所有記憶
    const allMsgText = allMsg.reduce((acc, curr) => {
      return (acc += curr.content);
    }, "");
    const poemText = await new WritePoem().run(allMsgText);

    const newMsg = new Message({
      content: poemText,
      role: this.profile,
      causeBy: todo?.constructor.name,
    });
    return newMsg;
  }
}
