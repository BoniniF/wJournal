// URL della tua API che restituisce il JSON con i link
const API_URL = "script.js";   // <-- cambia con il vero percorso

// Messaggio system (tu lo modificherai)
const SYSTEM_MESSAGE = `
here are proposed lots of urls from the home of an online newspaper, you must find the front page article in theese, so not the categories or similar but the first that seems redirecting in an article page. just write the right one.
`;

async function sendFirstStateLinks() {
  try {
    // 1. Ottieni il JSON generato dal tuo handler
    const data = await fetch(API_URL).then(r => r.json());

    // 2. Prendi il primo continente
    const firstContinent = Object.keys(data)[0];
    if (!firstContinent) throw new Error("Nessun continente trovato");

    // 3. Primo paese del continente
    const firstCountry = Object.keys(data[firstContinent])[0];
    if (!firstCountry) throw new Error("Nessun paese trovato");

    // 4. Primo gruppo di link (primo sito scelto tra i 3 random)
    const groups = data[firstContinent][firstCountry];
    if (!groups?.length) throw new Error("Nessun gruppo di link estratto");

    const firstGroup = groups[0];
    const links = firstGroup.extracted;

    if (!links?.length) throw new Error("Nessun link estratto");

    // 5. Trasforma la lista dei link in un singolo testo
    const content = links.join("\n");

    // 6. Prepara i messaggi per Pollinations
    const messages = [
      { role: "system", content: SYSTEM_MESSAGE, token: "2lACr6xBuUC51UOr" },
      { role: "user", content }
    ];

    // 7. Invia la richiesta POST
    const res = await fetch("https://text.Pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        model: "deepseek-v3",
        token: "2lACr6xBuUC51UOr",
        private: true
      })
    });

    const responseText = await res.text();
    console.log("Risposta del modello:", responseText);
    return responseText;

  } catch (err) {
    console.error("Errore in sendFirstStateLinks:", err);
    return null;
  }
}

// Per usarlo da console o altro
// sendFirstStateLinks();
