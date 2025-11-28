"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { motion } from "framer-motion";
import { Users, Calendar, FileEdit, GraduationCap, Settings, Flag, UserCog, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        eventos: 0,
        comites: 0,
        delegados: 0,
        mesas: 0,
        paises: 0,
        hojas: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Cargar estadísticas reales desde la API
        Promise.all([
            fetch("/api/events").then(r => r.json()),
            fetch("/api/committees").then(r => r.json()),
            fetch("/api/delegates").then(r => r.json()),
            fetch("/api/chairs").then(r => r.json()),
            fetch("/api/countries").then(r => r.json()),
            fetch("/api/sheets").then(r => r.json()),
        ]).then(([eventos, comites, delegados, mesas, paises, hojas]) => {
            setStats({
                eventos: Array.isArray(eventos) ? eventos.length : 0,
                comites: Array.isArray(comites) ? comites.length : 0,
                delegados: Array.isArray(delegados) ? delegados.length : 0,
                mesas: Array.isArray(mesas) ? mesas.length : 0,
                paises: Array.isArray(paises) ? paises.length : 0,
                hojas: Array.isArray(hojas) ? hojas.length : 0,
            });
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const quickLinks = [
        {
            title: "Eventos",
            description: "Administrar eventos MUN",
            icon: Calendar,
            href: "/dashboard/events",
            color: "from-blue-500 to-cyan-500"
        },
        {
            title: "Configuración",
            description: "Configurar comités y asignaciones",
            icon: Settings,
            href: "/dashboard/setup",
            color: "from-purple-500 to-pink-500"
        },
        {
            title: "Delegados",
            description: "Gestionar participantes",
            icon: Users,
            href: "/dashboard/delegates",
            color: "from-green-500 to-emerald-500"
        },
        {
            title: "Calificaciones",
            description: "Panel de evaluación",
            icon: GraduationCap,
            href: "/dashboard/grading",
            color: "from-orange-500 to-red-500"
        },
    ];

    const statCards = [
        { label: "Eventos", value: stats.eventos, icon: Calendar, color: "bg-blue-500/10 text-blue-600" },
        { label: "Comités", value: stats.comites, icon: Settings, color: "bg-purple-500/10 text-purple-600" },
        { label: "Delegados", value: stats.delegados, icon: Users, color: "bg-green-500/10 text-green-600" },
        { label: "Mesas", value: stats.mesas, icon: UserCog, color: "bg-orange-500/10 text-orange-600" },
        { label: "Países", value: stats.paises, icon: Flag, color: "bg-pink-500/10 text-pink-600" },
        { label: "Hojas de Evaluación", value: stats.hojas, icon: FileEdit, color: "bg-cyan-500/10 text-cyan-600" },
    ];

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold text-gray-900">Resumen General</h1>
                <p className="text-gray-500">Visión general de tu plataforma MUN</p>
            </motion.div>

            {/* Estadísticas */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <GlassCard className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className={`rounded-full p-3 ${stat.color}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">{stat.label}</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {loading ? "..." : stat.value}
                                        </p>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    );
                })}
            </div>

            {/* Accesos Rápidos */}
            <div>
                <h2 className="mb-4 text-xl font-bold text-gray-900">Accesos Rápidos</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {quickLinks.map((link, index) => {
                        const Icon = link.icon;
                        return (
                            <motion.div
                                key={link.title}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 + 0.6 }}
                            >
                                <Link href={link.href}>
                                    <GlassCard className="group cursor-pointer p-6 transition-all hover:scale-105 hover:shadow-xl">
                                        <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br ${link.color} p-3`}>
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="mb-2 font-bold text-gray-900">{link.title}</h3>
                                        <p className="mb-4 text-sm text-gray-500">{link.description}</p>
                                        <div className="flex items-center text-sm font-medium text-blue-600 transition-all group-hover:gap-2">
                                            Ir <ArrowRight className="h-4 w-4 transition-all group-hover:translate-x-1" />
                                        </div>
                                    </GlassCard>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Guía de inicio */}
            <GlassCard className="p-6">
                <h2 className="mb-4 text-xl font-bold text-gray-900">Guía de Inicio Rápido</h2>
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                            1
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Crear un Evento</h3>
                            <p className="text-sm text-gray-600">Comienza creando un evento MUN en la sección de Eventos</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-sm font-bold text-white">
                            2
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Configurar Comités</h3>
                            <p className="text-sm text-gray-600">Usa la sección de Configuración para crear comités y asignar mesas</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                            3
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Registrar Delegados</h3>
                            <p className="text-sm text-gray-600">Agrega los participantes en la sección de Delegados</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                            4
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Calificar</h3>
                            <p className="text-sm text-gray-600">Usa el Panel de Calificaciones para evaluar a los delegados</p>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
