export class CodeParser {
  static parseBlock(block: string, text: string): string {
    const blocks = this.parseBlocks(text);
    for (const [key, value] of Object.entries(blocks)) {
      if (block === key) {
        return value;
      }
    }
    return "";
  }

  static parseBlocks(text: string): { [key: string]: string } {
    const blocks = text.split("##");
    const blockDict: { [key: string]: string } = {};

    for (const block of blocks) {
      if (block.trim() === "") {
        continue;
      }
      let blockTitle: string;
      let blockContent: string;
      if (!block.includes("\n")) {
        blockTitle = block;
        blockContent = "";
      } else {
        [blockTitle, blockContent] = block.split("\n", 2).map((s) => s.trim());
      }
      blockDict[blockTitle.trim()] = blockContent.trim();
    }

    return blockDict;
  }

  static parseCode(block: string, text: string, lang: string = ""): string {
    if (block) {
      text = this.parseBlock(block, text);
    }
    const pattern = new RegExp(`\`\`\`${lang}.*?\\s+(.*?)\`\`\``, "s");
    const match = text.match(pattern);
    if (match) {
      return match[1];
    } else {
      console.error(`${pattern} not match following text:`);
      console.error(text);
      return text; // just assume original text is code
    }
  }
  static parseStr(block: string, text: string, lang: string = ""): string {
    let code = this.parseCode(block, text, lang);
    code = code
      .split("=")
      [-1].trim()
      .replace(/^['"]+|['"]+$/g, "");
    return code;
  }

  static parseFileList(
    block: string,
    text: string,
    lang: string = "",
  ): string[] {
    const code = this.parseCode(block, text, lang);
    const pattern = /\s*(.*=.*)?(\[.*\])/s;
    const match = code.match(pattern);
    if (match) {
      const tasksListStr = match[2];
      try {
        const tasks = JSON.parse(tasksListStr) as string[];
        return tasks;
      } catch (e) {
        throw new Error("Failed to parse tasks list string");
      }
    } else {
      throw new Error("No match found");
    }
  }
}
