const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
    try {
        console.log('🔍 Checking for admin user...');

        const admin = await prisma.usuarioMesa.findUnique({
            where: { usuario: 'admin' },
            include: {
                usuariosPermisos: {
                    include: {
                        permiso: true,
                    },
                },
            },
        });

        if (!admin) {
            console.log('❌ Admin user NOT found in database');
            return;
        }

        console.log('✅ Admin user found:', {
            id: admin.id,
            nombre: admin.nombre,
            usuario: admin.usuario,
            activo: admin.activo,
            permisos: admin.usuariosPermisos.length,
        });

        // Test password
        const passwordValid = await bcrypt.compare('admin123', admin.contrasena);
        console.log('🔑 Password test:', passwordValid ? '✅ VALID' : '❌ INVALID');

        // Show permissions
        console.log('\n📋 Permissions:');
        admin.usuariosPermisos.forEach((up) => {
            console.log(`  - ${up.permiso.clave} (${up.permiso.nombre})`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testLogin();
