import { verifySession } from "@/lib/auth";
import { getTransactionSummary } from "@/lib/data";
import OverviewClient from "./OverviewClient";

export default async function OverviewPage() {
  const session = await verifySession();
  if (!session?.userId) return null;

  const allTransactions = await getTransactionSummary(session.userId);
  return <OverviewClient initialTransactions={allTransactions} />;
}
