import {
  Environment,
  MESSAGE_ROUTE_TO_ALL,
  Message,
  UserRequirement,
} from "metagpt/index";
import { Student } from "./roles/student";
import { Teacher } from "./roles/teacher";

const classroom = new Environment({});
const user = new UserRequirement();

const main = async (topic: string, nRound = 3) => {
  classroom.addRoles([new Student(), new Teacher(), new Teacher()]);
  classroom.publishMessage(
    new Message({
      role: "Human",
      content: topic,
      causeBy: user.constructor.name,
      sendTo: MESSAGE_ROUTE_TO_ALL,
    }),
  );
  while (nRound > 0) {
    await classroom.run();
    nRound--;
  }
  console.log(classroom.history);
};

main("wirte a poem about moon");
