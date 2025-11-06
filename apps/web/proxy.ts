import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(req: NextRequest) {
  const { pathname, origin } = req.nextUrl
  const token = req.cookies.get("token")?.value
  const role = req.cookies.get("role")?.value

  if (pathname.startsWith("/admin")) {
    // Token yoksa giriş sayfasına yönlendir
    if (!token) {
      return NextResponse.redirect(new URL('/signin', origin))
    }
    
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL('/', origin))
    }
  }

  // Giriş/Kayıt sayfaları - Zaten giriş yapmışsa yönlendir
  if ((pathname === "/signin" || pathname === "/signup") && token) {
    // Rolüne göre yönlendirme
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL('/admin', origin))
    }
    return NextResponse.redirect(new URL('/', origin))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
}