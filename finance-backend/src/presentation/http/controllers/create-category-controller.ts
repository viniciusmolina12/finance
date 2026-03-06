import { Request, Response } from "express";
import { z } from "zod";

import { handleHttpControllerError } from "#presentation/http/controller-error-handler.js";
import { CreateCategoryUseCase } from "#category/application/usecases/create-category-use-case.js";

const create_category_schema = z.object({
  name: z.string().min(2),
});

export class CreateCategoryController {
  private readonly create_category_use_case: CreateCategoryUseCase;

  public constructor(create_category_use_case: CreateCategoryUseCase) {
    this.create_category_use_case = create_category_use_case;
  }

  public handle = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    try {
      const payload = create_category_schema.parse(request.body);
      const result = await this.create_category_use_case.execute(payload);

      response.status(201).json({
        id: result.id,
        name: result.name,
        created_at: result.created_at.toISOString(),
        updated_at: result.updated_at.toISOString(),
      });
    } catch (error: unknown) {
      handleHttpControllerError(error, response, {
        validation_message: "Dados inválidos para criação de categoria.",
        domain_status_map: {
          CATEGORY_NAME_INVALID: 422,
        },
      });
    }
  };
}
