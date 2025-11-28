import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
        return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    try {
        const committees = await prisma.committee.findMany({
            where: { eventId },
            include: {
                chairAssignments: {
                    include: {
                        chair: true
                    }
                },
                sheetAssignments: {
                    include: {
                        sheet: true
                    }
                },
                _count: {
                    select: { delegates: true }
                }
            },
            orderBy: { name: "asc" },
        });
        return NextResponse.json(committees);
    } catch (error) {
        console.error("Failed to fetch committees:", error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const committee = await prisma.committee.create({
            data: {
                name: body.name,
                eventId: body.eventId,
            },
        });
        return NextResponse.json(committee);
    } catch (error) {
        console.error("Failed to create committee:", error);
        return NextResponse.json({ error: "Failed to create committee" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await prisma.committee.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete committee:", error);
        return NextResponse.json({ error: "Failed to delete committee" }, { status: 500 });
    }
}
