import { BcryptEncrypt } from "#shared/infrastructure/encrypt/bcrypt-encrypt.js";
import { NodemailerMailer } from "#shared/infrastructure/mailer/nodemailer-mailer.js";
import { UnitOfWork } from "#shared/domain/unit-of-work.js";
import { ConfirmUserEmailUseCase } from "#user/application/usecases/confirm-user-email-use-case.js";
import { RegisterUserUseCase } from "#user/application/usecases/register-user-use-case.js";
import { SqliteUserRepository } from "#user/infrastructure/sqlite-user.repository.js";
import { ConfirmUserEmailController } from "#presentation/http/controllers/users/confirm-user-email-controller.js";
import { RegisterUserController } from "#presentation/http/controllers/users/register-user-controller.js";

export type UsersControllers = {
  register_user: RegisterUserController;
  confirm_user_email: ConfirmUserEmailController;
};

export function makeUsersControllers(
  unit_of_work: UnitOfWork,
): UsersControllers {
  const user_repository = new SqliteUserRepository();
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

  return {
    register_user: new RegisterUserController(register_user_use_case),
    confirm_user_email: new ConfirmUserEmailController(
      confirm_user_email_use_case,
    ),
  };
}
