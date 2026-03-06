import { DomainError } from "#shared/domain/domain-error.js";
import { ValueObject } from "#shared/domain/value-object.js";

const MIN_CATEGORY_NAME_LENGTH = 2;

export class InvalidCategoryNameError extends DomainError {
  public constructor() {
    super(
      "Nome da categoria deve possuir no mínimo 2 caracteres.",
      "CATEGORY_NAME_INVALID",
    );
  }
}

export class CategoryName extends ValueObject {
  public readonly value: string;

  private constructor(value: string) {
    super();
    this.value = value;
  }

  public static create(value: string): CategoryName {
    const normalized_value = value.trim();
    CategoryName.validate(normalized_value);
    return new CategoryName(normalized_value);
  }

  private static validate(value: string): void {
    if (value.length < MIN_CATEGORY_NAME_LENGTH) {
      throw new InvalidCategoryNameError();
    }
  }
}
