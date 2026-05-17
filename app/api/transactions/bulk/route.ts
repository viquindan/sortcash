import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { verifySession } from "@/lib/auth";
import { db } from "@/lib/db";
import { transactions, categoryRules, merchantExclusions } from "@/lib/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { extractMerchant } from "@/lib/merchant";

export async function PATCH(req: NextRequest) {
  try {
    const session = await verifySession();
    const userId = session?.userId;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { ids, category, createRule } = body as {
      ids: string[];
      category: string;
      createRule?: boolean;
    };

    if (!Array.isArray(ids) || ids.length === 0 || !category) {
      return new NextResponse("ids[] and category are required", { status: 400 });
    }

    await db
      .update(transactions)
      .set({ category })
      .where(and(eq(transactions.userId, userId), inArray(transactions.id, ids)));

    if (createRule) {
      const updated = await db.query.transactions.findMany({
        where: and(eq(transactions.userId, userId), inArray(transactions.id, ids)),
        columns: { description: true },
      });

      // Get exclusion list once
      const exclusionRows = await db.query.merchantExclusions.findMany({
        where: eq(merchantExclusions.userId, userId),
        columns: { merchant: true },
      });
      const excluded = new Set(exclusionRows.map(e => e.merchant));

      const merchants = Array.from(new Set(updated.map(tx => extractMerchant(tx.description))))
        .filter(m => m && !excluded.has(m));

      for (const merchant of merchants) {
        await db
          .insert(categoryRules)
          .values({ userId, merchant, category })
          .onConflictDoUpdate({
            target: [categoryRules.userId, categoryRules.merchant],
            set: { category, updatedAt: new Date() },
          });
      }

      revalidateTag(`rules-${userId}`);
    }

    revalidateTag(`txs-${userId}`);
    return NextResponse.json({ updated: ids.length });
  } catch (error) {
    console.error("Bulk update error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
