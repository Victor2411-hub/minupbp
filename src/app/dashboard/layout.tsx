"use client";

import { cn } from "@/lib/utils";
import {
    BarChart3, Calendar, FileEdit, GraduationCap, LayoutDashboard,
    LogOut, Settings, Users, UserCog, Flag, UserCheck, Shield,
    School, ChevronDown, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { obtenerPaginasPermitidas } from "@/lib/permisos";
import AuthProvider from "@/components/providers/AuthProvider";
import { useState } from "react";

type NavItem = {
    label: string;
    href: string;
    icon: any;
    permission?: string;
};

type NavGroup = {
    label: string;
    items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
    {
        label: "Principal",
        items: [
            { label: "Resumen", href: "/dashboard", icon: LayoutDashboard },
        ]
    },
    {
        label: "Académico",
        items: [
            { label: "Países", href: "/dashboard/countries", icon: Flag, permission: "pagina_paises" },
            { label: "Centros Educativos", href: "/dashboard/schools", icon: School, permission: "pagina_centros" },
            { label: "Delegados", href: "/dashboard/delegates", icon: UserCheck, permission: "pagina_delegados" },
        ]
    },
    {
        label: "Evaluación",
        items: [
            { label: "Hojas de Evaluación", href: "/dashboard/evaluation", icon: FileEdit, permission: "pagina_evaluacion" },
            { label: "Calificación", href: "/dashboard/grading", icon: GraduationCap, permission: "pagina_calificaciones" },
        ]
    },
    {
        label: "Configuración",
        items: [
            { label: "Eventos", href: "/dashboard/events", icon: Calendar, permission: "pagina_eventos" },
            { label: "Comités", href: "/dashboard/setup", icon: Settings, permission: "pagina_configuracion" },
            { label: "Mesas Directivas", href: "/dashboard/chairs", icon: UserCog, permission: "pagina_mesas" },
            { label: "Usuarios y Permisos", href: "/dashboard/users", icon: Shield, permission: "pagina_usuarios" },
        ]
    }
];

function SidebarItem({ item, isActive }: { item: NavItem, isActive: boolean }) {
    const Icon = item.icon;
    return (
        <Link
            href={item.href}
            className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm",
                isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
            )}
        >
            <Icon className="h-4 w-4" />
            <span className="font-medium">{item.label}</span>
        </Link>
    );
}

function SidebarGroup({ group, paginasPermitidas, accesoTotal }: { group: NavGroup, paginasPermitidas: string[], accesoTotal: boolean }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(true);

    // Filter items based on permissions
    const visibleItems = group.items.filter(item => {
        if (!item.permission) return true; // Always show if no permission required (e.g. Dashboard)
        return accesoTotal || paginasPermitidas.includes(item.permission);
    });

    if (visibleItems.length === 0) return null;

    return (
        <div className="mb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
            >
                {group.label}
                {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>

            {isOpen && (
                <div className="space-y-1">
                    {visibleItems.map(item => (
                        <SidebarItem
                            key={item.href}
                            item={item}
                            isActive={pathname === item.href}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Cargando...</div>
            </div>
        );
    }

    const permisos = session?.user?.permisos || [];
    const paginasPermitidas = obtenerPaginasPermitidas(permisos);
    const accesoTotal = permisos.includes("acceso_total");

    return (
        <div className="min-h-screen bg-transparent flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-black/5 bg-white/50 backdrop-blur-xl hidden md:block fixed h-full z-10 overflow-y-auto">
                <div className="p-6 sticky top-0 bg-white/50 backdrop-blur-xl z-20">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        MUN Eval
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        {session?.user?.nombre || "Usuario"}
                    </p>
                </div>

                <nav className="px-4 pb-20">
                    {NAV_GROUPS.map((group) => (
                        <SidebarGroup
                            key={group.label}
                            group={group}
                            paginasPermitidas={paginasPermitidas}
                            accesoTotal={accesoTotal}
                        />
                    ))}
                </nav>

                <div className="fixed bottom-0 w-64 border-t border-black/5 bg-white/50 backdrop-blur-xl p-4">
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors w-full text-sm"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                <div className="mx-auto max-w-6xl">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <DashboardContent>{children}</DashboardContent>
        </AuthProvider>
    );
}
