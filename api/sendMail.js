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

    // Configura il trasporto (Gmail o il tuo SMTP)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,  // tua Gmail
        pass: process.env.EMAIL_PASS   // password app (non la password normale!)
      }
    });
//"gcaccialanza@salesianisesto.it", 
    await transporter.sendMail({
      from: `"BoniniF's wJournal - demo" <${process.env.EMAIL_USER}>`,
      to: ["filippomariabonini@libero.it", "bonini.filippo@studenti.salesianisesto.it"],
      subject: "wJournal  rapporto automatico",
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
