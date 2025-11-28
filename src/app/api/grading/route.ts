import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { delegateId, criterionId, value } = body;

        const score = await prisma.score.upsert({
            where: {
                delegateId_criterionId: {
                    delegateId,
                    criterionId,
                },
            },
            update: { value: parseInt(value) },
            create: {
                delegateId,
                criterionId,
                value: parseInt(value),
            },
        });

        return NextResponse.json(score);
    } catch (error) {
        return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const committeeId = searchParams.get("committeeId");
    const delegateId = searchParams.get("delegateId");

    try {
        if (committeeId) {
            // Get all scores for all delegates in this committee
            const scores = await prisma.score.findMany({
                where: {
                    delegate: {
                        committeeId: committeeId,
                    },
                },
                include: {
                    delegate: true,
                    criterion: true,
                },
            });
            return NextResponse.json(scores);
        } else if (delegateId) {
            // Get scores for a specific delegate
            const scores = await prisma.score.findMany({
                where: { delegateId },
            });
            return NextResponse.json(scores);
        } else {
            return NextResponse.json([]);
        }
    } catch (error) {
        console.error("Failed to fetch scores:", error);
        return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 });
    }
}
