/**
 * Role is basical unit ai-agent in MetaGPT，
 * while run function be triggered,
 * Role execute _observe, _think and _act(ReAct logic), and then _publish
 *
 * which means:
 * 1. After running, a agent would observe the information it could catch,
 * and then put those in its memory.
 * 2. Next step is executing thinking, and determining next action(choicing from Action1, Action2, Action3...)
 * 3. Finishing choicing next action, execute the action and get the result for this turn.
 *
 *
 */

import { Action } from "../action/action";

export class Role {
  name: string;
  profile: string;

  constructor({ name, profile }: { name: string; profile: string }) {
    this.name = name;
    this.profile = profile;
  }

  _initActions(actionArr: Action[]) {}
}
