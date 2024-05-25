export const generateToolDesc = ({
  name_for_model,
  name_for_human,
  description_for_model,
  parameters,
}: {
  name_for_model: string;
  name_for_human: string;
  description_for_model: string;
  parameters: Object;
}) => {
  const TOOL_PROMPT = `
    {name_for_model}: Call this tool to interact with the {name_for_human} API. 
    What is the {name_for_human} API useful for? 
    {description_for_model} 
    Parameters: {parameters} Format the arguments as a JSON object.
    `;

  return TOOL_PROMPT.replace("{name_for_model}", name_for_model)
    .replace("{name_for_human}", name_for_human)
    .replace("{description_for_model}", description_for_model)
    .replace("{parameters}", JSON.stringify(parameters));
};

export const generateSysPrompt = ({
  toolDescsStr,
  toolNamesStr,
}: {
  toolDescsStr: string;
  toolNamesStr: string;
}) => {
  const REACT_PROMPT = `
    Answer the following questions as best you can. You have access to the following tools:

    {tool_descs}

    Use the following format:

    Question: the input question you must answer
    Thought: you should always think about what to do
    Action: the action to take, should be one of [{tool_names}]
    Action Input: the input to the action
    Observation: the result of the action
    ... (this Thought/Action/Action Input/Observation can be repeated zero or more times)
    Thought: I now know the final answer
    Final Answer: the final answer to the original input question

    Begin!
    `;

  return REACT_PROMPT.replace("{tool_descs}", toolDescsStr).replace(
    "{tool_names}",
    toolNamesStr,
  );
};
