import { DomainError } from "#shared/domain/domain-error.js";
import { Encrypt } from "#shared/domain/encrypt.js";
import { Mailer, MailerMessage } from "#shared/domain/mailer.js";
import { UnitOfWork } from "#shared/domain/unit-of-work.js";
import { EmailConfirmationToken } from "#user/domain/value-objects/email-confirmation-token.vo.js";
import { Email } from "#user/domain/value-objects/email.vo.js";
import { Name } from "#user/domain/value-objects/name.vo.js";
import { Password } from "#user/domain/value-objects/password.vo.js";
import { IUserRepository } from "#user/domain/user.repository.js";
import { User, UserId } from "#user/domain/user.aggregate.js";
import { RegisterUserUseCase } from "#user/application/usecases/register-user-use-case.js";

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
      token,
      expires_at: confirmation.expires_at,
      confirmed_at: confirmation.confirmed_at,
    };
  }

  public async activateUserById(user_id: UserId): Promise<void> {
    const user = this.users.find((item) => item.id.value === user_id.value);

    if (!user) {
      return;
    }
  }

  public async markEmailConfirmationAsConfirmed(
    token: EmailConfirmationToken,
    confirmed_at: Date,
  ): Promise<void> {
    const confirmation = this.confirmations.find(
      (item) => item.token === token.value,
    );

    if (!confirmation) {
      return;
    }

    confirmation.confirmed_at = confirmed_at;
  }
}

class FakeEncrypt implements Encrypt {
  public async hash(value: string): Promise<string> {
    return `hashed:${value}`;
  }
}

class FakeMailer implements Mailer {
  public sent: MailerMessage[] = [];

  public async send(message: MailerMessage): Promise<void> {
    this.sent.push(message);
  }
}

class FakeUnitOfWork implements UnitOfWork {
  public executed = false;

  public async executeInTransaction<T>(work: () => Promise<T>): Promise<T> {
    this.executed = true;
    return work();
  }
}

describe("RegisterUserUseCase", () => {
  it("deve cadastrar um usuário com senha hasheada", async () => {
    const user_repository = new InMemoryUserRepository();
    const encrypt = new FakeEncrypt();
    const unit_of_work = new FakeUnitOfWork();
    const mailer = new FakeMailer();
    const use_case = new RegisterUserUseCase(
      user_repository,
      encrypt,
      unit_of_work,
      mailer,
    );

    const output = await use_case.execute({
      name: "Maria Silva",
      email: "maria@email.com",
      password: "123456",
    });

    expect(output.id).toBeTruthy();
    expect(output.name).toBe("Maria Silva");
    expect(output.email).toBe("maria@email.com");
    expect(output.is_active).toBe(false);
    expect(output.email_confirmation_token).toBeTruthy();
    expect(user_repository.users).toHaveLength(1);
    expect(user_repository.confirmations).toHaveLength(1);
    expect(user_repository.users[0]?.password.hashed).toBe("hashed:123456");
    expect(unit_of_work.executed).toBe(true);
    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0]?.to).toBe(output.email);
    expect(mailer.sent[0]?.subject).toContain("Confirmação de e-mail");
    expect(mailer.sent[0]?.text).toContain(output.email_confirmation_token);
  });

  it("deve falhar quando o e-mail já está cadastrado", async () => {
    const user_repository = new InMemoryUserRepository();
    const encrypt = new FakeEncrypt();
    const unit_of_work = new FakeUnitOfWork();
    const mailer = new FakeMailer();
    const use_case = new RegisterUserUseCase(
      user_repository,
      encrypt,
      unit_of_work,
      mailer,
    );

    user_repository.users.push(
      User.rehydrate({
        id: UserId.create("550e8400-e29b-41d4-a716-446655440000"),
        name: Name.create("Usuário Existente"),
        email: Email.create("existente@email.com"),
        password: Password.rehydrate("hash-existente"),
        is_active: true,
        email_confirmed_at: new Date("2026-01-01T00:00:00.000Z"),
        created_at: new Date("2026-01-01T00:00:00.000Z"),
        updated_at: new Date("2026-01-01T00:00:00.000Z"),
      }),
    );

    await expect(
      use_case.execute({
        name: "Novo Usuário",
        email: "existente@email.com",
        password: "123456",
      }),
    ).rejects.toThrow(DomainError);
    expect(unit_of_work.executed).toBe(true);
  });
});
