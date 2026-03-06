import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { getSqliteConnection } from "#shared/infrastructure/database/sqlite-connection.js";

function isIgnorableMigrationError(error: unknown): boolean {
  const message = String(error).toLowerCase();

  return (
    message.includes("duplicate column name") ||
    message.includes("already exists")
  );
}

async function runMigrations(): Promise<void> {
  const db = await getSqliteConnection();
  const migration_dir = resolve("sql");
  const files = await readdir(migration_dir);
  const migration_files = files
    .filter((file_name) => file_name.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));

  for (const file_name of migration_files) {
    const migration_path = resolve(migration_dir, file_name);
    const migration_sql = await readFile(migration_path, "utf8");

    try {
      await db.exec(migration_sql);
    } catch (error: unknown) {
      if (!isIgnorableMigrationError(error)) {
        throw error;
      }
    }
  }

  await db.close();

  process.stdout.write("Migração executada com sucesso.\n");
}

runMigrations().catch((error: unknown) => {
  process.stderr.write(`Erro ao executar migração: ${String(error)}\n`);
  process.exitCode = 1;
});
