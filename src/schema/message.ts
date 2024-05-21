import { MESSAGE_ROUTE_TO_ALL } from "metagpt/utils/msg-const";
import { v4 as uuidV4 } from "uuid";

export class Message {
  id: string;
  content: string;
  sendTo: string;
  // sentFrom
  // sendTo
  constructor(content: string, sendTo?: string) {
    this.id = uuidV4();
    this.content = content;
    this.sendTo = sendTo ? sendTo : MESSAGE_ROUTE_TO_ALL;
  }
}

export class MessageQueue {}
