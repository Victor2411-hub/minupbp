"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassModal } from "@/components/ui/GlassModal";
import { Plus, Search, Pencil, Trash2, School } from "lucide-react";
import { useSession } from "next-auth/react";
import { tienePermiso, puedeEditar } from "@/lib/permisos";

interface EducationalCenter {
    id: number;
    nombre: string;
    activo: boolean;
    _count?: {
        delegados: number;
    };
}

export default function SchoolsPage() {
    const { data: session } = useSession();
    const [schools, setSchools] = useState<EducationalCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchool, setEditingSchool] = useState<EducationalCenter | null>(null);
    const [formData, setFormData] = useState({ nombre: "", activo: true });
    const [saving, setSaving] = useState(false);

    const permisos = session?.user?.permisos || [];
    const canEdit = puedeEditar(permisos, "editar_centros");

    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        try {
            const res = await fetch("/api/schools");
            const data = await res.json();
            setSchools(data);
        } catch (error) {
            console.error("Error fetching schools:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const url = editingSchool
                ? `/api/schools/${editingSchool.id}`
                : "/api/schools";

            const method = editingSchool ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to save");

            await fetchSchools();
            setIsModalOpen(false);
            setEditingSchool(null);
            setFormData({ nombre: "", activo: true });
            alert(editingSchool ? "Centro actualizado correctamente" : "Centro creado correctamente");
        } catch (error) {
            console.error("Error saving school:", error);
            alert("Error al guardar el centro educativo");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Estás seguro de eliminar este centro educativo?")) return;

        try {
            const res = await fetch(`/api/schools/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete");
            }

            await fetchSchools();
            alert("Centro educativo eliminado correctamente");
        } catch (error: any) {
            console.error("Error deleting school:", error);
            alert(error.message || "Error al eliminar el centro educativo");
        }
    };

    const filteredSchools = schools.filter(school =>
        school.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Centros Educativos
                    </h1>
                    <p className="text-gray-500 mt-1">Gestión de instituciones participantes</p>
                </div>
                {canEdit && (
                    <button
                        onClick={() => {
                            setEditingSchool(null);
                            setFormData({ nombre: "", activo: true });
                            setIsModalOpen(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        Nuevo Centro
                    </button>
                )}
            </div>

            <GlassCard className="p-6">
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar centro educativo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-4 px-4 font-medium text-gray-500">Nombre</th>
                                <th className="text-center py-4 px-4 font-medium text-gray-500">Delegados</th>
                                <th className="text-center py-4 px-4 font-medium text-gray-500">Estado</th>
                                {canEdit && <th className="text-right py-4 px-4 font-medium text-gray-500">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-500">
                                        Cargando...
                                    </td>
                                </tr>
                            ) : filteredSchools.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-500">
                                        No se encontraron centros educativos
                                    </td>
                                </tr>
                            ) : (
                                filteredSchools.map((school) => (
                                    <tr key={school.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <School className="h-5 w-5" />
                                                </div>
                                                <span className="font-medium text-gray-900">{school.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {school._count?.delegados || 0}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${school.activo
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                                }`}>
                                                {school.activo ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        {canEdit && (
                                            <td className="py-4 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingSchool(school);
                                                            setFormData({
                                                                nombre: school.nombre,
                                                                activo: school.activo
                                                            });
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(school.id)}
                                                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                                        disabled={school._count?.delegados ? school._count.delegados > 0 : false}
                                                        title={school._count?.delegados && school._count.delegados > 0 ? "No se puede eliminar porque tiene delegados asignados" : "Eliminar"}
                                                    >
                                                        <Trash2 className={`h-4 w-4 ${school._count?.delegados && school._count.delegados > 0 ? "opacity-50" : ""}`} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            <GlassModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingSchool ? "Editar Centro Educativo" : "Nuevo Centro Educativo"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre del Centro
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="Ej: Colegio San José"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="activo"
                            checked={formData.activo}
                            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="activo" className="text-sm text-gray-700">
                            Centro Activo
                        </label>
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
                            disabled={saving}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {saving ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </form>
            </GlassModal>
        </div>
    );
}
