import { DomainError } from "#shared/domain/domain-error.js";
import { ValueObject } from "#shared/domain/value-object.js";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class InvalidEmailConfirmationTokenError extends DomainError {
  public constructor() {
    super(
      "Token de confirmação inválido.",
      "USER_EMAIL_CONFIRMATION_TOKEN_INVALID",
    );
  }
}

export class EmailConfirmationToken extends ValueObject {
  public readonly value: string;

  private constructor(value: string) {
    super();
    this.value = value;
  }

  public static create(value: string): EmailConfirmationToken {
    const normalized_value = value.trim().toLowerCase();
    EmailConfirmationToken.validate(normalized_value);

    return new EmailConfirmationToken(normalized_value);
  }

  private static validate(value: string): void {
    if (!UUID_V4_REGEX.test(value)) {
      throw new InvalidEmailConfirmationTokenError();
    }
  }
}
