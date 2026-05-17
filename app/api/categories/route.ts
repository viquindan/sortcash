import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { verifySession } from "@/lib/auth";
import { db } from "@/lib/db";
import { customCategories } from "@/lib/db/schema";

const MAX_LEN = 100;

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    const userId = session?.userId;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const name = body.name?.trim();

    if (!name) return new NextResponse("Category name is required", { status: 400 });
    if (name.length > MAX_LEN) return new NextResponse("Name exceeds maximum length", { status: 400 });

    const [newCategory] = await db.insert(customCategories)
      .values({ userId, name })
      .returning();

    revalidateTag(`cats-${userId}`);
    return NextResponse.json(newCategory);
  } catch (error) {
    console.error("Create category error:", error);
    if ((error as { code?: string }).code === "23505") {
      return new NextResponse("Category already exists", { status: 409 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
