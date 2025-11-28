import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Si no hay token, NextAuth redirigirá automáticamente
        if (!token) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        const permisos = (token.permisos as string[]) || [];

        // Mapa de rutas y permisos requeridos
        const rutasPermitidas: Record<string, string> = {
            "/dashboard/events": "pagina_eventos",
            "/dashboard/setup": "pagina_configuracion",
            "/dashboard/countries": "pagina_paises",
            "/dashboard/delegates": "pagina_delegados",
            "/dashboard/grading": "pagina_calificaciones",
            "/dashboard/evaluation": "pagina_evaluacion",
            "/dashboard/chairs": "pagina_mesas",
        };

        // Verificar si la ruta requiere un permiso específico
        const permisoRequerido = rutasPermitidas[path];

        if (permisoRequerido) {
            // Verificar si tiene acceso total o el permiso específico
            const tieneAcceso =
                permisos.includes("acceso_total") ||
                permisos.includes(permisoRequerido);

            if (!tieneAcceso) {
                // Redirigir a una página de acceso denegado o al dashboard
                return NextResponse.redirect(new URL("/dashboard", req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/login",
        },
    }
);

export const config = {
    matcher: ["/dashboard/:path*"],
};
