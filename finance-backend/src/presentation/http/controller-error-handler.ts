import { type Response } from "express";
import { z } from "zod";

import { DomainError } from "#shared/domain/domain-error.js";

type DomainStatusMap = Record<string, number>;

type HandleHttpControllerErrorOptions = {
  validation_message: string;
  domain_status_map?: DomainStatusMap;
  default_domain_status?: number;
  default_status?: number;
};

const DEFAULT_DOMAIN_STATUS = 422;
const DEFAULT_STATUS = 500;

export function handleHttpControllerError(
  error: unknown,
  response: Response,
  options: HandleHttpControllerErrorOptions,
): void {
  const {
    validation_message,
    domain_status_map,
    default_domain_status = DEFAULT_DOMAIN_STATUS,
    default_status = DEFAULT_STATUS,
  } = options;

  if (error instanceof z.ZodError) {
    response.status(400).json({
      message: validation_message,
      errors: error.issues.map((issue) => issue.message),
    });
    return;
  }

  if (error instanceof DomainError) {
    const status_code =
      (domain_status_map && domain_status_map[error.code]) ??
      default_domain_status;

    response.status(status_code).json({
      message: error.message,
      code: error.code,
    });
    return;
  }

  console.error(error);
  response.status(default_status).json({
    message: "Erro interno ao processar requisição.",
  });
}
