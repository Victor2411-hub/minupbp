import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const committeeId = searchParams.get("committeeId");

    try {
        if (committeeId) {
            // Get sheet assigned to committee
            const assignment = await prisma.asignacionHoja.findFirst({
                where: { comiteId: parseInt(committeeId) },
                include: {
                    hoja: {
                        include: { criterios: true }
                    }
                }
            });

            if (!assignment) return NextResponse.json(null);

            const h = assignment.hoja;
            return NextResponse.json({
                id: h.id,
                name: h.nombre,
                description: h.descripcion,
                criteria: h.criterios.map(c => ({
                    id: c.id,
                    name: c.nombre,
                    maxScore: c.maxPuntaje,
                    sheetId: c.hojaId
                }))
            });
        } else {
            // Get all sheets
            const hojas = await prisma.hojaEvaluacion.findMany({
                include: { criterios: true }
            });

            const mapped = hojas.map(h => ({
                id: h.id,
                name: h.nombre,
                description: h.descripcion,
                criteria: h.criterios.map(c => ({
                    id: c.id,
                    name: c.nombre,
                    maxScore: c.maxPuntaje,
                    sheetId: c.hojaId
                }))
            }));
            return NextResponse.json(mapped);
        }
    } catch (error) {
        console.error("Failed to fetch sheets:", error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // body: { name, description, criteria: [{ name, maxScore }] }

        const hoja = await prisma.hojaEvaluacion.create({
            data: {
                nombre: body.name,
                descripcion: body.description,
                criterios: {
                    create: body.criteria.map((c: any) => ({
                        nombre: c.name,
                        maxPuntaje: parseInt(c.maxScore)
                    }))
                }
            },
            include: { criterios: true }
        });
        return NextResponse.json(hoja);
    } catch (error) {
        console.error("Failed to create sheet:", error);
        return NextResponse.json({ error: "Failed to create sheet" }, { status: 500 });
    }
}
