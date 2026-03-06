import express from "express";

import { SqliteUnitOfWork } from "#shared/infrastructure/database/sqlite-unit-of-work.js";
import { makeUsersControllers } from "#presentation/http/controllers/users/users-controllers.factory.js";
import { makeCategoriesControllers } from "#presentation/http/controllers/categories/categories-controllers.factory.js";
import { makeBillsControllers } from "#presentation/http/controllers/bills/bills-controllers.factory.js";
import { createUsersRoutes } from "#presentation/http/routes/users-routes.js";
import { createCategoriesRoutes } from "#presentation/http/routes/categories-routes.js";
import { createBillsRoutes } from "#presentation/http/routes/bills-routes.js";

export function createApp() {
  const app = express();
  const unit_of_work = new SqliteUnitOfWork();

  const users = makeUsersControllers(unit_of_work);
  const categories = makeCategoriesControllers(unit_of_work);
  const bills = makeBillsControllers(unit_of_work);

  app.use(express.json());
  app.use(
    "/users",
    createUsersRoutes(users.register_user, users.confirm_user_email),
  );
  app.use(
    "/categories",
    createCategoriesRoutes(categories.create_category, categories.list_categories),
  );
  app.use("/bill", createBillsRoutes(bills.create_bill));

  app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });

  return app;
}
