import { DomainError } from "#shared/domain/domain-error.js";
import { Email } from "../email.vo.js";

describe("Email", () => {
  it("deve normalizar e-mail ao criar", () => {
    const email = Email.create("  Teste@Email.COM  ");

    expect(email.value).toBe("teste@email.com");
  });

  it("deve falhar para e-mail inválido", () => {
    expect(() => Email.create("email-invalido")).toThrow(DomainError);
  });
});
