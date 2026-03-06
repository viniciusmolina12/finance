import { Request, Response } from "express";
import { z } from "zod";

import { handleHttpControllerError } from "#presentation/http/controller-error-handler.js";
import { ConfirmUserEmailUseCase } from "#user/application/usecases/confirm-user-email-use-case.js";

const confirm_user_email_schema = z.object({
  token: z.uuid(),
});

export class ConfirmUserEmailController {
  private readonly confirm_user_email_use_case: ConfirmUserEmailUseCase;

  public constructor(confirm_user_email_use_case: ConfirmUserEmailUseCase) {
    this.confirm_user_email_use_case = confirm_user_email_use_case;
  }

  public handle = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    try {
      const payload = confirm_user_email_schema.parse(request.query);
      const result = await this.confirm_user_email_use_case.execute(payload);

      response.status(200).json({
        user_id: result.user_id,
        confirmed_at: result.confirmed_at.toISOString(),
        message: "E-mail confirmado com sucesso.",
      });
    } catch (error: unknown) {
      handleHttpControllerError(error, response, {
        validation_message: "Dados inválidos para confirmação de e-mail.",
        domain_status_map: {
          USER_EMAIL_CONFIRMATION_NOT_FOUND: 404,
          USER_EMAIL_ALREADY_CONFIRMED: 409,
          USER_EMAIL_CONFIRMATION_EXPIRED: 410,
        },
      });
    }
  };
}
