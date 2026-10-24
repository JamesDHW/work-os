export type ChosenProviders = {
  readonly replace: (ids: readonly string[]) => void;
  readonly has: (id: string) => boolean;
  readonly list: () => readonly string[];
};

// The providers someone chose, by saving them or by starting the server with their key; models from any other
// provider pi-ai happens to know are never offered.
export const createChosenProviders = (initial: readonly string[]): ChosenProviders => {
  const ids = new Set(initial);

  return {
    replace: (next) => {
      ids.clear();
      for (const id of next) {
        ids.add(id);
      }
    },
    has: (id) => ids.has(id),
    list: () => [...ids],
  };
};
