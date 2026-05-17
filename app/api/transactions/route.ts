import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { verifySession } from "@/lib/auth";
import { db } from "@/lib/db";
import { transactions, uploads, categoryRules, knownAccounts } from "@/lib/db/schema";
import { categorizeTransaction } from "@/lib/categorize";
import { namesSimilar } from "@/lib/parsers/bankDetect";
import { format } from "date-fns";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    const userId = session?.userId;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const {
      filename,
      transactions: parsedTransactions,
      bank = "Desconocido",
      accountHolder = null,
      accountNumber = null,
      personLabel: bodyPersonLabel,
      confirmed = false,
    } = body;

    if (!filename || !parsedTransactions || !Array.isArray(parsedTransactions)) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    // ── Account identity check ───────────────────────────────────────────────
    // Look for a known account matching this bank + accountNumber (or holder)
    const existingAccounts = await db.query.knownAccounts.findMany({
      where: eq(knownAccounts.userId, userId),
    });

    const matchByNumber = accountNumber
      ? existingAccounts.find(a => a.bank === bank && a.accountNumber === accountNumber)
      : null;

    const matchByHolder = (!matchByNumber && accountHolder)
      ? existingAccounts.find(a => a.bank === bank && a.accountHolder && namesSimilar(a.accountHolder, accountHolder))
      : null;

    const knownAccount = matchByNumber ?? matchByHolder ?? null;

    // Mismatch: we know this bank+account but the holder name is clearly different
    if (knownAccount && accountHolder && !namesSimilar(knownAccount.personLabel === "Yo" ? (knownAccount.accountHolder ?? "") : "", accountHolder)) {
      // Only warn if holder name is substantially different from what we know
      if (knownAccount.accountHolder && !namesSimilar(knownAccount.accountHolder, accountHolder) && !confirmed) {
        return NextResponse.json({
          status: "mismatch",
          knownHolder: knownAccount.accountHolder,
          knownLabel: knownAccount.personLabel,
          detectedHolder: accountHolder,
        }, { status: 409 });
      }
    }

    // Determine person label for this upload
    let personLabel = bodyPersonLabel ?? knownAccount?.personLabel ?? "Yo";

    // ── Upsert known account ─────────────────────────────────────────────────
    if (!knownAccount && (accountNumber || accountHolder)) {
      await db.insert(knownAccounts).values({
        userId,
        bank,
        accountNumber: accountNumber ?? null,
        accountHolder: accountHolder ?? null,
        personLabel,
      }).onConflictDoNothing();
    }

    // ── Insert upload record ─────────────────────────────────────────────────
    const [uploadRecord] = await db.insert(uploads).values({
      userId,
      filename,
      count: parsedTransactions.length,
      bank,
      accountHolder: accountHolder ?? null,
      accountNumber: accountNumber ?? null,
      personLabel,
    }).returning({ id: uploads.id });

    // ── Fetch user rules for categorization ─────────────────────────────────
    const userRules = await db.query.categoryRules.findMany({
      where: eq(categoryRules.userId, userId),
    });

    // ── Build externalIds with counter for within-upload repeats ─────────────
    // This ensures two identical transactions in the same upload are both inserted,
    // while the same transaction from a different upload is skipped (dedup).
    const fingerprints: Record<string, number> = {};

    const txsToInsert = parsedTransactions.map((tx: any) => {
      const date = new Date(tx.date + "T12:00:00");
      const category = categorizeTransaction(tx.description, Number(tx.amount), userRules);
      const month = format(date, "yyyy-MM");

      const base = `${tx.date}-${tx.description.slice(0, 25).replace(/\s+/g, "_")}-${tx.amount}-${bank}`;
      fingerprints[base] = (fingerprints[base] || 0) + 1;
      const externalId = fingerprints[base] > 1 ? `${base}-${fingerprints[base]}` : base;

      return {
        userId,
        uploadId: uploadRecord.id,
        date: tx.date,
        description: tx.description,
        amount: String(tx.amount),
        balance: tx.balance != null ? String(tx.balance) : null,
        category,
        month,
        bank,
        source: personLabel,
        externalId,
      };
    });

    // ── Batch insert with cross-upload dedup ─────────────────────────────────
    let inserted = 0;
    const CHUNK = 100;
    for (let i = 0; i < txsToInsert.length; i += CHUNK) {
      const chunk = txsToInsert.slice(i, i + CHUNK);
      const result = await db.insert(transactions)
        .values(chunk)
        .onConflictDoNothing({ target: [transactions.userId, transactions.externalId] })
        .returning({ id: transactions.id });
      inserted += result.length;
    }

    revalidateTag(`txs-${userId}`);

    return NextResponse.json({
      success: true,
      count: inserted,
      skipped: txsToInsert.length - inserted,
      bank,
      personLabel,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
