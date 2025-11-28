import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const committeeId = searchParams.get("committeeId");

    if (!committeeId) {
        return NextResponse.json({ error: "Committee ID is required" }, { status: 400 });
    }

    try {
        const puntajes = await prisma.puntaje.findMany({
            where: {
                delegado: { comiteId: parseInt(committeeId) }
            }
        });

        // Map to English
        const mapped = puntajes.map(p => ({
            id: p.id,
            value: p.valor,
            delegateId: p.delegadoId,
            criterionId: p.criterioId
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error("Failed to fetch grading:", error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { delegateId, criterionId, value } = body;

        const puntaje = await prisma.puntaje.upsert({
            where: {
                delegadoId_criterioId: {
                    delegadoId: parseInt(delegateId),
                    criterioId: parseInt(criterionId)
                }
            },
            update: { valor: value },
            create: {
                delegadoId: parseInt(delegateId),
                criterioId: parseInt(criterionId),
                valor: value
            }
        });

        return NextResponse.json(puntaje);
    } catch (error) {
        console.error("Failed to save score:", error);
        return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
    }
}
