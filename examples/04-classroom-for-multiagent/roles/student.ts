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
      return (acc += curr);
    }, "");
    const poemText = await new WritePoem().run(allMsgText);

    // TODO: Message 除了content str之外，還需要加上 role、causeBy(todo type)等等
    const newMsg = new Message({ content: poemText });
    return newMsg;
  }
}