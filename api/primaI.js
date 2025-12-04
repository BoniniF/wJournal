
export default async function handler(req, res) {
  try {
    // 1. URL della API dove hai il JSON
    const API_URL = `https://w-journal.vercel.app/api/script.js`;

    // 2. Ottieni i dati
    const states = await fetch(API_URL).then(r => r.json());

    // 3. Prendi primo continente
    const firstContinent = Object.keys(states)[0];
    if (!firstContinent)
      return res.status(500).json({ error: "Nessun continente" });

    // 4. Primo paese
    const firstCountry = Object.keys(states[firstContinent])[0];
    if (!firstCountry)
      return res.status(500).json({ error: "Nessun paese" });

    // 5. Primo gruppo di link
    const groups = states[firstContinent][firstCountry];
    if (!groups?.length)
      return res.status(500).json({ error: "Nessun gruppo link" });

    const firstGroup = groups[1];
    const links = firstGroup.extracted || [];

    if (!links.length)
      return res.status(500).json({ error: "Nessun link estratto" });

    // 6. Concateniamo i link come prompt utente
    const content = links.join("\n");

    // 7. System prompt (lo modificherai tu)
    const systemMsg = "here are proposed lots of urls from the home of an online newspaper, you must find the front page article in theese, so not the categories or similar but the first that seems redirecting in an article page. just write the right one.";

    const messages = [
      { role: "system", content: systemMsg, token: "2lACr6xBuUC51UOr" },
      { role: "user", content }
    ];

    // 8. Richiesta a Pollinations
    const pollRes = await fetch("https://text.Pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        model: "deepseek-v3",
        token: "2lACr6xBuUC51UOr",
        private: true
      })
    });

    const text = await pollRes.text();

    // 9. Risposta del server
    res.status(200).json({
      continent: firstContinent,
      country: firstCountry,
      linkCount: links.length,
      response: text
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore server", details: err.message });
  }
}
