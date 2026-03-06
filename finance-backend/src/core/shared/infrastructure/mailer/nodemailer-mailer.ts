import nodemailer from "nodemailer";

import { Mailer, MailerMessage } from "#shared/domain/mailer.js";

export class NodemailerMailer implements Mailer {
  public async send(message: MailerMessage): Promise<void> {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const password = process.env.SMTP_PASSWORD;
    const from = process.env.SMTP_FROM;
    const from_name = process.env.SMTP_FROM_NAME ?? "Finance";

    console.log("host", host);
    console.log("port", port);
    console.log("user", user);
    console.log("password", password);
    console.log("from", from);
    console.log("from_name", from_name);

    if (!host || !user || !password || !from) {
      throw new Error("Configuração SMTP ausente para envio de e-mail.");
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: {
        user,
        pass: password,
      },
    });

    await transporter.sendMail({
      from: `${from_name} <${from}>`,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
  }
}

