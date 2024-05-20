import { Memory } from "../schema/memory";
import { Message } from "../schema/message";
import { Action } from "../action/action";

interface ConfigDict {
  arbitraryTypesAllowed: boolean;
}

interface Environment {
  // Define Environment properties and methods here
}

class MessageQueue {
  // Define MessageQueue properties and methods here
}

enum RoleReactMode {
  REACT = "react", // ReAct論文的 ‘思考-行動’循環來執行，即 _think -> _act -> _think -> _act ...
  BY_ORDER = "by_order", // 照指定的Action順序執行
  PLAN_AND_ACT = "plan_and_act", //一次思考後執行多個動作，即 _think -> _act -> _act -> _act ...
}

class RoleContext {
  modelConfig: ConfigDict;
  env?: Environment; // 在Environment添加Role時，同時會設置Role對Environment的引用
  msgBuffer: Array<Message>; // 提供異步的pop/push方法，Role透過這個MessageQueue來跟其他Role進行交互
  memory: Memory; // 記憶對象。當Role執行 _act 時，會將響應結果轉換為Memory物件、放入memory中；btw，當Role執行_observe時，會將MsgBuffer裡面的所有消息轉移到Memory中
  state: number; // 紀錄Role的執行狀態， init為-1；當全部Action執行完後，也會重置為-1
  todo: Action | null; // 下一個待執行的Action。當state>=0時，會指向下一個Action
  watch: Set<string>; // 用字符串表示當前Role觀察的Action列表，（目前用在 _observe 獲取 news 時進行消息過濾）
  news: Array<Message>; // 存儲哪些在本次執行 _observe 時讀取到的於當前Role上下文相關的消息
  reactMode: RoleReactMode; // ReAct循環的模式。
  maxReactLoop: number;

  constructor() {
    this.modelConfig = { arbitraryTypesAllowed: true };
    this.env = undefined;
    this.msgBuffer = [];
    this.memory = new Memory();
    this.state = -1;
    this.todo = null;
    this.watch = new Set<string>();
    this.news = [];
    this.reactMode = RoleReactMode.REACT;
    this.maxReactLoop = 1;
  }
}

export { RoleContext, ConfigDict, Environment, MessageQueue, RoleReactMode };
