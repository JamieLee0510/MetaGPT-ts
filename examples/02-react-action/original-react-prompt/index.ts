import { Agent } from "./agent";

const run = async () => {
  const newReActAgent = new Agent();
  const testRes = await newReActAgent.textCompletion("川普哪一年出生的？");
  console.log("testRes:", testRes);
};

run();
