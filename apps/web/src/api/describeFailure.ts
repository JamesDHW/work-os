type FailedResponse = {
  readonly error?: { readonly error: { readonly message: string } };
  readonly response: Response;
};

export const describeFailure = (result: FailedResponse): string | null => {
  if (result.response.ok) return null;

  return result.error?.error.message ?? `Request failed (${result.response.status}).`;
};
