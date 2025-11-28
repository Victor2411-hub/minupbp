import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requirePermiso } from "@/lib/api-auth";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requirePermiso(request, "editar_centros");
        const { id } = await params;
        const schoolId = parseInt(id);

        const body = await request.json();
        const { nombre, activo } = body;

        const school = await prisma.centroEducativo.update({
            where: { id: schoolId },
            data: {
                nombre,
                activo,
            },
        });

        return NextResponse.json(school);
    } catch (error) {
        console.error("Error updating school:", error);
        return NextResponse.json({ error: "Failed to update school" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requirePermiso(request, "editar_centros");
        const { id } = await params;
        const schoolId = parseInt(id);

        // Check if school has delegates
        const school = await prisma.centroEducativo.findUnique({
            where: { id: schoolId },
            include: {
                _count: {
                    select: { delegados: true }
                }
            }
        });

        if (school && school._count.delegados > 0) {
            return NextResponse.json(
                { error: "Cannot delete school with assigned delegates" },
                { status: 400 }
            );
        }

        await prisma.centroEducativo.delete({
            where: { id: schoolId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting school:", error);
        return NextResponse.json({ error: "Failed to delete school" }, { status: 500 });
    }
}
