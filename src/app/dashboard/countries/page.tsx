"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { Plus, Trash2, Flag } from "lucide-react";
import { useEffect, useState } from "react";

interface Country {
    id: string;
    name: string;
    code: string;
    flagUrl: string | null;
    _count: {
        delegates: number;
    };
}

export default function CountriesPage() {
    const [countries, setCountries] = useState<Country[]>([]);
    const [newCountry, setNewCountry] = useState({ name: "", code: "", flagUrl: "" });
    const [loading, setLoading] = useState(false);

    const fetchCountries = async () => {
        const res = await fetch("/api/countries");
        const data = await res.json();
        if (Array.isArray(data)) setCountries(data);
    };

    useEffect(() => {
        fetchCountries();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        await fetch("/api/countries", {
            method: "POST",
            body: JSON.stringify(newCountry),
        });

        setNewCountry({ name: "", code: "", flagUrl: "" });
        fetchCountries();
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar este país?")) return;

        await fetch(`/api/countries?id=${id}`, { method: "DELETE" });
        fetchCountries();
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Países</h1>

            {/* Create New Country */}
            <GlassCard className="p-6">
                <h2 className="mb-4 text-xl font-bold text-gray-900">Registrar Nuevo País</h2>
                <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-4">
                    <GlassInput
                        placeholder="Nombre del país"
                        value={newCountry.name}
                        onChange={(e) => setNewCountry({ ...newCountry, name: e.target.value })}
                        required
                    />
                    <GlassInput
                        placeholder="Código ISO (ej: US)"
                        value={newCountry.code}
                        onChange={(e) => setNewCountry({ ...newCountry, code: e.target.value.toUpperCase() })}
                        required
                    />
                    <GlassInput
                        placeholder="URL de la bandera"
                        value={newCountry.flagUrl}
                        onChange={(e) => setNewCountry({ ...newCountry, flagUrl: e.target.value })}
                    />
                    <GlassButton type="submit" disabled={loading} className="bg-blue-600 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Crear
                    </GlassButton>
                </form>
            </GlassCard>

            {/* Countries Grid */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {countries.map((country) => (
                    <GlassCard key={country.id} className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {country.flagUrl ? (
                                    <img
                                        src={country.flagUrl}
                                        alt={country.name}
                                        className="h-8 w-12 rounded object-cover shadow"
                                    />
                                ) : (
                                    <div className="flex h-8 w-12 items-center justify-center rounded bg-gray-100">
                                        <Flag className="h-4 w-4 text-gray-400" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-gray-900">{country.name}</h3>
                                    <p className="text-xs text-gray-600">{country.code}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={async () => {
                                        await fetch(`/api/countries?id=${country.id}`, {
                                            method: "PATCH",
                                            body: JSON.stringify({ active: !(country as any).active }),
                                        });
                                        fetchCountries();
                                    }}
                                    className={`rounded-full p-2 ${(country as any).active ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                                    title={(country as any).active ? "Desactivar" : "Activar"}
                                >
                                    {(country as any).active ? (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleDelete(country.id)}
                                    className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                    title="Eliminar"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                            {country._count.delegates} delegado(s)
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
}
