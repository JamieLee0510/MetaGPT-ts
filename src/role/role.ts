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
import { Environment, RoleContext, RoleReactMode } from "./role-context";
import { OPENAI_KEY } from "src/utils/keys";
import { generatePrefixPrompt, generateStatePrompt } from "src/utils/prompt";
import { UserRequiredActionFlag, Action } from "src/action";

export class Role {
  name: string;
  profile: string;
  desc: string;
  goal: string;
  actions: Action[];
  roleContext: RoleContext;
  latestObservedMsg: Message | null;
  llmClient: OpenAI; // TODO: currently using OpenAI SDK
  isRecovered: boolean;

  constructor({
    name,
    profile,
    desc,
    goal,
  }: {
    name: string;
    profile: string;
    desc?: string;
    goal?: string;
  }) {
    this.name = name;
    this.profile = profile;
    this.desc = desc ? desc : "";
    this.goal = goal ? goal : "";
    this.actions = [];
    this.roleContext = new RoleContext();
    this.latestObservedMsg = null;
    this.llmClient = new OpenAI({ apiKey: OPENAI_KEY });
    this.isRecovered = false; // TODO:

    // TODO: does _watch need init default?
  }

  setActions(actionArr: Action[]) {
    // TODO: should compare with offical python version
    this.actions = [...actionArr];
  }

  setReactMode(mode: RoleReactMode) {
    this.roleContext.reactMode = mode;
  }

  async run(withMsg?: string | Array<string>) {
    let msg = null;
    // 把user msg 放到 roleContext的 message buffer å中
    if (withMsg) {
      msg = new Message({ content: "" });
      if (typeof withMsg == "string") {
        msg.content = withMsg;
      } else if (Array.isArray(withMsg)) {
        const str = withMsg.reduce((arr, curr) => {
          arr += `\n ${curr}`;
          return arr;
        }, "");
        msg.content = str;
      }
      if (!msg.causeBy) {
        msg.causeBy = UserRequiredActionFlag;
      }
      this.putMessage(msg);
    }
    // 觀察，並根據觀察結果進行「思考」和「行動」
    // 將該role所需要的message都處理，
    // 形成news；把最新的news放到 this.latestObervedMsg
    const observeResult = await this._observe();

    // 假如沒有觀察到要處理的msg，就return （waiting的狀態）
    if (observeResult <= 0) return;

    const result = await this.act(); // MetaGPT python版是寫 react()

    this.publishMsg(result);
    this.setTodo(null);

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
    if (this.roleContext.env) {
      this.roleContext.env.publishMessage(msg);
    }
  }

  /**
   * Prepare new messages for processing
   * from the message buffer and other sources.
   */
  async _observe(shouldIgoreMsg: boolean = false): Promise<number> {
    // news為初始化空array
    let news: Message[] = [];
    if (this.isRecovered && this.latestObservedMsg) {
      news = [this.latestObservedMsg];
    }
    if (!news.length) {
      news = this.roleContext.msgBuffer.popAll();
    }
    const oldMessages = shouldIgoreMsg ? [] : this.roleContext.memory.get(0);
    this.roleContext.memory.addBatch(news);

    // Filter out messages of interest.
    this.roleContext.news = news.filter((msg) => {
      const causeBy = msg.causeBy;
      const sendTo = msg.sendTo;

      if (oldMessages.includes(msg)) {
        return false;
      }

      if (causeBy && this.roleContext.watch.has(causeBy)) {
        return true;
      }
      if (sendTo && this.name === sendTo) {
        return true;
      }

      return false;
    });

    // record the latest oberved msg
    this.latestObservedMsg = this.roleContext.news.length
      ? this.roleContext.news[this.roleContext.news.length - 1]
      : null;

    return this.roleContext.news.length;
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
      //TODO: context related
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

      result = await this._act();
      actionCounts++;
    }

    // return the output from the last action
    return result;
  }

  async _actByOrder() {
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
    let reactPrompt = this._getPrefix();
    reactPrompt += generateStatePrompt({
      history: JSON.stringify(this.roleContext.history()),
      previousState: "",
      states: `\n ${this.actions.length}`,
      nStates: `\n ${this.actions.length - 1}`,
    });

    // state 會是數字
    const nextState = await this.llmClient.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: reactPrompt },
      ],
      model: "gpt-3.5-turbo",
    });
  }

  // might overwrite while Instantiating
  async _act(): Promise<Message> {
    const previousHistory = this.roleContext.history();
    const contextStr = JSON.stringify(
      previousHistory.map(
        (historyMsg) => `${historyMsg.role}:${historyMsg.content}`,
      ),
    );
    const todo = this.roleContext.todo as Action;
    const result = await todo.run(contextStr);

    // TODO: Message & ActionNode

    const newMsg = new Message({
      content: result,
      causeBy: todo.constructor.name,
    });
    return newMsg;
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

  _getPrefix() {
    if (this.desc) return this.desc;
    let prefix = generatePrefixPrompt({
      profile: this.profile,
      name: this.name,
      goal: this.goal,
    });

    // TODO: this.constraints && this.roleContext.env && this.roleContext.env.desc

    return prefix;
  }
}
