
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        const event = await prisma.evento.create({
            data: {
                nombre: 'Test Event',
                fecha: new Date(),
                estado: 'activo',
            },
        });
        console.log('Event created:', event);
    } catch (error) {
        console.error('Error creating event:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
