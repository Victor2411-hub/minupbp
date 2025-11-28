"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { Plus, Trash2, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface Delegate {
    id: string;
    name: string;
    email: string | null;
    country: {
        id: string;
        name: string;
        flagUrl: string | null;
    };
    committee: {
        id: string;
        name: string;
        event: {
            name: string;
        };
    };
}

interface Country {
    id: string;
    name: string;
}

interface Committee {
    id: string;
    name: string;
}

export default function DelegatesPage() {
    const [delegates, setDelegates] = useState<Delegate[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [committees, setCommittees] = useState<Committee[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [newDelegate, setNewDelegate] = useState({
        name: "",
        email: "",
        countryId: "",
        committeeId: "",
    });

    const fetchDelegates = async () => {
        const res = await fetch("/api/delegates");
        const data = await res.json();
        if (Array.isArray(data)) setDelegates(data);
    };

    const fetchCountries = async () => {
        const res = await fetch("/api/countries");
        const data = await res.json();
        if (Array.isArray(data)) setCountries(data);
    };

    const fetchCommittees = async () => {
        // Fetch all events first
        const eventsRes = await fetch("/api/events");
        const events = await eventsRes.json();

        if (Array.isArray(events) && events.length > 0) {
            // Fetch committees for all events
            const allCommittees: Committee[] = [];
            for (const event of events) {
                const res = await fetch(`/api/committees?eventId=${event.id}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    allCommittees.push(...data.map((c: any) => ({ id: c.id, name: `${c.name} (${event.name})` })));
                }
            }
            setCommittees(allCommittees);
        }
    };

    useEffect(() => {
        fetchDelegates();
        fetchCountries();
        fetchCommittees();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        await fetch("/api/delegates", {
            method: "POST",
            body: JSON.stringify(newDelegate),
        });

        setNewDelegate({ name: "", email: "", countryId: "", committeeId: "" });
        fetchDelegates();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar este delegado?")) return;
        await fetch(`/api/delegates?id=${id}`, { method: "DELETE" });
        fetchDelegates();
    };

    const filteredDelegates = delegates.filter((d) =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.country.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Delegados</h1>

            {/* Create New Delegate */}
            <GlassCard className="p-6">
                <h2 className="mb-4 text-xl font-bold text-gray-900">Registrar Nuevo Delegado</h2>
                <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-5">
                    <GlassInput
                        placeholder="Nombre del delegado"
                        value={newDelegate.name}
                        onChange={(e) => setNewDelegate({ ...newDelegate, name: e.target.value })}
                        required
                    />
                    <GlassInput
                        type="email"
                        placeholder="Email (opcional)"
                        value={newDelegate.email}
                        onChange={(e) => setNewDelegate({ ...newDelegate, email: e.target.value })}
                    />
                    <select
                        className="w-full rounded-lg border border-gray-200 bg-white/50 p-3"
                        value={newDelegate.countryId}
                        onChange={(e) => setNewDelegate({ ...newDelegate, countryId: e.target.value })}
                        required
                    >
                        <option value="">-- Seleccionar País --</option>
                        {countries.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <select
                        className="w-full rounded-lg border border-gray-200 bg-white/50 p-3"
                        value={newDelegate.committeeId}
                        onChange={(e) => setNewDelegate({ ...newDelegate, committeeId: e.target.value })}
                        required
                    >
                        <option value="">-- Seleccionar Comité --</option>
                        {committees.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <GlassButton type="submit" className="bg-blue-600 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Crear
                    </GlassButton>
                </form>
            </GlassCard>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <GlassInput
                    placeholder="Buscar delegados..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Delegates List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDelegates.map((delegate) => (
                    <GlassCard key={delegate.id} className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900">{delegate.name}</h3>
                                <p className="text-sm text-gray-600">{delegate.country.name}</p>
                                {delegate.email && (
                                    <p className="text-xs text-gray-500">{delegate.email}</p>
                                )}
                                <div className="mt-2 text-xs text-gray-500">
                                    {delegate.committee.name} - {delegate.committee.event.name}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={async () => {
                                        await fetch(`/api/delegates?id=${delegate.id}`, {
                                            method: "PATCH",
                                            body: JSON.stringify({ active: !(delegate as any).active }),
                                        });
                                        fetchDelegates();
                                    }}
                                    className={`rounded-full p-2 ${(delegate as any).active ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                                    title={(delegate as any).active ? "Desactivar" : "Activar"}
                                >
                                    {(delegate as any).active ? (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleDelete(delegate.id)}
                                    className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                    title="Eliminar"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
}
