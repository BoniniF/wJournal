export default async function handler(req, res) {
  try {
    // 1. URL del tuo endpoint precedente
    const SOURCE_URL = "https://w-journal.vercel.app/api/tutte.js"; 

    // 2. Ottieni i risultati elaborati dal primo script
    const data = await fetch(SOURCE_URL).then(r => r.json());

    if (!data.results)
      return res.status(500).send("Nessun risultato disponibile");

    const urls = [];

    // 3. Estraggo tutti gli URL dalle risposte
    for (const continent of Object.keys(data.results)) {
      for (const country of Object.keys(data.results[continent])) {
        const groups = data.results[continent][country];

        for (const group of groups) {
          if (group?.response) {
            // Il modello risponde con una singola URL
            const cleaned = group.response.trim();
            urls.push(cleaned);
          }
        }
      }
    }

    if (!urls.length)
      return res.status(500).send("Nessun URL trovato nelle risposte");

    // 4. Scarico tutte le pagine in parallelo
    const htmlResponses = await Promise.all(
      urls.map(async url => {
        try {
          const res = await fetch(url);
          const text = await res.text();
          return { url, html: text };
        } catch (err) {
          return { url, html: `<p>Errore caricando ${url}</p>` };
        }
      })
    );

    // 5. Creo una singola pagina HTML con tutte le pagine embeddate
    const finalPage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Combined HTML Pages</title>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    .page { border: 1px solid #ccc; padding: 20px; margin-bottom: 40px; }
    .url { font-weight: bold; margin-bottom: 10px; }
  </style>
</head>
<body>
  <h1>Tutte le pagine raccolte</h1>
  ${htmlResponses
    .map(
      p => `
      <div class="page">
        <div class="url">${p.url}</div>
        <div class="content">${p.html}</div>
      </div>
    `
    )
    .join("\n")}
</body>
</html>
`;

    // 6. Risposta pagina HTML
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(finalPage);

  } catch (err) {
    console.error(err);
    res.status(500).send("Errore server: " + err.message);
  }
}
