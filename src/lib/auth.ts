import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                usuario: { label: "Usuario", type: "text" },
                contrasena: { label: "Contraseña", type: "password" },
            },
            async authorize(credentials) {
                try {
                    console.log("Attempting login for:", credentials?.usuario);

                    if (!credentials?.usuario || !credentials?.contrasena) {
                        console.log("Missing credentials");
                        return null;
                    }

                    // Check if prisma is available
                    if (!prisma) {
                        console.error("CRITICAL ERROR: prisma client is undefined");
                        return null;
                    }

                    const usuario = await prisma.usuarioMesa.findUnique({
                        where: { usuario: credentials.usuario },
                        include: {
                            usuariosPermisos: {
                                include: {
                                    permiso: true,
                                },
                            },
                        },
                    });

                    if (!usuario) {
                        console.log("User not found");
                        return null;
                    }

                    if (!usuario.activo) {
                        console.log("User inactive");
                        return null;
                    }

                    const passwordValid = await bcrypt.compare(
                        credentials.contrasena,
                        usuario.contrasena
                    );

                    console.log("Password valid:", passwordValid);

                    if (!passwordValid) {
                        return null;
                    }

                    // Extract permission claves
                    const permisos = usuario.usuariosPermisos.map((up) => up.permiso.clave);
                    console.log("Login successful, permissions:", permisos);

                    return {
                        id: usuario.id.toString(),
                        nombre: usuario.nombre,
                        usuario: usuario.usuario,
                        permisos,
                    };
                } catch (error) {
                    console.error("Login error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.nombre = (user as any).nombre;
                token.usuario = (user as any).usuario;
                token.permisos = (user as any).permisos;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    id: token.id as string,
                    nombre: token.nombre as string,
                    usuario: token.usuario as string,
                    permisos: token.permisos as string[],
                };
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_dev_only",
};
