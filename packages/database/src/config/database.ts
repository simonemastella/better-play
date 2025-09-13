import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../schema/index.js";
import { env } from "../env.js";

export function createDatabase(databaseUrl: string) {
  const queryClient = postgres(databaseUrl);
  return drizzle(queryClient, { schema });
}

export type Database = ReturnType<typeof createDatabase>;

// Default database instance using environment DATABASE_URL
export const db = createDatabase(env.DATABASE_URL);
