import { verifySession } from "@/lib/auth";
import { getCustomCategories, getCategoryRules, getExclusions, getUploads } from "@/lib/data";
import SettingsClient from "./SettingsClient";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categorize";

export default async function SettingsPage() {
  const session = await verifySession();
  if (!session?.userId) return null;

  const [userCategories, userRules, userExclusions, userUploads] = await Promise.all([
    getCustomCategories(session.userId),
    getCategoryRules(session.userId),
    getExclusions(session.userId),
    getUploads(session.userId),
  ]);

  return (
    <SettingsClient
      initialCategories={userCategories}
      initialRules={userRules}
      initialExclusions={userExclusions}
      initialUploads={userUploads}
      expenseCategories={EXPENSE_CATEGORIES}
      incomeCategories={INCOME_CATEGORIES}
    />
  );
}
