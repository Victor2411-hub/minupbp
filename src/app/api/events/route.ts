import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const eventos = await prisma.evento.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(eventos);
    } catch (error) {
        console.error("Failed to fetch events:", error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const evento = await prisma.evento.create({
            data: {
                nombre: body.name,
                fecha: new Date(body.date),
                estado: "activo",
            },
        });
        return NextResponse.json(evento);
    } catch (error) {
        console.error("Failed to create event:", error);
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        // Map English fields to Spanish if needed, or expect Spanish from frontend
        // For now, I'll map incoming English fields to Spanish DB fields
        const updateData: any = {};
        if (data.name) updateData.nombre = data.name;
        if (data.date) updateData.fecha = new Date(data.date);
        if (data.status) updateData.estado = data.status;

        const evento = await prisma.evento.update({
            where: { id: parseInt(id) }, // Ensure ID is Int
            data: updateData,
        });
        return NextResponse.json(evento);
    } catch (error) {
        console.error("Failed to update event:", error);
        return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await prisma.evento.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete event:", error);
        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }
}
