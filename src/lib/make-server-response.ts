"server-only";

import { ZodIssue } from "zod";

import { ApiErrorResponse } from "@/types";

export function makeErrorResponse(
  type: ApiErrorResponse["type"],
  message: string,
  fields?: ZodIssue[]
): ApiErrorResponse {
  return {
    success: false,
    type,
    error: {
      message,
      ...(fields && {
        fields: fields.map((issue) => ({
          path: issue.path,
          message: issue.message,
        })),
      }),
    },
  };
}
