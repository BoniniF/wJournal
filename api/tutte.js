export default async function handler(req, res) {
  try {
    const API_URL = `https://w-journal.vercel.app/api/script.js`;
    const states = await fetch(API_URL).then(r => r.json());

    const systemMsg =
      "here are proposed lots of urls from the home of an online newspaper, you must find the front page article in theese, so not the categories or similar but the first that seems redirecting in an article page. just write the right one.";

    let results = {};

    // Ciclo tutti i continenti
    for (const continent of Object.keys(states)) {
      results[continent] = {};

      // Ciclo tutti i paesi del continente
      for (const country of Object.keys(states[continent])) {
        const groups = states[continent][country];
        if (!groups?.length) {
          results[continent][country] = { error: "Nessun gruppo link" };
          continue;
        }

        results[continent][country] = [];

        // Ciclo tutti i gruppi di link
        for (let i = 0; i < groups.length; i++) {
          const group = groups[i];
          const links = group.extracted || [];

          if (!links.length) {
            results[continent][country].push({
              groupIndex: i,
              error: "Nessun link estratto"
            });
            continue;
          }

          // Prompt utente = tutti i link del gruppo
          const content = links.join("\n");

          const messages = [
            { role: "system", content: systemMsg, token: "2lACr6xBuUC51UOr" },
            { role: "user", content }
          ];

          // Chiamata a Pollinations
          const pollRes = await fetch("https://text.Pollinations.ai/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages,
              model: "deepseek-ai/deepseek-r1",
              token: "2lACr6xBuUC51UOr",
              private: true
            })
          });

          const text = await pollRes.text();

          // Salvo il risultato
          results[continent][country].push({
            groupIndex: i,
            linkCount: links.length,
            response: text
          });
        }
      }
    }

    // Risposta finale
    res.status(200).json({
      success: true,
      results
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore server", details: err.message });
  }
}
