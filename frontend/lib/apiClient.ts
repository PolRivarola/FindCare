import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_BASE = process.env.API_BASE!;
const ACCESS = process.env.JWT_ACCESS_COOKIE || "access_token";
const REFRESH = process.env.JWT_REFRESH_COOKIE || "refresh_token";

export type AppUser = {
  id: number;
  username: string;
  email: string;
  es_cliente: boolean;
  es_cuidador: boolean;
  is_staff: boolean;
  is_superuser: boolean;
};

async function fetchMe(access?: string): Promise<Response> {
  return fetch(`${API_BASE}/users/me/`, {
    headers: access ? { Authorization: `Bearer ${access}` } : undefined,
    cache: "no-store",
  });
}

export async function getUserOrNull(): Promise<AppUser | null> {
  const jar = await cookies();
  let access = jar.get(ACCESS)?.value;
  const refresh = jar.get(REFRESH)?.value;

  // 1) Intento con el access actual
  let r = await fetchMe(access);
  if (r.ok) return (await r.json()) as AppUser;

  // 2) Si falla por expirado y tengo refresh → refresco
  if (r.status === 401 && refresh) {
    const rr = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
      cache: "no-store",
    });

    if (rr.ok) {
      const data = await rr.json();
      access = data.access;
      // seteo nuevo access en cookie (HttpOnly) para siguientes requests
      (await
            // seteo nuevo access en cookie (HttpOnly) para siguientes requests
            cookies()).set(ACCESS, access!, {
        httpOnly: true, secure: true, sameSite: "lax", path: "/"
      });
      r = await fetchMe(access);
      if (r.ok) return (await r.json()) as AppUser;
    }
  }

  return null;
}

export async function requireUser(): Promise<AppUser> {
  const user = await getUserOrNull();
  if (!user) redirect("/login");
  return user;
}

export function userHasRole(user: AppUser, role: "cliente" | "cuidador" | "admin") {
  if (role === "admin") return !!(user.is_staff || user.is_superuser);
  if (role === "cuidador") return !!user.es_cuidador;
  if (role === "cliente") return !!user.es_cliente;
  return false;
}

export async function requireRole(role: "cliente" | "cuidador" | "admin") {
  const user = await requireUser();
  if (!userHasRole(user, role)) redirect("/forbidden");
  return user;
}
