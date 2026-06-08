import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "25"),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
});

export async function sendMail(params: { to: string; subject: string; text: string; html?: string }) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@signage.local",
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
  } catch (err) {
    console.warn("Email not sent (SMTP not configured):", (err as Error).message);
  }
}
