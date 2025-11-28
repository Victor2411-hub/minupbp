// src/app/dashboard/evaluation/page.tsx
"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Save, Trash2, Download, FileText } from "lucide-react";
import { useEffect, useState } from "react";

interface Criterion {
    id: number;
    name: string;
    maxScore: number;
}

interface EvaluationSheet {
    id: number;
    name: string;
    description: string | null;
    criteria: Criterion[];
}

export default function EvaluationPage() {
    const [sheets, setSheets] = useState<EvaluationSheet[]>([]);
    const [sheetName, setSheetName] = useState("");
    const [sheetDescription, setSheetDescription] = useState("");
    const [criteria, setCriteria] = useState<Criterion[]>([
        { id: 1, name: "Public Speaking", maxScore: 10 },
        { id: 2, name: "Diplomacy", maxScore: 10 },
    ]);

    const fetchSheets = async () => {
        const res = await fetch("/api/sheets");
        const data = await res.json();
        if (Array.isArray(data)) setSheets(data);
    };

    useEffect(() => {
        fetchSheets();
        const interval = setInterval(fetchSheets, 3000);
        return () => clearInterval(interval);
    }, []);

    const addCriterion = () => {
        setCriteria([
            ...criteria,
            { id: Date.now(), name: "", maxScore: 10 },
        ]);
    };

    const removeCriterion = (id: number) => {
        setCriteria(criteria.filter((c) => c.id !== id));
    };

    const updateCriterion = (id: number, field: keyof Criterion, value: string | number) => {
        setCriteria(
            criteria.map((c) => (c.id === id ? { ...c, [field]: value } : c))
        );
    };

    const handleSave = async () => {
        if (!sheetName) {
            alert("Por favor ingrese un nombre para la hoja.");
            return;
        }
        try {
            const res = await fetch("/api/sheets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: sheetName,
                    description: sheetDescription,
                    criteria: criteria.map((c) => ({ name: c.name, maxScore: c.maxScore })),
                }),
            });
            if (res.ok) {
                alert("¡Hoja de Evaluación Guardada!");
                setSheetName("");
                setSheetDescription("");
                setCriteria([{ id: 1, name: "Public Speaking", maxScore: 10 }]);
                fetchSheets();
            } else {
                alert("Error al guardar la hoja.");
            }
        } catch (error) {
            console.error("Error saving sheet:", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar esta hoja?")) return;
        await fetch(`/api/sheets?id=${id}`, { method: "DELETE" });
        fetchSheets();
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Evaluación - Hojas Reutilizables</h1>
                <GlassButton onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">
                    <Save className="mr-2 h-4 w-4" /> Guardar Hoja
                </GlassButton>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Create Sheet Form */}
                <div className="space-y-6">
                    <GlassCard className="p-6 space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">Nueva Hoja</h2>
                        <div>
                            <label className="mb-2 block text-sm text-gray-700">Nombre de la Hoja</label>
                            <GlassInput
                                placeholder="ej. Criterios Asamblea General"
                                value={sheetName}
                                onChange={(e) => setSheetName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm text-gray-700">Descripción (opcional)</label>
                            <textarea
                                className="w-full rounded-lg border border-gray-200 bg-white/50 p-3"
                                rows={3}
                                placeholder="Descripción de la hoja..."
                                value={sheetDescription}
                                onChange={(e) => setSheetDescription(e.target.value)}
                            />
                        </div>
                    </GlassCard>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Criterios</h2>
                            <GlassButton onClick={addCriterion} variant="secondary">
                                <Plus className="mr-2 h-4 w-4" /> Agregar
                            </GlassButton>
                        </div>
                        <AnimatePresence mode="popLayout">
                            {criteria.map((criterion) => (
                                <motion.div
                                    key={criterion.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <GlassCard className="flex items-center gap-4 p-4">
                                        <div className="flex-1">
                                            <GlassInput
                                                placeholder="Nombre del criterio"
                                                value={criterion.name}
                                                onChange={(e) => updateCriterion(criterion.id, "name", e.target.value)}
                                            />
                                        </div>
                                        <div className="w-32">
                                            <GlassInput
                                                type="number"
                                                placeholder="Máx"
                                                value={criterion.maxScore}
                                                onChange={(e) =>
                                                    updateCriterion(
                                                        criterion.id,
                                                        "maxScore",
                                                        parseInt(e.target.value)
                                                    )
                                                }
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeCriterion(criterion.id)}
                                            className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Saved Sheets List */}
                <div>
                    <h2 className="mb-4 text-xl font-bold text-gray-900">Hojas Guardadas</h2>
                    <div className="space-y-4">
                        {sheets.map((sheet) => (
                            <GlassCard key={sheet.id} className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{sheet.name}</h3>
                                        {sheet.description && (
                                            <p className="text-sm text-gray-600">{sheet.description}</p>
                                        )}
                                        <div className="mt-2 space-y-1">
                                            {sheet.criteria.map((c) => (
                                                <div key={c.id} className="text-xs text-gray-500">
                                                    • {c.name} (Máx: {c.maxScore})
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-2 flex gap-2">
                                            <motion.a
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                href={`/api/sheets/export?id=${sheet.id}&format=excel`}
                                                className="glass-button rounded-lg px-4 py-2 font-medium transition-colors bg-green-600 text-white inline-flex items-center"
                                                target="_blank"
                                                download
                                            >
                                                <Download className="h-5 w-5 mr-1" /> Excel
                                            </motion.a>
                                            <motion.a
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                href={`/api/sheets/export?id=${sheet.id}&format=pdf`}
                                                className="glass-button rounded-lg px-4 py-2 font-medium transition-colors bg-red-600 text-white inline-flex items-center"
                                                target="_blank"
                                                download
                                            >
                                                <FileText className="h-5 w-5 mr-1" /> PDF
                                            </motion.a>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(sheet.id)}
                                        className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
