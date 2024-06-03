import { Role } from "metagpt";
import { WriteCode } from "../action/writeCode";

export class Engineer extends Role {
  constructor() {
    super({ name: "Alex", profile: "Engineer" });
    this.setActions([new WriteCode()]);
  }
}
