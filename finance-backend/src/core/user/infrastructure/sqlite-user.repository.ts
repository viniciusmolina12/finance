import { getSqliteConnection } from "#shared/infrastructure/database/sqlite-connection.js";
import { EmailConfirmationToken } from "#user/domain/value-objects/email-confirmation-token.vo.js";
import { Email } from "#user/domain/value-objects/email.vo.js";
import { Name } from "#user/domain/value-objects/name.vo.js";
import { Password } from "#user/domain/value-objects/password.vo.js";
import { IUserRepository } from "#user/domain/user.repository.js";
import { User, UserId } from "#user/domain/user.aggregate.js";

type UserRow = {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
  is_active: number;
  email_confirmed_at: string | null;
};

type EmailConfirmationRow = {
  user_id: string;
  token: string;
  expires_at: string;
  confirmed_at: string | null;
};

export class SqliteUserRepository implements IUserRepository {
  public async findByEmail(email: Email): Promise<User | null> {
    const db = await getSqliteConnection();
    const row = await db.get<UserRow>(
      `SELECT id, name, email, password, created_at, updated_at, is_active, email_confirmed_at
       FROM users
       WHERE email = ?`,
      email.value,
    );

    if (!row) {
      return null;
    }

    return User.rehydrate({
      id: UserId.create(row.id),
      name: Name.create(row.name),
      email: Email.create(row.email),
      password: Password.rehydrate(row.password),
      is_active: Boolean(row.is_active),
      email_confirmed_at: row.email_confirmed_at
        ? new Date(row.email_confirmed_at)
        : null,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    });
  }

  public async create(user: User): Promise<void> {
    const db = await getSqliteConnection();

    await db.run(
      `INSERT INTO users (
         id, name, email, password, is_active, email_confirmed_at, created_at, updated_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      user.id.value,
      user.name.value,
      user.email.value,
      user.password.hashed,
      user.is_active ? 1 : 0,
      user.email_confirmed_at ? user.email_confirmed_at.toISOString() : null,
      user.created_at.toISOString(),
      user.updated_at.toISOString(),
    );
  }

  public async createEmailConfirmation(input: {
    user_id: UserId;
    token: EmailConfirmationToken;
    expires_at: Date;
    created_at: Date;
  }): Promise<void> {
    const db = await getSqliteConnection();

    await db.run(
      `INSERT INTO user_email_confirmations (user_id, token, expires_at, confirmed_at, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      input.user_id.value,
      input.token.value,
      input.expires_at.toISOString(),
      null,
      input.created_at.toISOString(),
    );
  }

  public async findEmailConfirmationByToken(
    token: EmailConfirmationToken,
  ): Promise<{
    user_id: UserId;
    token: EmailConfirmationToken;
    expires_at: Date;
    confirmed_at: Date | null;
  } | null> {
    const db = await getSqliteConnection();
    const row = await db.get<EmailConfirmationRow>(
      `SELECT user_id, token, expires_at, confirmed_at
       FROM user_email_confirmations
       WHERE token = ?`,
      token.value,
    );

    if (!row) {
      return null;
    }

    return {
      user_id: UserId.create(row.user_id),
      token: EmailConfirmationToken.create(row.token),
      expires_at: new Date(row.expires_at),
      confirmed_at: row.confirmed_at ? new Date(row.confirmed_at) : null,
    };
  }

  public async activateUserById(
    user_id: UserId,
    activated_at: Date,
  ): Promise<void> {
    const db = await getSqliteConnection();

    await db.run(
      `UPDATE users
       SET is_active = 1, email_confirmed_at = ?, updated_at = ?
       WHERE id = ?`,
      activated_at.toISOString(),
      activated_at.toISOString(),
      user_id.value,
    );
  }

  public async markEmailConfirmationAsConfirmed(
    token: EmailConfirmationToken,
    confirmed_at: Date,
  ): Promise<void> {
    const db = await getSqliteConnection();

    await db.run(
      `UPDATE user_email_confirmations
       SET confirmed_at = ?
       WHERE token = ?`,
      confirmed_at.toISOString(),
      token.value,
    );
  }
}
