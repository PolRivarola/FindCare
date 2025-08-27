import { NextResponse } from "next/server";
import { cookies as nextCookies } from "next/headers";

const API_BASE = process.env.API_BASE || "http://127.0.0.1:8000/api";
const ACCESS  = process.env.JWT_ACCESS_COOKIE  || "access_token";
const REFRESH = process.env.JWT_REFRESH_COOKIE || "refresh_token";
const SECURE  = process.env.NODE_ENV === "production";

export async function POST() {
  const jar = await nextCookies();
  const refresh = jar.get(REFRESH)?.value;
  if (!refresh) {
    return NextResponse.json({ detail: "no-refresh" }, { status: 401 });
  }

  const r = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
    cache: "no-store",
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data.access) {
    return NextResponse.json(data, { status: r.status || 401 });
  }

  const res = NextResponse.json({ access: data.access }, { status: 200 });
  // 👇 Aquí SÍ está permitido setear cookies
  res.cookies.set(ACCESS, data.access, {
    httpOnly: true,
    secure: SECURE,
    sameSite: "lax",
    path: "/",
  });
  return res;
}
