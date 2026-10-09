/**
 * Read a cookie value by name.
 */
function getCookie(name: string): string | undefined {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : undefined;
}

/**
 * Fetch the Sanctum CSRF cookie then return headers that include the
 * X-XSRF-TOKEN value so `fetch()` requests pass CSRF verification.
 *
 * Usage:
 * ```ts
 * const headers = await csrfHeaders(backendUrl);
 * await fetch(url, { method: "POST", headers, credentials: "include", body });
 * ```
 */
export async function csrfHeaders(
  backendUrl: string,
): Promise<Record<string, string>> {
  try {
    await fetch(`${backendUrl}/sanctum/csrf-cookie`, {
      credentials: "include",
    });
  } catch {
    // Gracefully continue without failing
  }

  const token = getCookie("XSRF-TOKEN");

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { "X-XSRF-TOKEN": token } : {}),
  };
}
