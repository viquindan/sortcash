import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { verifySession } from "@/lib/auth";
import { db } from "@/lib/db";
import { transactions, categoryRules, merchantExclusions } from "@/lib/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { extractMerchant } from "@/lib/merchant";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await verifySession();
    const userId = session?.userId;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const category = body.category?.trim();
    const createRule: boolean = !!body.createRule;

    if (!category) return new NextResponse("Category is required", { status: 400 });

    const [updatedTx] = await db
      .update(transactions)
      .set({ category })
      .where(and(eq(transactions.id, params.id), eq(transactions.userId, userId)))
      .returning();

    if (!updatedTx) return new NextResponse("Transaction not found", { status: 404 });

    revalidateTag(`txs-${userId}`);

    let affectedIds = [updatedTx.id];

    if (createRule && updatedTx.description) {
      const merchant = extractMerchant(updatedTx.description);
      if (merchant) {
        const excluded = await db.query.merchantExclusions.findFirst({
          where: and(
            eq(merchantExclusions.userId, userId),
            eq(merchantExclusions.merchant, merchant),
          ),
        });
        if (excluded) {
          return NextResponse.json({ tx: updatedTx, affectedIds, category });
        }

        await db.insert(categoryRules)
          .values({ userId, merchant, category })
          .onConflictDoUpdate({
            target: [categoryRules.userId, categoryRules.merchant],
            set: { category, updatedAt: new Date() },
          });

        // Push the LIKE filter to the DB — no N+1 load
        const matching = await db
          .select({ id: transactions.id })
          .from(transactions)
          .where(and(
            eq(transactions.userId, userId),
            sql`UPPER(${transactions.description}) LIKE ${"%" + merchant + "%"}`,
          ));

        const matchingIds = matching.map(t => t.id);

        if (matchingIds.length > 0) {
          await db.update(transactions)
            .set({ category })
            .where(and(eq(transactions.userId, userId), inArray(transactions.id, matchingIds)));
          affectedIds = matchingIds;
        }

        revalidateTag(`rules-${userId}`);
      }
    }

    return NextResponse.json({ tx: updatedTx, affectedIds, category });
  } catch (error) {
    console.error("Update transaction error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
