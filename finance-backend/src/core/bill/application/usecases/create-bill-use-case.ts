import { DomainError } from "#shared/domain/domain-error.js";
import { UnitOfWork } from "#shared/domain/unit-of-work.js";
import { CategoryId } from "#category/domain/category.aggregate.js";
import { ICategoryRepository } from "#category/domain/category.repository.js";
import { Bill, BillId } from "#bill/domain/bill.aggregate.js";
import { BillDescription } from "#bill/domain/value-objects/bill-description.vo.js";
import { BillValue } from "#bill/domain/value-objects/bill-value.vo.js";
import { IBillRepository } from "#bill/domain/bill.repository.js";

export type CreateBillInput = {
  category_id: string;
  description: string;
  value: number;
  date: string;
};

export type CreateBillOutput = {
  id: string;
  category_id: string;
  description: string;
  value: number;
  date: Date;
  created_at: Date;
  updated_at: Date;
};

export class CreateBillUseCase {
  private readonly bill_repository: IBillRepository;
  private readonly category_repository: ICategoryRepository;
  private readonly unit_of_work: UnitOfWork;

  public constructor(
    bill_repository: IBillRepository,
    category_repository: ICategoryRepository,
    unit_of_work: UnitOfWork,
  ) {
    this.bill_repository = bill_repository;
    this.category_repository = category_repository;
    this.unit_of_work = unit_of_work;
  }

  public async execute(input: CreateBillInput): Promise<CreateBillOutput> {
    return this.unit_of_work.executeInTransaction(async () => {
      const category_id = CategoryId.create(input.category_id);
      const category = await this.category_repository.findById(category_id);

      if (!category) {
        throw new DomainError(
          "Categoria não encontrada.",
          "BILL_CATEGORY_NOT_FOUND",
        );
      }

      const now = new Date();
      const bill = Bill.create({
        id: BillId.generate(),
        category_id,
        description: BillDescription.create(input.description),
        value: BillValue.create(input.value),
        date: new Date(input.date),
        created_at: now,
        updated_at: now,
      });

      await this.bill_repository.create(bill);

      return {
        id: bill.id.value,
        category_id: bill.category_id.value,
        description: bill.description.value,
        value: bill.value.value,
        date: bill.date,
        created_at: bill.created_at,
        updated_at: bill.updated_at,
      };
    });
  }
}
