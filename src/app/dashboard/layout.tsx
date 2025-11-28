"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { BarChart3, Calendar, FileEdit, GraduationCap, LayoutDashboard, LogOut, Settings, Users, UserCog, Flag, UserCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
    { label: "Resumen", href: "/dashboard", icon: LayoutDashboard },
    { label: "Eventos", href: "/dashboard/events", icon: Calendar },
    { label: "Configuración", href: "/dashboard/setup", icon: Settings },
    { label: "Mesas", href: "/dashboard/chairs", icon: UserCog },
    { label: "Países", href: "/dashboard/countries", icon: Flag },
    { label: "Delegados", href: "/dashboard/delegates", icon: UserCheck },
    { label: "Evaluación", href: "/dashboard/evaluation", icon: FileEdit },
    { label: "Panel de Calificación", href: "/dashboard/grading", icon: GraduationCap },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-transparent flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-black/5 bg-white/50 backdrop-blur-xl hidden md:block fixed h-full z-10">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        MUN Eval
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">Chair Dashboard</p>
                </div>

                <nav className="px-4 space-y-2 mt-4">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                        : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-8 left-0 w-full px-4">
                    <Link
                        href="/login"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Logout</span>
                    </Link>
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
