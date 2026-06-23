import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Block access to debug routes in production unless debug flag is enabled
  if (process.env.NODE_ENV !== "development" && !process.env.NEXT_PUBLIC_DEBUG) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/debug/:path*",
}

