import { randomUUID } from "node:crypto";

import { DomainError } from "#shared/domain/domain-error.js";
import { ValueObject } from "#shared/domain/value-object.js";
import { CategoryId } from "#category/domain/category.aggregate.js";
import { BillDescription } from "#bill/domain/value-objects/bill-description.vo.js";
import { BillValue } from "#bill/domain/value-objects/bill-value.vo.js";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class InvalidBillIdError extends DomainError {
  public constructor(value: string) {
    super(`Id de despesa inválido: "${value}".`, "BILL_ID_INVALID");
  }
}

export class BillId extends ValueObject {
  public readonly value: string;

  private constructor(value: string) {
    super();
    this.value = value;
  }

  public static create(value: string): BillId {
    const normalized_value = value.trim();
    BillId.validate(normalized_value);
    return new BillId(normalized_value);
  }

  public static generate(): BillId {
    return BillId.create(randomUUID());
  }

  private static validate(value: string): void {
    if (!UUID_V4_REGEX.test(value)) {
      throw new InvalidBillIdError(value);
    }
  }
}

type BillPrimitives = {
  id: BillId;
  category_id: CategoryId;
  description: BillDescription;
  value: BillValue;
  date: Date;
  created_at: Date;
  updated_at: Date;
};

export class Bill {
  public readonly id: BillId;
  public readonly category_id: CategoryId;
  public readonly description: BillDescription;
  public readonly value: BillValue;
  public readonly date: Date;
  public readonly created_at: Date;
  public readonly updated_at: Date;

  private constructor(primitives: BillPrimitives) {
    this.id = primitives.id;
    this.category_id = primitives.category_id;
    this.description = primitives.description;
    this.value = primitives.value;
    this.date = primitives.date;
    this.created_at = primitives.created_at;
    this.updated_at = primitives.updated_at;
  }

  public static create(primitives: BillPrimitives): Bill {
    return new Bill(primitives);
  }

  public static rehydrate(primitives: BillPrimitives): Bill {
    return new Bill(primitives);
  }
}
