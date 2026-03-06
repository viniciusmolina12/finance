import express from "express";

import { BcryptEncrypt } from "#shared/infrastructure/encrypt/bcrypt-encrypt.js";
import { NodemailerMailer } from "#shared/infrastructure/mailer/nodemailer-mailer.js";
import { SqliteUnitOfWork } from "#shared/infrastructure/database/sqlite-unit-of-work.js";
import { ConfirmUserEmailUseCase } from "#user/application/usecases/confirm-user-email-use-case.js";
import { RegisterUserUseCase } from "#user/application/usecases/register-user-use-case.js";
import { SqliteUserRepository } from "#user/infrastructure/sqlite-user.repository.js";
import { ConfirmUserEmailController } from "#presentation/http/controllers/confirm-user-email-controller.js";
import { RegisterUserController } from "#presentation/http/controllers/register-user-controller.js";
import { createUsersRoutes } from "#presentation/http/routes/users-routes.js";

export function createApp() {
  const app = express();
  const user_repository = new SqliteUserRepository();
  const unit_of_work = new SqliteUnitOfWork();
  const encrypt = new BcryptEncrypt();
  const mailer = new NodemailerMailer();
  const app_url = process.env.APP_URL ?? "http://localhost:3001";
  const register_user_use_case = new RegisterUserUseCase(
    user_repository,
    encrypt,
    unit_of_work,
    mailer,
    app_url,
  );
  const confirm_user_email_use_case = new ConfirmUserEmailUseCase(
    user_repository,
    unit_of_work,
  );
  const register_user_controller = new RegisterUserController(
    register_user_use_case,
  );
  const confirm_user_email_controller = new ConfirmUserEmailController(
    confirm_user_email_use_case,
  );

  app.use(express.json());
  app.use(
    "/users",
    createUsersRoutes(register_user_controller, confirm_user_email_controller),
  );

  app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });

  return app;
}
