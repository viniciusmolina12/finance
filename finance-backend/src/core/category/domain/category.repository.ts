import { Category } from "#category/domain/category.aggregate.js";

export type ListCategoriesFilters = {
  name?: string;
};

export interface ICategoryRepository {
  create(category: Category): Promise<void>;
  findAll(filters: ListCategoriesFilters): Promise<Category[]>;
}
