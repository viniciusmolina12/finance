import { randomUUID } from "node:crypto";

import { DomainError } from "#shared/domain/domain-error.js";
import { ValueObject } from "#shared/domain/value-object.js";
import { CategoryName } from "#category/domain/value-objects/category-name.vo.js";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class InvalidCategoryIdError extends DomainError {
  public constructor(value: string) {
    super(`Id de categoria inválido: "${value}".`, "CATEGORY_ID_INVALID");
  }
}

export class CategoryId extends ValueObject {
  public readonly value: string;

  private constructor(value: string) {
    super();
    this.value = value;
  }

  public static create(value: string): CategoryId {
    const normalized_value = value.trim();
    CategoryId.validate(normalized_value);
    return new CategoryId(normalized_value);
  }

  public static generate(): CategoryId {
    return CategoryId.create(randomUUID());
  }

  private static validate(value: string): void {
    if (!UUID_V4_REGEX.test(value)) {
      throw new InvalidCategoryIdError(value);
    }
  }
}

type CategoryPrimitives = {
  id: CategoryId;
  name: CategoryName;
  created_at: Date;
  updated_at: Date;
};

export class Category {
  public readonly id: CategoryId;
  public readonly name: CategoryName;
  public readonly created_at: Date;
  public readonly updated_at: Date;

  private constructor(primitives: CategoryPrimitives) {
    this.id = primitives.id;
    this.name = primitives.name;
    this.created_at = primitives.created_at;
    this.updated_at = primitives.updated_at;
  }

  public static create(primitives: CategoryPrimitives): Category {
    return new Category(primitives);
  }

  public static rehydrate(primitives: CategoryPrimitives): Category {
    return new Category(primitives);
  }
}
