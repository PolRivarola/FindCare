import { NextResponse } from "next/server";

const API_BASE = process.env.API_BASE || "http://127.0.0.1:8000/api";
const ACCESS  = process.env.JWT_ACCESS_COOKIE  || "access_token";
const REFRESH = process.env.JWT_REFRESH_COOKIE || "refresh_token";
const SECURE  = process.env.NODE_ENV === "production";

export async function POST() {
  // Intentá blacklistear en el backend si tenés ambos tokens
  // (si no, igual borramos cookies)
  const res = NextResponse.json({ ok: true });
  // limpiar cookies en el response
  res.cookies.set(ACCESS,  "", { httpOnly: true, secure: SECURE, sameSite: "lax", path: "/", maxAge: 0 });
  res.cookies.set(REFRESH, "", { httpOnly: true, secure: SECURE, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
