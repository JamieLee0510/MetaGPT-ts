import { Team } from "metagpt/team";
import { SimpleCoder } from "./role/simpleCoder";
import { SimpleTester } from "./role/simpleTester";
import { SimpleReviewer } from "./role/simpleReviewer";

const runTeam = async (
  idea: string,
  investment: number,
  nRound: number,
  addHuman: boolean,
) => {
  const team = new Team();
  team.hire([new SimpleCoder(), new SimpleTester(), new SimpleReviewer()]);
  team.invest(investment);
  team.runProject(idea);

  const data = await team.run(nRound);
  console.log(data);
};

runTeam("write a function that calculates the product of a list", 3, 5, false);
