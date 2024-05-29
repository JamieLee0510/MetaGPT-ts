import { Message } from "./message";

/**
 * Message queue which supports asynchronous updates.
 */
export class MessageQueue {
  private queue: Message[];
  constructor() {
    this.queue = [];
  }

  push(msg: Message) {
    this.queue.push(msg);
  }

  /**
   * Pop message from queue
   */
  pop() {
    if (this.queue.length) {
      return this.queue.pop();
    }
    return null;
  }

  popAll() {
    const result: Message[] = [];
    while (true) {
      const msg = this.pop();
      if (!msg) break;
      result.push(msg);
    }
    return result;
  }

  // TODO: asynchronous methods
}
