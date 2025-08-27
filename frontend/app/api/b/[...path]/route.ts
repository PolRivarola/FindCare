import { cookies as nextCookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.API_BASE || "http://127.0.0.1:8000/api";
const ACCESS_NAME = process.env.JWT_ACCESS_COOKIE || "access_token";
const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] as const;

async function handler(req: NextRequest, { params }: { params: { path: string[] } }) {
  if (!METHODS.includes(req.method as any)) {
    return NextResponse.json({ detail: "Method Not Allowed" }, { status: 405 });
  }

  // ---- preserve trailing slash from the incoming URL ----
  const url = new URL(req.url);
  const keepSlash = url.pathname.endsWith("/"); // e.g. .../calificar/
  const joined = (params.path ?? []).join("/"); // e.g. "servicios/5/calificar"
  const dest = `${BACKEND}/${joined}${keepSlash ? "/" : ""}${url.search}`;

  // ---- bearer from cookie (if present) ----
  const jar = await nextCookies();
  const access = jar.get(ACCESS_NAME)?.value;

  // ---- clone headers, normalized and without hop-by-hop ----
  const headers = new Headers();
  req.headers.forEach((v, k) => {
    const low = k.toLowerCase();
    if (["host", "content-length", "connection", "transfer-encoding"].includes(low)) return;
    // we'll set content-type explicitly later to avoid duplicate "application/json, application/json"
    if (low === "content-type") return;
    headers.set(low, v);
  });
  if (access) headers.set("authorization", `Bearer ${access}`);

  // ---- body + single content-type ----
  let body: BodyInit | undefined;
  let contentType = req.headers.get("content-type") || "";

  if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS") {
    if (contentType.includes("application/json")) {
      const json = await req.json().catch(() => undefined);
      body = json ? JSON.stringify(json) : undefined;
      contentType = "application/json";
    } else if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const fd = new FormData();
      for (const [k, v] of form.entries()) fd.append(k, v as any);
      body = fd; // fetch sets proper boundary; DO NOT set content-type manually
      contentType = ""; // let fetch compute it
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      body = await req.text();
      contentType = "application/x-www-form-urlencoded";
    } else {
      body = await req.arrayBuffer();
      // keep contentType as-is if there was one; otherwise leave empty
    }
  }

  if (contentType) headers.set("content-type", contentType);

  const res = await fetch(dest, {
    method: req.method,
    headers,
    body,
    cache: "no-store",
    redirect: "manual",
  });

  const buf = await res.arrayBuffer();
  const out = new NextResponse(buf, { status: res.status });

  // pass through useful headers
  for (const h of ["content-type", "content-disposition", "set-cookie"]) {
    const v = res.headers.get(h);
    if (v) out.headers.set(h, v);
  }

  return out;
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
};
