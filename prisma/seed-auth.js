const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const permisos = [
    // Permisos de Página
    { clave: 'pagina_eventos', nombre: 'Acceso a Eventos', descripcion: 'Ver página de eventos', tipo: 'PAGINA' },
    { clave: 'pagina_configuracion', nombre: 'Acceso a Configuración', descripcion: 'Ver página de configuración', tipo: 'PAGINA' },
    { clave: 'pagina_paises', nombre: 'Acceso a Países', descripcion: 'Ver página de países', tipo: 'PAGINA' },
    { clave: 'pagina_delegados', nombre: 'Acceso a Delegados', descripcion: 'Ver página de delegados', tipo: 'PAGINA' },
    { clave: 'pagina_calificaciones', nombre: 'Acceso a Calificaciones', descripcion: 'Ver página de calificaciones', tipo: 'PAGINA' },
    { clave: 'pagina_evaluacion', nombre: 'Acceso a Evaluación', descripcion: 'Ver página de hojas de evaluación', tipo: 'PAGINA' },
    { clave: 'pagina_mesas', nombre: 'Acceso a Mesas', descripcion: 'Ver página de mesas directivas', tipo: 'PAGINA' },
    { clave: 'pagina_usuarios', nombre: 'Gestión de Usuarios', descripcion: 'Ver página de gestión de usuarios y permisos', tipo: 'PAGINA' },
    { clave: 'pagina_centros', nombre: 'Ver Centros Educativos', descripcion: 'Ver página de centros educativos', tipo: 'PAGINA' },

    // Permisos de Acción
    { clave: 'editar_eventos', nombre: 'Editar Eventos', descripcion: 'Crear, editar y eliminar eventos', tipo: 'ACCION' },
    { clave: 'editar_comites', nombre: 'Editar Comités', descripcion: 'Crear, editar y eliminar comités', tipo: 'ACCION' },
    { clave: 'editar_paises', nombre: 'Editar Países', descripcion: 'Crear, editar y eliminar países', tipo: 'ACCION' },
    { clave: 'editar_delegados', nombre: 'Editar Delegados', descripcion: 'Crear, editar y eliminar delegados', tipo: 'ACCION' },
    { clave: 'editar_calificaciones', nombre: 'Editar Calificaciones', descripcion: 'Publicar y modificar calificaciones', tipo: 'ACCION' },
    { clave: 'editar_hojas', nombre: 'Editar Hojas', descripcion: 'Crear, editar y eliminar hojas de evaluación', tipo: 'ACCION' },
    { clave: 'editar_centros', nombre: 'Editar Centros Educativos', descripcion: 'Crear, editar y eliminar centros educativos', tipo: 'ACCION' },
    { clave: 'exportar_calificaciones', nombre: 'Exportar Calificaciones', descripcion: 'Exportar calificaciones a Excel/PDF', tipo: 'ACCION' },
    { clave: 'acceso_total', nombre: 'Acceso Total', descripcion: 'Acceso completo a todas las funciones', tipo: 'ACCION' },
];

async function main() {
    console.log('🌱 Iniciando seed de permisos...');

    // Crear permisos
    for (const permiso of permisos) {
        await prisma.permiso.upsert({
            where: { clave: permiso.clave },
            update: {},
            create: permiso,
        });
    }

    console.log(`✅ ${permisos.length} permisos creados`);

    // Crear usuario admin
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.usuarioMesa.upsert({
        where: { usuario: 'admin' },
        update: {},
        create: {
            nombre: 'Administrador',
            usuario: 'admin',
            contrasena: hashedPassword,
            activo: true,
        },
    });

    console.log('✅ Usuario admin creado');

    // Asignar permiso de acceso total al admin
    const permisoAccesoTotal = await prisma.permiso.findUnique({
        where: { clave: 'acceso_total' },
    });

    if (permisoAccesoTotal) {
        await prisma.usuarioPermiso.upsert({
            where: {
                usuarioMesaId_permisoId: {
                    usuarioMesaId: admin.id,
                    permisoId: permisoAccesoTotal.id,
                },
            },
            update: {},
            create: {
                usuarioMesaId: admin.id,
                permisoId: permisoAccesoTotal.id,
            },
        });
        console.log('✅ Permiso de acceso total asignado al admin');
    }

    console.log('\n🎉 Seed completado exitosamente');
    console.log('\n📝 Credenciales del administrador:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123');
    console.log('\n⚠️  IMPORTANTE: Cambia esta contraseña en producción\n');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
