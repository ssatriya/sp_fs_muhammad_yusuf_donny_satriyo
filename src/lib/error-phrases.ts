export const ErrorPhrases = {
  UNAUTHORIZED: "You must be logged in to perform this action.",
  VALIDATION_ERROR: "The submitted data is incomplete or invalid.",
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: "The requested data was not found.",
  INTERNAL_SERVER_ERROR:
    "An unexpected server error occurred. Please try again later.",
  CUSTOM: "An error occurred. Please try again.",
} as const;
