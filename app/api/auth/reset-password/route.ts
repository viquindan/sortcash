import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password) {
      return new NextResponse("Token and password are required", { status: 400 });
    }

    if (password.length < 8) {
      return new NextResponse("Password must be at least 8 characters", { status: 400 });
    }

    const resetToken = await db.query.passwordResetTokens.findFirst({
      where: eq(passwordResetTokens.token, token),
    });

    if (!resetToken) {
      return new NextResponse("Invalid or expired token", { status: 400 });
    }

    if (new Date() > resetToken.expiresAt) {
      await db.delete(passwordResetTokens)
        .where(eq(passwordResetTokens.id, resetToken.id));
      return new NextResponse("Token has expired", { status: 400 });
    }

    const hashed = await hashPassword(password);

    await db.update(users)
      .set({ password: hashed })
      .where(eq(users.id, resetToken.userId));

    // Single-use: delete token after successful reset
    await db.delete(passwordResetTokens)
      .where(eq(passwordResetTokens.id, resetToken.id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
