import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ErrorPhrases } from "@/lib/error-phrases";
import { makeErrorResponse } from "@/lib/make-server-response";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return Response.json(
        makeErrorResponse("unauthorized", ErrorPhrases.UNAUTHORIZED),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const hasPendingInvitation = await prisma.invitations.findFirst({
      where: {
        invitedUserId: session.user.id,
        status: "PENDING",
      },
      select: { id: true },
    });

    return NextResponse.json({ hasPendingInvitation: !!hasPendingInvitation });
  } catch (error) {
    let errorMessage = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return Response.json(
      { message: errorMessage },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
