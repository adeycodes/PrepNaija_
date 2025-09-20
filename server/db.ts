// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

// Initialize and export db directly
export const connectDb = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Use the connection string directly so TLS/SNI tenant routing works
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("✅ Connected to Supabase DB");

  // Return a Drizzle instance
  return drizzle(client);
};

// Export a singleton db instance
export const db = await connectDb();
