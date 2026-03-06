import { DomainError } from "#shared/domain/domain-error.js";
import { ValueObject } from "#shared/domain/value-object.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class InvalidEmailError extends DomainError {
  public constructor(value: string) {
    super(`E-mail inválido: "${value}".`, "USER_EMAIL_INVALID");
  }
}

export class Email extends ValueObject {
  public readonly value: string;

  private constructor(value: string) {
    super();
    this.value = value;
  }

  public static create(value: string): Email {
    const normalized_value = value.trim().toLowerCase();
    Email.validate(normalized_value);

    return new Email(normalized_value);
  }

  private static validate(value: string): void {
    if (!EMAIL_REGEX.test(value)) {
      throw new InvalidEmailError(value);
    }
  }
}
