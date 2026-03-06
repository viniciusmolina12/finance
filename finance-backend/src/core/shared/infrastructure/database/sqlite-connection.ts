import { resolve } from "node:path";

import { config } from "dotenv";
import { Database, open } from "sqlite";
import sqlite3 from "sqlite3";

config();

let db_instance: Database | null = null;

export async function closeSqliteConnection(): Promise<void> {
  if (db_instance) {
    await db_instance.close();
    db_instance = null;
  }
}

export async function getSqliteConnection(): Promise<Database> {
  if (db_instance) {
    return db_instance;
  }

  const database_url = process.env.DATABASE_URL ?? "./finance.db";
  const database_file =
    database_url === ":memory:" ? ":memory:" : resolve(database_url);

  db_instance = await open({
    filename: database_file,
    driver: sqlite3.Database,
  });

  await db_instance.exec("PRAGMA foreign_keys = ON;");

  return db_instance;
}
