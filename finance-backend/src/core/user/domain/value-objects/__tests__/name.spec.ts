import { DomainError } from "#shared/domain/domain-error.js";
import { Name } from "../name.vo.js";

describe("Name", () => {
  it("deve normalizar nome ao criar", () => {
    const name = Name.create("  Maria Silva  ");

    expect(name.value).toBe("Maria Silva");
  });

  it("deve falhar para nome muito curto", () => {
    expect(() => Name.create("ab")).toThrow(DomainError);
  });
});
