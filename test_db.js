const { neon } = require("@neondatabase/serverless");
const { drizzle } = require("drizzle-orm/neon-http");
const { pgTable, text, timestamp, uuid } = require("drizzle-orm/pg-core");
const bcrypt = require("bcryptjs");

const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

const sql = neon("postgresql://neondb_owner:npg_7Sir1zhmUBWl@ep-small-heart-aq7crc5j-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require");
const db = drizzle(sql);

async function main() {
  try {
    const hashedPassword = await bcrypt.hash("password123", 10);
    console.log("Bcrypt success:", hashedPassword);
    
    const [newUser] = await db.insert(users).values({
      email: "test_" + Date.now() + "@test.com",
      password: hashedPassword,
    }).returning();
    
    console.log("Insert success:", newUser);
  } catch (e) {
    console.error("Error:", e);
  }
}

main();
