import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { verifySession } from "@/lib/auth";
import { db } from "@/lib/db";
import { customCategories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await verifySession();
    const userId = session?.userId;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const deleted = await db.delete(customCategories)
      .where(and(eq(customCategories.id, params.id), eq(customCategories.userId, userId)))
      .returning();

    if (!deleted.length) {
      return new NextResponse("Not Found", { status: 404 });
    }

    revalidateTag(`cats-${userId}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete category error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
