import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { verifySession } from "@/lib/auth";
import { db } from "@/lib/db";
import { categoryRules } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const MAX_LEN = 100;

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
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

    const [updated] = await db
      .update(categoryRules)
      .set({ merchant, category, updatedAt: new Date() })
      .where(and(eq(categoryRules.id, params.id), eq(categoryRules.userId, userId)))
      .returning();

    if (!updated) return new NextResponse("Not Found", { status: 404 });

    revalidateTag(`rules-${userId}`);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update rule error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await verifySession();
    const userId = session?.userId;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const deleted = await db
      .delete(categoryRules)
      .where(and(eq(categoryRules.id, params.id), eq(categoryRules.userId, userId)))
      .returning();

    if (!deleted.length) return new NextResponse("Not Found", { status: 404 });

    revalidateTag(`rules-${userId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete rule error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
