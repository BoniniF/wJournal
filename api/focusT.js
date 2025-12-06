import * as cheerio from "cheerio";

// Funzione per tradurre con Google
async function translateToItalian(text) {
  const key = process.env.GOOGLE_TRANSLATE_KEY;

  const res = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        target: "it",
        format: "text"
      })
    }
  );

  const data = await res.json();
  const translated = data?.data?.translations?.[0]?.translatedText || "";
  const detected = data?.data?.translations?.[0]?.detectedSourceLanguage || "unknown";

  return { translated, detected };
}

export default async function handler(req, res) {
  try {
    const API_URL = `https://w-journal.vercel.app/api/tutte.js`;
    const data = await fetch(API_URL).then(r => r.json());

    const results = {};

    for (const continent of Object.keys(data.results)) {
      results[continent] = {};

      for (const country of Object.keys(data.results[continent])) {
        const groups = data.results[continent][country];
        results[continent][country] = [];

        for (const group of groups) {
          const raw = group.response?.trim();

          if (!raw || !raw.startsWith("http")) {
            results[continent][country].push({
              error: "Deepseek non ha restituito un URL valido",
              raw
            });
            continue;
          }

          const url = raw.replace(/[\s\n].*$/, "");

          try {
            const page = await fetch(url);
            const html = await page.text();
            const $ = cheerio.load(html);

            const paragraphs = $("p")
              .map((i, el) => $(el).text().trim())
              .get()
              .filter(Boolean);

            const text = paragraphs.join("\n\n");

            // 1️⃣ Traduzione in italiano
            const { translated, detected } = await translateToItalian(text);

            const images = $("img")
              .map((i, el) => $(el).attr("src"))
              .get()
              .filter(i => i && !i.startsWith("data:"));

            results[continent][country].push({
              url,
              original_language: detected,
              original_text: text,
              translated_text_it: translated,
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
