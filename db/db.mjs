import pg from "pg";

const { Pool } = pg;

function loadEnvIfAvailable() {
  if (process.env.DATABASE_URL) {
    return;
  }

  if (typeof process.loadEnvFile === "function") {
    try {
      process.loadEnvFile();
    } catch {
      // Ignore missing .env file errors; validation happens below.
    }
  }
}

function createPool() {
  loadEnvIfAvailable();
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Missing DATABASE_URL environment variable. Add it to .env or export it in your shell.",
    );
  }

  const shouldUseSsl = process.env.DATABASE_SSL !== "false";

  return new Pool({
    connectionString,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
  });
}

const db = createPool();

export default db;
