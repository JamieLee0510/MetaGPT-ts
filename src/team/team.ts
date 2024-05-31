import { Environment, Role } from "src/role";

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

  runProject(idea: string, sendTo?: string) {}

  run(nRound = 3, idea = "", sendTo = "") {
    if (idea) {
      this.runProject(idea);
    }

    while (nRound > 0) {}
    return this.env.history;
  }
}
