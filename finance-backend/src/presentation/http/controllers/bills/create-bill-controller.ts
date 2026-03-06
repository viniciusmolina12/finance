import { Request, Response } from "express";
import { z } from "zod";

import { handleHttpControllerError } from "#presentation/http/controller-error-handler.js";
import { CreateBillUseCase } from "#bill/application/usecases/create-bill-use-case.js";

const create_bill_schema = z.object({
  category_id: z.string().uuid(),
  description: z.string().min(1).max(255),
  value: z.number().positive(),
  date: z.string().datetime(),
});

export class CreateBillController {
  private readonly create_bill_use_case: CreateBillUseCase;

  public constructor(create_bill_use_case: CreateBillUseCase) {
    this.create_bill_use_case = create_bill_use_case;
  }

  public handle = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    try {
      const payload = create_bill_schema.parse(request.body);
      const result = await this.create_bill_use_case.execute(payload);

      response.status(201).json({
        id: result.id,
        category_id: result.category_id,
        description: result.description,
        value: result.value,
        date: result.date.toISOString(),
        created_at: result.created_at.toISOString(),
        updated_at: result.updated_at.toISOString(),
      });
    } catch (error: unknown) {
      handleHttpControllerError(error, response, {
        validation_message: "Dados inválidos para criação de despesa.",
        domain_status_map: {
          BILL_CATEGORY_NOT_FOUND: 404,
          BILL_VALUE_INVALID: 422,
          BILL_DESCRIPTION_INVALID: 422,
        },
      });
    }
  };
}
