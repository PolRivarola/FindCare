// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/b";

function withSlash(path: string) {
  // leaves /foo/bar/ as is; adds / if missing; doesn’t touch ?query
  const [p, q = ""] = path.split("?");
  if (/\.[a-z0-9]+$/i.test(p)) return path;         // keep files like .json, .png
  const fixed = p.endsWith("/") ? p : p + "/";
  return q ? `${fixed}?${q}` : fixed;
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
  const r = await fetch(url, { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" }, cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}

export async function apiPost<T>(endpoint: string, body?: any) {
  const url = `${API_BASE_URL}${withSlash(endpoint)}`;
  const r = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}


export async function apiPut<T>(endpoint: string, body?: any) {
  const url = `${API_BASE_URL}${withSlash(endpoint)}`;
  const r = await fetch(url, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}

export async function apiDelete(endpoint: string) {
  const url = `${API_BASE_URL}${withSlash(endpoint)}`;
  const r = await fetch(url, { method: "DELETE", credentials: "include", headers: { "Content-Type": "application/json" }});
  if (!r.ok) throw new Error(await r.text());
}

export async function apiPostFormData<T>(endpoint: string, formData: FormData) {
  const url = `${API_BASE_URL}${withSlash(endpoint)}`;
  const r = await fetch(url, {
    method: "POST",
    credentials: "include",
    // Don't set Content-Type - let browser set it with boundary for multipart/form-data
    body: formData,
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}

export async function apiPatchFormData<T>(endpoint: string, formData: FormData) {
  const url = `${API_BASE_URL}${withSlash(endpoint)}`;
  const r = await fetch(url, {
    method: "PATCH",
    credentials: "include",
    // Let the browser set multipart boundary automatically
    body: formData,
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}
