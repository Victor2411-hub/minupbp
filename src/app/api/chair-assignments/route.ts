import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { chairId, committeeId, position } = body;

        const assignment = await prisma.asignacionMesa.create({
            data: {
                usuarioMesaId: parseInt(chairId),
                comiteId: parseInt(committeeId),
                cargo: position,
            },
        });
        return NextResponse.json(assignment);
    } catch (error) {
        console.error("Failed to assign chair:", error);
        return NextResponse.json({ error: "Failed to assign chair" }, { status: 500 });
    }
}
