"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { Plus, Link2, Edit2, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function SetupPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [committees, setCommittees] = useState<any[]>([]);
    const [chairs, setChairs] = useState<any[]>([]);
    const [sheets, setSheets] = useState<any[]>([]);

    const [newCommittee, setNewCommittee] = useState({ name: "" });
    const [chairAssignment, setChairAssignment] = useState({ chairId: "", committeeId: "", position: "" });
    const [sheetAssignment, setSheetAssignment] = useState({ sheetId: "", committeeId: "" });

    const [editingCommittee, setEditingCommittee] = useState<any | null>(null);

    useEffect(() => {
        fetch("/api/events").then(res => res.json()).then(data => Array.isArray(data) ? setEvents(data) : setEvents([]));
        fetch("/api/chairs").then(res => res.json()).then(data => Array.isArray(data) ? setChairs(data) : setChairs([]));
        fetch("/api/sheets").then(res => res.json()).then(data => Array.isArray(data) ? setSheets(data) : setSheets([]));
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            fetchCommittees();
        } else {
            setCommittees([]);
        }
    }, [selectedEventId]);

    const fetchCommittees = async () => {
        if (!selectedEventId) return;
        const data = await fetch(`/api/committees?eventId=${selectedEventId}`).then(r => r.json());
        if (Array.isArray(data)) setCommittees(data);
    };

    const handleCreateOrUpdateCommittee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEventId) return;

        if (editingCommittee) {
            await fetch("/api/committees", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: editingCommittee.id, name: newCommittee.name }),
            });
            setEditingCommittee(null);
        } else {
            await fetch("/api/committees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newCommittee, eventId: selectedEventId }),
            });
        }

        setNewCommittee({ name: "" });
        fetchCommittees();
    };

    const handleDeleteCommittee = async (id: number) => {
        if (!confirm("¿Eliminar este comité?")) return;
        await fetch(`/api/committees?id=${id}`, { method: "DELETE" });
        fetchCommittees();
    };

    const startEditCommittee = (committee: any) => {
        setEditingCommittee(committee);
        setNewCommittee({ name: committee.nombre }); // Spanish field
    };

    const cancelEditCommittee = () => {
        setEditingCommittee(null);
        setNewCommittee({ name: "" });
    };

    const handleAssignChair = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch("/api/chair-assignments", {
            method: "POST",
            body: JSON.stringify(chairAssignment),
        });
        alert("Mesa asignada!");
        setChairAssignment({ chairId: "", committeeId: "", position: "" });
    };

    const handleAssignSheet = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch("/api/committee-sheets", {
            method: "POST",
            body: JSON.stringify(sheetAssignment),
        });
        alert("Hoja asignada!");
        setSheetAssignment({ sheetId: "", committeeId: "" });
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Configuración de Evento</h1>

            {/* 1. Select Event */}
            <GlassCard className="p-6">
                <h2 className="mb-4 text-xl font-bold text-gray-900">1. Seleccionar Evento</h2>
                <select
                    className="w-full p-3 rounded-lg border border-gray-200 bg-white/50"
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                >
                    <option value="">-- Elegir Evento --</option>
                    {events.map(e => (
                        <option key={e.id} value={e.id}>{e.nombre}</option> // Spanish field
                    ))}
                </select>
            </GlassCard>

            {selectedEventId && (
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* 2. Create/Edit Committees */}
                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingCommittee ? "2. Editar Comité" : "2. Crear Comités"}
                            </h2>
                            {editingCommittee && (
                                <button onClick={cancelEditCommittee} className="text-gray-500 hover:text-gray-700">
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                        <form onSubmit={handleCreateOrUpdateCommittee} className="space-y-4">
                            <GlassInput
                                placeholder="Nombre del comité"
                                value={newCommittee.name}
                                onChange={e => setNewCommittee({ name: e.target.value })}
                                required
                            />
                            <div className="flex gap-2">
                                <GlassButton type="submit" className="w-full justify-center">
                                    {editingCommittee ? <Edit2 className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                                    {editingCommittee ? "Actualizar" : "Crear"}
                                </GlassButton>
                                {editingCommittee && (
                                    <GlassButton type="button" onClick={cancelEditCommittee} className="bg-gray-200 text-gray-700">
                                        Cancelar
                                    </GlassButton>
                                )}
                            </div>
                        </form>

                        <div className="mt-6 space-y-2">
                            <h3 className="font-medium text-gray-700">Comités:</h3>
                            {committees.map(c => (
                                <div key={c.id} className="p-2 bg-white/40 rounded border border-gray-100 text-sm flex justify-between items-center group">
                                    <span>{c.nombre}</span> {/* Spanish field */}
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEditCommittee(c)}
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                            title="Editar"
                                        >
                                            <Edit2 className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCommittee(c.id)}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* 3. Assign Chairs */}
                    <GlassCard className="p-6">
                        <h2 className="mb-4 text-xl font-bold text-gray-900">3. Asignar Mesas</h2>
                        <form onSubmit={handleAssignChair} className="space-y-4">
                            <select
                                className="w-full p-3 rounded-lg border border-gray-200 bg-white/50"
                                value={chairAssignment.committeeId}
                                onChange={(e) => setChairAssignment({ ...chairAssignment, committeeId: e.target.value })}
                                required
                            >
                                <option value="">-- Comité --</option>
                                {committees.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre}</option> // Spanish field
                                ))}
                            </select>
                            <select
                                className="w-full p-3 rounded-lg border border-gray-200 bg-white/50"
                                value={chairAssignment.chairId}
                                onChange={(e) => setChairAssignment({ ...chairAssignment, chairId: e.target.value })}
                                required
                            >
                                <option value="">-- Mesa --</option>
                                {chairs.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <GlassInput
                                placeholder="Posición (ej: Presidente)"
                                value={chairAssignment.position}
                                onChange={(e) => setChairAssignment({ ...chairAssignment, position: e.target.value })}
                                required
                            />
                            <GlassButton type="submit" className="w-full bg-blue-500/10 text-blue-700">
                                <Link2 className="mr-2 h-4 w-4" /> Asignar
                            </GlassButton>
                        </form>
                    </GlassCard>

                    {/* 4. Assign Sheets */}
                    <GlassCard className="p-6">
                        <h2 className="mb-4 text-xl font-bold text-gray-900">4. Asignar Hojas</h2>
                        <form onSubmit={handleAssignSheet} className="space-y-4">
                            <select
                                className="w-full p-3 rounded-lg border border-gray-200 bg-white/50"
                                value={sheetAssignment.committeeId}
                                onChange={(e) => setSheetAssignment({ ...sheetAssignment, committeeId: e.target.value })}
                                required
                            >
                                <option value="">-- Comité --</option>
                                {committees.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre}</option> // Spanish field
                                ))}
                            </select>
                            <select
                                className="w-full p-3 rounded-lg border border-gray-200 bg-white/50"
                                value={sheetAssignment.sheetId}
                                onChange={(e) => setSheetAssignment({ ...sheetAssignment, sheetId: e.target.value })}
                                required
                            >
                                <option value="">-- Hoja de Evaluación --</option>
                                {sheets.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            <GlassButton type="submit" className="w-full bg-green-500/10 text-green-700">
                                <Link2 className="mr-2 h-4 w-4" /> Asignar
                            </GlassButton>
                        </form>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
