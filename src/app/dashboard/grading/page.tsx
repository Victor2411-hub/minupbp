"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import ScoreInput from "./ScoreInput";
import { Download } from "lucide-react";

interface Delegate {
    id: number;
    name: string;
    participations: number;
    comments: string | null;
    country: {
        name: string;
        flagUrl: string | null;
    };
}

interface Criterion {
    id: number;
    name: string;
    maxScore: number;
}

export default function GradingPage() {
    const { data: session } = useSession(); // Get session for user ID
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEventId, setSelectedEventId] = useState("");

    const [committees, setCommittees] = useState<any[]>([]);
    const [selectedCommitteeId, setSelectedCommitteeId] = useState("");

    const [delegates, setDelegates] = useState<Delegate[]>([]);
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    const [scores, setScores] = useState<Record<string, number>>({});
    const [presence, setPresence] = useState<Record<string, { userId: string }>>({}); // Presence map
    const [loading, setLoading] = useState(false);
    const [focusedCell, setFocusedCell] = useState<{ d: number, c: number } | null>(null); // Track focused cell

    // Debounce state
    const [pendingSaves, setPendingSaves] = useState<Record<string, boolean>>({});
    const pendingSavesRef = useRef<Record<string, boolean>>({}); // Ref to access latest pending state in interval
    const saveTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Sync ref with state
    useEffect(() => {
        pendingSavesRef.current = pendingSaves;
    }, [pendingSaves]);

    // 1. Load Events
    useEffect(() => {
        fetch("/api/events")
            .then((r) => r.json())
            .then((data) => setEvents(Array.isArray(data) ? data : []))
            .catch(() => setEvents([]));
    }, []);

    // 2. Load Committees when Event selected
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

    // 3. Load Grading Data when Committee selected
    useEffect(() => {
        if (!selectedCommitteeId) return;

        let isMounted = true;

        const fetchData = async (isInitial = false) => {
            if (isInitial) setLoading(true);
            try {
                const [delegatesData, sheetData, gradingResponse] = await Promise.all([
                    fetch(`/api/delegates?committeeId=${selectedCommitteeId}`).then((r) => r.json()),
                    fetch(`/api/sheets?committeeId=${selectedCommitteeId}`).then((r) => r.json()),
                    fetch(`/api/grading?committeeId=${selectedCommitteeId}`).then((r) => r.json()),
                ]);

                if (!isMounted) return;

                // Only update delegates if changed to prevent table re-render/focus loss
                if (JSON.stringify(delegatesData) !== JSON.stringify(delegates)) {
                    setDelegates(Array.isArray(delegatesData) ? delegatesData : []);
                }

                // Handle sheet data structure
                const crit = sheetData && sheetData.criteria ? sheetData.criteria : [];
                // Only update criteria if changed
                if (JSON.stringify(crit) !== JSON.stringify(criteria)) {
                    setCriteria(crit);
                }

                // Handle grading response (now object with scores and presence)
                const gradingData = gradingResponse.scores || (Array.isArray(gradingResponse) ? gradingResponse : []);
                const presenceData = gradingResponse.presence || [];

                // Map scores: "delegateId-criterionId" -> value
                const serverScores: Record<string, number> = {};
                if (Array.isArray(gradingData)) {
                    gradingData.forEach((g: any) => {
                        serverScores[`${g.delegateId}-${g.criterionId}`] = g.value;
                    });
                }

                // Map presence: "delegateId-criterionId" -> { userId }
                const presenceMap: Record<string, { userId: string }> = {};
                if (Array.isArray(presenceData)) {
                    presenceData.forEach((p: any) => {
                        presenceMap[`${p.delegateId}-${p.criterionId}`] = { userId: p.userId };
                    });
                }
                setPresence(presenceMap);

                // Merge with local state, preserving pending saves
                setScores((prevScores) => {
                    const newScores = { ...serverScores };
                    // If we have pending saves, keep the local (optimistic) value
                    const currentPending = pendingSavesRef.current;
                    Object.keys(currentPending).forEach((key) => {
                        if (currentPending[key] && prevScores[key] !== undefined) {
                            newScores[key] = prevScores[key];
                        }
                    });
                    return newScores;
                });

                if (isInitial) setLoading(false);
            } catch (e) {
                console.error("Failed to load committee data", e);
                if (isMounted && isInitial) {
                    setDelegates([]);
                    setCriteria([]);
                    setScores({});
                    setLoading(false);
                }
            }
        };

        fetchData(true);

        const interval = setInterval(() => fetchData(false), 3000); // Reverted to 3 seconds

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [selectedCommitteeId]); // Only re-run if committee changes

    const handleScoreChange = useCallback(async (delegateId: number, criterionId: number, value: string) => {
        const num = parseInt(value) || 0;
        const key = `${delegateId}-${criterionId}`;

        // Optimistic update
        setScores((prev) => ({ ...prev, [key]: num }));

        // Clear existing timeout
        if (saveTimeouts.current[key]) {
            clearTimeout(saveTimeouts.current[key]);
        }

        // Set pending state
        setPendingSaves((prev) => ({ ...prev, [key]: true }));

        // Debounce save (1 second)
        saveTimeouts.current[key] = setTimeout(async () => {
            try {
                await fetch("/api/grading", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ delegateId, criterionId, value: num }),
                });
                setLastSaved(new Date());
            } catch (err) {
                console.error("Failed to save score", err);
            } finally {
                setPendingSaves((prev) => {
                    const next = { ...prev };
                    delete next[key];
                    return next;
                });
            }
        }, 1000);
    }, []);

    const handleFocus = useCallback(async (delegateId: number, criterionId: number) => {
        if (!session?.user?.id) return;
        try {
            await fetch("/api/grading/presence", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    delegateId,
                    criterionId,
                    userId: session.user.id
                }),
            });
        } catch (e) {
            console.error("Failed to send heartbeat", e);
        }
    }, [session?.user?.id]);

    const handleUpdateDelegate = useCallback(async (delegateId: number, field: "participations" | "comments", value: any) => {
        // Optimistic update
        setDelegates(prev => prev.map(d => {
            if (d.id === delegateId) {
                return { ...d, [field]: value };
            }
            return d;
        }));

        try {
            await fetch("/api/delegates", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: delegateId, [field]: value }),
            });
        } catch (e) {
            console.error("Failed to update delegate", e);
            // Revert? For now, just log.
        }
    }, []);

    const columns = useMemo<ColumnDef<Delegate>[]>(() => {
        if (!criteria.length) return [];

        const base: ColumnDef<Delegate>[] = [
            {
                header: "País",
                accessorKey: "country.name",
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        {row.original.country.flagUrl && (
                            <img
                                src={row.original.country.flagUrl}
                                alt={row.original.country.name}
                                className="h-4 w-6 rounded object-cover"
                            />
                        )}
                        <span className="font-medium">{row.original.country.name}</span>
                    </div>
                ),
            },
            {
                header: "Delegado",
                accessorKey: "name",
            },
            {
                header: "Part.",
                accessorKey: "participations",
                cell: ({ row, table }: any) => {
                    const count = row.original.participations || 0;
                    const update = table.options.meta?.handleUpdateDelegate;
                    return (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => update(row.original.id, "participations", Math.max(0, count - 1))}
                                className="w-6 h-6 flex items-center justify-center rounded bg-red-100 text-red-600 hover:bg-red-200"
                            >-</button>
                            <span className="w-6 text-center font-medium">{count}</span>
                            <button
                                onClick={() => update(row.original.id, "participations", count + 1)}
                                className="w-6 h-6 flex items-center justify-center rounded bg-green-100 text-green-600 hover:bg-green-200"
                            >+</button>
                        </div>
                    );
                }
            },
            {
                header: "Comentarios",
                accessorKey: "comments",
                cell: ({ row, table }: any) => {
                    const comment = row.original.comments || "";
                    const update = table.options.meta?.handleUpdateDelegate;
                    return (
                        <textarea
                            defaultValue={comment}
                            onBlur={(e) => {
                                if (e.target.value !== comment) {
                                    update(row.original.id, "comments", e.target.value);
                                }
                            }}
                            className="w-32 h-8 text-xs p-1 rounded border border-gray-200 resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="..."
                        />
                    );
                }
            },
        ];

        const critCols = criteria.map((c) => ({
            header: `${c.name} (${c.maxScore})`,
            id: c.id.toString(),
            cell: ({ row, table }: any) => {
                const delegateId = row.original.id;
                // Access scores and handler from table meta to avoid re-renders
                const currentScores = table.options.meta?.scores || {};
                const onScoreChange = table.options.meta?.handleScoreChange;
                const onFocus = table.options.meta?.handleFocus;
                const setFocused = table.options.meta?.setFocusedCell;
                const focused = table.options.meta?.focusedCell;
                const pending = table.options.meta?.pendingSaves || {};
                const presenceMap = table.options.meta?.presence || {};
                const currentSession = table.options.meta?.session;

                const val = currentScores[`${delegateId}-${c.id}`] ?? "";
                const isPending = pending[`${delegateId}-${c.id}`];
                const cellPresence = presenceMap[`${delegateId}-${c.id}`];

                // Only show presence if it's NOT me
                const showPresence = cellPresence && cellPresence.userId !== currentSession?.user?.id ? cellPresence : undefined;

                // Check if this cell should be focused
                const shouldFocus = focused?.d === delegateId && focused?.c === c.id;

                return (
                    <ScoreInput
                        value={val}
                        max={c.maxScore}
                        onChange={(val) => onScoreChange(delegateId, c.id, val)}
                        onFocus={() => {
                            setFocused({ d: delegateId, c: c.id });
                            onFocus(delegateId, c.id);
                        }}
                        onBlur={() => setFocused(null)}
                        isPending={isPending}
                        presence={showPresence}
                        autoFocus={shouldFocus}
                    />
                );
            },
        }));

        const totalCol: ColumnDef<Delegate> = {
            header: "Total",
            id: "total",
            cell: ({ row, table }: any) => {
                const delegateId = row.original.id;
                const currentScores = table.options.meta?.scores || {};
                const total = criteria.reduce((sum, c) => {
                    return sum + (currentScores[`${delegateId}-${c.id}`] || 0);
                }, 0);
                return <span className="font-bold text-blue-600">{total}</span>;
            },
        };

        return [...base, ...critCols, totalCol];
    }, [criteria]);

    const table = useReactTable({
        data: delegates,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.id.toString(), // Ensure stable row IDs
        meta: {
            scores,
            handleScoreChange,
            handleFocus,
            setFocusedCell,
            focusedCell,
            handleUpdateDelegate,
            pendingSaves,
            presence,
            session
        } as any,
    });

    const handleExport = (format: "excel" | "pdf") => {
        if (!selectedCommitteeId) return;
        window.open(`/api/grading/export?committeeId=${selectedCommitteeId}&format=${format}`, "_blank");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Calificaciones</h1>
                {Object.keys(pendingSaves).length > 0 && (
                    <span className="text-sm text-yellow-600 animate-pulse font-medium">
                        Guardando cambios...
                    </span>
                )}
                {Object.keys(pendingSaves).length === 0 && lastSaved && (
                    <span className="text-sm text-green-600">
                        Guardado a las {lastSaved.toLocaleTimeString()}
                    </span>
                )}
            </div>

            {/* Selection Area */}
            <div className="grid gap-4 md:grid-cols-2">
                <GlassCard className="p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">1. Seleccionar Evento</label>
                    <select
                        className="w-full p-2 rounded border border-gray-200 bg-white/50"
                        value={selectedEventId}
                        onChange={(e) => {
                            setSelectedEventId(e.target.value);
                            setSelectedCommitteeId(""); // Reset committee
                        }}
                    >
                        <option value="">-- Elegir Evento --</option>
                        {events.map((e) => (
                            <option key={e.id} value={e.id}>{e.nombre}</option>
                        ))}
                    </select>
                </GlassCard>

                <GlassCard className={`p-4 transition-opacity ${!selectedEventId ? 'opacity-50 pointer-events-none' : ''}`}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">2. Seleccionar Comité</label>
                    <select
                        className="w-full p-2 rounded border border-gray-200 bg-white/50"
                        value={selectedCommitteeId}
                        onChange={(e) => setSelectedCommitteeId(e.target.value)}
                        disabled={!selectedEventId}
                    >
                        <option value="">-- Elegir Comité --</option>
                        {committees.map((c) => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                    </select>
                </GlassCard>
            </div>

            {/* Grading Grid */}
            {selectedCommitteeId && (
                <GlassCard className="overflow-hidden p-0">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white/40">
                        <h2 className="font-bold text-gray-800">Hoja de Evaluación</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleExport("excel")}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                            >
                                <Download className="h-4 w-4" /> Excel
                            </button>
                            <button
                                onClick={() => handleExport("pdf")}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                                <Download className="h-4 w-4" /> PDF
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Cargando datos...</div>
                    ) : delegates.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No hay delegados en este comité.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50/50 text-gray-700">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <th key={header.id} className="p-3 font-medium">
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {table.getRowModel().rows.map((row) => (
                                        <tr key={row.id} className="hover:bg-white/50">
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className="p-3">
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </GlassCard>
            )}
        </div>
    );
}
