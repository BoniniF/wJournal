import nodemailer from "nodemailer";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Metodo non permesso" });
    }

    const { html } = req.body;

    if (!html) {
      return res.status(400).json({ error: "Nessun HTML inviato" });
    }

    // prende il contenuto del primo <h1>
    const match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    const subject = match ? match[1].trim() : "wJournal • rapporto automatico";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Bonini Filippo Maria" <${process.env.EMAIL_USER}>`,
      to: ["filippomariabonini@libero.it", "bonini.filippo@studenti.salesianisesto.it"],
      subject: subject,
      html
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Errore invio email",
      details: err.message
    });
  }
}
