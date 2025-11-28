"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { motion } from "framer-motion";
import { Calendar, Plus, Edit2, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Evento {
    id: number;
    nombre: string;
    fecha: string;
    estado: string;
}

export default function EventsPage() {
    const [events, setEvents] = useState<Evento[]>([]);
    const [eventName, setEventName] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [editingEvent, setEditingEvent] = useState<Evento | null>(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch("/api/events");
            const data = await res.json();
            setEvents(data);
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventName || !eventDate) return;

        try {
            if (editingEvent) {
                // Update existing event
                const res = await fetch("/api/events", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: editingEvent.id, name: eventName, date: eventDate }),
                });
                if (res.ok) {
                    resetForm();
                    fetchEvents();
                }
            } else {
                // Create new event
                const res = await fetch("/api/events", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: eventName, date: eventDate }),
                });
                if (res.ok) {
                    resetForm();
                    fetchEvents();
                }
            }
        } catch (error) {
            console.error("Failed to save event", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Estás seguro de que quieres eliminar este evento?")) return;
        try {
            const res = await fetch(`/api/events?id=${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchEvents();
            }
        } catch (error) {
            console.error("Failed to delete event", error);
        }
    };

    const startEdit = (event: Evento) => {
        setEditingEvent(event);
        setEventName(event.nombre);
        setEventDate(new Date(event.fecha).toISOString().split('T')[0]);
    };

    const resetForm = () => {
        setEditingEvent(null);
        setEventName("");
        setEventDate("");
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Eventos</h1>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Create/Edit Event Form */}
                <GlassCard className="lg:col-span-1 p-6 h-fit sticky top-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">
                            {editingEvent ? "Editar Evento" : "Crear Nuevo Evento"}
                        </h2>
                        {editingEvent && (
                            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm text-gray-700">Nombre del Evento</label>
                            <GlassInput
                                placeholder="e.g. MUN 2025"
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm text-gray-700">Fecha</label>
                            <GlassInput
                                type="date"
                                value={eventDate}
                                onChange={(e) => setEventDate(e.target.value)}
                            />
                        </div>
                        <GlassButton type="submit" className="w-full justify-center">
                            {editingEvent ? <Edit2 className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                            {editingEvent ? "Actualizar Evento" : "Crear Evento"}
                        </GlassButton>
                        {editingEvent && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
                            >
                                Cancelar
                            </button>
                        )}
                    </form>
                </GlassCard>

                {/* Events List */}
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        <p className="text-center text-gray-500">Cargando eventos...</p>
                    ) : events.length === 0 ? (
                        <GlassCard className="p-8 text-center text-gray-500">
                            No se encontraron eventos. Crea uno para comenzar.
                        </GlassCard>
                    ) : (
                        events.map((event) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <GlassCard className="p-6 flex items-center justify-between group">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{event.nombre}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(event.fecha).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${event.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {event.estado.toUpperCase()}
                                        </span>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => startEdit(event)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(event.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
