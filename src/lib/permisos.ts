/**
 * Verifica si un usuario tiene un permiso específico
 */
export function tienePermiso(permisos: string[], permiso: string): boolean {
    // Si tiene acceso total, puede hacer todo
    if (permisos.includes('acceso_total')) {
        return true;
    }
    return permisos.includes(permiso);
}

/**
 * Verifica si un usuario puede ver una página específica
 */
export function puedeVerPagina(permisos: string[], ruta: string): boolean {
    const mapaPaginas: Record<string, string> = {
        '/dashboard/events': 'pagina_eventos',
        '/dashboard/setup': 'pagina_configuracion',
        '/dashboard/countries': 'pagina_paises',
        '/dashboard/delegates': 'pagina_delegados',
        '/dashboard/grading': 'pagina_calificaciones',
        '/dashboard/evaluation': 'pagina_evaluacion',
        '/dashboard/chairs': 'pagina_mesas',
    };

    const permisoRequerido = mapaPaginas[ruta];
    if (!permisoRequerido) {
        // Si la ruta no está en el mapa, permitir acceso por defecto
        return true;
    }

    return tienePermiso(permisos, permisoRequerido);
}

/**
 * Verifica si un usuario puede editar un recurso específico
 */
export function puedeEditar(permisos: string[], recurso: string): boolean {
    const mapaEdicion: Record<string, string> = {
        'eventos': 'editar_eventos',
        'comites': 'editar_comites',
        'paises': 'editar_paises',
        'delegados': 'editar_delegados',
        'calificaciones': 'editar_calificaciones',
        'hojas': 'editar_hojas',
    };

    const permisoRequerido = mapaEdicion[recurso];
    if (!permisoRequerido) {
        return false;
    }

    return tienePermiso(permisos, permisoRequerido);
}

/**
 * Verifica si un usuario puede exportar calificaciones
 */
export function puedeExportar(permisos: string[]): boolean {
    return tienePermiso(permisos, 'exportar_calificaciones');
}

/**
 * Obtiene todas las páginas a las que un usuario tiene acceso
 */
export function obtenerPaginasPermitidas(permisos: string[]): string[] {
    if (permisos.includes('acceso_total')) {
        return [
            '/dashboard/events',
            '/dashboard/setup',
            '/dashboard/countries',
            '/dashboard/delegates',
            '/dashboard/grading',
            '/dashboard/evaluation',
            '/dashboard/chairs',
        ];
    }

    const paginas: string[] = [];

    if (permisos.includes('pagina_eventos')) paginas.push('/dashboard/events');
    if (permisos.includes('pagina_configuracion')) paginas.push('/dashboard/setup');
    if (permisos.includes('pagina_paises')) paginas.push('/dashboard/countries');
    if (permisos.includes('pagina_delegados')) paginas.push('/dashboard/delegates');
    if (permisos.includes('pagina_calificaciones')) paginas.push('/dashboard/grading');
    if (permisos.includes('pagina_evaluacion')) paginas.push('/dashboard/evaluation');
    if (permisos.includes('pagina_mesas')) paginas.push('/dashboard/chairs');

    return paginas;
}
