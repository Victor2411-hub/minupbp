"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { Plus, Link2 } from "lucide-react";
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

    useEffect(() => {
        fetch("/api/events").then(res => res.json()).then(data => Array.isArray(data) ? setEvents(data) : setEvents([]));
        fetch("/api/chairs").then(res => res.json()).then(data => Array.isArray(data) ? setChairs(data) : setChairs([]));
        fetch("/api/sheets").then(res => res.json()).then(data => Array.isArray(data) ? setSheets(data) : setSheets([]));
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            fetch(`/api/committees?eventId=${selectedEventId}`)
                .then(res => res.json())
                .then(data => Array.isArray(data) ? setCommittees(data) : setCommittees([]));
        } else {
            setCommittees([]);
        }
    }, [selectedEventId]);

    const handleCreateCommittee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEventId) return;

        await fetch("/api/committees", {
            method: "POST",
            body: JSON.stringify({ ...newCommittee, eventId: selectedEventId }),
        });

        setNewCommittee({ name: "" });
        const data = await fetch(`/api/committees?eventId=${selectedEventId}`).then(r => r.json());
        if (Array.isArray(data)) setCommittees(data);
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
                        <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                </select>
            </GlassCard>

            {selectedEventId && (
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* 2. Create Committees */}
                    <GlassCard className="p-6">
                        <h2 className="mb-4 text-xl font-bold text-gray-900">2. Crear Comités</h2>
                        <form onSubmit={handleCreateCommittee} className="space-y-4">
                            <GlassInput
                                placeholder="Nombre del comité"
                                value={newCommittee.name}
                                onChange={e => setNewCommittee({ name: e.target.value })}
                                required
                            />
                            <GlassButton type="submit" className="w-full">
                                <Plus className="mr-2 h-4 w-4" /> Crear Comité
                            </GlassButton>
                        </form>

                        <div className="mt-6 space-y-2">
                            <h3 className="font-medium text-gray-700">Comités:</h3>
                            {committees.map(c => (
                                <div key={c.id} className="p-2 bg-white/40 rounded border border-gray-100 text-sm">
                                    {c.name}
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
                                    <option key={c.id} value={c.id}>{c.name}</option>
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
                                    <option key={c.id} value={c.id}>{c.name}</option>
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
