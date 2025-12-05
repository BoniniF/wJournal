import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

const API_URL = "https://w-journal.vercel.app/api/script.js";

// cartella dove salvare gli screenshots
const OUT = "./screens";
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

async function fetchJSON() {
  const res = await fetch(API_URL);
  return res.json();
}

function extractUrlFromAIResponse(text) {
  // spesso l'AI restituisce solo il link, o anche testo: prendiamo la prima URL trovata
  const match = text.match(/https?:\/\/[^\s"'<>]+/);
  return match ? match[0] : null;
}

async function screenshotURL(url, fileName, browser) {
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 2000 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 40000 });

    const filePath = path.join(OUT, fileName);
    await page.screenshot({ path: filePath, fullPage: true });
    await page.close();

    return filePath;
  } catch (err) {
    console.error("Errore screenshot:", url, err);
    return null;
  }
}

async function main() {
  console.log("📥 Fetching JSON...");
  const data = await fetchJSON();

  const screenshots = []; // per l’HTML finale

  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: null
  });

  for (const continent of Object.keys(data.results)) {
    for (const country of Object.keys(data.results[continent])) {
      const groups = data.results[continent][country];
      if (!Array.isArray(groups)) continue;

      for (const item of groups) {
        if (!item.response) continue;

        const url = extractUrlFromAIResponse(item.response);
        if (!url) continue;

        const filename =
          `${continent}-${country}-group${item.groupIndex}.png`
            .replace(/\s+/g, "_")
            .replace(/[^\w.-]/g, "");

        console.log("📸 Screenshot:", url);

        const imgPath = await screenshotURL(url, filename, browser);
        if (imgPath) {
          screenshots.push({
            continent,
            country,
            url,
            img: imgPath
          });
        }
      }
    }
  }

  await browser.close();

  // HTML finale
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Screenshots</title>
  <style>
    body { font-family: sans-serif; background:#f0f0f0; padding:20px; }
    .grid { 
      display:grid; 
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap:20px;
    }
    .card {
      background:white; padding:10px; border-radius:10px;
      box-shadow:0 2px 6px rgba(0,0,0,0.15);
    }
    img { width:100%; border-radius:8px; }
    h2{ margin-top:40px; }
  </style>
</head>
<body>

  <h1>Screenshots raccolti</h1>
  <div class="grid">
    ${screenshots
      .map(
        (s) => `
      <div class="card">
        <strong>${s.continent} / ${s.country}</strong><br>
        <small><a href="${s.url}" target="_blank">${s.url}</a></small>
        <img src="${s.img.replace("./", "")}" />
      </div>
    `
      )
      .join("")}
  </div>

</body>
</html>
`;

  fs.writeFileSync("screenshots.html", html);
  console.log("✅ HTML generato: screenshots.html");
}

main();
