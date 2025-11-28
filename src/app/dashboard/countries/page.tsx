"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { Plus, Trash2, Flag, Edit2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Pais {
    id: number;
    name: string;
    code: string;
    flagUrl: string | null;
    active: boolean;
    _count: {
        delegates: number;
    };
}

export default function CountriesPage() {
    const [countries, setCountries] = useState<Pais[]>([]);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [flagUrl, setFlagUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [editingCountry, setEditingCountry] = useState<Pais | null>(null);

    const fetchCountries = async () => {
        const res = await fetch("/api/countries");
        const data = await res.json();
        if (Array.isArray(data)) setCountries(data);
    };

    useEffect(() => {
        fetchCountries();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingCountry) {
                await fetch("/api/countries", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: editingCountry.id, name, code, flagUrl }),
                });
            } else {
                await fetch("/api/countries", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, code, flagUrl }),
                });
            }
            resetForm();
            fetchCountries();
        } catch (error) {
            console.error("Failed to save country", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar este país?")) return;

        await fetch(`/api/countries?id=${id}`, { method: "DELETE" });
        fetchCountries();
    };

    const startEdit = (country: Pais) => {
        setEditingCountry(country);
        setName(country.name);
        setCode(country.code);
        setFlagUrl(country.flagUrl || "");
    };

    const resetForm = () => {
        setEditingCountry(null);
        setName("");
        setCode("");
        setFlagUrl("");
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Países</h1>

            {/* Create/Edit Country */}
            <GlassCard className="p-6 sticky top-6 z-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        {editingCountry ? "Editar País" : "Registrar Nuevo País"}
                    </h2>
                    {editingCountry && (
                        <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-4 items-end">
                    <GlassInput
                        placeholder="Nombre del país"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <GlassInput
                        placeholder="Código ISO (ej: US)"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        required
                    />
                    <GlassInput
                        placeholder="URL de la bandera"
                        value={flagUrl}
                        onChange={(e) => setFlagUrl(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <GlassButton type="submit" disabled={loading} className="bg-blue-600 text-white flex-1 justify-center">
                            {editingCountry ? <Edit2 className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                            {editingCountry ? "Actualizar" : "Crear"}
                        </GlassButton>
                        {editingCountry && (
                            <GlassButton type="button" onClick={resetForm} className="bg-gray-200 text-gray-700">
                                Cancelar
                            </GlassButton>
                        )}
                    </div>
                </form>
            </GlassCard>

            {/* Countries Grid */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {countries.map((country) => (
                    <GlassCard key={country.id} className="p-4 group relative">
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
                                        await fetch("/api/countries", {
                                            method: "PATCH",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ id: country.id, active: !country.active }),
                                        });
                                        fetchCountries();
                                    }}
                                    className={`rounded-full p-2 ${country.active ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                                    title={country.active ? "Desactivar" : "Activar"}
                                >
                                    {country.active ? (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    )}
                                </button>
                                <button
                                    onClick={() => startEdit(country)}
                                    className="rounded-full p-2 text-blue-600 hover:bg-blue-50"
                                    title="Editar"
                                >
                                    <Edit2 className="h-4 w-4" />
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
