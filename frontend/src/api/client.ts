const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const CLIENT_ID_KEY = "strand_client_id";

/**
 * The anonymous per-browser id that scopes all history. Generated once and kept
 * in localStorage. This is the entire "auth" story — convenience scoping, not
 * security (see backend/app/deps.py).
 */
export function getClientId(): string {
  const existing = localStorage.getItem(CLIENT_ID_KEY);
  if (existing) return existing;

  // crypto.randomUUID is unavailable on insecure origins and older browsers.
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;

  localStorage.setItem(CLIENT_ID_KEY, id);
  return id;
}

/** A non-2xx response from the API. `detail` is FastAPI's error message. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
  }
}

/** FastAPI returns `{detail: string}` for HTTPException, but `{detail: [...]}`
 *  for 422 body-shape errors. Flatten both into one message. */
async function readError(response: Response): Promise<string> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return response.statusText || `Request failed (${response.status})`;
  }

  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (item as { msg?: unknown })?.msg)
      .filter((msg): msg is string => typeof msg === "string");
    if (messages.length > 0) return messages.join("; ");
  }
  return response.statusText || `Request failed (${response.status})`;
}

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  /** Endpoints under /samples and /health don't need the client id. */
  anonymous?: boolean;
};

export async function request<T>(
  path: string,
  { method = "GET", body, anonymous = false }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (!anonymous) headers["X-Client-Id"] = getClientId();

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new ApiError(response.status, await readError(response));
  }
  return (await response.json()) as T;
}
