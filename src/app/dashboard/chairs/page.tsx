"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { Plus, Trash2, UserPlus, Edit } from "lucide-react";
import { useEffect, useState } from "react";

interface Chair {
    id: string;
    name: string;
    username: string;
    assignments: Assignment[];
}

interface Assignment {
    id: string;
    position: string;
    committee: {
        id: string;
        name: string;
        event: {
            name: string;
        };
    };
}

export default function ChairsPage() {
    const [chairs, setChairs] = useState<Chair[]>([]);
    const [newChair, setNewChair] = useState({ name: "", username: "", password: "" });
    const [loading, setLoading] = useState(false);

    const fetchChairs = async () => {
        const res = await fetch("/api/chairs");
        const data = await res.json();
        if (Array.isArray(data)) setChairs(data);
    };

    useEffect(() => {
        fetchChairs();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        await fetch("/api/chairs", {
            method: "POST",
            body: JSON.stringify(newChair),
        });

        setNewChair({ name: "", username: "", password: "" });
        fetchChairs();
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar esta mesa directiva?")) return;

        await fetch(`/api/chairs?id=${id}`, { method: "DELETE" });
        fetchChairs();
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Mesas Directivas</h1>

            {/* Create New Chair */}
            <GlassCard className="p-6">
                <h2 className="mb-4 text-xl font-bold text-gray-900">Registrar Nueva Mesa</h2>
                <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-4">
                    <GlassInput
                        placeholder="Nombre completo"
                        value={newChair.name}
                        onChange={(e) => setNewChair({ ...newChair, name: e.target.value })}
                        required
                    />
                    <GlassInput
                        placeholder="Usuario"
                        value={newChair.username}
                        onChange={(e) => setNewChair({ ...newChair, username: e.target.value })}
                        required
                    />
                    <GlassInput
                        type="password"
                        placeholder="Contraseña"
                        value={newChair.password}
                        onChange={(e) => setNewChair({ ...newChair, password: e.target.value })}
                        required
                    />
                    <GlassButton type="submit" disabled={loading} className="bg-blue-600 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Crear
                    </GlassButton>
                </form>
            </GlassCard>

            {/* Chairs List */}
            <div className="grid gap-4 md:grid-cols-2">
                {chairs.map((chair) => (
                    <GlassCard key={chair.id} className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900">{chair.name}</h3>
                                <p className="text-sm text-gray-600">@{chair.username}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={async () => {
                                        await fetch(`/api/chairs?id=${chair.id}`, {
                                            method: "PATCH",
                                            body: JSON.stringify({ active: !(chair as any).active }),
                                        });
                                        fetchChairs();
                                    }}
                                    className={`rounded-full p-2 ${(chair as any).active ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                                    title={(chair as any).active ? "Desactivar" : "Activar"}
                                >
                                    {(chair as any).active ? (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleDelete(chair.id)}
                                    className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                    title="Eliminar"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            <p className="text-xs font-medium uppercase text-gray-500">Asignaciones:</p>
                            {chair.assignments.length === 0 ? (
                                <p className="text-sm text-gray-400">Sin asignaciones</p>
                            ) : (
                                chair.assignments.map((assignment) => (
                                    <div
                                        key={assignment.id}
                                        className="rounded-lg border border-gray-100 bg-white/50 p-3 text-sm"
                                    >
                                        <div className="font-medium text-gray-900">
                                            {assignment.position}
                                        </div>
                                        <div className="text-gray-600">
                                            {assignment.committee.name} - {assignment.committee.event.name}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
}
