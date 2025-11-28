import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to manage users (acceso_total or specific permission)
    // For now, we assume admin access is checked via middleware or here
    // TODO: Add specific permission check if needed

    try {
        const userId = parseInt(id);
        const body = await request.json();
        const { permissionIds } = body; // Array of permission IDs

        if (!Array.isArray(permissionIds)) {
            return NextResponse.json({ error: "Invalid permission IDs" }, { status: 400 });
        }

        // Transaction to update permissions
        await prisma.$transaction(async (tx: any) => {
            // 1. Remove all existing permissions for this user
            await tx.usuarioPermiso.deleteMany({
                where: { usuarioMesaId: userId },
            });

            // 2. Add new permissions
            if (permissionIds.length > 0) {
                await tx.usuarioPermiso.createMany({
                    data: permissionIds.map((permId: number) => ({
                        usuarioMesaId: userId,
                        permisoId: permId,
                    })),
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating permissions:", error);
        return NextResponse.json({ error: "Failed to update permissions" }, { status: 500 });
    }
}
