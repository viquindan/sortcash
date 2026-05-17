import { unstable_cache } from "next/cache";
import { db } from "./db";
import { transactions, customCategories, categoryRules, merchantExclusions, uploads } from "./db/schema";
import { eq, desc } from "drizzle-orm";

export function getTransactions(userId: string) {
  return unstable_cache(
    () => db.query.transactions.findMany({
      where: eq(transactions.userId, userId),
      orderBy: [desc(transactions.date)],
    }),
    [`txs-full-${userId}`],
    { revalidate: 60, tags: [`txs-${userId}`] }
  )();
}

export function getTransactionSummary(userId: string) {
  return unstable_cache(
    () => db.query.transactions.findMany({
      where: eq(transactions.userId, userId),
      columns: { month: true, amount: true, category: true },
    }),
    [`txs-summary-${userId}`],
    { revalidate: 60, tags: [`txs-${userId}`] }
  )();
}

export function getCustomCategories(userId: string) {
  return unstable_cache(
    () => db.query.customCategories.findMany({
      where: eq(customCategories.userId, userId),
      orderBy: [desc(customCategories.createdAt)],
    }),
    [`cats-${userId}`],
    { revalidate: 300, tags: [`cats-${userId}`] }
  )();
}

export function getCategoryRules(userId: string) {
  return unstable_cache(
    () => db.query.categoryRules.findMany({
      where: eq(categoryRules.userId, userId),
      orderBy: [desc(categoryRules.createdAt)],
    }),
    [`rules-${userId}`],
    { revalidate: 300, tags: [`rules-${userId}`] }
  )();
}

export function getUploads(userId: string) {
  return unstable_cache(
    () => db.query.uploads.findMany({
      where: eq(uploads.userId, userId),
      orderBy: [desc(uploads.createdAt)],
    }),
    [`uploads-${userId}`],
    { revalidate: 60, tags: [`uploads-${userId}`] }
  )();
}

export function getExclusions(userId: string) {
  return unstable_cache(
    () => db.query.merchantExclusions.findMany({
      where: eq(merchantExclusions.userId, userId),
      orderBy: [desc(merchantExclusions.createdAt)],
    }),
    [`excl-${userId}`],
    { revalidate: 300, tags: [`excl-${userId}`] }
  )();
}
