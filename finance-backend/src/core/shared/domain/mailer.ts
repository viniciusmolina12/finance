export type MailerMessage = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

export interface Mailer {
  send(message: MailerMessage): Promise<void>;
}

