import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { delegateId, criterionId, userId } = body;

        if (!delegateId || !criterionId || !userId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Upsert presence: if exists, update timestamp; if not, create
        // @ts-ignore
        const presence = await prisma.gradingPresence.upsert({
            where: {
                delegadoId_criterioId: {
                    delegadoId: parseInt(delegateId),
                    criterioId: parseInt(criterionId),
                },
            },
            update: {
                userId: userId,
                updatedAt: new Date(),
            },
            create: {
                delegadoId: parseInt(delegateId),
                criterioId: parseInt(criterionId),
                userId: userId,
            },
        });

        return NextResponse.json(presence);
    } catch (error) {
        console.error("Failed to update presence:", error);
        return NextResponse.json({ error: "Failed to update presence" }, { status: 500 });
    }
}
