import postgres from "postgres";

const globalForDb = globalThis as unknown as { sql: ReturnType<typeof postgres> };

export const sql =
  globalForDb.sql ??
  postgres(process.env.DATABASE_URL!, {
    max: 3,
    idle_timeout: 10,
    connect_timeout: 10,
    prepare: false,
    connection: { application_name: "silvio-store" }
  });

if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;
