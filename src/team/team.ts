import { MESSAGE_ROUTE_TO_ALL } from "src/utils/msg-const";
import { Environment, Role } from "src/role";
import { Message } from "src/schema";
import { UserRequiredActionFlag } from "src/action";

export class Team {
  env: Environment;

  investment: Number = 10;
  idea: string = "";

  // TODO: context
  constructor() {
    this.env = new Environment({});
  }

  hire(roles: Role[]) {
    this.env.addRoles(roles);
  }

  invest(investment: Number) {
    this.investment = investment;
    // TODO: costManager
  }

  runProject(idea: string, sendTo?: string) {
    this.idea = idea;
    const message = new Message({
      content: idea,
      role: "Human",
      causeBy: UserRequiredActionFlag,
      sendTo: sendTo ? sendTo : MESSAGE_ROUTE_TO_ALL,
    });
    this.env.publishMessage(message);
  }

  async run(nRound = 3, idea = "", sendTo = "") {
    if (idea) {
      this.runProject(idea, sendTo);
    }
    let countingRound = nRound;
    while (countingRound > 0) {
      // TODO: check balence
      await this.env.run();
      countingRound--;
    }
    return this.env.history;
  }
}
