/**
 * Auth routes: most backends expose `/api/v1/auth/login`, `/api/v1/auth/refresh`, etc.
 *
 * - Default (env unset): prefix `auth` → `/auth/refresh`, `/auth/login`, …
 * - Flat routes under the version root: set `NEXT_PUBLIC_API_AUTH_PREFIX=` (empty) in `.env.local`
 *   so paths become `/refresh`, `/login`, …
 */
function authPrefix(): string {
  const raw = process.env.NEXT_PUBLIC_API_AUTH_PREFIX;
  if (raw === "") {
    return "";
  }
  if (raw != null && String(raw).trim() !== "") {
    return String(raw).trim().replace(/^\/+|\/+$/g, "");
  }
  return "auth";
}

export function authPath(
  segment: "login" | "register" | "refresh" | "logout",
): string {
  const pre = authPrefix();
  return pre ? `/${pre}/${segment}` : `/${segment}`;
}

export function isPublicAuthRequestPath(url: string | undefined): boolean {
  if (!url) return false;
  const path = url.split("?")[0] ?? "";
  const candidates = [
    authPath("refresh"),
    authPath("login"),
    authPath("register"),
  ];
  return candidates.includes(path);
}
