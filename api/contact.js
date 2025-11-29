import { Resend } from "@resend/resend";

const resend = new Resend(process.env.RESEND_API_KEY || "");
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "businesses@skyyalla.com";
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "no-reply@skyyalla.com";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name = "", email = "", phone = "", company = "", message = "" } = req.body || {};
    const clean = (v) => v.toString().trim();
    const entry = {
      name: clean(name),
      email: clean(email),
      phone: clean(phone),
      company: clean(company),
      message: clean(message),
    };

    if (!entry.name || !entry.email || !entry.message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const text = [
      `Name: ${entry.name}`,
      `Email: ${entry.email}`,
      `Phone: ${entry.phone || "-"}`,
      `Company: ${entry.company || "-"}`,
      "",
      "Message:",
      entry.message,
    ].join("\n");

    await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      reply_to: entry.email,
      subject: `New contact form submission from ${entry.name}`,
      text,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Contact handler error", error);
    return res.status(500).json({ error: "Unable to send message right now." });
  }
}
