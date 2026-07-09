import { useState } from "react";

import { getClientId } from "../api/client";

/**
 * The anonymous per-browser id that scopes history. Stable for the lifetime of
 * the component tree; `api/client.ts` reads the same value straight from
 * localStorage when it sets the X-Client-Id header, so this hook is only for
 * components that want to *display* or key off the id.
 */
export function useClientId(): string {
  // Lazy initializer: getClientId() creates-and-persists on first call, so it
  // must not run on every render.
  const [clientId] = useState(getClientId);
  return clientId;
}
