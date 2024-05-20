import { TutorialAssistant } from "./role";

const main = async () => {
  const tutorialAssistant = new TutorialAssistant();
  const result = await tutorialAssistant.run("Write a tutorial about MySQL");
  console.log(result);
};

main();
