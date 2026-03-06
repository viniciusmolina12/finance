import { Router } from "express";

import { CreateCategoryController } from "#presentation/http/controllers/create-category-controller.js";
import { ListCategoriesController } from "#presentation/http/controllers/list-categories-controller.js";

export function createCategoriesRoutes(
  create_category_controller: CreateCategoryController,
  list_categories_controller: ListCategoriesController,
): Router {
  const categories_router = Router();

  categories_router.post("/", create_category_controller.handle);
  categories_router.get("/", list_categories_controller.handle);

  return categories_router;
}
