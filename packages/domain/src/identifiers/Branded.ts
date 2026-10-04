export type Branded<Value, Name extends string> = Value & { readonly __brand: Name };

export const brandString = <Name extends string>(value: string): Branded<string, Name> => {
  // oxlint-disable-next-line architecture/no-type-assertions, typescript/no-unsafe-type-assertion -- Attaching a brand to an already validated string is this function's only purpose.
  return value as Branded<string, Name>;
};
