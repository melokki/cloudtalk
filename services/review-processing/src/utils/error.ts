export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error occurred";
}

export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) return error.stack;
  return undefined;
}

export function formatError(error: unknown) {
  return {
    message: getErrorMessage(error),
    stack: getErrorStack(error),
  };
}
