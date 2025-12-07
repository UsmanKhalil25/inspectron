import { ChatOpenAI } from "@langchain/openai";
import { BrowserService, LabelingService } from "../services";
import { createBrowserTools } from "../tools";
import fs from "fs";

export async function crawlWorkflow(startUrl: string, maxPages: number = 5) {
  const browser = new BrowserService();
  const llm = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.7,
  });

  await browser.launch();
  let pagesVisited = 0;

  try {
    await browser.navigate(startUrl);

    while (pagesVisited < maxPages) {
      const elements = await browser.getInteractiveElements();
      await LabelingService.labelElements(browser.getPage(), elements);
      const screenshot = await browser.screenshot();

      fs.writeFileSync(`page-${pagesVisited}.png`, screenshot);

      const tools = createBrowserTools(browser, elements);

      const prompt = `You are exploring a website. You have visited ${pagesVisited} pages so far.
Current URL: ${browser.getPage().url()}

Interactive elements:
${elements.map((el) => `[${el.id}] ${el.tag} - "${el.text}"`).join("\n")}

Choose ONE element to click to continue exploring. Respond with ONLY the element ID number.`;

      const response = await llm.invoke([
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${screenshot.toString("base64")}` },
            },
          ],
        },
      ]);

      const elementId = parseInt(response.content.toString().trim());

      if (isNaN(elementId)) {
        console.log("Invalid element ID, stopping");
        break;
      }

      console.log(`Clicking element ${elementId}`);
      await tools.click(elementId);

      pagesVisited++;
      await tools.wait(1000);
    }
  } finally {
    await browser.close();
  }

  console.log(`Visited ${pagesVisited} pages`);
}
