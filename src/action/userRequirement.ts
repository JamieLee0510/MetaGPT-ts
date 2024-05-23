import { Action } from "./action";

/**
 * User Requirement without any implementation details
 */
export class UserRequirement extends Action {
  constructor() {
    super("UserRequirement");
  }
}
