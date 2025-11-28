import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sheetId, committeeId } = body;

        const assignment = await prisma.asignacionHoja.create({
            data: {
                hojaId: parseInt(sheetId),
                comiteId: parseInt(committeeId),
            },
        });
        return NextResponse.json(assignment);
    } catch (error) {
        console.error("Failed to assign sheet:", error);
        return NextResponse.json({ error: "Failed to assign sheet" }, { status: 500 });
    }
}
