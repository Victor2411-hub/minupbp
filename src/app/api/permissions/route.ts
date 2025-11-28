import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const permisos = await prisma.permiso.findMany({
            orderBy: { id: "asc" },
        });
        return NextResponse.json(permisos);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 });
    }
}
