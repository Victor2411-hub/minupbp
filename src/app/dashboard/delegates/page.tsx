"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { Plus, Trash2, Search, Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { GlassModal } from "@/components/ui/GlassModal";

interface Delegate {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    age: number | null;
    grade: string | null;
    schoolId: number | null;
    country: {
        id: number;
        name: string;
        flagUrl: string | null;
    };
    committee: {
        id: number;
        name: string;
        event: {
            name: string;
        };
    };
    school?: {
        id: number;
        name: string;
    } | null;
}

interface Country {
    id: number;
    name: string;
}

interface Committee {
    id: number;
    name: string;
}

interface School {
    id: number;
    nombre: string;
}

export default function DelegatesPage() {
    const [delegates, setDelegates] = useState<Delegate[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [committees, setCommittees] = useState<Committee[]>([]);
    const [schools, setSchools] = useState<School[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDelegate, setEditingDelegate] = useState<Delegate | null>(null);

    const initialFormState = {
        name: "",
        email: "",
        phone: "",
        age: "",
        grade: "",
        countryId: "",
        committeeId: "",
        schoolId: "",
    };

    const [formData, setFormData] = useState(initialFormState);

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

    const fetchSchools = async () => {
        const res = await fetch("/api/schools");
        const data = await res.json();
        if (Array.isArray(data)) setSchools(data);
    };

    const fetchCommittees = async () => {
        const eventsRes = await fetch("/api/events");
        const events = await eventsRes.json();

        if (Array.isArray(events) && events.length > 0) {
            const allCommittees: Committee[] = [];
            for (const event of events) {
                const res = await fetch(`/api/committees?eventId=${event.id}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    allCommittees.push(...data.map((c: any) => ({ id: c.id, name: `${c.nombre} (${event.nombre})` })));
                }
            }
            setCommittees(allCommittees);
        }
    };

    useEffect(() => {
        fetchDelegates();
        fetchCountries();
        fetchCommittees();
        fetchSchools();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = editingDelegate ? "/api/delegates" : "/api/delegates";
        const method = editingDelegate ? "PATCH" : "POST";
        const body = editingDelegate
            ? { ...formData, id: editingDelegate.id }
            : formData;

        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        setFormData(initialFormState);
        setEditingDelegate(null);
        setIsModalOpen(false);
        fetchDelegates();
    };

    const handleEdit = (delegate: Delegate) => {
        setEditingDelegate(delegate);
        setFormData({
            name: delegate.name,
            email: delegate.email || "",
            phone: delegate.phone || "",
            age: delegate.age?.toString() || "",
            grade: delegate.grade || "",
            countryId: delegate.country.id.toString(),
            committeeId: delegate.committee.id.toString(),
            schoolId: delegate.schoolId?.toString() || "",
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar este delegado?")) return;
        await fetch(`/api/delegates?id=${id}`, { method: "DELETE" });
        fetchDelegates();
    };

    const filteredDelegates = delegates.filter((d) =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.school?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Delegados
                </h1>
                <button
                    onClick={() => {
                        setEditingDelegate(null);
                        setFormData(initialFormState);
                        setIsModalOpen(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    Nuevo Delegado
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <GlassInput
                    placeholder="Buscar delegados por nombre, país o centro..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Delegates List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDelegates.map((delegate) => (
                    <GlassCard key={delegate.id} className="p-4 relative group">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-gray-900">{delegate.name}</h3>
                                    {delegate.country.flagUrl && (
                                        <img
                                            src={delegate.country.flagUrl}
                                            alt={delegate.country.name}
                                            className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
                                        />
                                    )}
                                </div>
                                <p className="text-sm font-medium text-blue-600">{delegate.country.name}</p>

                                <div className="mt-2 space-y-1 text-xs text-gray-500">
                                    <p>{delegate.committee.name}</p>
                                    {delegate.school && (
                                        <p className="flex items-center gap-1">
                                            <span className="font-semibold">Centro:</span> {delegate.school.name}
                                        </p>
                                    )}
                                    {(delegate.grade || delegate.age) && (
                                        <p>
                                            {delegate.grade && <span className="mr-2">{delegate.grade}</span>}
                                            {delegate.age && <span>{delegate.age} años</span>}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(delegate)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(delegate.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Create/Edit Modal */}
            <GlassModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingDelegate ? "Editar Delegado" : "Registrar Nuevo Delegado"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                            <GlassInput
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="Nombre del delegado"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <GlassInput
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="correo@ejemplo.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                            <GlassInput
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="809-555-5555"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                            <GlassInput
                                type="number"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                placeholder="Ej: 16"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Grado</label>
                            <select
                                className="w-full rounded-xl border border-gray-200 bg-white/50 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={formData.grade}
                                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                            >
                                <option value="">-- Seleccionar --</option>
                                <option value="1ro Secundaria">1ro Secundaria</option>
                                <option value="2do Secundaria">2do Secundaria</option>
                                <option value="3ro Secundaria">3ro Secundaria</option>
                                <option value="4to Secundaria">4to Secundaria</option>
                                <option value="5to Secundaria">5to Secundaria</option>
                                <option value="6to Secundaria">6to Secundaria</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Centro Educativo</label>
                            <select
                                className="w-full rounded-xl border border-gray-200 bg-white/50 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={formData.schoolId}
                                onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                            >
                                <option value="">-- Seleccionar Centro --</option>
                                {schools.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">País Representado</label>
                            <select
                                className="w-full rounded-xl border border-gray-200 bg-white/50 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={formData.countryId}
                                onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
                                required
                            >
                                <option value="">-- Seleccionar País --</option>
                                {countries.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Comité Asignado</label>
                            <select
                                className="w-full rounded-xl border border-gray-200 bg-white/50 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={formData.committeeId}
                                onChange={(e) => setFormData({ ...formData, committeeId: e.target.value })}
                                required
                            >
                                <option value="">-- Seleccionar Comité --</option>
                                {committees.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            {editingDelegate ? "Guardar Cambios" : "Crear Delegado"}
                        </button>
                    </div>
                </form>
            </GlassModal>
        </div>
    );
}
