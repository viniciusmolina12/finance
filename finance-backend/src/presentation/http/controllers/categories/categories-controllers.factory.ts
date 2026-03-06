import { UnitOfWork } from "#shared/domain/unit-of-work.js";
import { CreateCategoryUseCase } from "#category/application/usecases/create-category-use-case.js";
import { ListCategoriesUseCase } from "#category/application/usecases/list-categories-use-case.js";
import { SqliteCategoryRepository } from "#category/infrastructure/sqlite-category.repository.js";
import { CreateCategoryController } from "#presentation/http/controllers/categories/create-category-controller.js";
import { ListCategoriesController } from "#presentation/http/controllers/categories/list-categories-controller.js";

export type CategoriesControllers = {
  create_category: CreateCategoryController;
  list_categories: ListCategoriesController;
};

export function makeCategoriesControllers(
  unit_of_work: UnitOfWork,
): CategoriesControllers {
  const category_repository = new SqliteCategoryRepository();

  const create_category_use_case = new CreateCategoryUseCase(
    category_repository,
    unit_of_work,
  );
  const list_categories_use_case = new ListCategoriesUseCase(
    category_repository,
  );

  return {
    create_category: new CreateCategoryController(create_category_use_case),
    list_categories: new ListCategoriesController(list_categories_use_case),
  };
}
