const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Starting permission debug script...');

    try {
        // 1. Get the first user (likely admin)
        const user = await prisma.usuarioMesa.findFirst();
        if (!user) {
            console.error('❌ No users found');
            return;
        }
        console.log(`👤 User found: ${user.usuario} (ID: ${user.id})`);

        // 2. Get a permission
        const permission = await prisma.permiso.findFirst();
        if (!permission) {
            console.error('❌ No permissions found');
            return;
        }
        console.log(`🔑 Permission found: ${permission.clave} (ID: ${permission.id})`);

        // 3. Simulate the transaction logic
        console.log('🔄 Attempting transaction...');

        await prisma.$transaction(async (tx) => {
            // Remove existing
            console.log('   - Deleting existing permissions...');
            await tx.usuarioPermiso.deleteMany({
                where: { usuarioMesaId: user.id },
            });

            // Add new
            console.log('   - Creating new permission link...');
            await tx.usuarioPermiso.createMany({
                data: [{
                    usuarioMesaId: user.id,
                    permisoId: permission.id,
                }],
            });
        });

        console.log('✅ Transaction successful!');

    } catch (error) {
        console.error('❌ Transaction failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
