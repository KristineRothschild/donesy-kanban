import fs from "node:fs/promises";
import path from "node:path";
import db from "../db/db.mjs";

async function runMigrations() {
  const migrationsDir = path.resolve("db/migrations");
  const files = await fs.readdir(migrationsDir);
  const migrationFiles = files
    .filter((file) => file.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));

  for (const fileName of migrationFiles) {
    const filePath = path.join(migrationsDir, fileName);
    const sql = await fs.readFile(filePath, "utf-8");
    await db.query(sql);
    console.log(`Applied migration: ${fileName}`);
  }
}

runMigrations()
  .then(async () => {
    await db.end();
    console.log("Migrations completed");
  })
  .catch(async (error) => {
    await db.end();
    console.error("Migration failed:", error.message);
    process.exit(1);
  });
