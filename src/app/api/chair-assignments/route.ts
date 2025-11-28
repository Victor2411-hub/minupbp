import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const chairId = searchParams.get("chairId");
    const committeeId = searchParams.get("committeeId");

    try {
        const where: any = {};
        if (chairId) where.chairId = chairId;
        if (committeeId) where.committeeId = committeeId;

        const assignments = await prisma.chairAssignment.findMany({
            where,
            include: {
                chair: true,
                committee: {
                    include: {
                        event: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(assignments);
    } catch (error) {
        console.error("Failed to fetch chair assignments:", error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const assignment = await prisma.chairAssignment.create({
            data: {
                chairId: body.chairId,
                committeeId: body.committeeId,
                position: body.position,
            },
            include: {
                chair: true,
                committee: true,
            }
        });
        return NextResponse.json(assignment);
    } catch (error) {
        console.error("Failed to create chair assignment:", error);
        return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await prisma.chairAssignment.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete assignment:", error);
        return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 });
    }
}
