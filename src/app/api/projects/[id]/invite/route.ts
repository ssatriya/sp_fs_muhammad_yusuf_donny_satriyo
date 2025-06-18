import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ApiErrorResponse } from "@/types";
import { ErrorPhrases } from "@/lib/error-phrases";
import { inviteMemberToProject } from "@/schema/zod";
import { makeErrorResponse } from "@/lib/make-server-response";

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

    const body = await req.json();
    const validatedFields = inviteMemberToProject.safeParse(body);

    if (!validatedFields.success) {
      return Response.json(
        makeErrorResponse(
          "validation_error",
          ErrorPhrases.VALIDATION_ERROR,
          validatedFields.error.issues
        ),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data } = validatedFields;

    await prisma.invitations.create({
      data: {
        invitedUserId: data.invitedUserId,
        projectId: id,
        inviterId: session.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return Response.json(
      {
        message: "New invitation has been sent.",
      },
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    let message = ErrorPhrases.INTERNAL_SERVER_ERROR as string;
    const type: ApiErrorResponse["type"] = "internal_server_error";

    if (error instanceof Error) {
      message = error.message || message;
    }

    return Response.json(makeErrorResponse(type, message), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
