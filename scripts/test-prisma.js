const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking Prisma Client...");
    if (prisma.participante) {
        console.log("✅ prisma.participante exists!");
    } else {
        console.log("❌ prisma.participante is UNDEFINED");
    }

    if (prisma.delegado) {
        console.log("✅ prisma.delegado exists!");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
