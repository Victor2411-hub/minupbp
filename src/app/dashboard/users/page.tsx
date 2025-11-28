"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassModal } from "@/components/ui/GlassModal";
import { Shield, Check, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Permission {
    id: number;
    clave: string;
    nombre: string;
    descripcion: string;
    tipo: "PAGINA" | "ACCION";
}

interface User {
    id: number;
    nombre: string;
    usuario: string;
    activo: boolean;
    permisos: string[];
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Fetch initial data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, permsRes] = await Promise.all([
                fetch("/api/users"),
                fetch("/api/permissions")
            ]);

            if (usersRes.ok) setUsers(await usersRes.json());
            if (permsRes.ok) setPermissions(await permsRes.json());
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditPermissions = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const togglePermission = (permId: number, permClave: string) => {
        if (!selectedUser) return;

        const currentPerms = selectedUser.permisos;
        let newPerms: string[];

        if (currentPerms.includes(permClave)) {
            newPerms = currentPerms.filter(p => p !== permClave);
        } else {
            newPerms = [...currentPerms, permClave];
        }

        setSelectedUser({ ...selectedUser, permisos: newPerms });
    };

    const savePermissions = async () => {
        if (!selectedUser) return;
        setSaving(true);

        try {
            // Map permission claves back to IDs for the API
            const permissionIds = permissions
                .filter(p => selectedUser.permisos.includes(p.clave))
                .map(p => p.id);

            const res = await fetch(`/api/users/${selectedUser.id}/permissions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ permissionIds }),
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchData(); // Refresh list
            } else {
                alert("Error al guardar permisos");
            }
        } catch (error) {
            console.error("Error saving permissions:", error);
            alert("Error al guardar permisos");
        } finally {
            setSaving(false);
        }
    };

    // Group permissions for display
    const pagePermissions = permissions.filter(p => p.tipo === "PAGINA");
    const actionPermissions = permissions.filter(p => p.tipo === "ACCION");

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios y Permisos</h1>

            <GlassCard className="p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="pb-3 font-semibold text-gray-600">Nombre</th>
                                <th className="pb-3 font-semibold text-gray-600">Usuario</th>
                                <th className="pb-3 font-semibold text-gray-600">Estado</th>
                                <th className="pb-3 font-semibold text-gray-600">Permisos</th>
                                <th className="pb-3 font-semibold text-gray-600">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr key={user.id} className="group hover:bg-gray-50/50">
                                    <td className="py-3">{user.nombre}</td>
                                    <td className="py-3 text-gray-500">@{user.usuario}</td>
                                    <td className="py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${user.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            }`}>
                                            {user.activo ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <span className="text-sm text-gray-500">
                                            {user.permisos.includes("acceso_total")
                                                ? "Acceso Total"
                                                : `${user.permisos.length} permisos asignados`}
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <GlassButton
                                            onClick={() => handleEditPermissions(user)}
                                            className="text-sm py-1 px-3"
                                        >
                                            <Shield className="mr-2 h-4 w-4" />
                                            Gestionar Permisos
                                        </GlassButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            <GlassModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Permisos para ${selectedUser?.nombre}`}
            >
                <div className="space-y-6">
                    {/* Page Access */}
                    <div>
                        <h3 className="mb-3 text-lg font-semibold text-gray-800 border-b pb-2">Acceso a Páginas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {pagePermissions.map((perm) => (
                                <label key={perm.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-all">
                                    <input
                                        type="checkbox"
                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={selectedUser?.permisos.includes(perm.clave) || false}
                                        onChange={() => togglePermission(perm.id, perm.clave)}
                                        disabled={selectedUser?.permisos.includes("acceso_total") && perm.clave !== "acceso_total"}
                                    />
                                    <div>
                                        <div className="font-medium text-gray-900">{perm.nombre}</div>
                                        <div className="text-xs text-gray-500">{perm.descripcion}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div>
                        <h3 className="mb-3 text-lg font-semibold text-gray-800 border-b pb-2">Permisos de Acción</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {actionPermissions.map((perm) => (
                                <label key={perm.id} className={`flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-all ${perm.clave === 'acceso_total' ? 'bg-blue-50 border-blue-100' : ''}`}>
                                    <input
                                        type="checkbox"
                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={selectedUser?.permisos.includes(perm.clave) || false}
                                        onChange={() => togglePermission(perm.id, perm.clave)}
                                    />
                                    <div>
                                        <div className={`font-medium ${perm.clave === 'acceso_total' ? 'text-blue-800' : 'text-gray-900'}`}>{perm.nombre}</div>
                                        <div className="text-xs text-gray-500">{perm.descripcion}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t gap-3">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <GlassButton
                            onClick={savePermissions}
                            disabled={saving}
                            className="bg-blue-600 text-white"
                        >
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </GlassButton>
                    </div>
                </div>
            </GlassModal>
        </div>
    );
}
