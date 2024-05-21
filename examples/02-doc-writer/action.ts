import { Action } from "metagpt";

export class WriteDirectory extends Action {
  COMMOM_PROMPT: string;
  DIRECTORY_PROMPT: string;
  language: string;
  constructor({ language }: { language: string }) {
    super("WriteDirectory");
    this.COMMOM_PROMPT = `
    You are now a seasoned technical professional in the field of the internet. 
    We need you to write a technical tutorial with the topic " {topic} ".
    您現在是互聯網領域的經驗豐富的技術專業人員。
    我們需要您撰寫一個關於" {topic} "的技術教程。
    `;
    this.DIRECTORY_PROMPT = `
    Please provide the specific table of contents for this tutorial, strictly following the following requirements:
    1. The output must be strictly in the specified language, {language}.
    2. Answer strictly in the dictionary format like --- {"title": "xxx", "directory": [{"dir 1": ["sub dir 1", "sub dir 2"]}, {"dir 2": ["sub dir 3", "sub dir 4"]}]} ---.
    3. The directory should be as specific and sufficient as possible, with a primary and secondary directory.The secondary directory is in the array.
    4. Do not have extra spaces or line breaks.
    5. Each directory title has practical significance.
    請按照以下要求提供本教程的具體目錄：
    1. 輸出必須嚴格符合指定語言，{language}。
    2. 回答必須嚴格按照字典格式，如--- {"title": "xxx", "directory": [{"dir 1": ["sub dir 1", "sub dir 2"]}, {"dir 2": ["sub dir 3", "sub dir 4"]}]} ---。
    3. 目錄應盡可能具體和充分，包括一級和二級目錄。二級目錄在數組中。
    4. 不要有額外的空格或換行符。
    5. 每個目錄標題都具有實際意義。
    `;
    this.language = language;
  }

  async run(topic: string) {
    const commonPrompt = this.COMMOM_PROMPT.replace("{topic}", topic);
    const prompt =
      commonPrompt + this.DIRECTORY_PROMPT.replace("{language}", this.language);
    const result = (await this.getResultFromLLM(prompt)) as string;
    return this.extractStruct(result, "Object");
  }

  /**
   * Examples:
   * >>> text = 'xxx [1, 2, ["a", "b", [3, 4]], {"x": 5, "y": [6, 7]}] xxx'
   * >>> result_list = OutputParser.extract_struct(text, "list")
   * >>> print(result_list)
   * >>> ### Output: [1, 2, ["a", "b", [3, 4]], {"x": 5, "y": [6, 7]}]
   * >>> text = 'xxx {"x": 1, "y": {"a": 2, "b": {"c": 3}}} xxx'
   * >>> result_dict = OutputParser.extract_struct(text, "dict")
   * >>> print(result_dict)
   * >>> ### Output: {"x": 1, "y": {"a": 2, "b": {"c": 3}}}
   * @param text
   * @param dataType
   * @returns
   */
  extractStruct(text: string, dataType: "Array" | "Object"): any {
    const startChar = dataType === "Array" ? "[" : "{";
    const endChar = dataType === "Array" ? "]" : "}";

    const startIndex = text.indexOf(startChar);
    const endIndex = text.lastIndexOf(endChar);

    if (startIndex !== -1 && endIndex !== -1) {
      const structureText = text.substring(startIndex, endIndex + 1);

      try {
        // Use JSON.parse to convert the text to a JavaScript data type
        const result = JSON.parse(structureText);

        if (dataType === "Array" && Array.isArray(result)) {
          return result;
        } else if (
          dataType === "Object" &&
          typeof result === "object" &&
          !Array.isArray(result)
        ) {
          return result;
        }

        throw new Error(`The extracted structure is not a ${dataType}.`);
      } catch (e) {
        throw new Error(
          `Error while extracting and parsing the ${dataType}: ${e}`,
        );
      }
    } else {
      console.error(`No ${dataType} found in the text.`);
      return dataType === "Array" ? [] : {};
    }
  }
}

export class WriteContent extends Action {
  COMMOM_PROMPT: string;
  CONTENT_PROMPT: string;
  language: string;
  directory: string;
  constructor({
    language,
    directory,
  }: {
    language: string;
    directory: string;
  }) {
    super("WriteContent");
    this.language = language;
    this.directory = directory;
    this.COMMOM_PROMPT = `You are now a seasoned technical professional in the field of the internet. 
    We need you to write a technical tutorial with the topic " {contentTopic} ".`;
    this.CONTENT_PROMPT = `
    Now I will give you the module directory titles for the topic. 
    Please output the detailed principle content of this title in detail. 
    If there are code examples, please provide them according to standard code specifications. 
    Without a code example, it is not necessary.

    The module directory titles for the topic is as follows:
    ${directory}

    Strictly limit output according to the following requirements:
    1. Follow the Markdown syntax format for layout.
    2. If there are code examples, they must follow standard syntax specifications, have document annotations, and be displayed in code blocks.
    3. The output must be strictly in the specified language, {language}.
    4. Do not have redundant output, including concluding remarks.
    5. Strict requirement not to output the topic "{topic}".
    現在我將為您提供該主題的模塊目錄標題。
    請詳細輸出此標題的詳細原理內容。
    如果有代碼示例，請按照標準代碼規範提供。
    沒有代碼示例則不需要提供。
    
    該主題的模塊目錄標題如下：
    ${directory}
    
    嚴格按照以下要求限制輸出：
    1. 遵循Markdown語法格式進行布局。
    2. 如果有代碼示例，必須遵循標準語法規範，具備文檔注釋，並以代碼塊形式顯示。
    3. 輸出必須嚴格使用指定語言 ${language}。
    4. 不得有冗余輸出，包括總結性陳述。
    5. 嚴禁輸出主題" {contentTopic} "。`;
  }

  async run(contentTopic: string) {
    const commonPrompt = this.COMMOM_PROMPT.replace(
      "{contentTopic}",
      contentTopic,
    );

    // directory would be from WriteDirectory action result
    const contentPrompt =
      commonPrompt +
      this.CONTENT_PROMPT.replace("{contentTopic}", contentTopic);

    const result = (await this.getResultFromLLM(contentPrompt)) as string;
    return result;
  }
}
