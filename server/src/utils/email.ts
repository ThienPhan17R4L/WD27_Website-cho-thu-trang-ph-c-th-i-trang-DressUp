import nodemailer from "nodemailer";
import { env } from "../config/env";

export type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
};

function hasSmtpConfigured() {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

export async function sendEmail(args: SendEmailArgs) {
  if (!hasSmtpConfigured()) {
    // Dev fallback: log content to console
    // eslint-disable-next-line no-console
    console.log("[EMAIL:DEV_FALLBACK]", {
      to: args.to,
      subject: args.subject,
      html: args.html
    });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: args.to,
    subject: args.subject,
    html: args.html
  });
}
