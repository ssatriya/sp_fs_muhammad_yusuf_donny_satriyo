import { auth } from "@/lib/auth";
import { ErrorPhrases } from "@/lib/error-phrases";
import { makeErrorResponse } from "@/lib/make-server-response";
import { prisma } from "@/lib/prisma";
import { updateTaskStatusSchema } from "@/schema/zod";
import { NextRequest } from "next/server";

export async function PATCH(
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

    const { id } = await params;

    if (!id) {
      return Response.json(
        makeErrorResponse("unauthorized", ErrorPhrases.NOT_FOUND),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const validatedFields = updateTaskStatusSchema.safeParse(body);

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

    await prisma.tasks.update({
      where: {
        id: data.taskId,
      },
      data: {
        status: data.status,
      },
    });

    return Response.json(
      {
        message: "Task has been updated.",
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
