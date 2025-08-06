
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Verificar si el usuario intenta acceder a rutas de admin
    if (req.nextUrl.pathname.startsWith("/admin")) {
      // Verificar si el usuario es admin
      if (!req.nextauth.token?.isAdmin) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Para rutas de admin, verificar autenticación
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"]
};
