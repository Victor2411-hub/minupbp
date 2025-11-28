import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const paises = await prisma.pais.findMany({
            include: {
                _count: {
                    select: { delegados: true }
                }
            },
            orderBy: { nombre: "asc" },
        });

        // Map to English for frontend compatibility
        const mapped = paises.map(p => ({
            id: p.id,
            name: p.nombre,
            code: p.codigo,
            flagUrl: p.banderaUrl,
            active: p.activo,
            _count: { delegates: p._count.delegados }
        }));
        return NextResponse.json(mapped);
    } catch (error) {
        console.error("Failed to fetch countries:", error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const pais = await prisma.pais.create({
            data: {
                nombre: body.name,
                codigo: body.code,
                banderaUrl: body.flagUrl || null,
            },
        });
        return NextResponse.json(pais);
    } catch (error) {
        console.error("Failed to create country:", error);
        return NextResponse.json({ error: "Failed to create country" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        const updateData: any = {};
        if (data.name) updateData.nombre = data.name;
        if (data.code) updateData.codigo = data.code;
        if (data.flagUrl !== undefined) updateData.banderaUrl = data.flagUrl;
        if (data.active !== undefined) updateData.activo = data.active;

        const pais = await prisma.pais.update({
            where: { id: parseInt(id) },
            data: updateData,
        });
        return NextResponse.json(pais);
    } catch (error) {
        console.error("Failed to update country:", error);
        return NextResponse.json({ error: "Failed to update country" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await prisma.pais.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete country:", error);
        return NextResponse.json({ error: "Failed to delete country" }, { status: 500 });
    }
}
