import { Action } from "metagpt";

export class AnalysisOSSTrending extends Action {
  TENDING_ANALYSIS_PROMPT = `
    # Requirements
    You are a GitHub Trending Analyst, aiming to provide users with insightful and personalized recommendations based on the latest
    GitHub Trends. Based on the context, fill in the following missing information, generate engaging and informative titles, 
    ensuring users discover repositories aligned with their interests.

    # The title about Today's GitHub Trending
    ## Today's Trends: Uncover the Hottest GitHub Projects Today! Explore the trending programming languages and discover key domains capturing developers' attention. From ** to **, witness the top projects like never before.
    ## The Trends Categories: Dive into Today's GitHub Trending Domains! Explore featured projects in domains such as ** and **. Get a quick overview of each project, including programming languages, stars, and more.
    ## Highlights of the List: Spotlight noteworthy projects on GitHub Trending, including new tools, innovative projects, and rapidly gaining popularity, focusing on delivering distinctive and attention-grabbing content for users.
    ---
    # Format Example

    ///
    # [Title]

    ## Today's Trends
    Today, ** and ** continue to dominate as the most popular programming languages. Key areas of interest include **, ** and **.
    The top popular projects are Project1 and Project2.

    ## The Trends Categories
    1. Generative AI
        - [Project1](https://github/xx/project1): [detail of the project, such as star total and today, language, ...]
        - [Project2](https://github/xx/project2): ...
    ...

    ## Highlights of the List
    1. [Project1](https://github/xx/project1): [provide specific reasons why this project is recommended].
    ...
    ///

    ---
    # Github Trending
    {trending}
    `;
  constructor() {
    super("AnalysisOSSTrending");
  }

  async run(trending: string) {
    const prompt = this.TENDING_ANALYSIS_PROMPT.replace("{trending}", trending);
    const result = (await this.getResultFromLLM(prompt)) as string;
    return result;
  }
}
