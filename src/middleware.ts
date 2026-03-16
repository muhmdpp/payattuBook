import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    let res = NextResponse.next({
        request: {
            headers: req.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
                    res = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        res.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const isAuthRoute = req.nextUrl.pathname.startsWith('/login') ||
        req.nextUrl.pathname.startsWith('/auth');

    if (!user && !isAuthRoute) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/login';
        const redirectResponse = NextResponse.redirect(redirectUrl);
        res.cookies.getAll().forEach(cookie => {
            redirectResponse.cookies.set({ ...cookie });
        });
        return redirectResponse;
    }

    if (user && req.nextUrl.pathname === '/login') {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/';
        const redirectResponse = NextResponse.redirect(redirectUrl);
        res.cookies.getAll().forEach(cookie => {
            redirectResponse.cookies.set({ ...cookie });
        });
        return redirectResponse;
    }

    return res;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
