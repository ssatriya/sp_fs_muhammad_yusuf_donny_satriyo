import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ErrorPhrases } from "@/lib/error-phrases";
import { InvitationWithProjectAndInviter } from "@/types";
import { makeErrorResponse } from "@/lib/make-server-response";

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

    const invitations: Awaited<InvitationWithProjectAndInviter[] | null> =
      await prisma.invitations.findMany({
        where: {
          invitedUserId: session.user.id,
        },
        include: {
          project: true,
          inviter: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(invitations);
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
