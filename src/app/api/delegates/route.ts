import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const committeeId = searchParams.get("committeeId");

    try {
        const where: any = {};
        if (committeeId) where.comiteId = parseInt(committeeId);

        const delegados = await prisma.delegado.findMany({
            where,
            include: {
                pais: true,
                comite: {
                    include: {
                        evento: true
                    }
                },
                centroEducativo: true
            },
            orderBy: { pais: { nombre: "asc" } },
        });

        // Map to English for frontend
        const mapped = delegados.map(d => ({
            id: d.id,
            name: d.nombre,
            email: d.email,
            phone: d.telefono,
            age: d.edad,
            grade: d.grado,
            countryId: d.paisId,
            committeeId: d.comiteId,
            schoolId: d.centroEducativoId,
            participations: d.participaciones,
            comments: d.comentarios,
            country: {
                id: d.pais.id,
                name: d.pais.nombre,
                code: d.pais.codigo,
                flagUrl: d.pais.banderaUrl
            },
            committee: {
                id: d.comite.id,
                name: d.comite.nombre,
                eventId: d.comite.eventoId
            },
            school: d.centroEducativo ? {
                id: d.centroEducativo.id,
                name: d.centroEducativo.nombre
            } : null
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error("Failed to fetch delegates:", error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 1. Find or create Participante
        let participanteId = null;

        // Try to find by email if provided
        if (body.email) {
            // @ts-ignore
            const existingParticipante = await prisma.participante.findUnique({
                where: { email: body.email },
            });
            if (existingParticipante) {
                participanteId = existingParticipante.id;
            }
        }

        // If not found, create new Participante
        if (!participanteId) {
            // @ts-ignore
            const newParticipante = await prisma.participante.create({
                data: {
                    nombre: body.name,
                    email: body.email || null,
                    telefono: body.phone || null,
                    grado: body.grade || null,
                    // fechaNacimiento could be calculated from age if needed, but for now skipping
                    centroEducativoId: body.schoolId ? parseInt(body.schoolId) : null,
                },
            });
            participanteId = newParticipante.id;
        }

        const delegado = await prisma.delegado.create({
            data: {
                nombre: body.name,
                email: body.email || null,
                telefono: body.phone || null,
                edad: body.age ? parseInt(body.age) : null,
                grado: body.grade || null,
                paisId: parseInt(body.countryId),
                comiteId: parseInt(body.committeeId),
                centroEducativoId: body.schoolId ? parseInt(body.schoolId) : null,
                // @ts-ignore
                participanteId: participanteId,
            },
            include: { pais: true, comite: true, centroEducativo: true },
        });
        return NextResponse.json(delegado);
    } catch (error) {
        console.error("Failed to create delegate:", error);
        return NextResponse.json({ error: "Failed to create delegate" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        const updateData: any = {};
        if (data.name) updateData.nombre = data.name;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.phone !== undefined) updateData.telefono = data.phone;
        if (data.age) updateData.edad = parseInt(data.age);
        if (data.grade !== undefined) updateData.grado = data.grade;
        if (data.countryId) updateData.paisId = parseInt(data.countryId);
        if (data.committeeId) updateData.comiteId = parseInt(data.committeeId);
        if (data.schoolId !== undefined) updateData.centroEducativoId = data.schoolId ? parseInt(data.schoolId) : null;
        if (data.participations !== undefined) updateData.participaciones = parseInt(data.participations);
        if (data.comments !== undefined) updateData.comentarios = data.comments;

        const delegado = await prisma.delegado.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: { pais: true, comite: true, centroEducativo: true },
        });
        return NextResponse.json(delegado);
    } catch (error) {
        console.error("Failed to update delegate:", error);
        return NextResponse.json({ error: "Failed to update delegate" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await prisma.delegado.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete delegate:", error);
        return NextResponse.json({ error: "Failed to delete delegate" }, { status: 500 });
    }
}
