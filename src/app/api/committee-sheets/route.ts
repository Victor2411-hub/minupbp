import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const committeeId = searchParams.get("committeeId");
    const sheetId = searchParams.get("sheetId");

    try {
        const where: any = {};
        if (committeeId) where.committeeId = committeeId;
        if (sheetId) where.sheetId = sheetId;

        const assignments = await prisma.committeeSheet.findMany({
            where,
            include: {
                committee: {
                    include: { event: true }
                },
                sheet: {
                    include: { criteria: true }
                }
            },
        });
        return NextResponse.json(assignments);
    } catch (error) {
        console.error("Failed to fetch committee sheets:", error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const assignment = await prisma.committeeSheet.create({
            data: {
                committeeId: body.committeeId,
                sheetId: body.sheetId,
            },
            include: {
                committee: true,
                sheet: {
                    include: { criteria: true }
                }
            }
        });
        return NextResponse.json(assignment);
    } catch (error) {
        console.error("Failed to assign sheet to committee:", error);
        return NextResponse.json({ error: "Failed to assign sheet" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await prisma.committeeSheet.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete assignment:", error);
        return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 });
    }
}
