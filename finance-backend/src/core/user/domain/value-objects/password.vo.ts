import { DomainError } from "#shared/domain/domain-error.js";
import { ValueObject } from "#shared/domain/value-object.js";

const MIN_PASSWORD_LENGTH = 6;

export class InvalidPasswordError extends DomainError {
  public constructor() {
    super(
      "Senha deve possuir no mínimo 6 caracteres.",
      "USER_PASSWORD_INVALID",
    );
  }
}

export class InvalidPasswordHashError extends DomainError {
  public constructor() {
    super("Hash de senha inválido.", "USER_PASSWORD_HASH_INVALID");
  }
}

export class Password extends ValueObject {
  public readonly raw: string | null;
  public readonly hashed: string;
  public readonly value: string;

  private constructor(raw: string | null, hashed: string) {
    super();
    this.raw = raw;
    this.hashed = hashed;
    this.value = hashed;
  }

  public static create(raw: string, hashed: string): Password {
    Password.validateRaw(raw);
    Password.validateHashed(hashed);
    return new Password(raw, hashed);
  }

  public static rehydrate(hashed: string): Password {
    Password.validateHashed(hashed);
    return new Password(null, hashed);
  }

  public static validateRaw(value: string): void {
    if (value.length < MIN_PASSWORD_LENGTH) {
      throw new InvalidPasswordError();
    }
  }

  private static validateHashed(value: string): void {
    const normalized_value = value.trim();

    if (!normalized_value) {
      throw new InvalidPasswordHashError();
    }
  }
}
