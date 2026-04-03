import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email(),
    password: z.string().min(6).max(128),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    password: z.string().min(6).max(128),
  }),
});

export const refreshSchema = z.object({
  cookies: z.object({
    refreshToken: z.string().min(1),
  }),
});

export const logoutSchema = z.object({
  body: z.object({
    allSessions: z.boolean().optional().default(false),
  }),
});
