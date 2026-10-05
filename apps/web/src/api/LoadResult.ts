export type LoadFailure = { readonly kind: "failed"; readonly message: string };

export type LoadResult<Value> = { readonly kind: "ready"; readonly value: Value } | LoadFailure;
