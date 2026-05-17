import { verifySession } from "@/lib/auth";
import { getTransactions, getCustomCategories } from "@/lib/data";
import TransactionsClient from "./TransactionsClient";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categorize";

export default async function TransactionsPage() {
  const session = await verifySession();
  if (!session?.userId) return null;

  const [allTransactions, customCats] = await Promise.all([
    getTransactions(session.userId),
    getCustomCategories(session.userId),
  ]);

  const customNames = customCats.map(c => c.name);

  const expenseCategories = Array.from(new Set([...EXPENSE_CATEGORIES, ...customNames]))
    .sort((a, b) => a.localeCompare(b, "es"));
  const incomeCategories = Array.from(new Set([...INCOME_CATEGORIES, ...customNames]))
    .sort((a, b) => a.localeCompare(b, "es"));

  const banks = Array.from(new Set(allTransactions.map(tx => tx.bank).filter(Boolean))).sort();
  const persons = Array.from(new Set(allTransactions.map(tx => tx.source).filter(Boolean))).sort();

  return (
    <TransactionsClient
      initialTransactions={allTransactions}
      expenseCategories={expenseCategories}
      incomeCategories={incomeCategories}
      banks={banks}
      persons={persons}
    />
  );
}
