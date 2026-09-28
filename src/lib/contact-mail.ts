import type { ContactRecord } from "./contact-storage";

export function contactEmailConfigured() {
  if (!process.env.CONTACT_EMAIL_FROM || !process.env.CONTACT_EMAIL_TO)
    return false;
  switch (process.env.CONTACT_EMAIL_PROVIDER) {
    case "resend":
      return Boolean(process.env.RESEND_API_KEY);
    case "smtp":
      return Boolean(process.env.SMTP_HOST);
    default:
      return false;
  }
}

export async function sendContactMail(record: ContactRecord) {
  if (!contactEmailConfigured())
    throw new Error("Contact email delivery is disabled or incomplete");
  const text = `Nombre: ${record.name}\nEmail: ${record.email}\nFecha: ${record.receivedAt}\nReferencia: ${record.submissionId}\n\n${record.message}`;

  if (process.env.CONTACT_EMAIL_PROVIDER === "resend") {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `contact/${record.submissionId.toLowerCase()}`,
      },
      body: JSON.stringify({
        from: process.env.CONTACT_EMAIL_FROM,
        to: [process.env.CONTACT_EMAIL_TO],
        reply_to: record.email,
        subject: "Nueva consulta desde Fateplas",
        text,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(
        `Contact email provider returned HTTP ${response.status}`,
      );
    }
    const result: unknown = await response.json();
    if (
      !result ||
      typeof result !== "object" ||
      !("id" in result) ||
      typeof result.id !== "string"
    ) {
      throw new Error("Contact email provider returned an invalid response");
    }
    return;
  }

  const { default: nodemailer } = await import("nodemailer");
  const port = Number(process.env.SMTP_PORT || "587");
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("Invalid SMTP port");
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        }
      : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  try {
    await transport.sendMail({
      from: process.env.CONTACT_EMAIL_FROM,
      to: process.env.CONTACT_EMAIL_TO,
      replyTo: { name: record.name, address: record.email },
      subject: "Nueva consulta desde Fateplas",
      text,
    });
  } finally {
    transport.close();
  }
}
