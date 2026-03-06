import { DomainError } from "#shared/domain/domain-error.js";
import { ValueObject } from "#shared/domain/value-object.js";

export class InvalidBillValueError extends DomainError {
  public constructor() {
    super(
      "Valor da despesa deve ser positivo e ter no máximo 2 casas decimais.",
      "BILL_VALUE_INVALID",
    );
  }
}

export class BillValue extends ValueObject {
  public readonly value: number;

  private constructor(value: number) {
    super();
    this.value = value;
  }

  public static create(value: number): BillValue {
    BillValue.validate(value);
    return new BillValue(value);
  }

  private static validate(value: number): void {
    const is_positive = value > 0;
    const has_at_most_two_decimals =
      Number.parseFloat(value.toFixed(2)) === value;

    if (!is_positive || !has_at_most_two_decimals) {
      throw new InvalidBillValueError();
    }
  }
}
