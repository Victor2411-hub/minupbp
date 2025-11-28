import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const events = await prisma.event.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(events);
    } catch (error) {
        console.error("Failed to fetch events:", error);
        return NextResponse.json([], { status: 500 }); // Return empty array on error
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const event = await prisma.event.create({
            data: {
                name: body.name,
                date: new Date(body.date),
                status: "active",
            },
        });
        return NextResponse.json(event);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}
