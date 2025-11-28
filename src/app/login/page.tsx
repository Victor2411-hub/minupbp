"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock } from "lucide-react";

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "mun2025") {
            router.push("/dashboard");
        } else {
            setError("Invalid Access Code");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <GlassCard className="w-full max-w-md p-8">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                        <Lock className="h-8 w-8 text-blue-600" />
                    </div>
                    <h1 className="mb-2 text-2xl font-bold text-gray-900">Chair Access</h1>
                    <p className="text-gray-500">Enter the access code to continue</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <GlassInput
                            type="password"
                            placeholder="Access Code"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="text-center text-lg tracking-widest"
                        />
                    </div>

                    {error && (
                        <p className="text-center text-sm text-red-500 animate-pulse">
                            {error}
                        </p>
                    )}

                    <GlassButton type="submit" className="w-full justify-center">
                        Enter Dashboard
                    </GlassButton>
                </form>
            </GlassCard>
        </div>
    );
}
