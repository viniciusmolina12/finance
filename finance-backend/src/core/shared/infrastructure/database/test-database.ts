import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  closeSqliteConnection,
  getSqliteConnection,
} from "#shared/infrastructure/database/sqlite-connection.js";

async function runMigrations(): Promise<void> {
  const db = await getSqliteConnection();
  const migration_dir = resolve(process.cwd(), "sql");
  const files = await readdir(migration_dir);
  const migration_files = files
    .filter((file_name) => file_name.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));

  for (const file_name of migration_files) {
    const sql = await readFile(resolve(migration_dir, file_name), "utf8");

    try {
      await db.exec(sql);
    } catch (error: unknown) {
      const message = String(error).toLowerCase();
      const is_ignorable =
        message.includes("already exists") ||
        message.includes("duplicate column name");

      if (!is_ignorable) {
        throw error;
      }
    }
  }
}

export async function setupTestDatabase(): Promise<void> {
  process.env.DATABASE_URL = ":memory:";
  await closeSqliteConnection();
  await runMigrations();
}

export async function teardownTestDatabase(): Promise<void> {
  await closeSqliteConnection();
}

export async function clearTables(...table_names: string[]): Promise<void> {
  const db = await getSqliteConnection();

  for (const table_name of table_names) {
    await db.run(`DELETE FROM ${table_name}`);
  }
}
