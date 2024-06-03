import { Role, UserRequiredAction } from "metagpt";
import { SimpleWriteCode } from "../action/simpleWriteCode";

export class SimpleCoder extends Role {
  constructor() {
    super({ name: "Alice", profile: "SimpleCoder" });
    this._watch([UserRequiredAction]);
    this.setActions([new SimpleWriteCode()]);
  }
}
