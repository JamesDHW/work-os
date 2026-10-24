import { z } from "zod";

export const SignInCodeSchema = z.object({ code: z.string().min(1), expiresAt: z.iso.datetime() });
