import type { Config } from "drizzle-kit";
import { env } from "./src/env";

export default {
  schema: "./dist/schema/*.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
} satisfies Config;
