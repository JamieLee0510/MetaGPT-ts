import { MESSAGE_ROUTE_TO_ALL } from "../utils/msg-const";
import { v4 as uuidV4 } from "uuid";

export class Message {
  id: string;
  content: string;
  role?: string;
  sendTo?: string;
  causeBy?: string;
  // TODO: sentFrom

  // content: string, role: string, causeBy: string, sendTo?: string

  constructor({
    content,
    role,
    causeBy,
    sendTo,
  }: {
    content: string;
    role?: string;
    causeBy?: string;
    sendTo?: string;
  }) {
    this.id = uuidV4();
    this.content = content;

    if (role) {
      this.role = role;
    }

    this.sendTo = sendTo ? sendTo : MESSAGE_ROUTE_TO_ALL;
    this.causeBy = causeBy;
  }
}

export class MessageQueue {}
