// lib/auth-server.ts
import "server-only";
import { cookies as nextCookies } from "next/headers";
import { redirect } from "next/navigation";

const API_BASE =  "http://127.0.0.1:8000/";
const ACCESS  = process.env.JWT_ACCESS_COOKIE  || "access_token";
const REFRESH = process.env.JWT_REFRESH_COOKIE || "refresh_token";

export type AppUser = {
  id: number; username: string; email: string;
  es_cliente: boolean; es_cuidador: boolean;
  is_staff: boolean; is_superuser: boolean;
};

async function fetchMe(access?: string) {
  return fetch(`${API_BASE}api/users/me/`, {
    headers: access ? { Authorization: `Bearer ${access}` } : undefined,
    cache: "no-store",
  });
}

export async function getUserOrNull() {
  const jar = await nextCookies();
  let access = jar.get(ACCESS)?.value;
  const refresh = jar.get(REFRESH)?.value;

  // 1) try
  let r = await fetch(`${API_BASE}api/users/me/`, {
    headers: access ? { Authorization: `Bearer ${access}` } : undefined,
    cache: 'no-store',
  });
  if (r.ok) return (await r.json()) as AppUser;

  // 2) refresh through our local route (ABSOLUTE URL)
  if (r.status === 401 && refresh) {
    const rr = await fetch(`${siteBase()}/api/auth/refresh-local`, {
      method: 'POST',
      cache: 'no-store',
    });

    if (rr.ok) {
      const { access: newAccess } = await rr.json();
      access = newAccess;
      r = await fetch(`${API_BASE}/users/me/`, {
        headers: access ? { Authorization: `Bearer ${access}` } : undefined,
        cache: 'no-store',
      });
      if (r.ok) return (await r.json()) as AppUser;
    }
  }
  return null;
}

export async function requireUser(): Promise<AppUser> {
  const u = await getUserOrNull();
  console.log("User",u)
  if (!u) redirect("/login");
  return u;
}

export function hasRole(u: AppUser, role: "cliente" | "cuidador" | "admin") {
  if (role === "admin") return !!(u.is_staff || u.is_superuser);
  if (role === "cuidador") return !!u.es_cuidador;
  if (role === "cliente") return !!u.es_cliente;
  return false;
}

export async function requireRole(role: "cliente" | "cuidador" | "admin") {
  const u = await requireUser();
  if (!hasRole(u, role)) redirect("/forbidden");
  return u;
}

export function siteBase() {
  // Use env if available; fallback to localhost in dev
  const publicUrl = `${API_BASE}/api`;
  if (publicUrl) return publicUrl.replace(/\/$/, '');
  const vercel = process.env.VERCEL_URL; // e.g. myapp.vercel.app
  if (vercel) return `https://${vercel}`;
  return 'http://localhost:3000';
}