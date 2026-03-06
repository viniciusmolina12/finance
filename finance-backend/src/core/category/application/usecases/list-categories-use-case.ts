import { ICategoryRepository } from "#category/domain/category.repository.js";

export type ListCategoriesInput = {
  name?: string;
};

export type CategoryItem = {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
};

export type ListCategoriesOutput = {
  categories: CategoryItem[];
};

export class ListCategoriesUseCase {
  private readonly category_repository: ICategoryRepository;

  public constructor(category_repository: ICategoryRepository) {
    this.category_repository = category_repository;
  }

  public async execute(
    input: ListCategoriesInput,
  ): Promise<ListCategoriesOutput> {
    const categories = await this.category_repository.findAll({
      name: input.name,
    });

    return {
      categories: categories.map((category) => ({
        id: category.id.value,
        name: category.name.value,
        created_at: category.created_at,
        updated_at: category.updated_at,
      })),
    };
  }
}
