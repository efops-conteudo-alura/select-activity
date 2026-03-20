import { NextRequest, NextResponse } from "next/server";

// next-auth/jwt tem problemas de tipos com moduleResolution: bundler (next-auth v4 + Next.js 16.2)
// usar require como workaround até migrar para next-auth v5 (ver issue #17 do hub-efops)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getToken } = require("next-auth/jwt") as {
  getToken: (params: { req: NextRequest; secret: string }) => Promise<unknown>;
};

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? "",
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|login|criar-senha|_next/static|_next/image|favicon.ico).*)",
  ],
};
