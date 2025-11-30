import { withAuth } from "next-auth/middleware";
import { NextResponse, type NextRequest } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";
import type { JWT } from "next-auth/jwt";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    if (req.nextUrl.pathname.startsWith("/admin")) {
      const token = req.nextauth.token;
      const isAdmin = token?.role === "ADMIN";
      const isCollaborator = token?.role === "COLLABORATOR";
      if (!isAdmin && !isCollaborator) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }: { token: JWT | null; req: NextRequest }) => {
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return !!token && (token.role === "ADMIN" || token.role === "COLLABORATOR");
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
