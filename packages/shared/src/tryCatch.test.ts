import { describe, expect, it } from "vitest";

import { tryCatch, tryCatchAsync } from "./tryCatch.ts";
import { WorkOsError } from "./WorkOsError.ts";

describe("tryCatch", () => {
  it("returns the value when the operation succeeds", () => {
    expect(tryCatch(() => 42)).toBe(42);
  });

  it("returns a WorkOsError when the operation throws", () => {
    const result = tryCatch(() => new URL("not a URL"));
    expect(result).toBeInstanceOf(WorkOsError);
  });
});

describe("tryCatchAsync", () => {
  it("returns the resolved value", async () => {
    expect(await tryCatchAsync(async () => "done")).toBe("done");
  });

  it("returns a WorkOsError when the promise rejects", async () => {
    const result = await tryCatchAsync(async () => Promise.reject(new Error("boom")));
    expect(result).toBeInstanceOf(WorkOsError);
  });
});
