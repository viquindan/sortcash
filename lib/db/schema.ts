import { pgTable, text, timestamp, uuid, integer, numeric, date, index, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const knownAccounts = pgTable("known_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bank: text("bank").notNull(),
  accountNumber: text("account_number"),
  accountHolder: text("account_holder"),
  personLabel: text("person_label").notNull().default("Yo"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  userBankAccIdx: uniqueIndex("known_accounts_user_bank_acc_idx").on(t.userId, t.bank, t.accountNumber),
}));

export const uploads = pgTable("uploads", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  count: integer("count").notNull(),
  bank: text("bank").notNull().default("Desconocido"),
  accountHolder: text("account_holder"),
  accountNumber: text("account_number"),
  personLabel: text("person_label").notNull().default("Yo"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  uploadId: uuid("upload_id").references(() => uploads.id, { onDelete: "set null" }),
  date: date("date").notNull(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  balance: numeric("balance", { precision: 12, scale: 2 }),
  category: text("category").notNull().default("Otros"),
  month: text("month").notNull(),
  bank: text("bank").notNull().default("Desconocido"),
  source: text("source").notNull().default("Yo"),   // person label
  externalId: text("external_id"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  userIdx: index("transactions_user_idx").on(t.userId),
  monthIdx: index("transactions_month_idx").on(t.userId, t.month),
  bankIdx: index("transactions_bank_idx").on(t.userId, t.bank),
  dedupIdx: uniqueIndex("transactions_dedup_idx").on(t.userId, t.externalId),
}));

export const categoryRules = pgTable("category_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  merchant: text("merchant").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => ({
  userMerchantIdx: uniqueIndex("rules_user_merchant_idx").on(t.userId, t.merchant),
}));

export const merchantExclusions = pgTable("merchant_exclusions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  merchant: text("merchant").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  userMerchantIdx: uniqueIndex("exclusions_user_merchant_idx").on(t.userId, t.merchant),
}));

export const customCategories = pgTable("custom_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  userNameIdx: uniqueIndex("categories_user_name_idx").on(t.userId, t.name),
}));

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
