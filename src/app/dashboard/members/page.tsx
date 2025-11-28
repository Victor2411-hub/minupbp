
"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { MOCK_DELEGATES } from "@/lib/data";
import { motion } from "framer-motion";
import { Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";

export default function MembersPage() {
    const [delegates, setDelegates] = useState(MOCK_DELEGATES);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredDelegates = delegates.filter(
        (d) =>
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Miembros</h1>
                <GlassButton className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Agregar Delegado
                </GlassButton>
            </div>

            <GlassCard className="p-4">
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <GlassInput
                        placeholder="Buscar delegados o países..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredDelegates.map((delegate) => (
                        <motion.div
                            key={delegate.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group relative overflow-hidden rounded-xl bg-white/50 border border-gray-100 p-4 transition-all hover:bg-white hover:shadow-md"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-lg font-bold text-white shadow-lg">
                                    {delegate.country.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{delegate.country}</h3>
                                    <p className="text-sm text-gray-500">{delegate.name}</p>
                                </div>
                            </div>
                            <button className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                                <Trash2 className="h-4 w-4 text-red-400 hover:text-red-600" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
}
