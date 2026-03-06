import { UnitOfWork } from "#shared/domain/unit-of-work.js";
import { Category, CategoryId } from "#category/domain/category.aggregate.js";
import { CategoryName } from "#category/domain/value-objects/category-name.vo.js";
import { ICategoryRepository } from "#category/domain/category.repository.js";

export type CreateCategoryInput = {
  name: string;
};

export type CreateCategoryOutput = {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
};

export class CreateCategoryUseCase {
  private readonly category_repository: ICategoryRepository;
  private readonly unit_of_work: UnitOfWork;

  public constructor(
    category_repository: ICategoryRepository,
    unit_of_work: UnitOfWork,
  ) {
    this.category_repository = category_repository;
    this.unit_of_work = unit_of_work;
  }

  public async execute(
    input: CreateCategoryInput,
  ): Promise<CreateCategoryOutput> {
    return this.unit_of_work.executeInTransaction(async () => {
      const now = new Date();
      const category = Category.create({
        id: CategoryId.generate(),
        name: CategoryName.create(input.name),
        created_at: now,
        updated_at: now,
      });

      await this.category_repository.create(category);

      return {
        id: category.id.value,
        name: category.name.value,
        created_at: category.created_at,
        updated_at: category.updated_at,
      };
    });
  }
}
