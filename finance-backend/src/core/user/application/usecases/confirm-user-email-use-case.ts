import { DomainError } from "#shared/domain/domain-error.js";
import { UnitOfWork } from "#shared/domain/unit-of-work.js";
import { EmailConfirmationToken } from "#user/domain/value-objects/email-confirmation-token.vo.js";
import { IUserRepository } from "#user/domain/user.repository.js";

export type ConfirmUserEmailInput = {
  token: string;
};

export type ConfirmUserEmailOutput = {
  user_id: string;
  confirmed_at: Date;
};

export class ConfirmUserEmailUseCase {
  private readonly user_repository: IUserRepository;
  private readonly unit_of_work: UnitOfWork;

  public constructor(
    user_repository: IUserRepository,
    unit_of_work: UnitOfWork,
  ) {
    this.user_repository = user_repository;
    this.unit_of_work = unit_of_work;
  }

  public async execute(
    input: ConfirmUserEmailInput,
  ): Promise<ConfirmUserEmailOutput> {
    return this.unit_of_work.executeInTransaction(async () => {
      const token = EmailConfirmationToken.create(input.token);
      const confirmation =
        await this.user_repository.findEmailConfirmationByToken(token);

      if (!confirmation) {
        throw new DomainError(
          "Token de confirmação não encontrado.",
          "USER_EMAIL_CONFIRMATION_NOT_FOUND",
        );
      }

      if (confirmation.confirmed_at) {
        throw new DomainError(
          "E-mail já confirmado.",
          "USER_EMAIL_ALREADY_CONFIRMED",
        );
      }

      const now = new Date();

      if (confirmation.expires_at.getTime() < now.getTime()) {
        throw new DomainError(
          "Token de confirmação expirado.",
          "USER_EMAIL_CONFIRMATION_EXPIRED",
        );
      }

      await this.user_repository.activateUserById(confirmation.user_id, now);
      await this.user_repository.markEmailConfirmationAsConfirmed(token, now);

      return {
        user_id: confirmation.user_id.value,
        confirmed_at: now,
      };
    });
  }
}
