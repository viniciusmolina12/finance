import { DomainError } from "#shared/domain/domain-error.js";
import { Password } from "../password.vo.js";

describe("Password", () => {
  it("deve criar senha com raw e hashed", () => {
    const password = Password.create("123456", "hash-gerado");

    expect(password.raw).toBe("123456");
    expect(password.hashed).toBe("hash-gerado");
    expect(password.value).toBe("hash-gerado");
  });

  it("deve falhar para senha curta", () => {
    expect(() => Password.create("123", "hash-gerado")).toThrow(DomainError);
  });

  it("deve reidratar apenas com hash", () => {
    const password = Password.rehydrate("hash-reidratado");

    expect(password.raw).toBeNull();
    expect(password.hashed).toBe("hash-reidratado");
  });
});
