import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const users = await prisma.usuarioMesa.findMany({
            include: {
                usuariosPermisos: {
                    include: {
                        permiso: true,
                    },
                },
            },
            orderBy: { nombre: "asc" },
        });

        const formattedUsers = users.map((u) => ({
            id: u.id,
            nombre: u.nombre,
            usuario: u.usuario,
            activo: u.activo,
            permisos: u.usuariosPermisos.map((up) => up.permiso.clave),
        }));

        return NextResponse.json(formattedUsers);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
