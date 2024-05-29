import { Role, RoleReactMode, Message } from "metagpt";
import { AnalysisOSSTrending } from "./actions/analysis-oss-trending";
import { CrawlOSSTrending } from "./actions/crawl-oss-trend";

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
    msg = new Message({ content: result });
    //this.roleContext.memory.add(msg)

    return msg;
  }
}
