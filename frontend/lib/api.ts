// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/b";

function withSlash(path: string) {
  // leaves /foo/bar/ as is; adds / if missing; doesn't touch ?query
  const [p, q = ""] = path.split("?");
  if (/\.[a-z0-9]+$/i.test(p)) return path;         // keep files like .json, .png
  const fixed = p.endsWith("/") ? p : p + "/";
  return q ? `${fixed}?${q}` : fixed;
}

// Global authentication error handler
function handleAuthError(status: number, response: Response) {
  if (status === 401 || status === 403) {
    // Dispatch a custom event to notify components about authentication failure
    window.dispatchEvent(new CustomEvent('authError', { 
      detail: { status, response } 
    }));
  }
}

// Helper function to make API calls with automatic token refresh
async function makeAuthenticatedRequest(
  url: string, 
  options: RequestInit,
  retryOnAuth = true
): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    cache: "no-store",
  });

  // If we get a 401 and haven't retried yet, try to refresh the token
  if (response.status === 401 && retryOnAuth) {
    try {
      // Try to refresh the token
      const refreshResponse = await fetch('/api/auth/refresh-local', {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        // Token refreshed successfully, retry the original request
        return makeAuthenticatedRequest(url, options, false);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  }

  return response;
}

export async function apiGet<T>(endpoint: string, params?: Record<string, any>) {
  let query = "";
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    query = `?${searchParams.toString()}`;
  }
  const url = `${API_BASE_URL}${withSlash(endpoint)}${query}`;
  const r = await makeAuthenticatedRequest(url, { 
    method: "GET", 
    headers: { "Content-Type": "application/json" } 
  });
  if (!r.ok) {
    handleAuthError(r.status, r);
    throw new Error(await r.text());
  }
  return r.json() as Promise<T>;
}

export async function apiPost<T>(endpoint: string, body?: any) {
  const url = `${API_BASE_URL}${withSlash(endpoint)}`;
  const r = await makeAuthenticatedRequest(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  if (!r.ok) {
    handleAuthError(r.status, r);
    throw new Error(await r.text());
  }
  return r.json() as Promise<T>;
}


export async function apiPut<T>(endpoint: string, body?: any) {
  const url = `${API_BASE_URL}${withSlash(endpoint)}`;
  const r = await makeAuthenticatedRequest(url, { 
    method: "PUT", 
    headers: { "Content-Type": "application/json" }, 
    body: JSON.stringify(body) 
  });
  if (!r.ok) {
    handleAuthError(r.status, r);
    throw new Error(await r.text());
  }
  return r.json() as Promise<T>;
}

export async function apiDelete(endpoint: string) {
  const url = `${API_BASE_URL}${withSlash(endpoint)}`;
  const r = await makeAuthenticatedRequest(url, { 
    method: "DELETE", 
    headers: { "Content-Type": "application/json" }
  });
  
  if (!r.ok) {
    handleAuthError(r.status, r);
    const errorText = await r.text();
    throw new Error(errorText || `HTTP ${r.status}: ${r.statusText}`);
  }
  
  return;
}

export async function apiPostFormData<T>(endpoint: string, formData: FormData) {
  const url = `${API_BASE_URL}${withSlash(endpoint)}`;
  const r = await makeAuthenticatedRequest(url, {
    method: "POST",
    // Don't set Content-Type - let browser set it with boundary for multipart/form-data
    body: formData,
  });
  if (!r.ok) {
    handleAuthError(r.status, r);
    throw new Error(await r.text());
  }
  return r.json() as Promise<T>;
}

export async function apiPatchFormData<T>(endpoint: string, formData: FormData) {
  const url = `${API_BASE_URL}${withSlash(endpoint)}`;
  const r = await makeAuthenticatedRequest(url, {
    method: "PATCH",
    // Let the browser set multipart boundary automatically
    body: formData,
  });
  if (!r.ok) {
    handleAuthError(r.status, r);
    throw new Error(await r.text());
  }
  return r.json() as Promise<T>;
}
