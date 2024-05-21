// use nodejs crawler to analysis `https://github.com/trending/javascript?since=daily`

import { Action } from "metagpt";
import puppeteer from "puppeteer";

export class CrawlOSSTrending extends Action {
  constructor() {
    super("CrawlOSSTrending");
  }

  async run(targetUrl = "https://github.com/trending/javascript?since=daily") {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(targetUrl, { waitUntil: "networkidle2" });
    // Wait for the trending repositories to load
    await page.waitForSelector("article.Box-row");

    // Extract the repository names, URLs, and descriptions
    const repositories = await page.evaluate(() => {
      const repoElements = document.querySelectorAll("article.Box-row");
      const repos: any[] = [];
      repoElements.forEach((repoElement: any) => {
        const nameElement = repoElement.querySelector("h2 a");
        const descriptionElement = repoElement.querySelector("p");
        const starsElement = repoElement.querySelector(
          'a[href*="/stargazers"]',
        );
        const forksElement = repoElement.querySelector(
          'a[href*="/network/members"]',
        );

        const name = nameElement ? nameElement.innerText.trim() : null;
        const url = nameElement ? nameElement.href : null;
        const description = descriptionElement
          ? descriptionElement.innerText.trim()
          : "No description available";
        const stars = starsElement
          ? starsElement.innerText.trim().replace(",", "")
          : "0";
        const forks = forksElement
          ? forksElement.innerText.trim().replace(",", "")
          : "0";

        repos.push({ name, url, description, stars, forks });
      });
      return repos;
    });

    // Closing the browser
    await browser.close();
    return JSON.stringify(repositories);
  }
}
