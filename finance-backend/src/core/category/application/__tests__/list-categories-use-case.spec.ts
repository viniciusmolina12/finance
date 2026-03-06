import { Category, CategoryId } from "#category/domain/category.aggregate.js";
import { CategoryName } from "#category/domain/value-objects/category-name.vo.js";
import {
  ICategoryRepository,
  ListCategoriesFilters,
} from "#category/domain/category.repository.js";
import { ListCategoriesUseCase } from "#category/application/usecases/list-categories-use-case.js";

const FIXED_DATE = new Date("2026-01-01T00:00:00.000Z");

function makeCategory(id: string, name: string): Category {
  return Category.rehydrate({
    id: CategoryId.create(id),
    name: CategoryName.create(name),
    created_at: FIXED_DATE,
    updated_at: FIXED_DATE,
  });
}

class InMemoryCategoryRepository implements ICategoryRepository {
  public categories: Category[] = [];

  public async create(category: Category): Promise<void> {
    this.categories.push(category);
  }

  public async findById(id: CategoryId): Promise<Category | null> {
    return this.categories.find((c) => c.id.value === id.value) ?? null;
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

describe("ListCategoriesUseCase", () => {
  it("deve retornar todas as categorias quando não há filtro", async () => {
    const repository = new InMemoryCategoryRepository();
    repository.categories = [
      makeCategory("550e8400-e29b-41d4-a716-446655440001", "Alimentação"),
      makeCategory("550e8400-e29b-41d4-a716-446655440002", "Transporte"),
      makeCategory("550e8400-e29b-41d4-a716-446655440003", "Lazer"),
    ];

    const use_case = new ListCategoriesUseCase(repository);
    const output = await use_case.execute({});

    expect(output.categories).toHaveLength(3);
    expect(output.categories.map((c) => c.name)).toEqual([
      "Alimentação",
      "Transporte",
      "Lazer",
    ]);
  });

  it("deve filtrar categorias por nome (busca parcial)", async () => {
    const repository = new InMemoryCategoryRepository();
    repository.categories = [
      makeCategory("550e8400-e29b-41d4-a716-446655440001", "Alimentação"),
      makeCategory("550e8400-e29b-41d4-a716-446655440002", "Transporte"),
      makeCategory("550e8400-e29b-41d4-a716-446655440003", "Lazer"),
    ];

    const use_case = new ListCategoriesUseCase(repository);
    const output = await use_case.execute({ name: "trans" });

    expect(output.categories).toHaveLength(1);
    expect(output.categories[0]?.name).toBe("Transporte");
  });

  it("deve retornar lista vazia quando não há categorias", async () => {
    const repository = new InMemoryCategoryRepository();
    const use_case = new ListCategoriesUseCase(repository);

    const output = await use_case.execute({});

    expect(output.categories).toHaveLength(0);
  });

  it("deve retornar lista vazia quando filtro não encontra correspondência", async () => {
    const repository = new InMemoryCategoryRepository();
    repository.categories = [
      makeCategory("550e8400-e29b-41d4-a716-446655440001", "Alimentação"),
    ];

    const use_case = new ListCategoriesUseCase(repository);
    const output = await use_case.execute({ name: "xyz" });

    expect(output.categories).toHaveLength(0);
  });

  it("deve mapear corretamente os campos do output", async () => {
    const repository = new InMemoryCategoryRepository();
    const id = "550e8400-e29b-41d4-a716-446655440001";
    repository.categories = [makeCategory(id, "Alimentação")];

    const use_case = new ListCategoriesUseCase(repository);
    const output = await use_case.execute({});

    const category = output.categories[0];
    expect(category?.id).toBe(id);
    expect(category?.name).toBe("Alimentação");
    expect(category?.created_at).toEqual(FIXED_DATE);
    expect(category?.updated_at).toEqual(FIXED_DATE);
  });
});
