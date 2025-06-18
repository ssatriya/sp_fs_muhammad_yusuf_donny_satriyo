import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ApiErrorResponse } from "@/types";
import { ErrorPhrases } from "@/lib/error-phrases";
import { createProjectSchema, editProjectSchema } from "@/schema/zod";
import { makeErrorResponse } from "@/lib/make-server-response";

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const validatedFields = createProjectSchema.safeParse(body);

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

    const project = await prisma.$transaction(async (tx) => {
      const project = await tx.projects.create({
        data: {
          name: data.name,
          description: data.description,
          ownerId: session.user.id,
        },
      });

      await tx.memberships.create({
        data: {
          projectId: project.id,
          userId: session.user.id,
          role: "OWNER",
        },
      });

      return project;
    });

    return Response.json(
      {
        message: "New project has been saved.",
        data: project,
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

    const projectsOwnedOrInvited = await prisma.projects.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          { memberships: { some: { userId: session.user.id } } },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(projectsOwnedOrInvited);
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

export async function PATCH(req: NextRequest) {
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

    const body = await req.json();
    const validatedFields = editProjectSchema.safeParse(body);

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
    const { id, name, description } = data;

    const project = await prisma.projects.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!project) {
      return Response.json(
        makeErrorResponse("not_found", ErrorPhrases.NOT_FOUND),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (project.ownerId !== session.user.id) {
      return Response.json(
        makeErrorResponse("forbidden", ErrorPhrases.FORBIDDEN),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const updatedProject = await prisma.projects.update({
      where: { id },
      data: {
        name,
        description,
        updatedAt: new Date(),
      },
    });

    return Response.json(
      { message: "Project has been updated.", data: updatedProject },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
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

export async function DELETE(req: Request) {
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

    const projectId = await req.json();

    if (!projectId) {
      return NextResponse.json(
        makeErrorResponse("validation_error", ErrorPhrases.VALIDATION_ERROR),
        { status: 400 }
      );
    }

    const project = await prisma.projects.findUnique({
      where: { id: projectId },
      select: {
        ownerId: true,
        tasks: {
          select: { id: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        makeErrorResponse("not_found", ErrorPhrases.NOT_FOUND),
        { status: 404 }
      );
    }

    if (project.ownerId !== session.user.id) {
      return NextResponse.json(
        makeErrorResponse("forbidden", ErrorPhrases.FORBIDDEN),
        { status: 403 }
      );
    }

    await prisma.tasks.deleteMany({
      where: { projectId },
    });

    await prisma.projects.delete({
      where: { id: projectId },
    });

    return NextResponse.json(
      { message: "Project and all its tasks deleted successfully" },
      { status: 200 }
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
