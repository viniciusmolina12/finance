import { Router } from "express";

import { ConfirmUserEmailController } from "#presentation/http/controllers/confirm-user-email-controller.js";
import { RegisterUserController } from "#presentation/http/controllers/register-user-controller.js";

export function createUsersRoutes(
  register_user_controller: RegisterUserController,
  confirm_user_email_controller: ConfirmUserEmailController,
): Router {
  const users_router = Router();

  users_router.post("/register", register_user_controller.handle);
  users_router.get("/confirm-email", confirm_user_email_controller.handle);

  return users_router;
}
