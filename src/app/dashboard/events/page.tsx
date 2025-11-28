"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { motion } from "framer-motion";
import { Calendar, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface Event {
    id: string;
    name: string;
    date: string;
    status: string;
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [newEventName, setNewEventName] = useState("");
    const [newEventDate, setNewEventDate] = useState("");
    const [loading, setLoading] = useState(true);

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

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEventName || !newEventDate) return;

        try {
            const res = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newEventName, date: newEventDate }),
            });
            if (res.ok) {
                setNewEventName("");
                setNewEventDate("");
                fetchEvents();
            }
        } catch (error) {
            console.error("Failed to create event", error);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Eventos</h1>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Create Event Form */}
                <GlassCard className="lg:col-span-1 p-6 h-fit">
                    <h2 className="mb-4 text-xl font-bold text-gray-900">Crear Nuevo Evento</h2>
                    <form onSubmit={handleCreateEvent} className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm text-gray-700">Nombre del Evento</label>
                            <GlassInput
                                placeholder="e.g. MUN 2025"
                                value={newEventName}
                                onChange={(e) => setNewEventName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm text-gray-700">Fecha</label>
                            <GlassInput
                                type="date"
                                value={newEventDate}
                                onChange={(e) => setNewEventDate(e.target.value)}
                            />
                        </div>
                        <GlassButton type="submit" className="w-full justify-center">
                            <Plus className="mr-2 h-4 w-4" /> Crear Evento
                        </GlassButton>
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
                                <GlassCard className="p-6 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{event.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(event.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${event.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {event.status.toUpperCase()}
                                        </span>
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
