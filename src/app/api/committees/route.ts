import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
        return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    try {
        const comites = await prisma.comite.findMany({
            where: { eventoId: parseInt(eventId) },
            include: {
                asignacionesMesa: {
                    include: {
                        usuarioMesa: true
                    }
                },
                asignacionesHoja: {
                    include: {
                        hoja: true
                    }
                },
                _count: {
                    select: { delegados: true }
                }
            },
            orderBy: { nombre: "asc" },
        });

        // Map back to English structure for frontend compatibility (temporarily)
        // Or better, update frontend to expect Spanish. 
        // I will return Spanish structure and update Frontend.
        return NextResponse.json(comites);
    } catch (error) {
        console.error("Failed to fetch committees:", error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const comite = await prisma.comite.create({
            data: {
                nombre: body.name,
                eventoId: parseInt(body.eventId),
            },
        });
        return NextResponse.json(comite);
    } catch (error) {
        console.error("Failed to create committee:", error);
        return NextResponse.json({ error: "Failed to create committee" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        const updateData: any = {};
        if (data.name) updateData.nombre = data.name;

        const comite = await prisma.comite.update({
            where: { id: parseInt(id) },
            data: updateData,
        });
        return NextResponse.json(comite);
    } catch (error) {
        console.error("Failed to update committee:", error);
        return NextResponse.json({ error: "Failed to update committee" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await prisma.comite.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete committee:", error);
        return NextResponse.json({ error: "Failed to delete committee" }, { status: 500 });
    }
}
