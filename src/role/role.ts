/**
 * Role is basical unit ai-agent in MetaGPT，
 * while run function be triggered,
 * Role execute _observe, _think and _act(ReAct logic), and then _publish
 *
 * which means:
 * 1. After running, a agent would observe the information it could catch,
 * and then put those in its memory.
 * 2. Next step is executing thinking, and determining next action(choicing from Action1, Action2, Action3...)
 * 3. Finishing choicing next action, execute the action and get the result for this turn.
 *
 *
 */
import OpenAI from "openai";

import { Message } from "src/schema/message";
import { Action } from "src/action/action";
import { Environment, RoleContext, RoleReactMode } from "./role-context";
import { OPENAI_KEY } from "src/utils/keys";

export class Role {
  name: string;
  profile: string;
  actions: Action[]; // 等等，它是從roleContext中拿的，而不是本身的
  roleContext: RoleContext;
  latestObservedMsg: Message | null;
  llmClient: OpenAI; // TODO: 目前先用openai client

  constructor({ name, profile }: { name: string; profile: string }) {
    this.name = name;
    this.profile = profile;
    this.actions = [];
    this.roleContext = new RoleContext();
    this.latestObservedMsg = null;
    this.llmClient = new OpenAI({ apiKey: OPENAI_KEY });
  }

  setActions(actionArr: Action[]) {
    // TODO: 原本python版本有點複雜，先簡單複製（像是還需要set_llm）
    this.actions = [...actionArr];
  }

  setReactMode(mode: RoleReactMode) {
    this.roleContext.reactMode = mode;
  }

  async run(withMsg?: any) {
    let msg = null;

    // 把user msg 放到 roleContext的 message buffer å中
    if (withMsg) {
      if (typeof withMsg == "string") {
        msg = new Message({ content: withMsg });
        this.putMessage(msg);
      }
    }

    // 觀察，並根據觀察結果進行「思考」和「行動」
    // 將該role所需要的message都處理，
    // 形成news；把最新的news放到 this.latestObervedMsg
    await this._observe();

    const result = await this.act(); // MetaGPT python版是寫 react()
    // self.set_todo(None)
    // self.publish_message(rsp)

    return result;
  }

  /**
   * push message into roleContext's message buffer
   * @param msg
   */
  putMessage(msg: Message) {
    this.roleContext.msgBuffer.push(msg);
  }

  /**
   * If the role belongs to env,
   * then the role's messages will be broadcast to env
   * @param msg
   */
  publishMsg(msg: Message) {
    if (!msg) return;

    // If env does not exist, do not publish the message
    // this.roleContext.env.publishMsg(msg)
  }

  /**
   * Prepare new messages for processing
   * from the message buffer and other sources.
   */
  async _observe(): Promise<number> {
    // news為初始化空array
    // 檢查 recovered狀態，如果true，則要將最新觀察到的消息，放到news列表；
    // 如果news仍然為空，則從消息緩衝區（rolecontext.msg_buffer）彈出所有消息
    // TODO: this.recovered 相關
    const news = [...this.roleContext.msgBuffer];
    this.roleContext.msgBuffer = []; // TODO: 需要新增一個 popAll()

    this.roleContext.memory.addBatch(news);

    this.roleContext.news = news.filter((msg) => {
      const causeBy = msg.causeBy;
      const sendTo = msg.sendTo;

      // TODO: need to filter from old-messages

      if (causeBy && this.roleContext.watch.has(causeBy)) {
        return true;
      }
      if (sendTo && this.name === sendTo) {
        return true;
      }

      return false;
    });

    // 篩選，防止重複處理；同時過濾，只拿到感興趣、或者發送給當前對象的消息
    // self.rc.news = [ n for n in news if (n.cause_by in self.rc.watch or self.name in n.send_to) and n not in old_messages]
    this.latestObservedMsg = news[-1];

    // 在這個時候，roleContext中的msgBuffer已經有 user input

    // TODO: 理論上應該不用return東西？因為_observe() 應該只是觀察並操作到roleContext
    return 1;
  }

  async act() {
    let result = null;
    switch (this.roleContext.reactMode) {
      case RoleReactMode.REACT:
        result = await this._react();
        break;
      case RoleReactMode.BY_ORDER:
        result = await this._actByOrder();
      default:
        result = await this._react();
        break;
    }

    this._setState(-1); // current reaction is complete, reset state to -1

    return result as Message;
  }

  _setState(state: number) {
    // set roleContext state and todo
    this.roleContext.state = state;
    if (state >= 0) {
      this.setTodo(this.actions[state]);
    } else {
      this.setTodo(null);
    }
  }

  /**
   * Set action in todo and update context
   * @param todo
   */
  setTodo(todo: Action | null) {
    if (todo) {
      //TODO: 原本python是寫 value.context = this.context， 但不太懂
    }
    this.roleContext.todo = todo;
  }

  /**
   * Think first, then act, until the Role _think it is time to stop
   * and requires no more todo.
   * This is the standard think-act loop in the ReAct paper,
   * which alternates thinking and acting in task solving,
   * i.e. _think -> _act -> _think -> _act -> ...
   * Use llm to select actions in _think dynamically
   */
  async _react() {
    let actionCounts = 0;
    let result = null;
    while (actionCounts < this.roleContext.maxReactLoop) {
      // think
      await this._think();
      if (!this.roleContext.todo) break;

      // 執行_act(), 不過在自定義Role的時候，可能會overwrite
      result = await this._act();
      actionCounts++;
    }

    // return the output from the last action
    return result;
  }

  async _actByOrder() {
    console.log("act by order");
    const startIdx = this.roleContext.state >= 0 ? this.roleContext.state : 0;
    let resMsg = new Message({ content: "No actions taken yet" });
    for (let i = startIdx; i < this.actions.length; i++) {
      this._setState(i);
      resMsg = await this._act();
    }

    return resMsg;
  }

  /**
   * Consider what to do and decide on the next course of action.
   * Return false if nothing can be done.
   */
  async _think() {
    // 是不是，在think的時候 _setState, 然後在_setState的時候準備 roleContext的todo？
    if (this.actions.length == 1) {
      // only one Action can be performed
      this._setState(0);
      return;
    }
    // TODO: ReAct prompt engineering
    let reactPrompt = "";
  }

  // TODO: 這裡好像會被overwrite,在simple coder的例子中
  async _act(): Promise<Message> {
    const message = new Message({ content: "hihi" });
    return message;
  }

  /**
   * A wrapper to return the most recent k memories of this role,
   * return all when k=0"
   * @param k
   * @returns
   */
  getMemories(k = 0) {
    return this.roleContext.memory.get(k);
  }

  setEnv(env: Environment) {
    this.roleContext.env = env;
  }

  /**
   * Watch Actions of interest.
   * Role will select Messages caused by these Actions from its personal messages buffer
   * during _observe()
   * @param actions
   */
  _watch(actions: (new () => Action)[]) {
    actions.forEach((action) => {
      this.roleContext.watch.add(action.name);
    });
  }
}
