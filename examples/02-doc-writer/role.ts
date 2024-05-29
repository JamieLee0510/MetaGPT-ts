import { Role, RoleReactMode, Message } from "metagpt";
import { WriteContent, WriteDirectory } from "./action";
import { DirectoryStructure } from "./type";

export class TutorialAssistant extends Role {
  name = "Stitch";
  profile = "Tutorial Assistant";
  goal = "Generate tutorial documents";
  constraints =
    "Strictly follow Markdown's syntax, with neat and standardized layout";
  language = "Chinese";

  topic = "";
  mainTitle = "";
  totalContent = "";

  constructor() {
    super({ name: "Stitch", profile: "Tutorial Assistant" });
    this.setActions([new WriteDirectory({ language: this.language })]);
    this.setReactMode(RoleReactMode.BY_ORDER);
  }

  async _act() {
    const todo = this.roleContext.todo;
    if (todo instanceof WriteDirectory) {
      const msg = this.roleContext.memory.get(1)[0];
      this.topic = msg.content;
      const directoryRes = await todo.run(msg.content);
      await this._handleDirectory(directoryRes);
      return await super.act();
    }
    const directoryContent = await todo!.run(this.topic);
    if (this.totalContent !== "") {
      this.totalContent += "\n\n\n";
    }
    this.totalContent += directoryContent;

    return new Message({ content: directoryContent });
  }

  async _handleDirectory(directoryStructure: DirectoryStructure) {
    this.mainTitle = directoryStructure.title;
    let directory = `${this.mainTitle}\n`;
    this.totalContent += `# ${this.mainTitle}`;

    const actions: WriteContent[] = [];

    for (let firstDir of directoryStructure.directory) {
      console.log(firstDir);
      actions.push(
        new WriteContent({
          language: this.language,
          directory: JSON.stringify(firstDir),
        }),
      );
    }
    console.log(actions);
    this.setActions(actions);
  }

  async act() {
    const msg = await super.act();
    console.log(this.totalContent);
    msg.content = "hihi";
    return msg;
  }
}
