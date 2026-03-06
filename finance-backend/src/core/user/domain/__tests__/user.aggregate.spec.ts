import { DomainError } from "#shared/domain/domain-error.js";
import { UserId } from "../user.aggregate.js";

describe("UserId", () => {
  it("deve criar um id válido", () => {
    const user_id = UserId.create("550e8400-e29b-41d4-a716-446655440000");

    expect(user_id.value).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("deve gerar um id válido", () => {
    const user_id = UserId.generate();

    expect(user_id.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("deve falhar para id inválido", () => {
    expect(() => UserId.create("123")).toThrow(DomainError);
  });
});
