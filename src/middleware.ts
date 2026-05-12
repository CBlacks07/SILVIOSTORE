import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "silvio_session";

async function verify(token: string): Promise<{ sub: string; role: string } | null> {
  try {
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return { sub: String(payload.sub), role: String(payload.role) };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verify(token) : null;

  if (path.startsWith("/compte") && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  if (path.startsWith("/admin")) {
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/connexion";
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }
    if (session.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/compte/:path*", "/admin/:path*"]
};
