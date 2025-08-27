// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/b";

function withSlash(path: string) {
  // leaves /foo/bar/ as is; adds / if missing; doesn’t touch ?query
  const [p, q = ""] = path.split("?");
  if (/\.[a-z0-9]+$/i.test(p)) return path;         // keep files like .json, .png
  const fixed = p.endsWith("/") ? p : p + "/";
  return q ? `${fixed}?${q}` : fixed;
}

export async function apiGet<T>(endpoint: string, params?: Record<string, string | number>) {
  const query = params ? `?${new URLSearchParams(params as any)}` : "";
  const url = `${API_BASE_URL}${withSlash(endpoint)}${query}`;
  const r = await fetch(url, { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" }, cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}

export async function apiPost<T>(endpoint: string, body?: any) {
  const url = `${API_BASE_URL}${withSlash(endpoint)}`;
  const r = await fetch(url, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
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
