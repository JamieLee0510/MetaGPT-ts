import { Agent } from "./agent";

const run = async () => {
  const newReActAgent = new Agent();
  const reactAnswer = await newReActAgent.textCompletion("川普哪一年出生的？");
  console.log("reactAnswer:", reactAnswer);
};

run();
