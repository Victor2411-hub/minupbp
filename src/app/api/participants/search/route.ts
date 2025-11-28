import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
        return NextResponse.json([]);
    }

    try {
        // @ts-ignore
        const participants = await prisma.participante.findMany({
            where: {
                OR: [
                    { nombre: { contains: query } },
                    { email: { contains: query } },
                ],
            },
            include: {
                centroEducativo: true,
            },
            take: 10,
        });

        return NextResponse.json(participants);
    } catch (error) {
        console.error("Error searching participants:", error);
        return NextResponse.json({ error: "Failed to search participants" }, { status: 500 });
    }
}
