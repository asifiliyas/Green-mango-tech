// No middleware needed.
// Auth redirects are handled by AuthContext on the client side.
// API route protection is handled by getSession() in each API route.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
