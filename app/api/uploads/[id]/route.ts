import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { verifySession } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploads, transactions } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await verifySession();
    if (!session?.userId) return new NextResponse("Unauthorized", { status: 401 });

    await db.delete(transactions).where(
      and(eq(transactions.uploadId, params.id), eq(transactions.userId, session.userId))
    );

    await db.delete(uploads).where(
      and(eq(uploads.id, params.id), eq(uploads.userId, session.userId))
    );

    revalidateTag(`txs-${session.userId}`);
    revalidateTag(`uploads-${session.userId}`);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Delete upload error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
