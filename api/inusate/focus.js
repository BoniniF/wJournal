import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const API_URL = `https://w-journal.vercel.app/api/tutte.js`;
    const data = await fetch(API_URL).then(r => r.json());

    const results = {};

    // Loop continenti
    for (const continent of Object.keys(data.results)) {
      results[continent] = {};

      // Loop paesi
      for (const country of Object.keys(data.results[continent])) {
        const groups = data.results[continent][country];
        results[continent][country] = [];

        // Loop gruppi deepseek
        for (const group of groups) {
          const raw = group.response?.trim();

          if (!raw || !raw.startsWith("http")) {
            results[continent][country].push({
              error: "Deepseek non ha restituito un URL valido",
              raw
            });
            continue;
          }

          const url = raw.replace(/[\s\n].*$/, ""); // Prima riga → link

          try {
            const page = await fetch(url);
            const html = await page.text();
            const $ = cheerio.load(html);

            // Ottieni tutto il testo leggibile
            const paragraphs = $("p")
              .map((i, el) => $(el).text().trim())
              .get()
              .filter(Boolean);

            const text = paragraphs.join("\n\n");

            // Ottieni immagini significative
            const images = $("img")
              .map((i, el) => $(el).attr("src"))
              .get()
              .filter(i => i && !i.startsWith("data:"));

            results[continent][country].push({
              url,
              text,
              images
            });

          } catch (err) {
            results[continent][country].push({
              url,
              error: "Errore nell’estrazione",
              details: err.message
            });
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      results
    });

  } catch (err) {
    res.status(500).json({
      error: "Errore server",
      details: err.message
    });
  }
}
