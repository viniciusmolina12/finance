import { UnitOfWork } from "#shared/domain/unit-of-work.js";
import { SqliteCategoryRepository } from "#category/infrastructure/sqlite-category.repository.js";
import { CreateBillUseCase } from "#bill/application/usecases/create-bill-use-case.js";
import { SqliteBillRepository } from "#bill/infrastructure/sqlite-bill.repository.js";
import { CreateBillController } from "#presentation/http/controllers/bills/create-bill-controller.js";

export type BillsControllers = {
  create_bill: CreateBillController;
};

export function makeBillsControllers(unit_of_work: UnitOfWork): BillsControllers {
  const bill_repository = new SqliteBillRepository();
  const category_repository = new SqliteCategoryRepository();

  const create_bill_use_case = new CreateBillUseCase(
    bill_repository,
    category_repository,
    unit_of_work,
  );

  return {
    create_bill: new CreateBillController(create_bill_use_case),
  };
}
