import type { UserId } from "../identifiers/Identifiers.ts";

export type Principal =
  | { readonly kind: "user"; readonly userId: UserId }
  | { readonly kind: "serviceAccount"; readonly serviceAccountId: string };
