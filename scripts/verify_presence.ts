
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting presence verification...");

    // 1. Get a valid delegate and criterion
    const delegate = await prisma.delegado.findFirst();
    const criterion = await prisma.criterio.findFirst();

    if (!delegate || !criterion) {
        console.error("No delegate or criterion found to test with.");
        process.exit(1);
    }

    console.log(`Testing with Delegate ID: ${delegate.id}, Criterion ID: ${criterion.id}`);

    // 2. Insert fake presence
    const fakeUserId = "fake-user-123";
    console.log(`Upserting presence for User: ${fakeUserId}...`);

    // @ts-ignore
    await prisma.gradingPresence.upsert({
        where: {
            delegadoId_criterioId: {
                delegadoId: delegate.id,
                criterioId: criterion.id,
            },
        },
        update: {
            userId: fakeUserId,
            updatedAt: new Date(),
        },
        create: {
            delegadoId: delegate.id,
            criterioId: criterion.id,
            userId: fakeUserId,
        },
    });

    // 3. Verify it exists and is recent
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    console.log("Querying for active presence...");

    // @ts-ignore
    const activePresence = await prisma.gradingPresence.findMany({
        where: {
            delegadoId: delegate.id,
            criterioId: criterion.id,
            updatedAt: { gte: fiveSecondsAgo }
        }
    });

    if (activePresence.length > 0 && activePresence[0].userId === fakeUserId) {
        console.log("SUCCESS: Active presence found!");
        console.log(activePresence);
    } else {
        console.error("FAILURE: Active presence NOT found or incorrect.");
        console.log(activePresence);
    }

    // 4. Cleanup
    console.log("Cleaning up...");
    // @ts-ignore
    await prisma.gradingPresence.delete({
        where: {
            delegadoId_criterioId: {
                delegadoId: delegate.id,
                criterioId: criterion.id,
            },
        }
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
