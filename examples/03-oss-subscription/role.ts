import { Role } from "metagpt/role/role";
import { AnalysisOSSTrending } from "./actions/analysis-oss-trending";
import { CrawlOSSTrending } from "./actions/crawl-oss-trend";
import { RoleReactMode } from "metagpt/role/role-context";
import { Message } from "metagpt/schema/message";

export class OssWatcher extends Role {
  constructor() {
    super({ name: "Codey", profile: "OssWatcher" });
    this.setActions([new CrawlOSSTrending(), new AnalysisOSSTrending()]);
    this.setReactMode(RoleReactMode.BY_ORDER);
  }

  async _act(): Promise<Message> {
    const todo = this.roleContext.todo;
    let msg = this.getMemories(1)[0];

    const result = await todo!.run(msg.content);
    msg = new Message(result);
    //this.roleContext.memory.add(msg)

    return msg;
  }
}
