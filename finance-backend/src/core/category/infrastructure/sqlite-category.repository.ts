import { getSqliteConnection } from "#shared/infrastructure/database/sqlite-connection.js";
import { Category, CategoryId } from "#category/domain/category.aggregate.js";
import { CategoryName } from "#category/domain/value-objects/category-name.vo.js";
import {
  ICategoryRepository,
  ListCategoriesFilters,
} from "#category/domain/category.repository.js";

type CategoryRow = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export class SqliteCategoryRepository implements ICategoryRepository {
  public async create(category: Category): Promise<void> {
    const db = await getSqliteConnection();

    await db.run(
      `INSERT INTO categories (id, name, created_at, updated_at)
       VALUES (?, ?, ?, ?)`,
      category.id.value,
      category.name.value,
      category.created_at.toISOString(),
      category.updated_at.toISOString(),
    );
  }

  public async findAll(filters: ListCategoriesFilters): Promise<Category[]> {
    const db = await getSqliteConnection();

    const name_pattern = filters.name ? `%${filters.name}%` : "%";

    const rows = await db.all<CategoryRow[]>(
      `SELECT id, name, created_at, updated_at
       FROM categories
       WHERE name LIKE ?
       ORDER BY name ASC`,
      name_pattern,
    );

    return rows.map((row) =>
      Category.rehydrate({
        id: CategoryId.create(row.id),
        name: CategoryName.create(row.name),
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
      }),
    );
  }
}
