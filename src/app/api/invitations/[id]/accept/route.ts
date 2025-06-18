import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ErrorPhrases } from "@/lib/error-phrases";
import { makeErrorResponse } from "@/lib/make-server-response";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    if (!id) {
      return Response.json(
        makeErrorResponse("unauthorized", ErrorPhrases.NOT_FOUND),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const invitation = await prisma.invitations.findFirst({
      where: {
        id: id,
      },
      include: { project: true },
    });

    if (!invitation || invitation.status !== "PENDING") {
      return Response.json(
        makeErrorResponse("validation_error", ErrorPhrases.VALIDATION_ERROR),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (new Date() > invitation.expiresAt) {
      return Response.json(
        makeErrorResponse("validation_error", ErrorPhrases.VALIDATION_ERROR),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (invitation.invitedUserId !== session.user.id) {
      return Response.json(
        makeErrorResponse("forbidden", ErrorPhrases.FORBIDDEN),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    await prisma.$transaction([
      prisma.memberships.create({
        data: {
          userId: session.user.id,
          projectId: invitation.projectId,
          role: "MEMBER",
        },
      }),
      prisma.invitations.update({
        where: { id: id },
        data: { status: "ACCEPTED" },
      }),
    ]);

    return Response.json(
      {
        message: "Invitation accepted.",
      },
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
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
