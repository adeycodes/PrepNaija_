import { db } from "../server/db.js";
import { sql } from "drizzle-orm";

async function fixColumnNames() {
  try {
    console.log("Starting column name fixes...");

    // Fix questions table columns
    try {
      await db.execute(sql`ALTER TABLE questions RENAME COLUMN createdat TO created_at`);
      console.log("✅ Renamed questions.createdat to created_at");
    } catch (error: any) {
      if (error.message.includes("does not exist")) {
        console.log("ℹ️  questions.createdat already renamed or doesn't exist");
      } else {
        console.error("❌ Error renaming questions.createdat:", error.message);
      }
    }

    try {
      await db.execute(sql`ALTER TABLE questions RENAME COLUMN updatedat TO updated_at`);
      console.log("✅ Renamed questions.updatedat to updated_at");
    } catch (error: any) {
      if (error.message.includes("does not exist")) {
        console.log("ℹ️  questions.updatedat already renamed or doesn't exist");
      } else {
        console.error("❌ Error renaming questions.updatedat:", error.message);
      }
    }

    // Fix users table columns if they exist
    try {
      await db.execute(sql`ALTER TABLE users RENAME COLUMN createdat TO created_at`);
      console.log("✅ Renamed users.createdat to created_at");
    } catch (error: any) {
      if (error.message.includes("does not exist")) {
        console.log("ℹ️  users.createdat already renamed or doesn't exist");
      } else {
        console.error("❌ Error renaming users.createdat:", error.message);
      }
    }

    try {
      await db.execute(sql`ALTER TABLE users RENAME COLUMN updatedat TO updated_at`);
      console.log("✅ Renamed users.updatedat to updated_at");
    } catch (error: any) {
      if (error.message.includes("does not exist")) {
        console.log("ℹ️  users.updatedat already renamed or doesn't exist");
      } else {
        console.error("❌ Error renaming users.updatedat:", error.message);
      }
    }

    // Fix profiles table columns if they exist
    try {
      await db.execute(sql`ALTER TABLE profiles RENAME COLUMN createdat TO created_at`);
      console.log("✅ Renamed profiles.createdat to created_at");
    } catch (error: any) {
      if (error.message.includes("does not exist")) {
        console.log("ℹ️  profiles.createdat already renamed or doesn't exist");
      } else {
        console.error("❌ Error renaming profiles.createdat:", error.message);
      }
    }

    try {
      await db.execute(sql`ALTER TABLE profiles RENAME COLUMN updatedat TO updated_at`);
      console.log("✅ Renamed profiles.updatedat to updated_at");
    } catch (error: any) {
      if (error.message.includes("does not exist")) {
        console.log("ℹ️  profiles.updatedat already renamed or doesn't exist");
      } else {
        console.error("❌ Error renaming profiles.updatedat:", error.message);
      }
    }

    console.log("✅ Column name fixes completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing column names:", error);
    process.exit(1);
  }
}

fixColumnNames();
