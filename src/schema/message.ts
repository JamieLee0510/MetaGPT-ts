import { v4 as uuidV4 } from "uuid";

export class Message {
  id: string;
  content: string;
  // sentFrom
  // sendTo
  constructor(content: string) {
    this.id = uuidV4();
    this.content = content;
  }
}

export class MessageQueue {}
