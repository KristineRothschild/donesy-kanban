import db from "../db/db.mjs";

async function nukeDatabase() {
  await db.query("DROP SCHEMA IF EXISTS public CASCADE;");
  await db.query("CREATE SCHEMA public;");
  await db.query("GRANT ALL ON SCHEMA public TO CURRENT_USER;");
  await db.query("GRANT ALL ON SCHEMA public TO public;");
}

nukeDatabase()
  .then(async () => {
    await db.end();
    console.log("Database nuked successfully");
  })
  .catch(async (error) => {
    await db.end();
    console.error("Database nuke failed:", error.message);
    process.exit(1);
  });
