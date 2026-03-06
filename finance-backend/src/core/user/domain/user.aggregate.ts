import { ValueObject } from "#shared/domain/value-object.js";
import { Email } from "./value-objects/email.vo.js";
import { Name } from "./value-objects/name.vo.js";
import { Password } from "./value-objects/password.vo.js";

import { randomUUID } from "node:crypto";
import { DomainError } from "#shared/domain/domain-error.js";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class InvalidUserIdError extends DomainError {
  public constructor(value: string) {
    super(`Id de usuário inválido: "${value}".`, "USER_ID_INVALID");
  }
}

export class UserId extends ValueObject {
  public readonly value: string;

  private constructor(value: string) {
    super();
    this.value = value;
  }

  public static create(value: string): UserId {
    const normalized_value = value.trim();
    UserId.validate(normalized_value);
    return new UserId(normalized_value);
  }

  public static generate(): UserId {
    return UserId.create(randomUUID());
  }

  private static validate(value: string): void {
    if (!UUID_V4_REGEX.test(value)) {
      throw new InvalidUserIdError(value);
    }
  }
}

type UserPrimitives = {
  id: UserId;
  name: Name;
  email: Email;
  password: Password;
  is_active: boolean;
  email_confirmed_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export class User {
  public readonly id: UserId;
  public readonly name: Name;
  public readonly email: Email;
  public readonly password: Password;
  public readonly is_active: boolean;
  public readonly email_confirmed_at: Date | null;
  public readonly created_at: Date;
  public readonly updated_at: Date;

  private constructor(primitives: UserPrimitives) {
    this.id = primitives.id;
    this.name = primitives.name;
    this.email = primitives.email;
    this.password = primitives.password;
    this.is_active = primitives.is_active;
    this.email_confirmed_at = primitives.email_confirmed_at;
    this.created_at = primitives.created_at;
    this.updated_at = primitives.updated_at;
  }

  public static register(primitives: UserPrimitives): User {
    return new User(primitives);
  }

  public static rehydrate(primitives: UserPrimitives): User {
    return new User(primitives);
  }
}
