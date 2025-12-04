export default async function handler(req, res) {
  try {
    // 1. Otteniamo i risultati dal tuo primo endpoint
    const apiUrl = `${req.headers.origin}/api/tuoEndpoint`; // <-- CAMBIA "tuoEndpoint" col nome del tuo file
    const mainData = await fetch(apiUrl).then(r => r.json());

    if (!mainData || !mainData.results)
      return res.status(500).send("Nessun risultato dal primo endpoint");

    let allUrls = [];

    // 2. Estrai tutti gli URL trovati dal modello
    for (const continent of Object.keys(mainData.results)) {
      for (const country of Object.keys(mainData.results[continent])) {
        const groups = mainData.results[continent][country];
        for (const g of groups) {
          if (g?.response) {
            // Estraggo eventuali URL dal testo della risposta
            const urls = g.response.match(/https?:\/\/[^\s]+/g);
            if (urls) allUrls.push(...urls);
          }
        }
      }
    }

    if (!allUrls.length)
      return res.status(500).send("Nessun URL trovato nelle risposte");

    // 3. Scarica HTML (tramite Google Translate)
    const translatedHtmlBlocks = await Promise.all(
      allUrls.map(async (url) => {
        try {
          const googleUrl =
            `https://translate.google.com/translate?sl=auto&tl=it&u=${encodeURIComponent(url)}`;

          const html = await fetch(googleUrl).then(r => r.text());

          return `
            <section style="margin:40px 0; padding:20px; border:1px solid #ccc">
              <h2>Articolo tradotto:</h2>
              <p><a href="${googleUrl}" target="_blank">${url}</a></p>
              <div>${html}</div>
            </section>
          `;
        } catch (err) {
          return `
            <section style="margin:40px 0; padding:20px; border:1px solid red">
              <h2>Errore caricamento</h2>
              <p>${url}</p>
              <pre>${err.message}</pre>
            </section>
          `;
        }
      })
    );

    // 4. Unisci tutto in una singola pagina HTML
    const finalHtml = `
      <!DOCTYPE html>
      <html lang="it">
        <head>
          <meta charset="UTF-8"/>
          <title>Articoli Tradotti</title>
          <style>
            body { font-family: Arial, sans-serif; padding:40px; background:#f3f3f3; }
            h1 { text-align:center; }
          </style>
        </head>
        <body>
          <h1>Articoli Tradotti in Italiano</h1>
          ${translatedHtmlBlocks.join("\n")}
        </body>
      </html>
    `;

    res.status(200).setHeader("Content-Type", "text/html").send(finalHtml);

  } catch (error) {
    console.error(error);
    res.status(500).send("Errore server: " + error.message);
  }
}
