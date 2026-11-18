import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabasePublicConfig, isSupabaseConfigured } from '@/lib/supabase/client';

const DEMO_ROLES: Record<string, 'admin' | 'seller' | 'customer'> = {
  'admin@umkmhub.id': 'admin',
  'kopigayo@umkmhub.id': 'seller',
  'pembeli@umkmhub.id': 'customer',
};

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;
  const isProtectedCustomer =
    pathname.startsWith('/customer') || pathname.startsWith('/checkout');
  const isProtectedSeller = pathname.startsWith('/seller');
  const isProtectedAdmin = pathname.startsWith('/admin');

  // Check demo/seeded session cookie first
  const demoSessionEmail = request.cookies.get('umkm_demo_session')?.value;
  if (demoSessionEmail && DEMO_ROLES[demoSessionEmail]) {
    const role = DEMO_ROLES[demoSessionEmail];
    if (isProtectedAdmin && role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (isProtectedSeller && role !== 'seller' && role !== 'admin') {
      return NextResponse.redirect(
        new URL('/customer?notice=Silakan+daftar+sebagai+Penjual+UMKM', request.url)
      );
    }
    return response;
  }

  if (!isSupabaseConfigured()) {
    return response;
  }

  const { url, publishableKey } = getSupabasePublicConfig();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if ((isProtectedCustomer || isProtectedSeller || isProtectedAdmin) && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && (isProtectedSeller || isProtectedAdmin || isProtectedCustomer)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single();

    if (profile?.status === 'suspended') {
      const suspendedUrl = new URL('/login?error=Akun+Anda+sedang+ditangguhkan', request.url);
      return NextResponse.redirect(suspendedUrl);
    }

    const effectiveRole =
      profile?.role ||
      (user.email === 'admin@umkmhub.id'
        ? 'admin'
        : (user.user_metadata?.role as string) || 'customer');

    if (isProtectedAdmin && effectiveRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (isProtectedSeller && effectiveRole !== 'seller' && effectiveRole !== 'admin') {
      return NextResponse.redirect(
        new URL('/customer?notice=Silakan+daftar+sebagai+Penjual+UMKM', request.url)
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/customer/:path*',
    '/checkout/:path*',
    '/seller/:path*',
    '/admin/:path*',
  ],
};
