export default async function handler(req, res) {
  try {
    const jsonURL = "https://w-journal.vercel.app/states.json";
    const states = await fetch(jsonURL).then(r => r.json());

    const result = {};

    for (const continente in states) {
      result[continente] = {};

      const paesi = states[continente];

      for (const paese in paesi) {
        const siti = paesi[paese];

        // prendi 3 random
        const randomLinks = shuffle(siti).slice(0, 3);
        result[continente][paese] = [];

        for (const url of randomLinks) {
          try {
            const html = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }}).then(r => r.text());

            let links = extractLinks(html, url);

            // limita a max 10.000 caratteri (senza spezzare)
            links = clampLinks(links, 9500);

            result[continente][paese].push({
              source: url,
              extracted: links
            });

          } catch (e) {
            console.error("Errore nel fetch:", url, e);
          }
        }
      }
    }

    res.status(200).json(result);

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Errore generale" });
  }
}

// ------------------------------
// FUNZIONI ESTERNE
// ------------------------------

function shuffle(arr) {
  return arr
    .map(a => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map(a => a.value);
}

function extractLinks(html, baseUrl) {
  const links = [];
  const tmp = html.match(/<a\s+[^>]*href=["']([^"']+)["']/gi);

  if (!tmp) return links;

  for (const tag of tmp) {
    const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
    if (!hrefMatch) continue;

    let link = hrefMatch[1];

    // normalizza link relativi
    if (link.startsWith("/")) {
      try {
        const u = new URL(baseUrl);
        link = u.origin + link;
      } catch {}
    }

    if (link.startsWith("http")) links.push(link);
  }

  return links;
}

function clampLinks(links, maxChars = 10000) {
  const result = [];
  let total = 0;

  for (const link of links) {
    const len = link.length;

    if (total + len > maxChars) break;

    result.push(link);
    total += len;
  }

  return result;
}
