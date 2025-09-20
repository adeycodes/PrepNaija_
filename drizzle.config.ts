import { defineConfig } from "drizzle-kit";

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL or DIRECT_URL environment variable is required");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl + (dbUrl.includes('?') ? '&' : '?') + 'sslmode=require',
  },
});
