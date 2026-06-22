import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value, options)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session so it doesn't expire mid-visit.
  // IMPORTANT: never call supabase.auth.getSession() here —
  // getUser() re-validates with Supabase Auth on every request.
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protect seller routes — must be logged in + have seller role
  if (pathname.startsWith('/seller')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login?next=/seller', request.url))
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login?next=/admin', request.url))
    }
  }

  // Protect checkout / orders — must be logged in
  if (pathname.startsWith('/checkout') || pathname.startsWith('/orders')) {
    if (!user) {
      return NextResponse.redirect(new URL(`/auth/login?next=${pathname}`, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
