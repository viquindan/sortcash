import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email?.trim().toLowerCase();
    const lang = body.lang === "en" ? "en" : "es";

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    // Always return 200 — never reveal whether the email exists
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (user) {
      // Delete any existing tokens for this user
      await db.delete(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, user.id));

      // Generate cryptographically strong token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
      });

      await sendPasswordResetEmail(email, token, lang);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
