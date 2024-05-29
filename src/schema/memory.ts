import { Message } from "./message";

export class Memory {
  storage: Message[];
  index: Map<string, Message[]>;

  constructor() {
    this.storage = [];
    this.index = new Map<string, Message[]>();
  }

  get(k: number): Message[] {
    return k === 0 ? [...this.storage] : this.storage.slice(-k);
  }

  add(msg: Message) {
    if (this.storage.includes(msg)) return;
    this.storage.push(msg);
    if (msg.causeBy) {
      const oldMessages = this.index.get(msg.causeBy);
      if (oldMessages && oldMessages.length) {
        this.index.set(msg.causeBy, [...oldMessages, msg]);
      } else {
        this.index.set(msg.causeBy, [msg]);
      }
    }
  }

  addBatch(messages: Message[]) {
    messages.forEach((msg) => this.add(msg));
  }
}
