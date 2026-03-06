import { DomainError } from "#shared/domain/domain-error.js";
import { ValueObject } from "#shared/domain/value-object.js";

const MAX_DESCRIPTION_LENGTH = 255;

export class InvalidBillDescriptionError extends DomainError {
  public constructor() {
    super(
      "Descrição da despesa não pode ser vazia e deve ter no máximo 255 caracteres.",
      "BILL_DESCRIPTION_INVALID",
    );
  }
}

export class BillDescription extends ValueObject {
  public readonly value: string;

  private constructor(value: string) {
    super();
    this.value = value;
  }

  public static create(value: string): BillDescription {
    const normalized_value = value.trim();
    BillDescription.validate(normalized_value);
    return new BillDescription(normalized_value);
  }

  private static validate(value: string): void {
    if (value.length === 0 || value.length > MAX_DESCRIPTION_LENGTH) {
      throw new InvalidBillDescriptionError();
    }
  }
}
