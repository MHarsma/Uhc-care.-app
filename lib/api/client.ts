const TUNNEL_URL = "https://api.uhc-ap.me/api";

export function getApiBaseUrl(): string {
  const envUrl = (process.env.NEXT_PUBLIC_API_URL || "").trim();

  if (envUrl && !envUrl.includes("trycloudflare.com")) {
    return envUrl.replace(/[\r\n]+/g, "").replace(/\/+$/, "");
  }

  return TUNNEL_URL;
}

export function getBackendBaseUrl(): string {
  return getApiBaseUrl().replace(/\/api\/?$/, "");
}

/** Read a cookie value by name from document.cookie */
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(`${name}=`)) {
      return decodeURIComponent(trimmed.substring(name.length + 1));
    }
  }
  return undefined;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, ...customConfig } = options;

  const baseUrl = getApiBaseUrl();
  let url = endpoint.startsWith("http")
    ? endpoint
    : `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const defaultHeaders: Record<string, string> = {
    Accept: "application/json",
  };

  if (!(customConfig.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  // Attach Sanctum Bearer token for cross-domain / mobile authentication
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("uhc_auth_token");
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  // Attach XSRF-TOKEN for mutating requests (POST, PATCH, PUT, DELETE)
  const method = (options.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    let xsrfToken = getCookie("XSRF-TOKEN");
    if (!xsrfToken && typeof window !== "undefined") {
      try {
        const backendBase = getBackendBaseUrl();
        await fetch(`${backendBase}/sanctum/csrf-cookie`, {
          credentials: "include",
        });
        xsrfToken = getCookie("XSRF-TOKEN");
      } catch {
        // Continue anyway; credentials may still carry session
      }
    }
    if (xsrfToken) {
      defaultHeaders["X-XSRF-TOKEN"] = xsrfToken;
    }
  }

  const config: RequestInit = {
    method,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    credentials: "include", // Essential for Laravel Sanctum cookie authentication
    ...customConfig,
    // Re-assert credentials after spread to prevent override
    ...(customConfig.credentials ? {} : { credentials: "include" as RequestCredentials }),
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    // Network-level failure: server offline, tunnel down, DNS unreachable, CORS blocked
    const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
    const friendlyMessage = isOffline
      ? "You appear to be offline. Please check your internet connection and try again."
      : "Could not connect to the server. Please check your connection or try again in a moment.";
    throw new ApiError(friendlyMessage, 0, { originalError: String(networkError) });
  }

  if (response.status === 204) {
    return {} as T;
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMessage =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;
    throw new ApiError(errorMessage, response.status, data);
  }

  return data as T;
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),
};
