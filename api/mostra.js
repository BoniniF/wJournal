import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export default async function handler(req, res) {
  try {
    const apiUrl = `https://w-journal.vercel.app/api/tutte.js`;
    const json = await fetch(apiUrl).then(r => r.json());

    function extractUrl(text) {
      const m = text?.match(/https?:\/\/[^\s"'<>]+/);
      return m ? m[0] : null;
    }

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const screenshots = [];

    for (const continent of Object.keys(json.results)) {
      for (const country of Object.keys(json.results[continent])) {
        const items = json.results[continent][country];
        if (!Array.isArray(items)) continue;

        for (const group of items) {
          if (!group.response) continue;

          const url = extractUrl(group.response);
          if (!url) continue;

          const page = await browser.newPage();
          await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

          const buffer = await page.screenshot({ fullPage: true });
          await page.close();

          screenshots.push({
            continent,
            country,
            url,
            base64: buffer.toString("base64")
          });
        }
      }
    }

    await browser.close();

    res.status(200).json({
      success: true,
      count: screenshots.length,
      screenshots,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
