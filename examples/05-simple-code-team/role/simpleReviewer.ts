import { Role } from "metagpt";
import { SimpleWriteReview } from "../action/simpleWriteReview";
import { SimpleWriteTest } from "../action/simpleWriteTest";

export class SimpleReviewer extends Role {
  constructor() {
    super({ name: "Charlie", profile: "SimpleReviewer" });
    this.setActions([new SimpleWriteReview()]);
    this._watch([SimpleWriteTest]);
  }

  // TODO: add human
}
