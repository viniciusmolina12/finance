import { Request, Response } from "express";
import { z } from "zod";

import { handleHttpControllerError } from "#presentation/http/controller-error-handler.js";
import { RegisterUserUseCase } from "#user/application/usecases/register-user-use-case.js";

const register_user_schema = z.object({
  name: z.string().min(3),
  email: z.email(),
  password: z.string().min(6),
});

export class RegisterUserController {
  private readonly register_user_use_case: RegisterUserUseCase;

  public constructor(register_user_use_case: RegisterUserUseCase) {
    this.register_user_use_case = register_user_use_case;
  }

  public handle = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    try {
      const payload = register_user_schema.parse(request.body);
      const user = await this.register_user_use_case.execute(payload);

      response.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        is_active: user.is_active,
        created_at: user.created_at.toISOString(),
      });
    } catch (error: unknown) {
      handleHttpControllerError(error, response, {
        validation_message: "Dados inválidos para cadastro.",
        domain_status_map: {
          USER_EMAIL_ALREADY_EXISTS: 409,
        },
      });
    }
  };
}
