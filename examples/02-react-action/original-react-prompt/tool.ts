import { SERPER_KEY, OPENAI_KEY } from "./const";
import axios from "axios";

export type ToolConfig = {
  name_for_human: string;
  name_for_model: string;
  description_for_model: string;
  parameters: {
    name: string;
    description: string;
    required: boolean;
    schema: {
      type: string;
    };
  }[];
};
export class Tool {
  toolConfig: ToolConfig[];
  constructor() {
    this.toolConfig = this._initToolConfig();
  }
  _initToolConfig() {
    const tools = [
      {
        name_for_human: "Google-Search",
        name_for_model: "google_search",
        description_for_model:
          "Google-Search 是一種通用搜索引擎，可用於訪問互聯網、查詢百科知識、了解時事新聞等。",
        parameters: [
          {
            name: "search_query",
            description: "搜索關鍵字或短語",
            required: true,
            schema: { type: "string" },
          },
        ],
      },
    ];
    return tools;
  }

  async googleSearch(searchQuery: string) {
    const query = JSON.parse(searchQuery)["search_query"];
    const config = {
      method: "post",
      url: "https://google.serper.dev/search",
      headers: {
        "X-API-KEY": SERPER_KEY,
        "Content-Type": "application/json",
      },
      data: JSON.stringify({ q: query }),
    };
    const res = await axios(config);
    console.log(res);
    return res.data["organic"][0]["snippet"];
  }
}
