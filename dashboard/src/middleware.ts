import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/campaigns", "/contacts"];
const publicRoutes = ["/login", "/register", "/"];
const cookieName = "auth-token";

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const token =
    req.cookies.get(cookieName)?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (protectedRoutes.some((route) => path.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
  }

  if (publicRoutes.includes(path) && token) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
