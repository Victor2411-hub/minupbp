"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
    const [usuario, setUsuario] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const result = await signIn("credentials", {
            usuario,
            contrasena,
            redirect: false,
        });

        setLoading(false);

        if (result?.error) {
            setError("Usuario o contraseña incorrectos");
        } else {
            router.push(callbackUrl);
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
            <GlassCard className="w-full max-w-md p-8 space-y-6">
                {/* Logo/Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                        MUN Platform
                    </h1>
                    <p className="text-sm text-gray-600">
                        Sistema de Gestión de Modelo de Naciones Unidas
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Usuario
                        </label>
                        <GlassInput
                            type="text"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            placeholder="Ingresa tu usuario"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña
                        </label>
                        <GlassInput
                            type="password"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            placeholder="Ingresa tu contraseña"
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <GlassButton
                        type="submit"
                        disabled={loading}
                        className="w-full justify-center bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Ingresando..." : "Ingresar"}
                    </GlassButton>
                </form>

                {/* Help Link */}
                <div className="text-center">
                    <button
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        onClick={() => alert("Contacta al administrador del sistema")}
                    >
                        ¿Necesitas ayuda?
                    </button>
                </div>
            </GlassCard>
        </div>
    );
}
