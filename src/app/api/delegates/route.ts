import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const committeeId = searchParams.get("committeeId");

    try {
        const where: any = {};
        if (committeeId) where.committeeId = committeeId;

        const delegates = await prisma.delegate.findMany({
            where,
            include: {
                country: true,
                committee: {
                    include: {
                        event: true
                    }
                }
            },
            orderBy: { country: { name: "asc" } },
        });
        return NextResponse.json(delegates);
    } catch (error) {
        console.error("Failed to fetch delegates:", error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const delegate = await prisma.delegate.create({
            data: {
                name: body.name,
                email: body.email || null,
                countryId: body.countryId,
                committeeId: body.committeeId,
            },
            include: { country: true, committee: true },
        });
        return NextResponse.json(delegate);
    } catch (error) {
        console.error("Failed to create delegate:", error);
        return NextResponse.json({ error: "Failed to create delegate" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        const delegate = await prisma.delegate.update({
            where: { id },
            data,
            include: { country: true, committee: true },
        });
        return NextResponse.json(delegate);
    } catch (error) {
        console.error("Failed to update delegate:", error);
        return NextResponse.json({ error: "Failed to update delegate" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await prisma.delegate.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete delegate:", error);
        return NextResponse.json({ error: "Failed to delete delegate" }, { status: 500 });
    }
}
