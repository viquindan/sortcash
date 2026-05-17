import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { verifySession } from "@/lib/auth";
import { db } from "@/lib/db";
import { merchantExclusions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const MAX_LEN = 100;

export async function GET() {
  try {
    const session = await verifySession();
    if (!session?.userId) return new NextResponse("Unauthorized", { status: 401 });

    const rows = await db.query.merchantExclusions.findMany({
      where: eq(merchantExclusions.userId, session.userId),
      orderBy: (t, { asc }) => [asc(t.merchant)],
    });
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Get exclusions error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const merchant = body.merchant?.trim();

    if (!merchant) return new NextResponse("Merchant is required", { status: 400 });
    if (merchant.length > MAX_LEN) return new NextResponse("Merchant exceeds maximum length", { status: 400 });

    const [row] = await db.insert(merchantExclusions)
      .values({ userId: session.userId, merchant: merchant.toUpperCase() })
      .onConflictDoNothing()
      .returning();

    revalidateTag(`excl-${session.userId}`);
    return NextResponse.json(row ?? { merchant: merchant.toUpperCase() });
  } catch (error) {
    console.error("Create exclusion error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
