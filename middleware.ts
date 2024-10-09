import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api/|_next/|_static/|_vercel|assets|[\\w-]+\\.\\w+).*)',
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  let hostname = req.headers
    .get('host')!
    .replace('.localhost:3000', `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`);

  // special case for Vercel preview deployment URLs
  if (
    hostname.includes('---') &&
    hostname.endsWith(`.${process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`)
  ) {
    hostname = `${hostname.split('---')[0]}.${
      process.env.NEXT_PUBLIC_ROOT_DOMAIN
    }`;
  }

  const searchParams = req.nextUrl.searchParams.toString();

  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ''
  }`;

  // rewrites for app pages
  if (hostname == `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) {
    const session = await getToken({ req });
    if (!session && path !== '/login') {
      return NextResponse.redirect(new URL('/login', req.url));
    } else if (session && path == '/login') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.rewrite(
      new URL(`/app${path === '/' ? '' : path}`, req.url)
    );
  }

  if (hostname.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)) {
    const slug = hostname.replace(
      `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
      ''
    );

    const rewriteUrl = new URL(
      `/${encodeURIComponent(process.env.NEXT_PUBLIC_ROOT_DOMAIN as string)}/${slug}`,
      'http://localhost:3000'
    );
    console.log('REWRITE URL', rewriteUrl);

    return NextResponse.rewrite(rewriteUrl);
  }

  if (hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
    if (path === '/') {
      return NextResponse.rewrite(new URL('/i/landing-page', req.url));
    }

    if (
      path.startsWith('/i/') ||
      path.startsWith('/api/') ||
      path.startsWith('/new')
    ) {
      return NextResponse.rewrite(new URL(path, req.url));
    }

    return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url));
  }

  return NextResponse.rewrite(new URL(`/${hostname}/unknown`, req.url));
}