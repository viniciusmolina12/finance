import { DomainError } from "#shared/domain/domain-error.js";
import { ValueObject } from "#shared/domain/value-object.js";

const MIN_NAME_LENGTH = 3;

export class InvalidNameError extends DomainError {
  public constructor() {
    super(
      "Nome deve possuir no mínimo 3 caracteres.",
      "USER_NAME_INVALID",
    );
  }
}

export class Name extends ValueObject {
  public readonly value: string;

  private constructor(value: string) {
    super();
    this.value = value;
  }

  public static create(value: string): Name {
    const normalized_value = value.trim();
    Name.validate(normalized_value);

    return new Name(normalized_value);
  }

  private static validate(value: string): void {
    if (value.length < MIN_NAME_LENGTH) {
      throw new InvalidNameError();
    }
  }
}
