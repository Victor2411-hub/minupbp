import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const countries = await prisma.country.findMany({
            include: {
                _count: {
                    select: { delegates: true }
                }
            },
            orderBy: { name: "asc" },
        });
        return NextResponse.json(countries);
    } catch (error) {
        console.error("Failed to fetch countries:", error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const country = await prisma.country.create({
            data: {
                name: body.name,
                code: body.code,
                flagUrl: body.flagUrl || null,
            },
        });
        return NextResponse.json(country);
    } catch (error) {
        console.error("Failed to create country:", error);
        return NextResponse.json({ error: "Failed to create country" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        const country = await prisma.country.update({
            where: { id },
            data,
        });
        return NextResponse.json(country);
    } catch (error) {
        console.error("Failed to update country:", error);
        return NextResponse.json({ error: "Failed to update country" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await prisma.country.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete country:", error);
        return NextResponse.json({ error: "Failed to delete country" }, { status: 500 });
    }
}
