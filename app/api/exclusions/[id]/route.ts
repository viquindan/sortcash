import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { verifySession } from "@/lib/auth";
import { db } from "@/lib/db";
import { merchantExclusions } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifySession();
  if (!session?.userId) return new NextResponse("Unauthorized", { status: 401 });
  await db.delete(merchantExclusions)
    .where(and(eq(merchantExclusions.id, params.id), eq(merchantExclusions.userId, session.userId)));
  revalidateTag(`excl-${session.userId}`);
  return new NextResponse(null, { status: 204 });
}
