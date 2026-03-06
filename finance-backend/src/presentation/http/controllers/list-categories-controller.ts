import { Request, Response } from "express";
import { z } from "zod";

import { handleHttpControllerError } from "#presentation/http/controller-error-handler.js";
import { ListCategoriesUseCase } from "#category/application/usecases/list-categories-use-case.js";

const list_categories_schema = z.object({
  name: z.string().optional(),
});

export class ListCategoriesController {
  private readonly list_categories_use_case: ListCategoriesUseCase;

  public constructor(list_categories_use_case: ListCategoriesUseCase) {
    this.list_categories_use_case = list_categories_use_case;
  }

  public handle = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    try {
      const filters = list_categories_schema.parse(request.query);
      const result = await this.list_categories_use_case.execute(filters);

      response.status(200).json({
        categories: result.categories.map((category) => ({
          id: category.id,
          name: category.name,
          created_at: category.created_at.toISOString(),
          updated_at: category.updated_at.toISOString(),
        })),
      });
    } catch (error: unknown) {
      handleHttpControllerError(error, response, {
        validation_message: "Parâmetros inválidos para listagem de categorias.",
      });
    }
  };
}
