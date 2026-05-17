import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { verifySession } from "@/lib/auth";
import { db } from "@/lib/db";
import { categoryRules } from "@/lib/db/schema";

const MAX_LEN = 100;

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    const userId = session?.userId;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const merchant = body.merchant?.trim();
    const category = body.category?.trim();

    if (!merchant || !category) {
      return new NextResponse("Merchant and category are required", { status: 400 });
    }
    if (merchant.length > MAX_LEN || category.length > MAX_LEN) {
      return new NextResponse("Fields exceed maximum length", { status: 400 });
    }

    const [newRule] = await db.insert(categoryRules)
      .values({ userId, merchant, category })
      .returning();

    revalidateTag(`rules-${userId}`);
    return NextResponse.json(newRule);
  } catch (error) {
    console.error("Create rule error:", error);
    if ((error as { code?: string }).code === "23505") {
      return new NextResponse("Rule already exists for this merchant", { status: 409 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
