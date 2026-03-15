import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { sendEmail, generatePasswordResetEmail } from "@/lib/email/service";
import { consumeRateLimit } from "@/lib/security/rate-limit";

const schema = z.object({
  email: z.string().email("Invalid email address")
});

export async function POST(req: NextRequest) {
  try {
    // Rate limiting - prevent brute force
    const clientIP = req.headers.get("x-forwarded-for") ||
                     req.headers.get("x-real-ip") ||
                     "unknown";
    const rateLimitResult = await consumeRateLimit({
      key: `forgot_password:${clientIP}`,
      limit: 5,
      windowMs: 15 * 60 * 1000 // 5 attempts per 15 minutes
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many reset attempts. Please try again later." },
        { status: 429 }
      );
    }

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Find user by email
    const user = await prisma.appUser.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate secure reset token
      const resetToken = randomBytes(32).toString('hex');
      const tokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

      // Store reset token in database
      await prisma.passwordResetToken.upsert({
        where: { userId: user.id },
        update: {
          token: resetToken,
          expiresAt: tokenExpiry,
          createdAt: new Date()
        },
        create: {
          userId: user.id,
          token: resetToken,
          expiresAt: tokenExpiry
        }
      });

      // Send reset email
      try {
        const appHost = process.env.SHOPIFY_APP_URL ||
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

        const resetUrl = `${appHost}/reset-password?token=${resetToken}`;

        const emailContent = generatePasswordResetEmail({
          userName: user.name || user.email,
          resetUrl,
          userEmail: user.email
        });

        await sendEmail({
          to: user.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        });

        console.log(`Password reset email sent to ${user.email}`);
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
        // Don't fail the request if email fails
        // In production, you might want to queue this for retry
      }
    }

    // Always return success
    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, we've sent a password reset link."
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}