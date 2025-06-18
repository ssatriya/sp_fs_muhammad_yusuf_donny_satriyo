import { auth } from "@/lib/auth";
import { ErrorPhrases } from "@/lib/error-phrases";
import { makeErrorResponse } from "@/lib/make-server-response";
import { prisma } from "@/lib/prisma";
import { ApiErrorResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";

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

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.toLowerCase() ?? "";
    const limit = 5;

    const users = await prisma.users.findMany({
      where: {
        AND: [
          {
            OR: [
              { email: { contains: query, mode: "insensitive" } },
              { name: { contains: query, mode: "insensitive" } },
            ],
          },
          { memberships: { some: { projectId: id } } },
        ],
      },
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    const options = users.map((user) => ({
      value: user.id,
      label: user.email,
    }));

    return NextResponse.json(options);
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
