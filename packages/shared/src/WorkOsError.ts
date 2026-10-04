type WorkOsErrorOptions = {
  readonly cause?: unknown;
};

export class WorkOsError extends Error {
  override readonly name: string;

  constructor(message: string, options: WorkOsErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = new.target.name;
  }
}

export const toWorkOsError = (thrown: unknown): WorkOsError => {
  if (thrown instanceof WorkOsError) return thrown;
  if (thrown instanceof Error) return new WorkOsError(thrown.message, { cause: thrown });

  return new WorkOsError(String(thrown), { cause: thrown });
};
