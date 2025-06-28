import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

export async function middleware(req: NextRequest) {
  // solo usar en prod
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next()
  }

  const token = req.cookies.get("access_token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "clave-dev")
    const { payload } = await jwtVerify(token, secret)

    const role = payload.role

    const pathname = req.nextUrl.pathname
    if (pathname.startsWith("/cliente") && role !== "cliente") {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    if (pathname.startsWith("/cuidador") && role !== "cuidador") {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    return NextResponse.next()
  } catch (e) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
}

export const config = {
  matcher: ["/cliente/:path*", "/cuidador/:path*"],
}
