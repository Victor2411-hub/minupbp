// src/app/dashboard/grading/page.tsx
"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { Save, Loader2, CheckCircle2, Download } from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

interface Delegate {
    id: string;
    name: string;
    country: { name: string; code: string; flagUrl: string | null };
}

interface Criterion {
    id: string;
    name: string;
    maxScore: number;
}

export default function GradingPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [committees, setCommittees] = useState<any[]>([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [selectedCommitteeId, setSelectedCommitteeId] = useState("");

    const [delegates, setDelegates] = useState<Delegate[]>([]);
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    const [scores, setScores] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Load events
    useEffect(() => {
        fetch("/api/events")
            .then((r) => r.json())
            .then((data) => setEvents(Array.isArray(data) ? data : []))
            .catch(() => setEvents([]));
    }, []);

    // Load committees when event changes
    useEffect(() => {
        if (selectedEventId) {
            fetch(`/api/committees?eventId=${selectedEventId}`)
                .then((r) => r.json())
                .then((data) => setCommittees(Array.isArray(data) ? data : []))
                .catch(() => setCommittees([]));
        } else {
            setCommittees([]);
        }
    }, [selectedEventId]);

    // Load delegates, criteria, scores when committee changes
    useEffect(() => {
        if (!selectedCommitteeId) return;
        setLoading(true);
        Promise.all([
            fetch(`/api/delegates?committeeId=${selectedCommitteeId}`).then((r) => r.json()),
            fetch(`/api/sheets?committeeId=${selectedCommitteeId}`).then((r) => r.json()),
            fetch(`/api/grading?committeeId=${selectedCommitteeId}`).then((r) => r.json()),
        ])
            .then(([delegatesData, sheetData, gradingData]) => {
                setDelegates(Array.isArray(delegatesData) ? delegatesData : []);
                const crit = sheetData && sheetData.criteria ? sheetData.criteria : [];
                setCriteria(crit);
                const map: Record<string, number> = {};
                if (Array.isArray(gradingData)) {
                    gradingData.forEach((g: any) => {
                        map[`${g.delegateId}-${g.criterionId}`] = g.value;
                    });
                }
                setScores(map);
                setLoading(false);
            })
            .catch((e) => {
                console.error("Failed to load committee data", e);
                setDelegates([]);
                setCriteria([]);
                setScores({});
                setLoading(false);
            });
    }, [selectedCommitteeId]);

    const handleScoreChange = useCallback(async (delegateId: string, criterionId: string, value: string) => {
        const num = parseInt(value) || 0;
        const key = `${delegateId}-${criterionId}`;
        setScores((prev) => ({ ...prev, [key]: num }));
        try {
            await fetch("/api/grading", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ delegateId, criterionId, value: num }),
            });
            setLastSaved(new Date());
        } catch (err) {
            console.error("Failed to save score", err);
        }
    }, []);

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            const promises = Object.entries(scores).map(([key, value]) => {
                const [delegateId, criterionId] = key.split("-");
                return fetch("/api/grading", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ delegateId, criterionId, value }),
                });
            });
            await Promise.all(promises);
            setLastSaved(new Date());
            alert("¡Todas las calificaciones guardadas!");
        } catch (e) {
            alert("Error al guardar");
        }
        setSaving(false);
    };

    const handleExport = (format: "excel" | "pdf") => {
        if (!selectedCommitteeId) return;
        const url = `/api/grading/export?committeeId=${selectedCommitteeId}&format=${format}`;
        // Open in new tab to trigger download
        window.open(url, "_blank");
    };

    const columns = useMemo<ColumnDef<Delegate>[]>(() => {
        if (!criteria.length) return [];
        const base: ColumnDef<Delegate>[] = [
            {
                header: "País",
                accessorFn: (row) => row.country.name,
                cell: (info) => (
                    <div className="flex items-center gap-2">
                        {info.row.original.country.flagUrl && (
                            <img src={info.row.original.country.flagUrl} alt="" className="h-4 w-6 rounded object-cover" />
                        )}
                        <span className="font-bold">{info.getValue() as string}</span>
                    </div>
                ),
            },
            { header: "Delegado", accessorKey: "name" },
        ];
        const critCols = criteria.map((c) => ({
            header: `${c.name} (${c.maxScore})`,
            id: c.id,
            cell: ({ row }) => {
                const delegateId = row.original.id;
                const val = scores[`${delegateId}-${c.id}`] ?? "";
                return (
                    <input
                        type="number"
                        min="0"
                        max={c.maxScore}
                        className="w-20 rounded border border-gray-200 bg-white/50 p-1 text-center focus:border-blue-500 focus:outline-none"
                        value={val}
                        onChange={(e) => handleScoreChange(delegateId, c.id, e.target.value)}
                    />
                );
            },
        }));
        const totalCol: ColumnDef<Delegate> = {
            header: "Total",
            id: "total",
            cell: ({ row }) => {
                const delegateId = row.original.id;
                const total = criteria.reduce((acc, c) => acc + (scores[`${delegateId}-${c.id}`] ?? 0), 0);
                return <span className="font-bold text-blue-600">{total}</span>;
            },
        };
        return [...base, ...critCols, totalCol];
    }, [criteria, scores, handleScoreChange]);

    const table = useReactTable({ data: delegates, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Panel de Calificaciones</h1>
                    {lastSaved && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" /> Última actualización: {lastSaved.toLocaleTimeString()}
                        </p>
                    )}
                </div>
                <div className="flex gap-4 items-center">
                    <GlassButton onClick={handleSaveAll} disabled={saving} className="bg-green-600 text-white">
                        <Save className="mr-2 h-4 w-4" /> Guardar Todo
                    </GlassButton>
                    <GlassButton onClick={() => handleExport("excel")} className="bg-blue-600 text-white ml-2">
                        <Download className="mr-2 h-4 w-4" /> Excel
                    </GlassButton>
                    <GlassButton onClick={() => handleExport("pdf")} className="bg-red-600 text-white ml-2">
                        <Download className="mr-2 h-4 w-4" /> PDF
                    </GlassButton>
                    <select
                        className="rounded-lg border border-gray-200 bg-white/50 p-2"
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                    >
                        <option value="">Evento</option>
                        {events.map((e) => (
                            <option key={e.id} value={e.id}>
                                {e.name}
                            </option>
                        ))}
                    </select>
                    <select
                        className="rounded-lg border border-gray-200 bg-white/50 p-2"
                        value={selectedCommitteeId}
                        onChange={(e) => setSelectedCommitteeId(e.target.value)}
                        disabled={!selectedEventId}
                    >
                        <option value="">Comité</option>
                        {committees.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedCommitteeId && (
                <GlassCard className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                                {table.getHeaderGroups().map((hg) => (
                                    <tr key={hg.id}>
                                        {hg.headers.map((h) => (
                                            <th key={h.id} className="px-6 py-3">
                                                {flexRender(h.column.columnDef.header, h.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={columns.length} className="p-8 text-center">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-500" />
                                        </td>
                                    </tr>
                                ) : delegates.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length} className="p-8 text-center">
                                            No hay delegados en este comité.
                                        </td>
                                    </tr>
                                ) : (
                                    table.getRowModel().rows.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50/50">
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className="px-6 py-4">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            )}
        </div>
    );
}
