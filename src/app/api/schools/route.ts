import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requirePermiso } from "@/lib/api-auth";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check permission (optional: allow all authenticated users to list schools for dropdowns)
        // For management page, we might want to restrict, but for dropdowns we need access.
        // We'll allow read access to authenticated users.

        const schools = await prisma.centroEducativo.findMany({
            orderBy: { nombre: 'asc' },
            include: {
                _count: {
                    select: { delegados: true }
                }
            }
        });

        return NextResponse.json(schools);
    } catch (error) {
        console.error("Error fetching schools:", error);
        return NextResponse.json({ error: "Failed to fetch schools" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await requirePermiso(request, "editar_centros");

        const body = await request.json();
        const { nombre } = body;

        if (!nombre) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const existing = await prisma.centroEducativo.findUnique({
            where: { nombre },
        });

        if (existing) {
            return NextResponse.json({ error: "School already exists" }, { status: 400 });
        }

        const school = await prisma.centroEducativo.create({
            data: {
                nombre,
                activo: true,
            },
        });

        return NextResponse.json(school);
    } catch (error) {
        console.error("Error creating school:", error);
        return NextResponse.json({ error: "Failed to create school" }, { status: 500 });
    }
}
