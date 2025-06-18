import { auth } from "@/lib/auth";
import { ErrorPhrases } from "@/lib/error-phrases";
import { makeErrorResponse } from "@/lib/make-server-response";
import { prisma } from "@/lib/prisma";
import { createTaskSchema, updateTaskSchema } from "@/schema/zod";
import { ApiErrorResponse, TaskWithAssignee } from "@/types";
import { NextRequest, NextResponse } from "next/server";

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

    const { id } = await params;

    if (!id) {
      return Response.json(
        makeErrorResponse("unauthorized", ErrorPhrases.NOT_FOUND),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const validatedFields = createTaskSchema.safeParse(body);

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

    const task = await prisma.tasks.create({
      data: {
        title: data.title,
        description: data.description,
        assignedId: data.assigneeId,
        projectId: id,
      },
    });

    return Response.json(
      {
        message: "New task has been saved.",
        data: task,
      },
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    let message = ErrorPhrases.INTERNAL_SERVER_ERROR as string;
    const type: ApiErrorResponse["type"] = "internal_server_error";

    if (error instanceof Error) {
      message = error.message || message;
    }

    const { id } = params;

    if (!id) {
      return Response.json(
        makeErrorResponse("unauthorized", ErrorPhrases.NOT_FOUND),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return Response.json(makeErrorResponse(type, message), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET(
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

    const tasks: Awaited<TaskWithAssignee[]> = await prisma.tasks.findMany({
      where: {
        projectId: id,
      },
      include: {
        assignee: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tasks);
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

    const { id: projectId } = await params;

    if (!projectId) {
      return Response.json(
        makeErrorResponse("unauthorized", ErrorPhrases.NOT_FOUND),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const validatedFields = updateTaskSchema.safeParse(body);

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
    const { id, assigneeId, description, status, title } = data;

    // Check if task exists and get project/assignee info
    const existingTask = await prisma.tasks.findUnique({
      where: { id },
      select: {
        assignedId: true,
        projectId: true,
        project: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!existingTask) {
      return Response.json(
        makeErrorResponse("not_found", ErrorPhrases.NOT_FOUND),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify task belongs to the specified project
    if (existingTask.projectId !== projectId) {
      return Response.json(
        makeErrorResponse("forbidden", ErrorPhrases.FORBIDDEN),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if current user is either:
    // 1. The assignee, OR
    // 2. The project owner
    const isAssignee = existingTask.assignedId === session.user.id;
    const isOwner = existingTask.project.ownerId === session.user.id;

    if (!isAssignee && !isOwner) {
      return Response.json(
        makeErrorResponse(
          "forbidden",
          "Only the assignee or project owner can update this task"
        ),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update the task
    const updatedTask = await prisma.tasks.update({
      where: { id },
      data: {
        title,
        description,
        status,
        assignedId: assigneeId,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        status: true,
        assignedId: true,
        project: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    return Response.json(
      { data: updatedTask, message: "Task has been updated." },
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

export async function DELETE(
  req: Request,
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

    const { id: projectId } = await params;

    if (!projectId) {
      return Response.json(
        makeErrorResponse("unauthorized", ErrorPhrases.NOT_FOUND),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const taskId = await req.json();

    if (!taskId) {
      return NextResponse.json(
        makeErrorResponse("validation_error", ErrorPhrases.VALIDATION_ERROR),
        { status: 400 }
      );
    }

    const task = await prisma.tasks.findUnique({
      where: { id: taskId },
      select: {
        project: {
          select: {
            id: true,
            ownerId: true,
            memberships: {
              where: { userId: session.user.id },
              select: { role: true },
            },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        makeErrorResponse("not_found", ErrorPhrases.NOT_FOUND),
        { status: 404 }
      );
    }

    if (task.project.id !== projectId) {
      return NextResponse.json(
        makeErrorResponse("forbidden", "Task does not belong to this project"),
        { status: 403 }
      );
    }

    const isOwner = task.project.ownerId === session.user.id;

    if (!isOwner) {
      return NextResponse.json(
        makeErrorResponse(
          "forbidden",
          "Only project owners/admins can delete tasks"
        ),
        { status: 403 }
      );
    }

    await prisma.tasks.delete({
      where: { id: taskId },
    });

    return NextResponse.json(
      { message: "Task deleted successfully" },
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
