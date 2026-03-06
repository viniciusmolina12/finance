import { DomainError } from "#shared/domain/domain-error.js";
import { UnitOfWork } from "#shared/domain/unit-of-work.js";
import { EmailConfirmationToken } from "#user/domain/value-objects/email-confirmation-token.vo.js";
import { Email } from "#user/domain/value-objects/email.vo.js";
import { Name } from "#user/domain/value-objects/name.vo.js";
import { Password } from "#user/domain/value-objects/password.vo.js";
import { IUserRepository } from "#user/domain/user.repository.js";
import { User, UserId } from "#user/domain/user.aggregate.js";
import { ConfirmUserEmailUseCase } from "#user/application/usecases/confirm-user-email-use-case.js";

class InMemoryUserRepository implements IUserRepository {
  public users: User[] = [];
  public confirmations: Array<{
    user_id: string;
    token: string;
    expires_at: Date;
    confirmed_at: Date | null;
  }> = [];

  public async findByEmail(email: Email): Promise<User | null> {
    const user = this.users.find((item) => item.email.value === email.value);
    return user ?? null;
  }

  public async create(user: User): Promise<void> {
    this.users.push(user);
  }

  public async createEmailConfirmation(input: {
    user_id: UserId;
    token: EmailConfirmationToken;
    expires_at: Date;
    created_at: Date;
  }): Promise<void> {
    this.confirmations.push({
      user_id: input.user_id.value,
      token: input.token.value,
      expires_at: input.expires_at,
      confirmed_at: null,
    });
  }

  public async findEmailConfirmationByToken(
    token: EmailConfirmationToken,
  ): Promise<{
    user_id: UserId;
    token: EmailConfirmationToken;
    expires_at: Date;
    confirmed_at: Date | null;
  } | null> {
    const confirmation = this.confirmations.find(
      (item) => item.token === token.value,
    );

    if (!confirmation) {
      return null;
    }

    return {
      user_id: UserId.create(confirmation.user_id),
      token: EmailConfirmationToken.create(confirmation.token),
      expires_at: confirmation.expires_at,
      confirmed_at: confirmation.confirmed_at,
    };
  }

  public async activateUserById(
    user_id: UserId,
    activated_at: Date,
  ): Promise<void> {
    this.users = this.users.map((user) => {
      if (user.id.value !== user_id.value) {
        return user;
      }

      return User.rehydrate({
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        is_active: true,
        email_confirmed_at: activated_at,
        created_at: user.created_at,
        updated_at: activated_at,
      });
    });
  }

  public async markEmailConfirmationAsConfirmed(
    token: EmailConfirmationToken,
    confirmed_at: Date,
  ): Promise<void> {
    this.confirmations = this.confirmations.map((item) => {
      if (item.token !== token.value) {
        return item;
      }

      return {
        ...item,
        confirmed_at,
      };
    });
  }
}

class FakeUnitOfWork implements UnitOfWork {
  public executed = false;

  public async executeInTransaction<T>(work: () => Promise<T>): Promise<T> {
    this.executed = true;
    return work();
  }
}

describe("ConfirmUserEmailUseCase", () => {
  it("deve confirmar e ativar usuário", async () => {
    const repository = new InMemoryUserRepository();
    const unit_of_work = new FakeUnitOfWork();
    const user_id = UserId.create("550e8400-e29b-41d4-a716-446655440000");
    const token = EmailConfirmationToken.create(
      "550e8400-e29b-41d4-a716-446655440001",
    );

    repository.users.push(
      User.rehydrate({
        id: user_id,
        name: Name.create("Maria Silva"),
        email: Email.create("maria@email.com"),
        password: Password.rehydrate("hash"),
        is_active: false,
        email_confirmed_at: null,
        created_at: new Date("2026-01-01T00:00:00.000Z"),
        updated_at: new Date("2026-01-01T00:00:00.000Z"),
      }),
    );

    repository.confirmations.push({
      user_id: user_id.value,
      token: token.value,
      expires_at: new Date(Date.now() + 60_000),
      confirmed_at: null,
    });

    const use_case = new ConfirmUserEmailUseCase(repository, unit_of_work);
    const output = await use_case.execute({ token: token.value });

    expect(output.user_id).toBe(user_id.value);
    expect(repository.users[0]?.is_active).toBe(true);
    expect(repository.confirmations[0]?.confirmed_at).not.toBeNull();
    expect(unit_of_work.executed).toBe(true);
  });

  it("deve falhar para token expirado", async () => {
    const repository = new InMemoryUserRepository();
    const unit_of_work = new FakeUnitOfWork();
    const user_id = UserId.create("550e8400-e29b-41d4-a716-446655440000");
    const token = EmailConfirmationToken.create(
      "550e8400-e29b-41d4-a716-446655440002",
    );

    repository.confirmations.push({
      user_id: user_id.value,
      token: token.value,
      expires_at: new Date(Date.now() - 60_000),
      confirmed_at: null,
    });

    const use_case = new ConfirmUserEmailUseCase(repository, unit_of_work);

    await expect(use_case.execute({ token: token.value })).rejects.toThrow(
      DomainError,
    );
    expect(unit_of_work.executed).toBe(true);
  });
});
