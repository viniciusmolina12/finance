import { randomUUID } from "node:crypto";

import { DomainError } from "#shared/domain/domain-error.js";
import { Encrypt } from "#shared/domain/encrypt.js";
import { Mailer } from "#shared/domain/mailer.js";
import { UnitOfWork } from "#shared/domain/unit-of-work.js";
import { EmailConfirmationToken } from "#user/domain/value-objects/email-confirmation-token.vo.js";
import { Email } from "#user/domain/value-objects/email.vo.js";
import { Name } from "#user/domain/value-objects/name.vo.js";
import { Password } from "#user/domain/value-objects/password.vo.js";
import { IUserRepository } from "#user/domain/user.repository.js";
import { User, UserId } from "#user/domain/user.aggregate.js";

export type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
};

export type RegisterUserOutput = {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: Date;
};

const EMAIL_CONFIRMATION_EXPIRATION_HOURS = 24;

export class RegisterUserUseCase {
  private readonly user_repository: IUserRepository;
  private readonly encrypt: Encrypt;
  private readonly unit_of_work: UnitOfWork;
  private readonly mailer: Mailer;
  private readonly app_url: string;

  public constructor(
    user_repository: IUserRepository,
    encrypt: Encrypt,
    unit_of_work: UnitOfWork,
    mailer: Mailer,
    app_url: string,
  ) {
    this.user_repository = user_repository;
    this.encrypt = encrypt;
    this.unit_of_work = unit_of_work;
    this.mailer = mailer;
    this.app_url = app_url;
  }

  public async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    return this.unit_of_work.executeInTransaction(async () => {
      const email = Email.create(input.email);
      const existing_user = await this.user_repository.findByEmail(email);

      if (existing_user) {
        throw new DomainError(
          "E-mail já cadastrado.",
          "USER_EMAIL_ALREADY_EXISTS",
        );
      }

      const name = Name.create(input.name);
      const raw_password = input.password;
      Password.validateRaw(raw_password);
      const now = new Date();
      const confirmation_expires_at = new Date(
        now.getTime() + EMAIL_CONFIRMATION_EXPIRATION_HOURS * 60 * 60 * 1000,
      );
      const confirmation_token = EmailConfirmationToken.create(randomUUID());
      const hashed_password = await this.encrypt.hash(raw_password);
      const password = Password.create(raw_password, hashed_password);

      const user = User.register({
        id: UserId.generate(),
        name,
        email,
        password,
        is_active: false,
        email_confirmed_at: null,
        created_at: now,
        updated_at: now,
      });

      await this.user_repository.create(user);
      await this.user_repository.createEmailConfirmation({
        user_id: user.id,
        token: confirmation_token,
        expires_at: confirmation_expires_at,
        created_at: now,
      });

      const confirmation_link = `${this.app_url}/users/confirm-email?token=${confirmation_token.value}`;

      await this.mailer.send({
        to: email.value,
        subject: "Confirmação de e-mail - Finance",
        html: [
          `<p>Olá, <strong>${user.name.value}</strong>!</p>`,
          `<p>Recebemos um pedido de cadastro no Finance com este e-mail.</p>`,
          `<p>Clique no botão abaixo para confirmar seu endereço de e-mail. O link expira em ${EMAIL_CONFIRMATION_EXPIRATION_HOURS} horas.</p>`,
          `<p><a href="${confirmation_link}" style="display:inline-block;padding:12px 24px;background-color:#4f46e5;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">Confirmar e-mail</a></p>`,
          `<p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>`,
          `<p><a href="${confirmation_link}">${confirmation_link}</a></p>`,
          `<p>Se você não solicitou este cadastro, por favor ignore esta mensagem.</p>`,
        ].join("\n"),
        text: [
          `Olá, ${user.name.value}!`,
          "",
          "Recebemos um pedido de cadastro no Finance com este e-mail.",
          `Acesse o link abaixo para confirmar seu e-mail (expira em ${EMAIL_CONFIRMATION_EXPIRATION_HOURS} horas):`,
          "",
          confirmation_link,
          "",
          "Se você não solicitou este cadastro, por favor ignore esta mensagem.",
        ].join("\n"),
      });

      return {
        id: user.id.value,
        name: user.name.value,
        email: user.email.value,
        is_active: user.is_active,
        created_at: user.created_at,
      };
    });
  }
}
