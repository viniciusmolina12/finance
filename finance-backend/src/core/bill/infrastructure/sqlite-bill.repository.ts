import { getSqliteConnection } from "#shared/infrastructure/database/sqlite-connection.js";
import { Bill, BillId } from "#bill/domain/bill.aggregate.js";
import { BillDescription } from "#bill/domain/value-objects/bill-description.vo.js";
import { BillValue } from "#bill/domain/value-objects/bill-value.vo.js";
import { IBillRepository } from "#bill/domain/bill.repository.js";
import { CategoryId } from "#category/domain/category.aggregate.js";

type BillRow = {
  id: string;
  category_id: string;
  description: string;
  value: number;
  date: string;
  created_at: string;
  updated_at: string;
};

export class SqliteBillRepository implements IBillRepository {
  public async create(bill: Bill): Promise<void> {
    const db = await getSqliteConnection();

    await db.run(
      `INSERT INTO bills (id, category_id, description, value, date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      bill.id.value,
      bill.category_id.value,
      bill.description.value,
      bill.value.value,
      bill.date.toISOString(),
      bill.created_at.toISOString(),
      bill.updated_at.toISOString(),
    );
  }
}
