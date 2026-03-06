import { Category, CategoryId } from "#category/domain/category.aggregate.js";

export type ListCategoriesFilters = {
  name?: string;
};

export interface ICategoryRepository {
  create(category: Category): Promise<void>;
  findById(id: CategoryId): Promise<Category | null>;
  findAll(filters: ListCategoriesFilters): Promise<Category[]>;
}
