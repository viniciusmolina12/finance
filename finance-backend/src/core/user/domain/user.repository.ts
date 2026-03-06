import { EmailConfirmationToken } from "./value-objects/email-confirmation-token.vo.js";
import { Email } from "./value-objects/email.vo.js";
import { User, UserId } from "./user.aggregate.js";

export type EmailConfirmation = {
  user_id: UserId;
  token: EmailConfirmationToken;
  expires_at: Date;
  confirmed_at: Date | null;
};

export interface IUserRepository {
  findByEmail(email: Email): Promise<User | null>;
  create(user: User): Promise<void>;
  createEmailConfirmation(input: {
    user_id: UserId;
    token: EmailConfirmationToken;
    expires_at: Date;
    created_at: Date;
  }): Promise<void>;
  findEmailConfirmationByToken(
    token: EmailConfirmationToken,
  ): Promise<EmailConfirmation | null>;
  activateUserById(user_id: UserId, activated_at: Date): Promise<void>;
  markEmailConfirmationAsConfirmed(
    token: EmailConfirmationToken,
    confirmed_at: Date,
  ): Promise<void>;
}
