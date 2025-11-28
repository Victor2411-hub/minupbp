import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const chairs = await prisma.chair.findMany({
            include: {
                assignments: {
                    include: {
                        committee: {
                            include: {
                                event: true
                            }
                        }
                    }
                }
            },
            orderBy: { name: "asc" },
        });
        return NextResponse.json(chairs);
    } catch (error) {
        console.error("Failed to fetch chairs:", error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const chair = await prisma.chair.create({
            data: {
                name: body.name,
                username: body.username,
                password: body.password, // TODO: Hash in production!
            },
        });
        return NextResponse.json(chair);
    } catch (error) {
        console.error("Failed to create chair:", error);
        return NextResponse.json({ error: "Failed to create chair" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        const chair = await prisma.chair.update({
            where: { id },
            data,
        });
        return NextResponse.json(chair);
    } catch (error) {
        console.error("Failed to update chair:", error);
        return NextResponse.json({ error: "Failed to update chair" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await prisma.chair.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete chair:", error);
        return NextResponse.json({ error: "Failed to delete chair" }, { status: 500 });
    }
}
