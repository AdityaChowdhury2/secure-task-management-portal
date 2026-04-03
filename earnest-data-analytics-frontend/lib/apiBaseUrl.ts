/**
 * Base URL for API calls (e.g. http://localhost:5000/api/v1).
 * Trailing slashes are stripped so paths like `/login` resolve correctly.
 */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";
  return raw.replace(/\/+$/, "");
}
