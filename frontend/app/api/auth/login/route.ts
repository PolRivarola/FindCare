import { NextResponse } from "next/server";

const API_BASE =  "http://127.0.0.1:8000/api";
const ACCESS  = process.env.JWT_ACCESS_COOKIE  || "access_token";
const REFRESH = process.env.JWT_REFRESH_COOKIE || "refresh_token";
const SECURE  = process.env.NODE_ENV === "production"; // secure sólo en prod

export async function POST(req: Request) {
  const body = await req.json();
  const r = await fetch(`${API_BASE}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await r.json();
  if (!r.ok) {
    return NextResponse.json(data, { status: r.status });
  }

  const res = NextResponse.json({ ok: true, user: data.user ?? null }, { status: 200 });
  res.cookies.set(ACCESS,  data.access,  { httpOnly: true, secure: SECURE, sameSite: "lax", path: "/" });
  res.cookies.set(REFRESH, data.refresh, { httpOnly: true, secure: SECURE, sameSite: "lax", path: "/" });
  return res;
}
