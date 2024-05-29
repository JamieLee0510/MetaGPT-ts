import { Memory } from "../schema/memory";
import { Message } from "../schema/message";
import { Action } from "../action/action";
import { Environment } from "../environment/environment";
import { MessageQueue } from "src/schema/message-queue";

interface ConfigDict {
  arbitraryTypesAllowed: boolean;
}

enum RoleReactMode {
  REACT = "react", // ex: _think -> _act -> _think -> _act ...
  BY_ORDER = "by_order", // ex: _act by ordery
  PLAN_AND_ACT = "plan_and_act", // ex: _think -> _act -> _act -> _act ...
}

class RoleContext {
  modelConfig: ConfigDict; // TODO: need to refer original python version
  env?: Environment; // if there is an Envirionment, Role will refer the Environment instance
  msgBuffer: MessageQueue; // providing async/sync pop and push methods. Role will interact with other roles through this.
  memory: Memory; // TODO: need to refer original python version
  state: number; // recording Role execiting situation. will be `-1` while no Action need to be executed
  todo: Action | null; // next Action which will be executed while `state >=0`
  watch: Set<string>; // for filtering msg in _observe() process
  news: Array<Message>; // in _observe() process, storing messages in this executing batch
  reactMode: RoleReactMode; // acting mode
  maxReactLoop: number;

  constructor() {
    this.modelConfig = { arbitraryTypesAllowed: true };
    this.env = undefined;
    this.msgBuffer = new MessageQueue();
    this.memory = new Memory();
    this.state = -1;
    this.todo = null;
    this.watch = new Set<string>();
    this.news = [];
    this.reactMode = RoleReactMode.REACT;
    this.maxReactLoop = 1;
  }

  history() {
    return this.memory.get(0);
  }
}

export { RoleContext, ConfigDict, Environment, RoleReactMode };
