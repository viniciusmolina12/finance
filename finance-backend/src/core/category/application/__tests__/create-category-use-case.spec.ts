import { DomainError } from "#shared/domain/domain-error.js";
import { UnitOfWork } from "#shared/domain/unit-of-work.js";
import { Category } from "#category/domain/category.aggregate.js";
import {
  ICategoryRepository,
  ListCategoriesFilters,
} from "#category/domain/category.repository.js";
import { CreateCategoryUseCase } from "#category/application/usecases/create-category-use-case.js";

class InMemoryCategoryRepository implements ICategoryRepository {
  public categories: Category[] = [];

  public async create(category: Category): Promise<void> {
    this.categories.push(category);
  }

  public async findAll(filters: ListCategoriesFilters): Promise<Category[]> {
    if (!filters.name) {
      return this.categories;
    }

    const term = filters.name.toLowerCase();
    return this.categories.filter((c) =>
      c.name.value.toLowerCase().includes(term),
    );
  }
}

class FakeUnitOfWork implements UnitOfWork {
  public executed = false;

  public async executeInTransaction<T>(work: () => Promise<T>): Promise<T> {
    this.executed = true;
    return work();
  }
}

describe("CreateCategoryUseCase", () => {
  it("deve criar uma categoria com nome válido", async () => {
    const repository = new InMemoryCategoryRepository();
    const unit_of_work = new FakeUnitOfWork();
    const use_case = new CreateCategoryUseCase(repository, unit_of_work);

    const output = await use_case.execute({ name: "Alimentação" });

    expect(output.id).toBeTruthy();
    expect(output.name).toBe("Alimentação");
    expect(output.created_at).toBeInstanceOf(Date);
    expect(output.updated_at).toBeInstanceOf(Date);
    expect(repository.categories).toHaveLength(1);
    expect(repository.categories[0]?.name.value).toBe("Alimentação");
    expect(unit_of_work.executed).toBe(true);
  });

  it("deve remover espaços extras do nome", async () => {
    const repository = new InMemoryCategoryRepository();
    const unit_of_work = new FakeUnitOfWork();
    const use_case = new CreateCategoryUseCase(repository, unit_of_work);

    const output = await use_case.execute({ name: "  Transporte  " });

    expect(output.name).toBe("Transporte");
    expect(repository.categories[0]?.name.value).toBe("Transporte");
  });

  it("deve falhar se o nome tiver menos de 2 caracteres", async () => {
    const repository = new InMemoryCategoryRepository();
    const unit_of_work = new FakeUnitOfWork();
    const use_case = new CreateCategoryUseCase(repository, unit_of_work);

    await expect(use_case.execute({ name: "A" })).rejects.toThrow(DomainError);
    await expect(use_case.execute({ name: "" })).rejects.toThrow(DomainError);
    expect(repository.categories).toHaveLength(0);
  });

  it("deve atribuir created_at e updated_at com o mesmo valor na criação", async () => {
    const repository = new InMemoryCategoryRepository();
    const unit_of_work = new FakeUnitOfWork();
    const use_case = new CreateCategoryUseCase(repository, unit_of_work);

    const output = await use_case.execute({ name: "Lazer" });

    expect(output.created_at.getTime()).toBe(output.updated_at.getTime());
  });
});
