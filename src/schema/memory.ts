import { Message } from "./message";

export class Memory {
  storage: Message[];

  constructor() {
    this.storage = [];
  }

  get(k: number): Message[] {
    return k === 0 ? this.storage : this.storage.slice(-k);
  }

  addBatch(messages: Message[]) {
    messages.forEach((msg) => this.storage.push(msg));
  }
}
