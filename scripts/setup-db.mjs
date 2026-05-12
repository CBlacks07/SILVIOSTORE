import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is missing. Configure it first, then rerun `npm run db:setup`.");
  process.exit(1);
}

const root = process.cwd();
const schemaFile = path.join(root, "sql", "schema.sql");
const seedFile = path.join(root, "sql", "seed.sql");
const psqlBin = process.env.PSQL_BIN || "psql";

function runPsql(filePath) {
  const result = spawnSync(psqlBin, [databaseUrl, "-v", "ON_ERROR_STOP=1", "-f", filePath], {
    stdio: "inherit"
  });

  if (result.error) {
    console.error(`Failed to run ${psqlBin}. Install PostgreSQL client or set PSQL_BIN.`);
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("Applying schema...");
runPsql(schemaFile);

console.log("Applying seed...");
runPsql(seedFile);

console.log("Database setup complete.");
