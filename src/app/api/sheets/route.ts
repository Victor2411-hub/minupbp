import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const committeeId = searchParams.get("committeeId");

    try {
        if (committeeId) {
            // Get sheet assigned to this committee
            const assignment = await prisma.committeeSheet.findFirst({
                where: { committeeId },
                include: {
                    sheet: {
                        include: { criteria: true }
                    }
                }
            });
            return NextResponse.json(assignment?.sheet || null);
        } else {
            // Get all sheets
            const sheets = await prisma.evaluationSheet.findMany({
                include: {
                    criteria: true,
                    _count: {
                        select: { committeeSheets: true }
                    }
                },
                orderBy: { createdAt: "desc" },
            });
            return NextResponse.json(sheets);
        }
    } catch (error) {
        console.error("Failed to fetch sheets:", error);
        return NextResponse.json(null, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, criteria } = body;

        const sheet = await prisma.evaluationSheet.create({
            data: {
                name,
                description: description || null,
                criteria: {
                    create: criteria.map((c: any) => ({
                        name: c.name,
                        maxScore: parseInt(c.maxScore),
                    })),
                },
            },
            include: { criteria: true },
        });
        return NextResponse.json(sheet);
    } catch (error) {
        console.error("Failed to create sheet:", error);
        return NextResponse.json({ error: "Failed to create sheet" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await prisma.evaluationSheet.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete sheet:", error);
        return NextResponse.json({ error: "Failed to delete sheet" }, { status: 500 });
    }
}
