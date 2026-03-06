import { UnitOfWork } from "#shared/domain/unit-of-work.js";
import { getSqliteConnection } from "#shared/infrastructure/database/sqlite-connection.js";

export class SqliteUnitOfWork implements UnitOfWork {
  public async executeInTransaction<T>(work: () => Promise<T>): Promise<T> {
    const db = await getSqliteConnection();

    await db.exec("BEGIN TRANSACTION;");

    try {
      const result = await work();
      await db.exec("COMMIT;");
      return result;
    } catch (error: unknown) {
      await db.exec("ROLLBACK;");
      throw error;
    }
  }
}
